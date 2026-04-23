import { NextResponse } from "next/server";

const SITE_URL = "https://iamamitkumar.dev";

export async function GET() {
  const jwks = {
    keys: [
      {
        kty: "EC",
        crv: "P-256",
        x: "f83OJ3D2xF1b8tMlN2K8vF9qR0sT1uV2wX3yZ4aB5cD",
        y: "e6G7hH8iI9jJ0kK1lL2mM3nN4oO5pP6qQ7rR8sS9tT0",
        use: "sig",
        alg: "ES256",
        kid: "iamamitkumar-dev-2026",
      },
    ],
  };

  return NextResponse.json(jwks, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
