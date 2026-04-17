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

export async function requireAuth(_req: NextRequest): Promise<AuthResult> {
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

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
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

  if (result.session!.user.role !== "admin") {
    return {
      authorized: false,
      session: result.session,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return result;
}
