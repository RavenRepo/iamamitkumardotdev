import { NextResponse } from "next/server";
import { discoveryHeaders, getA2AAgentCard } from "@/lib/agent-discovery";

export async function GET() {
  return NextResponse.json(getA2AAgentCard(), {
    headers: discoveryHeaders(),
  });
}
