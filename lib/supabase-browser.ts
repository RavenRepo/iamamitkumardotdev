import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const supabaseUrl =
  process.env.NEXT_PUBLIC_PROJECT_URL || process.env.PROJECT_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_ANON_KEY || process.env.ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabaseBrowser = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
);
