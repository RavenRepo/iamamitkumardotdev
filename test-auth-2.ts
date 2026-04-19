import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_PROJECT_URL || process.env.PROJECT_URL;
const supabaseServiceKey = process.env.SERVICE_ROLE;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    console.error("Error listing users:", error.message);
    process.exit(1);
  }
  
  if (users.length === 0) {
    console.log("No users found in the database.");
  } else {
    console.log("Users in DB:");
    users.forEach(u => {
      console.log(`- ${u.email} (ID: ${u.id}, Role: ${u.app_metadata?.role})`);
    });
  }
}

main().catch(console.error);
