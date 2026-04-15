import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { admin } from "better-auth/plugins";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const auth = betterAuth({
    database: pool,
    plugins: [
        admin(),
    ],
    emailAndPassword: {
        enabled: true,
    },
});
