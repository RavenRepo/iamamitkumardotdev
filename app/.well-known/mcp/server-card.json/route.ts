import { NextResponse } from "next/server";

const SITE_URL = "https://iamamitkumar.dev";

export async function GET() {
  const serverCard = {
    $schema: "https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2127",
    serverInfo: {
      name: "Amit Kumar Portfolio MCP Server",
      version: "1.0.0",
      description:
        "MCP server for accessing portfolio projects, blog content, and professional information",
    },
    transport: {
      type: "http",
      url: `${SITE_URL}/api/mcp`,
    },
    capabilities: {
      tools: {
        listChanged: true,
      },
      resources: {
        subscribe: false,
        listChanged: true,
      },
      prompts: {
        listChanged: true,
      },
    },
    icons: [
      {
        src: `${SITE_URL}/favicon.svg`,
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
    endpoints: [
      {
        name: "Portfolio API",
        url: `${SITE_URL}/api`,
        description: "REST API for portfolio data",
      },
      {
        name: "Blog API",
        url: `${SITE_URL}/api/blog`,
        description: "Access blog posts and content",
      },
    ],
  };

  return NextResponse.json(serverCard, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
