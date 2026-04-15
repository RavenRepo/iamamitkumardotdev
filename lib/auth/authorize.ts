import { NextResponse } from "next/server";
import { auth } from "./auth";
import { headers } from "next/headers";

export type UserRole = "user" | "admin";

export async function requireAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { 
      authorized: false, 
      session: null, 
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) 
    };
  }

  return { authorized: true, session, response: NextResponse.json({ error: "Unexpected error" }, { status: 500 }) };
}

export async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { 
      authorized: false, 
      session: null, 
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) 
    };
  }

  const role = (session.user as unknown as { role?: UserRole }).role;

  if (role !== "admin") {
    return { 
      authorized: false, 
      session, 
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) 
    };
  }

  return { 
    authorized: true, 
    session, 
    response: NextResponse.json({ error: "Unexpected error" }, { status: 500 }) 
  };
}
