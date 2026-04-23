import { NextResponse } from "next/server";
import { discoveryHeaders, getAuthServerMetadata } from "@/lib/agent-discovery";

export async function GET() {
  const metadata = getAuthServerMetadata();

  if (!metadata) {
    return NextResponse.json(
      { error: "OpenID Connect discovery metadata is not configured." },
      { status: 503 },
    );
  }

  return NextResponse.json(
    {
      ...metadata,
      userinfo_endpoint: `${metadata.issuer}/userinfo`,
      claims_supported: [
        "aud",
        "email",
        "email_verified",
        "exp",
        "iat",
        "iss",
        "name",
        "picture",
        "sub",
      ],
    },
    {
      headers: discoveryHeaders(),
    },
  );
}
