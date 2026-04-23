import { NextRequest, NextResponse } from "next/server";

const MARKDOWN_BYPASS_HEADER = "x-markdown-negotiation-bypass";

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

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#[xX]27;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function htmlToMarkdown(html: string): string {
  let md = html;

  md = md.replace(/<script[\s\S]*?<\/script>/gi, "");
  md = md.replace(/<style[\s\S]*?<\/style>/gi, "");
  md = md.replace(/<noscript[\s\S]*?<\/noscript>/gi, "");
  md = md.replace(/<svg[\s\S]*?<\/svg>/gi, "");
  md = md.replace(/<nav[\s\S]*?<\/nav>/gi, "");
  md = md.replace(/<footer[\s\S]*?<\/footer>/gi, "");
  md = md.replace(/<header[\s\S]*?<\/header>/gi, "");

  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n\n# $1\n\n");
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n\n## $1\n\n");
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n\n### $1\n\n");
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "\n\n#### $1\n\n");
  md = md.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, "\n\n##### $1\n\n");
  md = md.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, "\n\n###### $1\n\n");

  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "\n\n$1\n\n");
  md = md.replace(/<br\s*\/?>/gi, "\n");
  md = md.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, "**$2**");
  md = md.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, "*$2*");
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");
  md = md.replace(
    /<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi,
    "![$2]($1)",
  );
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, "![]($1)");
  md = md.replace(
    /<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi,
    "\n\n```\n$1\n```\n\n",
  );
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`");
  md = md.replace(
    /<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi,
    "\n\n> $1\n\n",
  );
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, "\n\n$1\n\n");
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, "\n\n$1\n\n");
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n");
  md = md.replace(/<hr[^>]*\/?>/gi, "\n\n---\n\n");
  md = md.replace(/<[^>]+>/g, "");

  md = decodeHtmlEntities(md);

  return md.replace(/\n{3,}/g, "\n\n").trim();
}

export async function middleware(request: NextRequest) {
  if (request.method !== "GET") {
    return NextResponse.next();
  }

  if (request.headers.get(MARKDOWN_BYPASS_HEADER) === "1") {
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

  try {
    const htmlResponse = await fetch(request.url, {
      headers: {
        [MARKDOWN_BYPASS_HEADER]: "1",
        Accept: "text/html",
        "User-Agent": "Mozilla/5.0 (compatible; MarkdownBot/1.0)",
      },
    });

    if (!htmlResponse.ok) {
      return NextResponse.next();
    }

    const html = await htmlResponse.text();
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const bodyContent = bodyMatch ? bodyMatch[1] : html;
    const markdown = htmlToMarkdown(bodyContent);

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? decodeHtmlEntities(titleMatch[1].trim()) : "";
    const descMatch = html.match(
      /<meta[^>]+name="description"[^>]+content="([^"]*)"[^>]*\/?>/i,
    );
    const description = descMatch
      ? decodeHtmlEntities(descMatch[1].trim())
      : "";

    let frontmatter = "---\n";
    if (title) frontmatter += `title: "${title.replace(/"/g, '\\"')}"\n`;
    if (description) {
      frontmatter += `description: "${description.replace(/"/g, '\\"')}"\n`;
    }
    frontmatter += `url: "${pathname}"\n`;
    frontmatter += 'author: "Amit Kumar (aka growthperclick)"\n';
    frontmatter += "---\n\n";

    const fullMarkdown = frontmatter + markdown;
    const tokenCount = estimateTokens(fullMarkdown);

    return new NextResponse(fullMarkdown, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=3600",
        "Content-Signal": "ai-train=no, search=yes, ai-input=yes",
        "Content-Type": "text/markdown; charset=utf-8",
        Vary: "Accept",
        "x-markdown-tokens": tokenCount.toString(),
      },
    });
  } catch (error) {
    console.error(`[Markdown] Error converting ${pathname}:`, error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
