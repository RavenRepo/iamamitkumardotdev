import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatPostDate } from "@/lib/format-post-date";

export type BlogPostLinkProps = {
  title: string;
  slug: string;
  publishedAt: string;
  className?: string;
};

export function BlogPostLink({
  title,
  slug,
  publishedAt,
  className,
}: BlogPostLinkProps) {
  return (
    <Link
      href={`/blog/${slug}`}
      className={cn(
        "group flex flex-col gap-1 transition-colors duration-200 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 md:gap-20",
        className,
      )}
    >
      <span className="text-foreground group-hover:text-primary min-w-0 font-medium sm:truncate">
        {title}
      </span>
      <span className="text-muted-foreground group-hover:text-primary shrink-0 font-mono text-[10px] tracking-widest uppercase">
        {formatPostDate(publishedAt)}
      </span>
    </Link>
  );
}
