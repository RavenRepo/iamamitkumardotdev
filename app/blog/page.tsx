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
    <Container>
      <p className="text-foreground pt-4 text-base">
        This is where I write about what I&apos;m building, what I&apos;m testing,
        and what I&apos;m learning while shipping products in public.
      </p>
      <p className="text-foreground pt-4 text-base">
        Expect founder notes, technical breakdowns, launch experiments, and
        playbooks from real execution.
      </p>

      <BlogIndex posts={indexPosts} />
      <DottedSeparator className="my-8" />
    </Container>
  );
}
