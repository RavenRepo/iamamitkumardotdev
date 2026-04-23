import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getClapState, registerClap } from "@/lib/claps";
import { rateLimit } from "@/lib/rate-limit";
import { withCsrfProtection } from "@/lib/csrf";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VISITOR_COOKIE_NAME = "clap_visitor_id";
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const VISITOR_ID_REGEX = /^[a-f0-9-]{16,128}$/i;

function getValidatedSlug(rawSlug: unknown): string | null {
  if (typeof rawSlug !== "string") return null;
  const slug = rawSlug.trim().toLowerCase();
  return SLUG_REGEX.test(slug) ? slug : null;
}

function getRequestIp(req: NextRequest): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0]?.trim();
    if (firstIp) return firstIp.slice(0, 128);
  }
  const realIp = req.headers.get("x-real-ip");
  return realIp ? realIp.slice(0, 128) : null;
}

function getRequestUserAgent(req: NextRequest): string | null {
  const userAgent = req.headers.get("user-agent");
  return userAgent ? userAgent.slice(0, 512) : null;
}

function getOrCreateVisitorId(request: NextRequest): {
  visitorId: string;
  setCookie: boolean;
} {
  const cookieValue = request.cookies.get(VISITOR_COOKIE_NAME)?.value?.trim();
  if (cookieValue && VISITOR_ID_REGEX.test(cookieValue)) {
    return { visitorId: cookieValue.slice(0, 128), setCookie: false };
  }
  return { visitorId: crypto.randomUUID(), setCookie: true };
}

function withVisitorCookie(
  response: NextResponse,
  visitorId: string,
  setCookie: boolean
) {
  if (setCookie) {
    response.cookies.set({
      name: VISITOR_COOKIE_NAME,
      value: visitorId,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: VISITOR_COOKIE_MAX_AGE,
    });
  }
  return response;
}

async function handleClapPost(request: NextRequest) {
  const limit = rateLimit(request, { windowMs: 60000, maxRequests: 20 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
          "X-RateLimit-Limit": "20",
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  try {
    const payload = await request.json();
    const slug = getValidatedSlug((payload as { slug?: unknown })?.slug);
    if (!slug) {
      return NextResponse.json({ error: "Valid slug is required" }, { status: 400 });
    }

    const { visitorId, setCookie } = getOrCreateVisitorId(request);
    const clapState = await registerClap({
      slug,
      visitorKey: visitorId,
      ip: getRequestIp(request),
      userAgent: getRequestUserAgent(request),
    });

    const response = NextResponse.json({
      success: true,
      claps: Math.max(clapState.userClaps, 1),
      total: Math.max(clapState.totalClaps, 1),
      hasClapped: true,
    });

    return withVisitorCookie(response, visitorId, setCookie);
  } catch (error) {
    console.error("Clap API error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export const POST = withCsrfProtection(handleClapPost);

export async function GET(request: NextRequest) {
  const limit = rateLimit(request, { windowMs: 60000, maxRequests: 60 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a bit." },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
          "X-RateLimit-Limit": "60",
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const slug = getValidatedSlug(searchParams.get("slug"));
    if (!slug) {
      return NextResponse.json({ error: "Valid slug is required" }, { status: 400 });
    }

    const { visitorId, setCookie } = getOrCreateVisitorId(request);
    const clapState = await getClapState(slug, visitorId);

    const response = NextResponse.json({
      claps: clapState.userClaps,
      total: clapState.totalClaps,
      hasClapped: clapState.hasClapped,
    });

    return withVisitorCookie(response, visitorId, setCookie);
  } catch (error) {
    console.error("Clap GET API error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
