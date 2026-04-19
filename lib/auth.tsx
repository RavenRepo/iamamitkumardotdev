"use client";

import { createBrowserClient } from "@supabase/ssr";
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { Database } from "@/types/supabase";
import type { User, Session } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_PROJECT_URL || process.env.PROJECT_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_ANON_KEY || process.env.ANON_KEY!;

const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

interface AuthState {
  user: User | null;
  session: Session | null;
  isPending: boolean;
}

const AuthContext = createContext<AuthState>({
  user: null,
  session: null,
  isPending: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isPending: true,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({ user: session?.user ?? null, session, isPending: false });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ user: session?.user ?? null, session, isPending: false });
    });

    return () => subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export { supabase as authClient };