"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface ClapButtonProps {
  slug: string;
}

function ClapParticle({
  x,
  y,
  id,
  distance,
}: {
  x: number;
  y: number;
  id: number;
  distance: number;
}) {
  const angle = (id * 137.5) % 360;
  const tx = Math.cos((angle * Math.PI) / 180) * distance;
  const ty = Math.sin((angle * Math.PI) / 180) * distance;

  return (
    <span
      className="absolute pointer-events-none"
      style={{
        left: x,
        top: y,
        width: 4,
        height: 4,
        background: "var(--primary)",
        animation: "clap-particle 0.6s ease-out forwards",
        ["--tx" as string]: `${tx}px`,
        ["--ty" as string]: `${ty}px`,
      }}
      aria-hidden="true"
    />
  );
}

const MAX_CLAPS = 1;

export function ClapButton({ slug }: ClapButtonProps) {
  const [userClaps, setUserClaps] = useState(0);
  const [totalClaps, setTotalClaps] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; distance: number }[]
  >([]);
  const [showCount, setShowCount] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const particleIdRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const statusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    async function fetchClaps() {
      try {
        const params = new URLSearchParams({ slug });
        const res = await fetch(`/api/clap?${params.toString()}`);
        const data = await res.json();
        if (data.claps !== undefined) {
          setUserClaps(data.claps);
          setTotalClaps(data.total || 0);
        }
      } catch (error) {
        console.error("Failed to fetch claps:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchClaps();
  }, [slug]);

  const handleClap = useCallback(async () => {
    if (userClaps >= MAX_CLAPS) {
      setStatusMessage(
        "Thanks! I really appreciate you liked it. One clap per post here, so please share this blog."
      );
      if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
      statusTimeoutRef.current = setTimeout(() => setStatusMessage(null), 3200);
      return;
    }

    try {
      const res = await fetch("/api/clap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();

      if (data.success) {
        setUserClaps(data.claps);
        setTotalClaps(data.total);
        setStatusMessage("Thanks for the clap!");
        if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
        statusTimeoutRef.current = setTimeout(() => setStatusMessage(null), 1800);
      }
    } catch (error) {
      console.error("Failed to clap:", error);
    }

    setIsAnimating(true);
    setShowCount(true);

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const containerRect = buttonRef.current.parentElement?.getBoundingClientRect();
      if (containerRect) {
        const x = rect.left - containerRect.left + rect.width / 2;
        const y = rect.top - containerRect.top + rect.height / 2;
        const newParticles = Array.from({ length: 5 }, () => ({
          id: particleIdRef.current++,
          x,
          y,
          distance: 30 + Math.random() * 40,
        }));
        setParticles((prev) => [...prev, ...newParticles]);
        setTimeout(() => {
          setParticles((prev) =>
            prev.filter((p) => !newParticles.find((np) => np.id === p.id))
          );
        }, 700);
      }
    }

    setTimeout(() => setIsAnimating(false), 300);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShowCount(false), 1500);
  }, [slug, userClaps]);

  const hasClapped = userClaps > 0;
  const isMaxed = userClaps >= MAX_CLAPS;

  return (
    <div className="flex flex-col items-center gap-4 relative">
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        {particles.map((p) => (
          <ClapParticle
            key={p.id}
            x={p.x}
            y={p.y}
            id={p.id}
            distance={p.distance}
          />
        ))}
      </div>

      <div
        className="transition-all duration-300 ease-out"
        style={{
          opacity: showCount ? 1 : 0,
          transform: showCount ? "translateY(0) scale(1)" : "translateY(8px) scale(0.8)",
        }}
      >
        <span className="font-mono text-xs text-primary font-bold bg-primary/10 border border-primary/20 px-3 py-1 inline-block">
          +{userClaps}
        </span>
      </div>

      <button
        ref={buttonRef}
        onClick={handleClap}
        disabled={isLoading}
        aria-label={`Clap for this post. ${userClaps} claps given.`}
        className={`
          group relative w-16 h-16 flex items-center justify-center
          border transition-all duration-200 ease-out
          ${hasClapped
            ? "border-primary/40 bg-primary/5"
            : "border-border bg-card/30 hover:border-primary/50 hover:bg-primary/5"
          }
          ${isLoading ? "opacity-60 cursor-default" : "cursor-pointer active:scale-90"}
        `}
      >
        <span
          className={`text-3xl select-none transition-transform duration-200 ${isAnimating ? "scale-125" : "scale-100"}`}
          role="img"
          aria-hidden="true"
        >
          👏
        </span>
        <span
          className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/30"
          aria-hidden="true"
        />
        <span
          className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary/30"
          aria-hidden="true"
        />
      </button>

      <div className="text-center space-y-1">
        <p className="font-mono text-sm font-bold text-foreground tabular-nums">
          {isLoading ? "..." : totalClaps}
        </p>
        {statusMessage ? (
          <p className="text-[11px] text-primary/85 leading-relaxed max-w-[220px]">
            {statusMessage}
          </p>
        ) : (
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
            {isMaxed
              ? "CLAP_REGISTERED_SHARE_IT"
              : hasClapped
              ? "CLAP_REGISTERED"
              : "CLAP_TO_APPRECIATE"}
          </p>
        )}
      </div>
    </div>
  );
}
