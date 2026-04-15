import Link from "next/link";
import Container from "@/components/container";
import { format } from "date-fns";
import { Clock, Tag } from "lucide-react";
import type { Metadata } from "next";
import {
  estimateReadingTime,
  getPublishedPosts,
  parseTags,
  SITE_URL,
} from "@/lib/blog";

type Props = {
  params: Promise<{ tag: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return {
    title: `Posts tagged "${decoded}"`,
    description: `All blog posts tagged with "${decoded}" by Amit Kumar.`,
    alternates: { canonical: `${SITE_URL}/blog/tag/${tag}` },
    robots: {
      index: false,
      follow: true,
      googleBot: {
        index: false,
        follow: true,
      },
    },
  };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag).toLowerCase();

  const allPosts = await getPublishedPosts();
  const filtered = allPosts.filter((post) =>
    parseTags(post.tags).some((t) => t.toLowerCase() === decoded)
  );

  return (
    <div className="min-h-dvh pt-32 pb-24 bg-background relative overflow-hidden">
      <div
        className="absolute inset-0 bg-grid text-foreground opacity-20 pointer-events-none"
        aria-hidden="true"
      />

      <Container className="relative z-10">
        <div className="mb-16 border-b border-border pb-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-8 group"
          >
            <span
              className="w-1.5 h-1.5 bg-border group-hover:bg-primary transition-colors mr-3"
              aria-hidden="true"
            />
            RETURN_TO_INDEX
          </Link>

          <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground uppercase tracking-widest mb-4">
            <Tag className="w-4 h-4 text-primary" aria-hidden="true" />
            TAG_FILTER
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tighter text-foreground uppercase mb-2">
            {decoded}
          </h1>
          <p className="text-sm font-mono text-muted-foreground">
            {filtered.length} RECORD{filtered.length !== 1 ? "S" : ""} FOUND
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post) => {
            const readingTime = estimateReadingTime(post.content);
            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block h-full"
              >
                <article className="h-full border border-border bg-card/50 hover:bg-background hover:border-primary/50 transition-all duration-300 p-6 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    {post.publishedAt && (
                      <time
                        dateTime={new Date(post.publishedAt).toISOString()}
                        className="font-mono text-[10px] text-muted-foreground bg-background border border-border px-2 py-1 tracking-widest"
                      >
                        {format(new Date(post.publishedAt), "yyyy.MM.dd")}
                      </time>
                    )}
                    <div className="font-mono text-[10px] text-muted-foreground/60 flex items-center gap-1">
                      <Clock className="w-3 h-3" aria-hidden="true" />
                      {readingTime} MIN
                    </div>
                  </div>
                  <h2 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-3 leading-tight">
                    {post.title}
                  </h2>
                  <p className="font-mono text-xs text-muted-foreground line-clamp-3 leading-relaxed flex-1">
                    {post.excerpt}
                  </p>
                  <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-muted-foreground/50 group-hover:text-primary transition-colors uppercase tracking-widest">
                      [READ_RECORD]
                    </span>
                    <span
                      className="w-1.5 h-1.5 bg-border group-hover:bg-primary transition-colors"
                      aria-hidden="true"
                    />
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
