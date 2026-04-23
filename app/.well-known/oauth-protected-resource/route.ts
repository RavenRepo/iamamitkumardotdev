import { NextResponse } from "next/server";
import {
  discoveryHeaders,
  getProtectedResourceMetadata,
} from "@/lib/agent-discovery";

export async function GET() {
  return NextResponse.json(getProtectedResourceMetadata(), {
    headers: discoveryHeaders(),
  });
}
