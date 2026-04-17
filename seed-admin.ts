/**
 * seed-admin.ts — Run once to create the first admin user in Supabase Auth.
 * Usage: npx tsx seed-admin.ts <your-password>
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.PROJECT_URL!;
const supabaseServiceKey = process.env.SERVICE_ROLE!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ADMIN_EMAIL = "hello@iamamitkumar.dev";
const ADMIN_PASS = process.argv[2];

if (!ADMIN_PASS) {
  console.error("❌ Usage: npx tsx seed-admin.ts <your-password>");
  process.exit(1);
}

async function main() {
  console.log(`Checking for existing user: ${ADMIN_EMAIL}...`);

  const {
    data: { users },
    error: listError,
  } = await supabaseAdmin.auth.admin.listUsers();

  if (listError) {
    console.error("❌ Error listing users:", listError.message);
    process.exit(1);
  }

  const existing = users?.find((u) => u.email === ADMIN_EMAIL);

  if (existing) {
    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(existing.id, {
        app_metadata: { role: "admin" },
      });

    if (updateError) {
      console.error("❌ Error updating role:", updateError.message);
      process.exit(1);
    }

    console.log(`✅ User ${ADMIN_EMAIL} is now an admin!`);
    process.exit(0);
  }

  console.log("User not found. Creating new admin user...");

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASS,
    email_confirm: true,
    app_metadata: { role: "admin" },
  });

  if (error) {
    console.error("❌ Error creating user:", error.message);
    process.exit(1);
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  console.log("✅ Admin user created successfully!");
  console.log(`   ID:       ${data.user.id}`);
  console.log(`   Email:    ${data.user.email}`);
  console.log(`   Role:     admin`);
  console.log(`   Password: (the one you passed)`);
  console.log(`\n   Login at: ${baseUrl}/admin`);
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});
