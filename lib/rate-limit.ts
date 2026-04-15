import { NextRequest, NextResponse } from "next/server";
import { env } from "./env";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000,
  maxRequests: 60,
};

function getClientId(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : 
             req.headers.get("x-real-ip") || 
             "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";
  return `ratelimit:${ip}:${userAgent.slice(0, 50)}`;
}

const rateLimitStore = new Map<string, RequestRecord>();

function cleanupStore() {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

setInterval(cleanupStore, 60 * 1000);

async function redisRateLimit(
  clientId: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const { Redis } = await import("ioredis");
  const redis = new Redis(env.REDIS_URL!, { 
    maxRetriesPerRequest: 1,
    lazyConnect: true 
  });
  
  const key = `ratelimit:${clientId}`;
  const now = Date.now();
  const windowSec = Math.ceil(config.windowMs / 1000);
  
  const pipe = redis.pipeline();
  pipe.zadd(key, now, `${now}-${Math.random()}`);
  pipe.zremrangebyscore(key, 0, now - windowSec * 1000);
  pipe.zcard(key);
  pipe.expire(key, windowSec);
  
  const results = await pipe.exec();
  const count = results?.[2]?.[1] as number || 0;
  
  await redis.quit();
  
  const resetTime = now + config.windowMs;
  const remaining = Math.max(0, config.maxRequests - count);
  const allowed = count <= config.maxRequests;
  
  return { allowed, remaining, resetTime };
}

function memoryRateLimit(
  clientId: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  
  let record = rateLimitStore.get(clientId);
  
  if (!record || record.resetTime < now) {
    record = {
      count: 0,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(clientId, record);
  }
  
  record.count++;
  
  const remaining = Math.max(0, config.maxRequests - record.count);
  const allowed = record.count <= config.maxRequests;
  
  return {
    allowed,
    remaining,
    resetTime: record.resetTime,
  };
}

export function rateLimit(
  req: NextRequest,
  config: RateLimitConfig = DEFAULT_CONFIG
): { allowed: boolean; remaining: number; resetTime: number } {
  const clientId = getClientId(req);
  
  if (env.REDIS_URL) {
    return redisRateLimit(clientId, config) as any;
  }
  
  return memoryRateLimit(clientId, config);
}

export async function rateLimitAsync(
  req: NextRequest,
  config: RateLimitConfig = DEFAULT_CONFIG
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const clientId = getClientId(req);
  
  if (env.REDIS_URL) {
    return redisRateLimit(clientId, config);
  }
  
  return memoryRateLimit(clientId, config);
}

export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config?: RateLimitConfig
) {
  return async function (req: NextRequest): Promise<NextResponse> {
    const endpointConfig = config || DEFAULT_CONFIG;
    
    const result = await rateLimitAsync(req, endpointConfig);
    
    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
      
      return new NextResponse(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": String(endpointConfig.maxRequests),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(result.resetTime),
            "Content-Type": "application/json",
          },
        }
      );
    }
    
    const response = await handler(req);
    
    response.headers.set("X-RateLimit-Limit", String(endpointConfig.maxRequests));
    response.headers.set("X-RateLimit-Remaining", String(result.remaining));
    response.headers.set("X-RateLimit-Reset", String(result.resetTime));
    
    return response;
  };
}
