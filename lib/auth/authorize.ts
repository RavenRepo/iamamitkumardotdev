import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

export type UserRole = "user" | "admin";

interface AuthResult {
  authorized: boolean;
  session: { user: { id: string; role?: UserRole } } | null;
  response: NextResponse;
}

const ADMIN_USER_IDS = process.env.ADMIN_USER_IDS
  ? process.env.ADMIN_USER_IDS.split(",").map((id) => id.trim()).filter(Boolean)
  : [];

async function isAdminUser(userId: string): Promise<boolean> {
  if (ADMIN_USER_IDS.length > 0) {
    return ADMIN_USER_IDS.includes(userId);
  }

  return false;
}

export async function requireAuth(req: NextRequest): Promise<AuthResult> {
  const cookieStore = await cookies();

  const supabase = createServerClient(env.PROJECT_URL, env.ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options);
        }
      },
    },
  });

  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : undefined;

  const {
    data: { user },
    error,
  } = token ? await supabase.auth.getUser(token) : await supabase.auth.getUser();

  if (error || !user) {
    console.error("Auth verification failed:", { error, hasUser: !!user, hasToken: !!token });
    return {
      authorized: false,
      session: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return {
    authorized: true,
    session: {
      user: {
        id: user.id,
        role: (user.app_metadata?.role as UserRole) || "user",
      },
    },
    response: NextResponse.json({ error: "Unexpected error" }, { status: 500 }),
  };
}

export async function requireAdmin(req: NextRequest): Promise<AuthResult> {
  const result = await requireAuth(req);

  if (!result.authorized) return result;

  const userId = result.session!.user.id;
  const hasRole = result.session!.user.role === "admin";
  const isInAllowlist = await isAdminUser(userId);

  if (!hasRole && !isInAllowlist) {
    return {
      authorized: false,
      session: result.session,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return result;
}
