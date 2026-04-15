"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Subheading } from "../subheading";
import type { PostSummary } from "@/lib/blog";

type BlogListProps = {
  posts: PostSummary[];
};

export function BlogList({ posts }: BlogListProps) {
  return (
    <section className="flex flex-col gap-4">
      <Subheading>Writing</Subheading>
      {posts.slice(0, 3).map((post, index) => (
        <Link
          href={`/blog/${post.slug}`}
          key={index}
          className="group flex items-center justify-between gap-20 transition-colors duration-200 md:gap-20"
        >
          <span className="text-foreground group-hover:text-primary truncate font-medium">
            {post.title}
          </span>
          <span className="text-muted-foreground group-hover:text-primary shrink-0 font-mono text-[10px] tracking-widest uppercase">
            {post.publishedAt
              ? format(new Date(post.publishedAt), "MMM d, yyyy")
              : ""}
          </span>
        </Link>
      ))}
    </section>
  );
}
