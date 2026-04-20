import { NextRequest, NextResponse } from "next/server";
import { rateLimitAsync } from "@/lib/rate-limit";
import { validateNewsletterInput } from "@/lib/validation";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const limitResult = await rateLimitAsync(request, {
    windowMs: 60_000,
    maxRequests: 5,
  });
  if (!limitResult.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
          "X-RateLimit-Limit": "5",
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  try {
    const body = await request.json();
    const validation = validateNewsletterInput(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.errors.join(", ") },
        { status: 400 },
      );
    }

    const { email } = validation.data!;

    const { data: existing } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("id")
      .eq("email", email)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({
        success: true,
        message: "You're already subscribed!",
        alreadySubscribed: true,
      });
    }

    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .insert({ email });

    if (error) {
      console.error("Newsletter subscribe DB error:", error);
      return NextResponse.json(
        { error: "Failed to subscribe. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Subscribed! You'll hear from me soon.",
      alreadySubscribed: false,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }
}
