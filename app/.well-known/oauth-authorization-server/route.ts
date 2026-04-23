import { NextResponse } from "next/server";
import { discoveryHeaders, getAuthServerMetadata } from "@/lib/agent-discovery";

export async function GET() {
  const metadata = getAuthServerMetadata();

  if (!metadata) {
    return NextResponse.json(
      { error: "OAuth authorization server metadata is not configured." },
      { status: 503 },
    );
  }

  return NextResponse.json(metadata, {
    headers: discoveryHeaders(),
  });
}
