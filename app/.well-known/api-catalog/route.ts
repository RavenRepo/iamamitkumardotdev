import { NextResponse } from "next/server";

const SITE_URL = "https://iamamitkumar.dev";

export async function GET() {
  const apiCatalog = {
    linkset: [
      {
        anchor: SITE_URL,
        links: [
          {
            rel: "service-doc",
            href: `${SITE_URL}/blog`,
            type: "text/html",
            title: "Blog and Documentation",
          },
          {
            rel: "service-desc",
            href: `${SITE_URL}/api`,
            type: "application/json",
            title: "API Endpoints",
          },
          {
            rel: "sitemap",
            href: `${SITE_URL}/sitemap.xml`,
            type: "application/xml",
            title: "Sitemap",
          },
          {
            rel: "robots",
            href: `${SITE_URL}/robots.txt`,
            type: "text/plain",
            title: "Robots Exclusion Protocol",
          },
        ],
      },
      {
        anchor: `${SITE_URL}/api`,
        links: [
          {
            rel: "service-doc",
            href: `${SITE_URL}/blog`,
            type: "text/html",
            title: "API Documentation",
          },
          {
            rel: "status",
            href: `${SITE_URL}/api/health`,
            type: "application/json",
            title: "Health Check Endpoint",
          },
        ],
      },
    ],
  };

  return NextResponse.json(apiCatalog, {
    headers: {
      "Content-Type": "application/linkset+json",
    },
  });
}
