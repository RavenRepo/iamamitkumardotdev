"use client";

import { IconBrandTwitter, IconBrandLinkedin } from "@tabler/icons-react";
import { Link2, Check } from "lucide-react";
import { useState } from "react";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
        SHARE:
      </span>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 flex items-center justify-center border border-border hover:border-primary hover:text-primary text-muted-foreground transition-colors"
        aria-label="Share on Twitter"
      >
        <IconBrandTwitter className="w-3.5 h-3.5" />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 flex items-center justify-center border border-border hover:border-primary hover:text-primary text-muted-foreground transition-colors"
        aria-label="Share on LinkedIn"
      >
        <IconBrandLinkedin className="w-3.5 h-3.5" />
      </a>
      <button
        onClick={handleCopy}
        className="w-8 h-8 flex items-center justify-center border border-border hover:border-primary hover:text-primary text-muted-foreground transition-colors"
        aria-label="Copy link to clipboard"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-primary" />
        ) : (
          <Link2 className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}
