/**
 * seed-admin.ts — Run once to create the first admin user securely.
 * Usage: npx tsx seed-admin.ts <your-password>
 */
import 'dotenv/config';
import { Pool } from 'pg';
import { auth } from './src/lib/auth/auth';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const ADMIN_NAME  = 'Amit Kumar';
const ADMIN_EMAIL = 'hello@iamamitkumar.dev';
const ADMIN_PASS  = process.argv[2];

if (!ADMIN_PASS) {
  console.error('❌ Usage: npx tsx seed-admin.ts <your-password>');
  process.exit(1);
}

const mockHeaders = new Headers();

async function main() {
  console.log(`Checking for existing user: ${ADMIN_EMAIL}...`);

  const existingResult = await pool.query(
    'SELECT id, email FROM users WHERE email = $1',
    [ADMIN_EMAIL]
  );

  if (existingResult.rows.length > 0) {
    const userId = existingResult.rows[0].id;
    
    await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2',
      ['admin', userId]
    );
    
    console.log(`✅ User ${ADMIN_EMAIL} is now an admin!`);
    process.exit(0);
  }

  console.log('User not found. Creating new admin user...');

  try {
    const result = await auth.api.signUpEmail({
      body: {
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASS,
      },
      headers: mockHeaders
    });

    if (!result || !result.user) {
      throw new Error("Created user was null or undefined");
    }

    await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2',
      ['admin', result.user.id]
    );

    const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3000';
    console.log('✅ Admin user created successfully!');
    console.log(`   ID:       ${result.user.id}`);
    console.log(`   Email:    ${result.user.email}`);
    console.log(`   Role:     admin`);
    console.log(`   Password: (the one you passed)`);
    console.log(`\n   Login at: ${baseUrl}/admin`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating user:', error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});