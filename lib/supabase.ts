import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import { env } from './env'

const supabaseUrl = env.PROJECT_URL
const supabaseAnonKey = env.ANON_KEY
const supabaseServiceKey = env.SERVICE_ROLE

// Public client for read operations (uses anon key, respects RLS)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Admin client for write operations (uses service role, bypasses RLS)
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey)

export const createSupabaseClient = () => supabase
