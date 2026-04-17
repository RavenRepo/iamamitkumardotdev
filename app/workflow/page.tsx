import type { Metadata } from "next";
import Container from "@/components/container";
import { DottedSeparator } from "@/components/separator";
import { Subheading } from "@/components/subheading";
import React from "react";
import {
  IconBrain,
  IconBrandBunpo,
  IconBrandGithubCopilot,
  IconBrandNodejs,
  IconBrandPython,
  IconBrandRust,
  IconBrandTypescript,
  IconBrandVscode,
  IconCoffee,
  IconDatabase,
  IconBrandSupabase,
  IconTerminal2,
  IconPrompt,
  IconTerminal,
  IconCommand,
  IconAppWindow,
  IconBrandDocker,
  IconNotebook,
  IconCloud,
  IconBolt,
  IconBrandOpenai,
} from "@tabler/icons-react";

export const metadata: Metadata = {
  title: "Workflow - Amit Kumar",
  description:
    "My AI-first dev workflow — the tools, languages, editors, and systems powering my projects.",
  alternates: {
    canonical: "/workflow",
  },
};

const sections = [
  {
    title: "AI Code Assistants",
    items: [
      { icon: IconTerminal2, label: "OpenCode", description: "Primary AI code assistant" },
      { icon: IconBrandOpenai, label: "Claude", description: "Secondary AI assistant — Hermes configured" },
      { icon: IconBrandGithubCopilot, label: "GitHub Copilot", description: "Tertiary inline completions" },
      { icon: IconPrompt, label: "Cursor Agent", description: "IDE-level alternative when needed" },
    ],
  },
  {
    title: "Memory & AI Systems",
    items: [
      { icon: IconNotebook, label: "NotebookLM", description: "Deep context and RAG for long documents" },
      { icon: IconCloud, label: "Hermes + Hindsight", description: "Custom agent with cloud memory layer" },
      { icon: IconBrain, label: "Supermemory", description: "Persistent knowledge layer" },
      { icon: IconTerminal, label: "Ruflo", description: "Custom MCP: agent orchestration layer" },
      { icon: IconTerminal, label: "fullstackskills", description: "Custom MCP: 21-agent scaffolding system" },
      { icon: IconTerminal, label: "Context7", description: "Custom MCP: live docs retrieval inside chat" },
    ],
  },
  {
    title: "Languages & Runtimes",
    items: [
      { icon: IconBrandNodejs, label: "Node.js / pnpm", description: "Primary JS runtime and package manager" },
      { icon: IconBrandRust, label: "Rust / cargo", description: "Systems programming and CLI tooling" },
      { icon: IconBrandBunpo, label: "Bun", description: "Fast JS runtime for edge-ready scripts" },
      { icon: IconBrandPython, label: "Python / uv", description: "AI/ML scripts, fast dependency management" },
      { icon: IconCoffee, label: "Java / SDKMAN", description: "Enterprise integrations and JVM tooling" },
      { icon: IconBrandTypescript, label: "TypeScript", description: "Strict typing across the entire stack" },
    ],
  },
  {
    title: "Editors",
    items: [
      { icon: IconBrandVscode, label: "VS Code", description: "Primary editor with full extension ecosystem" },
      { icon: IconAppWindow, label: "Zed", description: "Fast, GPU-accelerated editor for focused sessions" },
      { icon: IconTerminal, label: "Neovim", description: "Terminal-native editing and scripting" },
      { icon: IconPrompt, label: "Cursor", description: "AI-native editor for high-context sessions" },
    ],
  },
  {
    title: "DevOps & Databases",
    items: [
      { icon: IconBrandDocker, label: "Podman", description: "Rootless container runtime — primary choice" },
      { icon: IconDatabase, label: "PostgreSQL", description: "OLTP workhorse for relational data" },
      { icon: IconBrandSupabase, label: "Supabase", description: "Backend-as-a-service with Postgres" },
      { icon: IconDatabase, label: "Redis", description: "Caching, pub/sub, and session store" },
      { icon: IconDatabase, label: "NeonDB", description: "Serverless Postgres for edge workloads" },
    ],
  },
  {
    title: "Terminal & Power Tools",
    items: [
      { icon: IconTerminal, label: "zsh + Starship", description: "Shell and prompt for maximum clarity" },
      { icon: IconBolt, label: "RTK", description: "Custom token killer — 60–90% token savings on dev ops" },
      { icon: IconCommand, label: "lazygit", description: "Terminal UI for git — fast and visual" },
      { icon: IconCommand, label: "eza", description: "Modern ls replacement with icons" },
      { icon: IconCloud, label: "rclone", description: "Cloud storage sync and backup automation" },
      { icon: IconCloud, label: "ngrok", description: "Instant secure tunnels for local dev" },
    ],
  },
];

export default function WorkflowPage() {
  return (
    <>
      <Container className="min-h-screen">
        <p className="text-foreground pt-4 text-base">
          My AI-first dev workflow — the underlying stack powering how I build,
          scale, and automate.
        </p>
        <p className="text-foreground/70 pt-4 text-base">
          Every tool here earns its place: no fluff, no bloat — just systems
          that let me move fast and ship clean.
        </p>

        <div className="mt-12 flex flex-col gap-12">
          {sections.map((section) => (
            <div key={section.title} className="flex flex-col gap-5">
              <Subheading>{section.title}</Subheading>
              
              <div className="flex flex-col gap-3">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="group flex flex-col items-start gap-1.5 md:flex-row md:items-center md:gap-2">
                      <div className="flex shrink-0 items-center gap-2">
                        <Icon className="text-foreground/50 size-4 transition-colors group-hover:text-foreground" stroke={1.5} />
                        <p className="text-foreground font-medium">
                          {item.label}
                        </p>
                      </div>
                      <div className="hidden size-1 rounded-full bg-neutral-200 dark:bg-neutral-800 md:block" />
                      <p className="text-foreground/70 text-balance">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Container>
      <Container>
        <DottedSeparator className="my-8" />
      </Container>
    </>
  );
}
