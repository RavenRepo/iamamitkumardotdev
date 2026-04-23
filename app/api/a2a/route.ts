import { NextRequest, NextResponse } from "next/server";
import { getA2AAgentCard } from "@/lib/agent-discovery";

export async function GET() {
  return NextResponse.json(getA2AAgentCard(), {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Expected a JSON A2A request body." },
      { status: 400 },
    );
  }

  const method =
    body && typeof body === "object" && "method" in body
      ? String((body as { method?: unknown }).method)
      : "";

  if (method === "agent.card" || method === "skills/list") {
    return NextResponse.json({ result: getA2AAgentCard() });
  }

  return NextResponse.json(
    {
      result: {
        message:
          "This public portfolio endpoint supports discovery only. Use the site pages, markdown negotiation, and WebMCP tools for content access.",
        supportedMethods: ["agent.card", "skills/list"],
      },
    },
    { headers: { "Content-Type": "application/json" } },
  );
}
