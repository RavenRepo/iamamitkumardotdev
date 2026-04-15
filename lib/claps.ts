import { Pool } from "pg";

interface ClapInput {
  slug: string;
  visitorKey: string;
  ip?: string | null;
  userAgent?: string | null;
}

type ClapState = {
  userClaps: number;
  totalClaps: number;
  hasClapped: boolean;
};

type GlobalClapsState = {
  pool?: Pool;
  initPromise?: Promise<void>;
  memory?: Map<string, Map<string, number>>;
};

const globalClaps = globalThis as typeof globalThis & {
  __clapsState__?: GlobalClapsState;
};

const state = globalClaps.__clapsState__ ?? {};
globalClaps.__clapsState__ = state;

function getPool() {
  if (state.pool) return state.pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  state.pool = new Pool({ connectionString });
  return state.pool;
}

function getMemoryStore() {
  if (!state.memory) {
    state.memory = new Map<string, Map<string, number>>();
  }
  return state.memory;
}

function getMemoryClapState(slug: string, visitorKey: string): ClapState {
  const store = getMemoryStore();
  const slugMap = store.get(slug) ?? new Map<string, number>();
  const userClaps = slugMap.get(visitorKey) ?? 0;
  const totalClaps = Array.from(slugMap.values()).reduce((sum, count) => sum + count, 0);
  return {
    userClaps,
    totalClaps,
    hasClapped: userClaps > 0,
  };
}

function registerMemoryClap(input: ClapInput): ClapState {
  const store = getMemoryStore();
  const slugMap = store.get(input.slug) ?? new Map<string, number>();
  slugMap.set(input.visitorKey, Math.max(slugMap.get(input.visitorKey) ?? 0, 1));
  store.set(input.slug, slugMap);
  return getMemoryClapState(input.slug, input.visitorKey);
}

async function ensureClapTable() {
  if (state.initPromise) {
    await state.initPromise;
    return;
  }

  state.initPromise = (async () => {
    const pool = getPool();
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blog_claps (
        id BIGSERIAL PRIMARY KEY,
        slug TEXT NOT NULL,
        visitor_key TEXT NOT NULL,
        ip TEXT,
        user_agent TEXT,
        count INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(slug, visitor_key)
      );
    `);
  })();

  await state.initPromise;
}

async function getTotalClaps(pool: Pool, slug: string): Promise<number> {
  const totalResult = await pool.query<{ total: string | null }>(
    `
      SELECT COALESCE(SUM(count), 0)::bigint AS total
      FROM blog_claps
      WHERE slug = $1;
    `,
    [slug]
  );

  return Number(totalResult.rows[0]?.total ?? 0);
}

export async function getClapState(
  slug: string,
  visitorKey: string
): Promise<ClapState> {
  if (!process.env.DATABASE_URL) {
    return getMemoryClapState(slug, visitorKey);
  }

  await ensureClapTable();
  const pool = getPool();

  const [userResult, totalClaps] = await Promise.all([
    pool.query<{ count: number }>(
      `
        SELECT count
        FROM blog_claps
        WHERE slug = $1 AND visitor_key = $2
        LIMIT 1;
      `,
      [slug, visitorKey]
    ),
    getTotalClaps(pool, slug),
  ]);

  const userClaps = userResult.rows[0]?.count ?? 0;
  return {
    userClaps,
    totalClaps,
    hasClapped: userClaps > 0,
  };
}

export async function registerClap(input: ClapInput): Promise<ClapState> {
  if (!process.env.DATABASE_URL) {
    return registerMemoryClap(input);
  }

  await ensureClapTable();
  const pool = getPool();

  await pool.query(
    `
      INSERT INTO blog_claps (slug, visitor_key, ip, user_agent, count)
      VALUES ($1, $2, $3, $4, 1)
      ON CONFLICT (slug, visitor_key)
      DO UPDATE SET
        ip = EXCLUDED.ip,
        user_agent = EXCLUDED.user_agent,
        count = GREATEST(blog_claps.count, 1),
        updated_at = NOW();
    `,
    [input.slug, input.visitorKey, input.ip ?? null, input.userAgent ?? null]
  );

  return getClapState(input.slug, input.visitorKey);
}
