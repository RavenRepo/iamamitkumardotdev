"use client";

import { useEffect, useMemo, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({ content }: { content: string }) {
  const [activeId, setActiveId] = useState<string>("");

  const headings = useMemo(() => {
    const matches = content.matchAll(/^(#{2,3})\s+(.+)$/gm);
    const items: TocItem[] = [];

    for (const match of matches) {
      const level = match[1].length;
      const text = match[2].replace(/[*_`\[\]]/g, "").trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      items.push({ id, text, level });
    }

    return items;
  }, [content]);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );

    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 3) return null;

  return (
    <nav className="hidden xl:block fixed right-8 top-1/3 w-56 max-h-[50vh] overflow-y-auto" aria-label="Table of contents">
      <div className="border-l border-border pl-4 space-y-2">
        <span className="font-mono text-[9px] text-muted-foreground/50 uppercase tracking-widest block mb-3">
          ON THIS PAGE
        </span>
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            className={`block font-mono text-[10px] leading-relaxed transition-colors ${
              heading.level === 3 ? "pl-3" : ""
            } ${
              activeId === heading.id
                ? "text-primary"
                : "text-muted-foreground/60 hover:text-muted-foreground"
            }`}
          >
            {heading.text}
          </a>
        ))}
      </div>
    </nav>
  );
}
