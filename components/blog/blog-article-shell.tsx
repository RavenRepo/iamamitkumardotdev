"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { IconArrowLeft } from "@tabler/icons-react";
import Container from "@/components/container";
import { DottedSeparator } from "@/components/separator";

export type BlogArticleFrontMatter = {
  title: string;
  publishedAt: string;
  summary?: string;
  readingTime?: { text: string };
  author?: string;
};

type BlogArticleShellProps = {
  frontMatter: BlogArticleFrontMatter;
  children: React.ReactNode;
};

export function BlogArticleShell({
  frontMatter,
  children,
}: BlogArticleShellProps) {
  const dateLabel = format(parseISO(frontMatter.publishedAt), "MMMM d, yyyy");

  return (
    <Container>
      <article className="pt-4">
        <h2 className="text-primary pt-3 font-mono text-2xl font-bold tracking-widest uppercase">
          {frontMatter.title}
        </h2>
        {frontMatter.summary ? (
          <p className="text-muted-foreground pt-3 font-mono text-xs leading-relaxed tracking-widest uppercase">
            {frontMatter.summary}
          </p>
        ) : null}
        <div className="text-foreground/50 mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-[10px] tracking-widest uppercase">
          <span className="text-primary">
            {frontMatter.author || "Amit Kumar"}
          </span>
          <span aria-hidden className="text-foreground/30">
            ·
          </span>
          <time
            dateTime={frontMatter.publishedAt}
            className="text-muted-foreground"
          >
            {dateLabel}
          </time>
          {frontMatter.readingTime?.text ? (
            <>
              <span aria-hidden className="text-foreground/30">
                ·
              </span>
              <span className="text-muted-foreground">
                {frontMatter.readingTime.text}
              </span>
            </>
          ) : null}
        </div>

        <DottedSeparator className="my-8" />

        <div className="prose prose-neutral prose-headings:scroll-mt-24 prose-a:text-primary prose-a:no-underline hover:prose-a:underline max-w-none">
          {children}
        </div>

        <DottedSeparator className="mt-12 mb-4" />
      </article>
    </Container>
  );
}
