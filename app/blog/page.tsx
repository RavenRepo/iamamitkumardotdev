import type { Metadata } from "next";
import Container from "@/components/container";
import { DottedSeparator } from "@/components/separator";
import { BlogIndex } from "@/components/blog/blog-index";
import { getPublishedPosts, SITE_URL } from "@/lib/blog";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog - Amit Kumar",
  description:
    "Founder notes, build logs, and technical writing on shipping products, AI systems, and growth experiments.",
  alternates: {
    canonical: `${SITE_URL}/blog`,
    types: {
      "application/rss+xml": `${SITE_URL}/feed.xml`,
    },
  },
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();
  const indexPosts = posts
    .filter((post) => Boolean(post.publishedAt))
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      publishedAt: post.publishedAt as string,
      summary: post.excerpt || post.summary || "",
    }));

  return (
    <Container className="flex-1">
      <p className="text-muted-foreground pt-4 font-mono text-xs tracking-widest uppercase">
        FOUNDER NOTES, BUILD LOGS, AND TECHNICAL WRITING ON SHIPPING PRODUCTS,
        AI SYSTEMS, AND GROWTH EXPERIMENTS.
      </p>

      <BlogIndex posts={indexPosts} />
      <DottedSeparator className="my-8" />
    </Container>
  );
}
