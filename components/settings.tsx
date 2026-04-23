"use client";
import { cn } from "@/lib/utils";
import { IconSettingsFilled, IconX } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { DottedSeparator } from "./separator";

type FontOption = "inter" | "schibsted" | "geist";
type ColorOption =
  | "regular"
  | "rose"
  | "emerald"
  | "blue"
  | "amber"
  | "violet";

const FONTS: { id: FontOption; label: string; variable: string }[] = [
  {
    id: "schibsted",
    label: "Schibsted",
    variable: "var(--font-schibsted-grotesk)",
  },
  { id: "inter", label: "Inter", variable: "var(--font-inter)" },
  { id: "geist", label: "Geist", variable: "var(--font-geist-sans)" },
];

const COLORS: {
  id: ColorOption;
  label: string;
  swatch: string;
  bg: string;
  primary: string;
  foreground: string;
  gradientFrom: string;
  gradientTo: string;
  ringOffset: string;
  activeRing: string;
}[] = [
  {
    id: "regular",
    label: "Paper",
    swatch: "bg-stone-500",
    bg: "var(--color-stone-50)",
    primary: "var(--color-stone-800)",
    foreground: "var(--color-stone-600)",
    gradientFrom: "from-stone-500",
    gradientTo: "to-neutral-800",
    ringOffset: "ring-offset-stone-600",
    activeRing: "ring-stone-600",
  },
  {
    id: "rose",
    label: "Bloom",
    swatch: "bg-fuchsia-500",
    bg: "var(--color-rose-50)",
    primary: "var(--color-rose-900)",
    foreground: "var(--color-rose-600)",
    gradientFrom: "from-rose-400",
    gradientTo: "to-fuchsia-700",
    ringOffset: "ring-offset-fuchsia-500",
    activeRing: "ring-fuchsia-500",
  },
  {
    id: "emerald",
    label: "Lagoon",
    swatch: "bg-teal-500",
    bg: "var(--color-teal-50)",
    primary: "var(--color-teal-900)",
    foreground: "var(--color-teal-600)",
    gradientFrom: "from-teal-400",
    gradientTo: "to-cyan-700",
    ringOffset: "ring-offset-teal-500",
    activeRing: "ring-teal-500",
  },
  {
    id: "blue",
    label: "Nocturne",
    swatch: "bg-indigo-500",
    bg: "var(--color-indigo-50)",
    primary: "var(--color-indigo-950)",
    foreground: "var(--color-indigo-600)",
    gradientFrom: "from-indigo-400",
    gradientTo: "to-violet-700",
    ringOffset: "ring-offset-indigo-500",
    activeRing: "ring-indigo-500",
  },
  {
    id: "amber",
    label: "Honey",
    swatch: "bg-amber-500",
    bg: "var(--color-amber-50)",
    primary: "var(--color-amber-950)",
    foreground: "var(--color-amber-700)",
    gradientFrom: "from-amber-400",
    gradientTo: "to-orange-600",
    ringOffset: "ring-offset-amber-500",
    activeRing: "ring-amber-500",
  },
  {
    id: "violet",
    label: "Lilac",
    swatch: "bg-violet-500",
    bg: "var(--color-violet-50)",
    primary: "var(--color-violet-950)",
    foreground: "var(--color-violet-600)",
    gradientFrom: "from-violet-400",
    gradientTo: "to-purple-700",
    ringOffset: "ring-offset-violet-500",
    activeRing: "ring-violet-500",
  },
];

const STORAGE_KEY = "site-settings";

function isColorOption(value: unknown): value is ColorOption {
  return (
    typeof value === "string" &&
    COLORS.some((c) => c.id === value)
  );
}

function loadSettings(): { font: FontOption; color: ColorOption } {
  if (typeof window === "undefined")
    return { font: "schibsted", color: "regular" };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as {
        font?: FontOption;
        color?: unknown;
      };
      const color = isColorOption(parsed.color)
        ? parsed.color
        : "regular";
      const font =
        parsed.font &&
        FONTS.some((f) => f.id === parsed.font)
          ? parsed.font
          : "schibsted";
      return { font, color };
    }
  } catch {}
  return { font: "schibsted", color: "regular" };
}

function saveSettings(font: FontOption, color: ColorOption) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ font, color }));
}

function applySettings(font: FontOption, color: ColorOption) {
  const root = document.documentElement;
  const fontConfig = FONTS.find((f) => f.id === font)!;
  const colorConfig = COLORS.find((c) => c.id === color)!;

  root.style.setProperty("--primary-font", fontConfig.variable);
  root.style.setProperty("--theme-bg", colorConfig.bg);
  root.style.setProperty("--primary", colorConfig.primary);
  root.style.setProperty("--foreground", colorConfig.foreground);
}

export const Settings = () => {
  const [open, setOpen] = useState(false);
  const [font, setFont] = useState<FontOption>("schibsted");
  const [color, setColor] = useState<ColorOption>("regular");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = loadSettings();
    setFont(saved.font);
    setColor(saved.color);
    applySettings(saved.font, saved.color);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open]);

  const handleFont = (f: FontOption) => {
    setFont(f);
    applySettings(f, color);
    saveSettings(f, color);
  };

  const handleColor = (c: ColorOption) => {
    setColor(c);
    applySettings(font, c);
    saveSettings(font, c);
  };

  const colorConfig = COLORS.find((c) => c.id === color)!;

  return (
    <div
      ref={containerRef}
      className="fixed top-[max(0.75rem,env(safe-area-inset-top))] right-[max(0.75rem,env(safe-area-inset-right))] z-[200] flex flex-col items-end"
    >
      <AnimatePresence mode="wait">
        {!open ? (
          <button
            key="trigger"
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Change site font and accent colors"
            aria-expanded={false}
            aria-haspopup="dialog"
            className={cn(
              "flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg bg-linear-to-b align-middle shadow-md ring-1 ring-white/20 ring-offset-2 ring-inset transition active:scale-95 md:size-8 md:min-h-0 md:min-w-0 md:aspect-square",
              colorConfig.gradientFrom,
              colorConfig.gradientTo,
              colorConfig.ringOffset,
            )}
          >
            <IconSettingsFilled className="size-5 shrink-0 text-white drop-shadow-xl drop-shadow-black/40 md:size-4" />
          </button>
        ) : (
          <motion.div
            key="panel"
            role="dialog"
            aria-label="Appearance settings"
            aria-modal="true"
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "w-[min(calc(100vw-1.5rem),14rem)] rounded-xl border border-neutral-200 bg-linear-to-b p-4 shadow-lg ring-1 ring-white/20 ring-offset-2 ring-inset dark:border-neutral-700",
              colorConfig.gradientFrom,
              colorConfig.gradientTo,
              colorConfig.ringOffset,
            )}
          >
            <motion.div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-white/95">
                  Appearance
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md p-1 text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Close appearance settings"
                >
                  <IconX className="size-4" stroke={1.5} />
                </button>
              </div>
              <div className="mb-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  {FONTS.map((f) => (
                    <button
                      type="button"
                      key={f.id}
                      onClick={() => handleFont(f.id)}
                      style={{ fontFamily: f.variable }}
                      aria-pressed={font === f.id}
                      className={cn(
                        `rounded-md bg-linear-to-b px-2 py-1 text-xs font-light text-white shadow-sm ring-1 shadow-black/10 ring-black/10 transition-all duration-200`,
                        font === f.id && colorConfig.gradientFrom,
                        font === f.id && colorConfig.gradientTo,
                        font === f.id && colorConfig.ringOffset,
                        font === f.id && "shadow-black/60",
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <DottedSeparator />
              <div>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => handleColor(c.id)}
                      className="group flex flex-col items-center gap-1"
                      aria-label={c.label}
                      aria-pressed={color === c.id}
                    >
                      <div
                        className={cn(
                          `size-4 rounded-full transition-all`,
                          c.swatch,
                          color === c.id
                            ? `ring-2 ring-offset-2 ${c.activeRing}`
                            : "ring-1 ring-neutral-200 group-hover:ring-neutral-400",
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
