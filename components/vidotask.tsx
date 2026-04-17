"use client";

import React, { useState } from "react";
import { Subheading } from "./subheading";
import {
  IconBookmark,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTiktok,
  IconExternalLink,
  IconListCheck,
} from "@tabler/icons-react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { SPRING_CONFIG } from "@/lib/motion-config";

const platforms = [
  {
    icon: IconBrandInstagram,
    label: "Instagram",
    color: "from-pink-500 to-rose-500",
    ring: "ring-offset-rose-500",
  },
  {
    icon: IconBrandTiktok,
    label: "TikTok",
    color: "from-neutral-800 to-neutral-950",
    ring: "ring-offset-neutral-800",
  },
  {
    icon: IconBrandLinkedin,
    label: "LinkedIn",
    color: "from-blue-500 to-blue-700",
    ring: "ring-offset-blue-600",
  },
];

const points = [
  {
    stat: "87%",
    label: "of saves are never opened again",
    body: "Saving is not doing. Every time you hit save, your brain tricks you into feeling productive — but you've just moved the problem to a folder you'll never open.",
  },
  {
    stat: "0",
    label: "structure in your saved list",
    body: "A recipe, a workout, a business idea, a tutorial — all dumped in the same place with zero next step attached. No wonder nothing gets done.",
  },
  {
    stat: "→",
    label: "saves become actionable tasks",
    body: "VidoTask pulls from your Instagram, TikTok, and LinkedIn saves and converts them into steps you can actually execute — today, not someday.",
  },
];

export const VidoTask = () => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section>
      <Subheading>Building now</Subheading>

      {/* App identity row */}
      <div className="mt-4 flex items-center gap-3">
        <div className="relative flex items-center gap-1.5">
          {platforms.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING_CONFIG, delay: i * 0.06 }}
                className={`flex size-7 items-center justify-center rounded-md bg-linear-to-b ${p.color} shadow-md ring-1 ring-white/20 ring-offset-1 ${p.ring} ring-inset`}
              >
                <Icon className="size-3.5 text-white" />
              </motion.div>
            );
          })}
          {/* Arrow to tasks */}
          <span className="text-foreground/30 mx-0.5 text-xs">→</span>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...SPRING_CONFIG, delay: 0.25 }}
            className="flex size-7 items-center justify-center rounded-md bg-linear-to-b from-violet-400 to-violet-600 shadow-md ring-1 ring-white/20 ring-offset-1 ring-offset-violet-500 ring-inset"
          >
            <IconListCheck className="size-3.5 text-white" />
          </motion.div>
        </div>

        <div>
          <p className="text-foreground font-medium leading-none">VidoTask</p>
          <p className="text-foreground/50 mt-0.5 text-xs">
            Saves → actionable plans
          </p>
        </div>

        {/* Live badge */}
        <div className="ml-auto flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 dark:border-amber-800/40 dark:bg-amber-900/20">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-amber-500" />
          </span>
          <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
            In development
          </span>
        </div>
      </div>

      {/* Stat callout */}
      <div className="mt-5 rounded-lg border border-neutral-200/80 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900/50">
        <p className="text-foreground/60 text-sm">
          <span className="text-foreground font-semibold">
            You have hundreds of saved posts
          </span>{" "}
          on Instagram, TikTok, LinkedIn. When did you last open any of them?
        </p>
      </div>

      {/* Three points */}
      <div className="mt-5 flex flex-col gap-4">
        {points.map((point, i) => (
          <motion.div
            key={point.stat}
            className="group flex cursor-default items-start gap-4"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Stat pill */}
            <div className="mt-0.5 flex w-12 shrink-0 items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={hovered === i ? "active" : "idle"}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={SPRING_CONFIG}
                  className={`font-mono text-lg font-bold transition-colors ${
                    hovered === i
                      ? "text-violet-500 dark:text-violet-400"
                      : "text-foreground/25"
                  }`}
                >
                  {point.stat}
                </motion.span>
              </AnimatePresence>
            </div>

            <div>
              <p
                className={`text-sm font-medium transition-colors ${
                  hovered === i
                    ? "text-foreground"
                    : "text-foreground/70"
                }`}
              >
                {point.label}
              </p>
              <p className="text-foreground/50 mt-0.5 text-sm leading-relaxed">
                {point.body}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-6">
        <Link
          href="https://vidotask.com"
          target="_blank"
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 transition-colors hover:text-violet-500 dark:text-violet-400"
        >
          <IconBookmark className="size-4 transition-transform duration-200 group-hover:-rotate-6" />
          Early access — vidotask.com
          <IconExternalLink className="size-3.5 opacity-50 transition-opacity group-hover:opacity-100" />
        </Link>
      </div>
    </section>
  );
};
