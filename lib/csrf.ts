import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";
const TOKEN_LENGTH = 32;

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function generateCsrfToken(): string {
  return crypto.randomBytes(TOKEN_LENGTH).toString("hex");
}

export function setCsrfCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: CSRF_COOKIE_NAME,
    value: token,
    httpOnly: false,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

export function getCsrfTokenFromRequest(req: NextRequest): string | null {
  return (
    req.headers.get(CSRF_HEADER_NAME) ||
    req.cookies.get(CSRF_COOKIE_NAME)?.value ||
    null
  );
}

export function validateCsrfToken(req: NextRequest): boolean {
  const cookieToken = req.cookies.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = req.headers.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken) {
    return false;
  }

  return cookieToken === headerToken;
}

export function withCsrfProtection(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async function (req: NextRequest): Promise<NextResponse> {
    if (SAFE_METHODS.has(req.method)) {
      return handler(req);
    }

    if (!validateCsrfToken(req)) {
      return NextResponse.json(
        { error: "CSRF validation failed. Please refresh the page and try again." },
        { status: 403 }
      );
    }

    return handler(req);
  };
}

export function withCsrfProtectionWithParams<T extends object>(
  handler: (req: NextRequest, ctx: T) => Promise<NextResponse>
) {
  return async function (req: NextRequest, ctx: T): Promise<NextResponse> {
    if (SAFE_METHODS.has(req.method)) {
      return handler(req, ctx);
    }

    if (!validateCsrfToken(req)) {
      return NextResponse.json(
        { error: "CSRF validation failed. Please refresh the page and try again." },
        { status: 403 }
      );
    }

    return handler(req, ctx);
  };
}

export function withCsrfTokenResponse(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async function (req: NextRequest): Promise<NextResponse> {
    const response = await handler(req);

    if (!req.cookies.get(CSRF_COOKIE_NAME)) {
      const token = generateCsrfToken();
      setCsrfCookie(response, token);
      response.headers.set("X-CSRF-Token", token);
    }

    return response;
  };
}
