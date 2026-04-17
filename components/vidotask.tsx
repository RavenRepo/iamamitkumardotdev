"use client";

import React from "react";
import { Subheading } from "./subheading";
import {
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTiktok,
  IconListCheck,
} from "@tabler/icons-react";
import { Box } from "./box";
import { motion } from "motion/react";
import { SPRING_CONFIG } from "@/lib/motion-config";

const platforms = [
  {
    icon: IconBrandInstagram,
    label: "Instagram",
    boxClassName:
      "bg-linear-to-b from-pink-400 to-rose-600 ring-offset-rose-500",
  },
  {
    icon: IconBrandTiktok,
    label: "TikTok",
    boxClassName:
      "bg-linear-to-b from-neutral-700 to-neutral-900 ring-offset-neutral-800",
  },
  {
    icon: IconBrandLinkedin,
    label: "LinkedIn",
    boxClassName:
      "bg-linear-to-b from-blue-400 to-blue-600 ring-offset-blue-500",
  },
];

const points = [
  {
    stat: "87%",
    label: "of saves are never opened again.",
    body: "Saving is not doing. Every time you hit save, your brain tricks you into feeling productive — but you've just moved the problem to a folder you'll never open.",
  },
  {
    stat: "Zero",
    label: "structure in your saved list.",
    body: "A recipe, a workout, a business idea, a tutorial — all dumped in the same place. No next step. No context. No wonder nothing gets executed.",
  },
  {
    stat: "Today",
    label: "not someday.",
    body: "VidoTask pulls from your Instagram, TikTok, and LinkedIn saves and converts them into steps you can actually act on — with structure, not a dump folder.",
  },
];

export const VidoTask = () => {
  return (
    <section>
      <Subheading>Building now</Subheading>

      {/* Identity row — matches work.tsx pattern */}
      <div className="mt-4 flex flex-col gap-1 md:flex-row md:items-center md:gap-2">
        <div className="flex shrink-0 items-center gap-1.5">
          {platforms.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.label}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING_CONFIG, delay: i * 0.05 }}
              >
                <Box className={p.boxClassName}>
                  <Icon className="size-4 text-white drop-shadow-xl drop-shadow-black/40" />
                </Box>
              </motion.div>
            );
          })}

          <span className="text-foreground/30 px-1 text-sm">→</span>

          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_CONFIG, delay: 0.2 }}
          >
            <Box className="bg-linear-to-b from-violet-400 to-violet-600 ring-offset-violet-500">
              <IconListCheck className="size-4 text-white drop-shadow-xl drop-shadow-black/40" />
            </Box>
          </motion.div>
        </div>

        <p className="text-foreground font-medium">VidoTask</p>
        <div className="hidden size-1 rounded-full bg-neutral-200 md:block" />
        <p className="text-foreground/70">
          Turns your saved social content into an actionable plan.
        </p>
      </div>

      {/* Body — plain prose, exactly like header.tsx */}
      <div className="mt-6 flex flex-col gap-4">
        <p className="text-foreground/70 text-base">
          You have hundreds of saved posts on Instagram, TikTok, LinkedIn. Be
          honest — when did you last open any of them?
        </p>

        {points.map((point) => (
          <p key={point.stat} className="text-foreground/70 text-base">
            <span className="text-foreground font-medium">
              {point.stat} — {point.label}
            </span>{" "}
            {point.body}
          </p>
        ))}
      </div>
    </section>
  );
};
