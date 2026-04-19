import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_PROJECT_URL || process.env.PROJECT_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_ANON_KEY || process.env.ANON_KEY;
const supabaseServiceKey = process.env.SERVICE_ROLE;

console.log("URL exists:", !!supabaseUrl);
console.log("Anon Key exists:", !!supabaseAnonKey);
console.log("Service Key exists:", !!supabaseServiceKey);

if (!supabaseUrl || !supabaseServiceKey) {
  console.log("Missing URL or Service Key");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    console.error("Error listing users:", error.message);
    process.exit(1);
  }
  
  const adminEmail = "hello@iamamitkumar.dev";
  const user = users.find((u) => u.email === adminEmail);
  
  if (user) {
    console.log("Admin user FOUND:");
    console.log("ID:", user.id);
    console.log("Email:", user.email);
    console.log("Confirmed At:", user.email_confirmed_at);
    console.log("App Metadata:", user.app_metadata);
    console.log("User Metadata:", user.user_metadata);
  } else {
    console.log("Admin user NOT FOUND.");
  }
}

main().catch(console.error);
