import { NextResponse } from "next/server";

const SITE_URL = "https://iamamitkumar.dev";

export async function GET() {
  const robotsTxt = `User-Agent: *
Allow: /

User-Agent: GPTBot
Allow: /

User-Agent: ChatGPT-User
Allow: /

User-Agent: Googlebot
Allow: /

User-Agent: Bingbot
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
Host: ${SITE_URL}

Content-Signal: ai-train=no, search=yes, ai-input=yes
`;

  return new NextResponse(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
      "Content-Signal": "ai-train=no, search=yes, ai-input=yes",
    },
  });
}
