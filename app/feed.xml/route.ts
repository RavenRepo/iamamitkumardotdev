import { AUTHOR, getPublishedPosts, SITE_URL } from "@/lib/blog";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const allPosts = await getPublishedPosts();

  const items = allPosts.map((post) => {
    const pubDate = post.publishedAt
      ? new Date(post.publishedAt).toUTCString()
      : new Date(post.createdAt).toUTCString();

    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}/blog/${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${post.slug}</guid>
      <description>${escapeXml(post.excerpt || "")}</description>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXml(AUTHOR.name)}</author>
    </item>`;
  });

  const lastBuildDate = allPosts[0]?.publishedAt
    ? new Date(allPosts[0].publishedAt).toUTCString()
    : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${AUTHOR.name} — Engineering Records`)}</title>
    <link>${SITE_URL}/blog</link>
    <description>Technical logs on AI agents, SaaS architectures, and full-stack development patterns.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items.join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
