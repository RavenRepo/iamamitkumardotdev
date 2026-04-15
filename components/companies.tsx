import React from "react";
import { Subheading } from "./subheading";
import {
  CursorIcon,
  FireworksIcon,
  HostingerIcon,
  NeonIcon,
  PosthogIcon,
  StrapiIcon,
} from "./icons/general";
import { Box } from "./box";

export const Companies = () => {
  const companies = [
    {
      title: "LaunchSuite.tech",
      description: "SaaS boilerplate MVP for founders, launched for speed-to-revenue.",
      skeleton: (
        <CursorIcon className="size-4 text-white drop-shadow-xl drop-shadow-black/40" />
      ),
      boxClassName:
        "bg-linear-to-b from-neutral-400 to-neutral-600 ring-offset-neutral-500",
    },
    {
      title: "Index Mavens",
      description: "8-agent trading intelligence system for Indian market workflows.",
      skeleton: (
        <NeonIcon className="size-4 text-white drop-shadow-xl drop-shadow-black/40" />
      ),
      boxClassName:
        "bg-linear-to-b from-green-400 to-green-600 ring-offset-green-500",
    },
    {
      title: "ComplianceHQ",
      description: "AI-powered compliance automation for startup security readiness.",
      skeleton: (
        <StrapiIcon className="size-4 text-white drop-shadow-xl drop-shadow-black/40" />
      ),
      boxClassName:
        "bg-linear-to-b from-violet-400 to-violet-600 ring-offset-violet-500",
    },
    {
      title: "SharkOS",
      description: "LinkedIn operating system replacing multiple GTM SaaS tools.",
      skeleton: (
        <HostingerIcon className="size-4 text-white drop-shadow-xl drop-shadow-black/40" />
      ),
      boxClassName:
        "bg-linear-to-b from-purple-400 to-purple-600 ring-offset-purple-500",
    },
    {
      title: "BrandCo",
      description: "AI brand strategy engine for conversion-led positioning.",
      skeleton: (
        <PosthogIcon className="size-4 text-white drop-shadow-xl drop-shadow-black/40" />
      ),
      boxClassName:
        "bg-linear-to-b from-yellow-400 to-yellow-600 ring-offset-yellow-500",
    },
    {
      title: "JARVIS OS",
      description: "Local-first AI morning briefing assistant for focused execution.",
      skeleton: (
        <FireworksIcon className="size-4 text-white drop-shadow-xl drop-shadow-black/40" />
      ),
      boxClassName:
        "bg-linear-to-b from-indigo-400 to-indigo-600 ring-offset-indigo-500",
    },
  ];
  return (
    <section>
      <Subheading>Products I've built</Subheading>
      <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-3">
        {companies.map((company) => (
          <div key={company.title} className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Box className={company.boxClassName}>{company.skeleton}</Box>
              <p className="text-foreground text-sm font-medium">
                {company.title}
              </p>
            </div>
            <p className="text-foreground/70 text-sm text-pretty">
              {company.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
