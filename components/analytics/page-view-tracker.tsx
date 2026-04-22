"use client";

import { trackPageView } from "@/lib/analytics";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Automatically tracks page views on route changes.
 * Drop into layout.tsx or a providers wrapper.
 */
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  return null;
}