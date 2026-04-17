import type { Metadata } from "next";
import Container from "@/components/container";
import { DottedSeparator } from "@/components/separator";

export const metadata: Metadata = {
  title: "Workflow - Amit Kumar",
  description:
    "My AI-first dev workflow — the tools, languages, editors, and systems powering 5 parallel projects, soon to be in production.",
  alternates: {
    canonical: "/workflow",
  },
};

type WorkflowItem = {
  label: string;
  description?: string;
  badge?: string;
};

type WorkflowSection = {
  title: string;
  emoji: string;
  items: WorkflowItem[];
};

const sections: WorkflowSection[] = [
  {
    title: "AI Code Assistants",
    emoji: "🤖",
    items: [
      { label: "OpenCode", description: "Primary AI code assistant", badge: "primary" },
      { label: "Claude", description: "Secondary AI assistant — Hermes configured", badge: "secondary" },
      { label: "GitHub Copilot", description: "Tertiary inline completions" },
      { label: "Cursor Agent", description: "IDE-level alternative when needed" },
    ],
  },
  {
    title: "AI / RAG + Memory",
    emoji: "🧠",
    items: [
      { label: "NotebookLM", description: "Deep context and RAG for long documents" },
      { label: "Hermes Agent + Hindsight", description: "Custom agent with cloud memory layer" },
      { label: "Supermemory", description: "by @DhravyaShah — persistent knowledge layer" },
    ],
  },
  {
    title: "Media & Creative",
    emoji: "🎨",
    items: [
      { label: "MiniMax Music Gen + mmx CLI", description: "AI music generation via terminal" },
      { label: "Pencil MCP", description: "AI-powered design tooling inside the workflow" },
    ],
  },
  {
    title: "Languages & Runtimes",
    emoji: "🧱",
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
    emoji: "📝",
    items: [
      { label: "VS Code", description: "Primary editor with full extension ecosystem", badge: "primary" },
      { label: "Zed", description: "Fast, GPU-accelerated editor for focused sessions" },
      { label: "Neovim", description: "Terminal-native editing and scripting" },
      { label: "Cursor", description: "AI-native editor for high-context sessions" },
    ],
  },
  {
    title: "DevOps & Infra",
    emoji: "🐳",
    items: [
      { label: "Podman", description: "Rootless container runtime — primary choice", badge: "primary" },
      { label: "Docker", description: "Fallback and compatibility layer" },
      { label: "kubectl", description: "Kubernetes cluster management" },
    ],
  },
  {
    title: "Databases",
    emoji: "🗃️",
    items: [
      { label: "PostgreSQL", description: "OLTP workhorse for relational data" },
      { label: "MySQL", description: "Legacy and compatibility use cases" },
      { label: "Redis", description: "Caching, pub/sub, and session store" },
      { label: "TimescaleDB", description: "Time-series extension on top of Postgres" },
      { label: "Supabase", description: "Backend-as-a-service with Postgres" },
      { label: "NeonDB", description: "Serverless Postgres for edge workloads" },
    ],
  },
  {
    title: "Terminal Stack",
    emoji: "⚡",
    items: [
      { label: "zsh + Starship", description: "Shell and prompt for maximum clarity" },
      { label: "lazygit", description: "Terminal UI for git — fast and visual" },
      { label: "eza", description: "Modern ls replacement with icons" },
      { label: "bat", description: "cat with syntax highlighting" },
      { label: "fzf", description: "Fuzzy finder for files, commands, history" },
      { label: "btop", description: "Beautiful resource monitor and system overview" },
    ],
  },
  {
    title: "Power Tools",
    emoji: "🔧",
    items: [
      { label: "RTK", description: "My custom token killer — 60–90% token savings on dev ops", badge: "custom" },
      { label: "rclone", description: "Cloud storage sync and backup automation" },
      { label: "ngrok", description: "Instant secure tunnels for local dev" },
      { label: "Caddy", description: "Automatic HTTPS reverse proxy" },
      { label: "tmux", description: "Terminal multiplexer for persistent sessions" },
      { label: "fullstackskills", description: "Custom MCP: 21-agent scaffolding system", badge: "custom" },
      { label: "Ruflo", description: "Custom MCP: agent orchestration layer", badge: "custom" },
      { label: "Context7", description: "Custom MCP: live docs retrieval inside chat", badge: "custom" },
    ],
  },
];

const badgeColors: Record<string, string> = {
  primary: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  secondary: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  custom: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
};

const badgeLabels: Record<string, string> = {
  primary: "primary",
  secondary: "secondary",
  custom: "custom",
};

export default function WorkflowPage() {
  return (
    <>
      <Container className="min-h-screen">
        <p className="text-foreground pt-4 text-base">
          My AI-first dev workflow — currently running{" "}
          <span className="font-medium">5 parallel projects</span>, soon to be
          in production.
        </p>
        <p className="text-foreground/70 pt-2 text-base">
          Every tool here earns its place: no fluff, no bloat — just systems
          that let me move fast and ship clean.
        </p>

        <div className="mt-8 flex flex-col gap-10">
          {sections.map((section) => (
            <div key={section.title}>
              {/* Section Header */}
              <div className="mb-4 flex items-center gap-2">
                <span className="text-lg" aria-hidden="true">
                  {section.emoji}
                </span>
                <h2 className="text-foreground text-sm font-semibold uppercase tracking-widest">
                  {section.title}
                </h2>
              </div>

              {/* Items */}
              <div className="flex flex-col gap-3">
                {section.items.map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    {/* Bullet dot */}
                    <span className="bg-foreground/20 mt-2 size-1.5 shrink-0 rounded-full" />
                    <div className="flex flex-col items-start gap-1 md:flex-row md:items-center md:gap-2">
                      <p className="text-foreground flex items-center gap-2 font-medium">
                        {item.label}
                        {item.badge && (
                          <span
                            className={`rounded px-1.5 py-0.5 text-xs font-medium ${badgeColors[item.badge]}`}
                          >
                            {badgeLabels[item.badge]}
                          </span>
                        )}
                      </p>
                      {item.description && (
                        <>
                          <div className="bg-neutral-200 dark:bg-neutral-700 hidden size-1 rounded-full md:block" />
                          <p className="text-foreground/60 text-sm">
                            {item.description}
                          </p>
                        </>
                      )}
                    </div>
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
