import type { Metadata } from "next";
import Container from "@/components/container";
import { DottedSeparator } from "@/components/separator";
import { Subheading } from "@/components/subheading";

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
      { label: "OpenCode", description: "Primary AI code assistant" },
      { label: "Claude", description: "Secondary AI assistant — Hermes configured" },
      { label: "GitHub Copilot", description: "Tertiary inline completions" },
      { label: "Cursor Agent", description: "IDE-level alternative when needed" },
    ],
  },
  {
    title: "Memory & AI Systems",
    items: [
      { label: "NotebookLM", description: "Deep context and RAG for long documents" },
      { label: "Hermes + Hindsight", description: "Custom agent with cloud memory layer" },
      { label: "Supermemory", description: "Persistent knowledge layer" },
      { label: "Ruflo", description: "Custom MCP: agent orchestration layer" },
      { label: "fullstackskills", description: "Custom MCP: 21-agent scaffolding system" },
      { label: "Context7", description: "Custom MCP: live docs retrieval inside chat" },
    ],
  },
  {
    title: "Languages & Runtimes",
    items: [
      { label: "Node.js / pnpm", description: "Primary JS runtime and package manager" },
      { label: "Rust / cargo", description: "Systems programming and CLI tooling" },
      { label: "Bun", description: "Fast JS runtime for edge-ready scripts" },
      { label: "Python / uv", description: "AI/ML scripts, fast dependency management" },
      { label: "Java / SDKMAN", description: "Enterprise integrations and JVM tooling" },
      { label: "TypeScript", description: "Strict typing across the entire stack" },
    ],
  },
  {
    title: "Editors",
    items: [
      { label: "VS Code", description: "Primary editor with full extension ecosystem" },
      { label: "Zed", description: "Fast, GPU-accelerated editor for focused sessions" },
      { label: "Neovim", description: "Terminal-native editing and scripting" },
      { label: "Cursor", description: "AI-native editor for high-context sessions" },
    ],
  },
  {
    title: "DevOps & Databases",
    items: [
      { label: "Podman", description: "Rootless container runtime — primary choice" },
      { label: "PostgreSQL", description: "OLTP workhorse for relational data" },
      { label: "Supabase", description: "Backend-as-a-service with Postgres" },
      { label: "Redis", description: "Caching, pub/sub, and session store" },
      { label: "NeonDB", description: "Serverless Postgres for edge workloads" },
    ],
  },
  {
    title: "Terminal & Power Tools",
    items: [
      { label: "zsh + Starship", description: "Shell and prompt for maximum clarity" },
      { label: "RTK", description: "Custom token killer — 60–90% token savings on dev ops" },
      { label: "lazygit", description: "Terminal UI for git — fast and visual" },
      { label: "eza", description: "Modern ls replacement with icons" },
      { label: "rclone", description: "Cloud storage sync and backup automation" },
      { label: "ngrok", description: "Instant secure tunnels for local dev" },
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
                {section.items.map((item) => (
                  <div key={item.label} className="flex flex-col items-start gap-1 md:flex-row md:items-center md:gap-2">
                    <p className="text-foreground font-medium shrink-0">
                      {item.label}
                    </p>
                    <div className="hidden size-1 rounded-full bg-neutral-200 dark:bg-neutral-800 md:block" />
                    <p className="text-foreground/70 text-balance">
                      {item.description}
                    </p>
                  </div>
                ))}
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
