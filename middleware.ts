import { NextRequest, NextResponse } from "next/server";

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function htmlToMarkdown(html: string): string {
  let md = html;

  // Remove script, style, noscript, svg, and other non-content elements
  md = md.replace(/<script[\s\S]*?<\/script>/gi, "");
  md = md.replace(/<style[\s\S]*?<\/style>/gi, "");
  md = md.replace(/<noscript[\s\S]*?<\/noscript>/gi, "");
  md = md.replace(/<svg[\s\S]*?<\/svg>/gi, "");
  md = md.replace(/<nav[\s\S]*?<\/nav>/gi, "");
  md = md.replace(/<footer[\s\S]*?<\/footer>/gi, "");
  md = md.replace(/<header[\s\S]*?<\/header>/gi, "");

  // Headings
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n\n# $1\n\n");
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n\n## $1\n\n");
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n\n### $1\n\n");
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "\n\n#### $1\n\n");
  md = md.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, "\n\n##### $1\n\n");
  md = md.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, "\n\n###### $1\n\n");

  // Paragraphs
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "\n\n$1\n\n");

  // Line breaks
  md = md.replace(/<br\s*\/?>/gi, "\n");

  // Bold and italic
  md = md.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, "**$2**");
  md = md.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, "*$2*");

  // Links
  md = md.replace(
    /<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi,
    "[$2]($1)",
  );

  // Images
  md = md.replace(
    /<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi,
    "![$2]($1)",
  );
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, "![]($1)");

  // Code blocks
  md = md.replace(
    /<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi,
    "\n\n```\n$1\n```\n\n",
  );
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`");

  // Blockquotes
  md = md.replace(
    /<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi,
    "\n\n> $1\n\n",
  );

  // Lists
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, "\n\n$1\n\n");
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, "\n\n$1\n\n");
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n");

  // Horizontal rules
  md = md.replace(/<hr[^>]*\/?>/gi, "\n\n---\n\n");

  // Remove all remaining HTML tags
  md = md.replace(/<[^>]+>/g, "");

  // Decode common HTML entities
  md = md.replace(/&amp;/g, "&");
  md = md.replace(/&lt;/g, "<");
  md = md.replace(/&gt;/g, ">");
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#39;/g, "'");
  md = md.replace(/&nbsp;/g, " ");

  // Clean up whitespace
  md = md.replace(/\n{3,}/g, "\n\n");
  md = md.trim();

  return md;
}

export async function middleware(request: NextRequest) {
  const url = new URL(request.url);

  // Skip if this is an internal fetch (marked by query parameter)
  if (url.searchParams.get("_md") === "1") {
    url.searchParams.delete("_md");
    return NextResponse.next();
  }

  const acceptHeader = request.headers.get("accept") || "";

  if (!acceptHeader.includes("text/markdown")) {
    return NextResponse.next();
  }

  // Skip non-HTML resources
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
    skipExtensions.some((ext) => url.pathname.endsWith(ext)) ||
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/api/")
  ) {
    return NextResponse.next();
  }

  // Block markdown conversion for sensitive/internal paths
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

  if (blockedPaths.some((path) => url.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  try {
    // Fetch the HTML version with a query parameter to prevent recursion
    const fetchUrl = new URL(url.pathname + url.search, request.url);
    fetchUrl.searchParams.set("_md", "1");

    const htmlResponse = await fetch(fetchUrl.toString(), {
      headers: {
        accept: "text/html",
      },
      redirect: "manual",
    });

    // Handle redirects by passing through
    if (htmlResponse.status >= 300 && htmlResponse.status < 400) {
      return NextResponse.next();
    }

    const html = await htmlResponse.text();

    // Extract content from body
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const bodyContent = bodyMatch ? bodyMatch[1] : html;

    // Convert HTML to markdown
    const markdown = htmlToMarkdown(bodyContent);

    // Build a clean markdown document with frontmatter from metadata
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "";
    const descMatch = html.match(
      /<meta[^>]+name="description"[^>]+content="([^"]*)"[^>]*\/?>/i,
    );
    const description = descMatch ? descMatch[1].trim() : "";

    let frontmatter = "---\n";
    if (title) frontmatter += `title: "${title.replace(/"/g, '\\"')}"\n`;
    if (description)
      frontmatter += `description: "${description.replace(/"/g, '\\"')}"\n`;
    frontmatter += `url: "${url.pathname}"\n`;
    frontmatter += "---\n\n";

    const fullMarkdown = frontmatter + markdown;
    const tokenCount = estimateTokens(fullMarkdown);

    return new NextResponse(fullMarkdown, {
      status: htmlResponse.status,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "x-markdown-tokens": tokenCount.toString(),
        Vary: "Accept",
      },
    });
  } catch (error) {
    console.error(`[Markdown] Error converting ${url.pathname}:`, error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
