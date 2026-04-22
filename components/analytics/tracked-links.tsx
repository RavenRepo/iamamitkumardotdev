"use client";

import { trackCTA, trackExternal } from "@/lib/analytics";

/**
 * Trackable mailto link
 * Usage: <TrackedMailto subject="MVP Sprint" ctaType="mvp-sprint" href="mailto:hi@iamamitkumar.dev?subject=..." />
 */
export function TrackedMailto({
  href,
  subject,
  ctaType,
  children,
  className,
}: {
  href: string;
  subject: string;
  ctaType: string;
  children: React.ReactNode;
  className?: string;
}) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    trackCTA("mailto", {
      subject,
      cta_type: ctaType,
    });
    window.location.href = href;
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}

/**
 * Trackable external link
 * Usage: <TrackedExternal product="vidotask" url="https://vidotask.com" />
 */
export function TrackedExternal({
  url,
  product,
  children,
  className,
}: {
  url: string;
  product: string;
  children: React.ReactNode;
  className?: string;
}) {
  const handleClick = (e: React.MouseEvent) => {
    trackExternal(product, url);
    // Let the default navigation happen
  };

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" onClick={handleClick} className={className}>
      {children}
    </a>
  );
}