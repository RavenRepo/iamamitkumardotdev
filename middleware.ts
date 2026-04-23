import { NextRequest, NextResponse } from "next/server";

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function acceptsMarkdown(acceptHeader: string): boolean {
  return acceptHeader
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .some((part) => {
      const [mediaType, ...parameters] = part
        .split(";")
        .map((value) => value.trim());
      const q = parameters
        .find((parameter) => parameter.startsWith("q="))
        ?.slice(2);

      return mediaType === "text/markdown" && q !== "0" && q !== "0.0";
    });
}

function titleFromPath(pathname: string): string {
  if (pathname === "/") return "Amit Kumar";

  return pathname
    .split("/")
    .filter(Boolean)
    .at(-1)!
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function pageMarkdown(pathname: string): {
  title: string;
  description: string;
  body: string;
} {
  if (pathname === "/") {
    return {
      title: "Amit Kumar | Agentic Architect & Full-Stack Engineer",
      description:
        "Indie hacker building AI products in public — from LaunchSuite.tech to multi-agent systems, growth experiments, and fast MVP launches.",
      body: `I'm an indie hacker shipping AI products in public. I go from idea to MVP fast, test demand, and iterate weekly. I share the full journey on [X / Twitter](https://x.com/growthperclick) — wins, mistakes, and what actually worked.

I launched [LaunchSuite.tech](https://launchsuite.tech) as a production SaaS boilerplate and pushed it to Product Hunt. I also build high-leverage products in AI automation, trading intelligence, and growth systems.

I publish founder notes, build logs, and playbooks on [Substack](https://substack.com/@growthperclick) for builders who want speed plus real execution.

## Things I ship

- [LaunchSuite.tech](https://launchsuite.tech) — shipped SaaS boilerplate MVP for founders.
- [Product launches](https://www.producthunt.com) — public validation with real users.
- [Build in public](https://x.com/growthperclick) — daily experiments on distribution, product, and growth loops.

## Building now

- VidoTask — turns saved social content into actionable plans. Try [vidotask.com](https://vidotask.com) (in active development).
- ComplianceHQ — AI-powered compliance automation for startup security readiness.
- SharkOS — LinkedIn operating system replacing multiple GTM SaaS tools.
- BrandCo — AI brand strategy engine for conversion-led positioning.
- JARVIS OS — local-first AI morning briefing assistant for focused execution.

### How VidoTask fixes it

1. **Auto-import saves** — Connect Instagram, TikTok, and LinkedIn; saves sync automatically with no manual entry.
2. **AI-powered task extraction** — Each save becomes concrete next steps (e.g. recipe → grocery list, tutorial → schedule).
3. **Actionable plans, not bookmarks** — Structured tasks with deadlines and context instead of a dead save folder.

## Explore

- [Blog](/blog)
- [Newsletter](/newsletter)
- [Workflow](/workflow)
- [Tweets](/tweets)
- [Sponsor](/sponsor)
`,
    };
  }

  if (pathname === "/blog") {
    return {
      title: "Blog — Founder Notes & Build Logs | Amit Kumar",
      description:
        "Founder notes, build logs, and technical writing on shipping products, AI systems, and growth experiments.",
      body: `Founder notes, build logs, and technical writing on shipping products, AI systems, and growth experiments.

## Recent writing

- [Why Your AI Agent Pilot Never Makes It to Production (And How to Fix It)](/blog/ai-agent-pilot-to-production)
- [How to Set Up OpenClaw: A Builder's Honest Setup Guide (2026)](/blog/how-to-set-up-openclaw-a-builder-s-honest-setup-guide-2026)
- [What's Actually Inside Claude Code (It's More Impressive Than You Think)](/blog/what-is-inside-claude-code)
- [How to Build Enterprise-Grade, Production-Ready AI Agents](/blog/how-to-build-enterprise-grade-production-ready-ai-agents)
- [Building Enterprise-Grade Production-Ready AI Agents: My Practical Guide to Deployment](/blog/building-enterprise-grade-production-ready-ai-agents-my-practical-guide-to-deployment)

## Stay in the loop

Get build logs, shipping notes, and AI product breakdowns delivered to your inbox. No spam — just the stuff worth reading.
`,
    };
  }

  if (pathname.startsWith("/blog/")) {
    const title = titleFromPath(pathname);
    return {
      title: `${title} | Amit Kumar`,
      description:
        "A public blog post by Amit Kumar about AI systems, product building, and growth experiments.",
      body: `# ${title}

This is a public Amit Kumar blog article.

For the canonical HTML article, visit [${pathname}](${pathname}). Agents can also request site index pages with \`Accept: text/markdown\`.

## Related links

- [Blog index](/blog)
- [Home](/)
- [Newsletter](/newsletter)
`,
    };
  }

  const title = titleFromPath(pathname);
  return {
    title: `${title} | Amit Kumar`,
    description:
      "A public page on Amit Kumar's portfolio site for agentic architecture, product building, and growth experiments.",
    body: `# ${title}

This is a public page on Amit Kumar's portfolio site.

## Useful links

- [Home](/)
- [Blog](/blog)
- [Newsletter](/newsletter)
- [Workflow](/workflow)
- [Tweets](/tweets)
- [Sponsor](/sponsor)
`,
  };
}

function buildMarkdown(pathname: string): string {
  const page = pageMarkdown(pathname);

  return `---
title: "${page.title.replace(/"/g, '\\"')}"
description: "${page.description.replace(/"/g, '\\"')}"
url: "${pathname}"
author: "Amit Kumar (aka growthperclick)"
---

${page.body.trim()}
`;
}

export async function middleware(request: NextRequest) {
  if (request.method !== "GET") {
    return NextResponse.next();
  }

  const acceptHeader = request.headers.get("accept") || "";

  if (!acceptsMarkdown(acceptHeader)) {
    return NextResponse.next();
  }

  const url = new URL(request.url);
  const pathname = url.pathname;

  const skipExtensions = [
    ".ico",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".webp",
    ".css",
    ".js",
    ".map",
    ".woff",
    ".woff2",
    ".ttf",
    ".xml",
    ".json",
    ".webmanifest",
  ];

  if (
    skipExtensions.some((ext) => pathname.endsWith(ext)) ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/")
  ) {
    return NextResponse.next();
  }

  const blockedPaths = [
    "/admin",
    "/dashboard",
    "/settings",
    "/login",
    "/signup",
    "/account",
    "/profile",
    "/.well-known",
  ];

  if (blockedPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const markdown = buildMarkdown(pathname);

  return new NextResponse(markdown, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Signal": "ai-train=no, search=yes, ai-input=yes",
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "Accept",
      "x-markdown-tokens": estimateTokens(markdown).toString(),
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
