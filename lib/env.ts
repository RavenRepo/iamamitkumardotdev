import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_PROJECT_URL: z.string().url().optional(),
  NEXT_PUBLIC_ANON_KEY: z.string().min(1).optional(),
  PROJECT_URL: z.string().url(),
  ANON_KEY: z.string().min(1),
  SERVICE_ROLE: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
  DATABASE_URL: z.string().url(),
  NOTION_INTEGRATION_SECRET: z.string().min(1),
  NOTION_WEBHOOK_SECRET: z.string().optional(),
  NOTION_PROJECTS_DB_ID: z.string().optional(),
  NOTION_CONTENT_CALENDAR_DB_ID: z.string().optional(),
  NOTION_SOPS_DB_ID: z.string().optional(),
  NOTION_PARENT_PAGE_ID: z.string().optional(),
  NOTION_REVIEW_PARENT_PAGE_ID: z.string().optional(),
  OPENCLAW_API_KEY: z.string().optional(),

  REDIS_URL: z.string().url().optional(),
});

type Env = z.infer<typeof envSchema>;

let _env: Env | undefined;

export function getEnv(): Env {
  if (_env) return _env;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`,
    );
    throw new Error(
      `❌ Invalid environment variables:\n${errors.join("\n")}\n\n` +
        `Add these to your .env file. Check .env.example for reference.`,
    );
  }

  _env = result.data;
  return _env;
}

export const env = getEnv();
