"use client";
import React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { GENERAL_VARIANT, SPRING_CONFIG } from "@/lib/motion-config";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { DottedUnderline } from "./dotted-underline";

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const links = [
  { title: "Home", href: "/" },
  { title: "Tweets", href: "/tweets" },
  { title: "Inspiration", href: "/inspiration" },
  { title: "Workflow", href: "/workflow" },
  { title: "Blog", href: "/blog" },
  { title: "Newsletter", href: "/newsletter" },
  { title: "Sponsor", href: "/sponsor" },
];

export const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="mx-auto flex max-w-2xl flex-col items-start gap-3 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-0.5 md:gap-4 md:pt-8">
      <div className="flex min-w-0 items-center gap-2 perspective-distant">
        <motion.div
          variants={GENERAL_VARIANT}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={SPRING_CONFIG}
          className="shrink-0 rounded-md bg-white shadow-md dark:bg-neutral-800"
        >
          <Image
            src="/profile.jpg"
            alt="Amit Kumar profile photo"
            width={40}
            height={40}
            className="aspect-square size-7 rounded-md shadow-2xl md:size-8"
          />
        </motion.div>
        <div className="text-foreground min-w-0 text-base font-medium tracking-tight sm:text-lg md:text-2xl">
          <span className="text-balance">
            Amit Kumar{" "}
            <span className="text-foreground/50 font-normal">aka</span>{" "}
            <span className="font-normal italic">growthperclick</span>
          </span>
        </div>
      </div>
      <div className="flex w-full min-w-0 flex-wrap items-center gap-x-3 gap-y-2 text-sm md:gap-x-4 md:text-base">
        {links.map((link) => {
          const active = isActivePath(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "group relative transition-colors",
                active
                  ? "text-primary"
                  : "text-foreground/70 hover:text-primary",
              )}
            >
              {link.title}
              <DottedUnderline
                className={cn(
                  "mask-x-from-90% transition-opacity duration-300",
                  active
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100",
                )}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
