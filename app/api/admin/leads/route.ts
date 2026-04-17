import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/authorize";
import { rateLimit } from "@/lib/rate-limit";
import { listContactInquiries, listNewsletterSubscribers } from "@/lib/leads";

function parseLimit(value: string | null, fallback = 50) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(Math.floor(n), 200);
}

export async function GET(req: NextRequest) {
  const rateLimitResult = rateLimit(req, { windowMs: 60000, maxRequests: 30 });
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const { authorized, response } = await requireAdmin(req);
  if (!authorized) return response;

  const { searchParams } = new URL(req.url);
  const contactLimit = parseLimit(searchParams.get("contactLimit"), 50);
  const newsletterLimit = parseLimit(searchParams.get("newsletterLimit"), 50);

  try {
    const [contactInquiries, newsletterSubscribers] = await Promise.all([
      listContactInquiries(contactLimit),
      listNewsletterSubscribers(newsletterLimit),
    ]);

    return NextResponse.json({
      contactInquiries,
      newsletterSubscribers,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 },
    );
  }
}
