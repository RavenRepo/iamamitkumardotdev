"use client";

import React from "react";
import { Subheading } from "@/components/subheading";
import {
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTiktok,
  IconListCheck,
  IconBolt,
  IconBrain,
  IconChecklist,
} from "@tabler/icons-react";
import { Box } from "@/components/box";
import { LinkPreview } from "@/components/link-preview";
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

const stats = [
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

const features = [
  {
    icon: IconBolt,
    title: "Auto-import saves",
    description:
      "Connect your Instagram, TikTok, and LinkedIn. VidoTask pulls your saved posts automatically — no manual entry, no copy-paste.",
    boxClassName:
      "bg-linear-to-b from-amber-400 to-orange-500 ring-offset-orange-500",
  },
  {
    icon: IconBrain,
    title: "AI-powered task extraction",
    description:
      "Each save gets analyzed and broken into concrete next steps. A recipe becomes a grocery list. A tutorial becomes a learning schedule.",
    boxClassName:
      "bg-linear-to-b from-violet-400 to-violet-600 ring-offset-violet-500",
  },
  {
    icon: IconChecklist,
    title: "Actionable plans, not bookmarks",
    description:
      "Your saves become structured tasks with deadlines, priorities, and context. Finally, that saved post becomes something you actually do.",
    boxClassName:
      "bg-linear-to-b from-emerald-400 to-emerald-600 ring-offset-emerald-500",
  },
];

export const VidoTask = () => {
  return (
    <section>
      <Subheading>Building now</Subheading>

      <div className="mt-4 flex flex-col gap-1 md:flex-row md:items-center md:gap-2">
        <div className="flex shrink-0 items-center gap-1.5">
          {platforms.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.label}
                initial={{ y: 4 }}
                animate={{ y: 0 }}
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
            initial={{ y: 4 }}
            animate={{ y: 0 }}
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

      <div className="mt-6 flex flex-col gap-4">
        <p className="text-foreground/70 text-base">
          You have hundreds of saved posts on Instagram, TikTok, LinkedIn. Be
          honest — when did you last open any of them?
        </p>

        {stats.map((point) => (
          <p key={point.stat} className="text-foreground/70 text-base">
            <span className="text-foreground font-medium">
              {point.stat} — {point.label}
            </span>{" "}
            {point.body}
          </p>
        ))}
      </div>

      <div className="mt-10 flex flex-col gap-4">
        <p className="text-foreground text-base font-medium">
          How VidoTask fixes it
        </p>

        {features.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ y: 6 }}
              animate={{ y: 0 }}
              transition={{ ...SPRING_CONFIG, delay: 0.3 + i * 0.08 }}
              className="flex flex-col"
            >
              <div className="flex flex-row items-center gap-2">
                <Box className={feature.boxClassName}>
                  <Icon className="size-4 text-white drop-shadow-xl drop-shadow-black/40" />
                </Box>
                <p className="text-foreground font-medium text-balance">
                  {feature.title}
                </p>
              </div>
              <p className="text-foreground/70 mt-2 text-sm">
                {feature.description}
              </p>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8">
        <p className="text-foreground/70 text-base">
          Try it out at{" "}
          <LinkPreview url="https://vidotask.com">
            vidotask.com
          </LinkPreview>{" "}
          — currently in active development.
        </p>
      </div>
    </section>
  );
};
