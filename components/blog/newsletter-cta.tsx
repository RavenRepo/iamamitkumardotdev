"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { SPRING_CONFIG } from "@/lib/motion-config";
import { Subheading } from "@/components/subheading";
import { Box } from "@/components/box";
import { IconMailFilled } from "@tabler/icons-react";

type NewsletterState = "idle" | "submitting" | "success" | "error";

export function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<NewsletterState>("idle");
  const [message, setMessage] = useState("");
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setState("submitting");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setState("error");
        setMessage(data.error || "Something went wrong.");
        return;
      }

      setState("success");
      setMessage(
        data.alreadySubscribed
          ? "You're already on the list!"
          : "Subscribed! You'll hear from me soon.",
      );
      setEmail("");
    } catch {
      setState("error");
      setMessage("Network error. Please try again.");
    }
  };

  const toast = (
    <AnimatePresence mode="wait">
      {(state === "success" || state === "error") ? (
        <motion.div
          key={state === "success" ? "subscribe-ok" : "subscribe-err"}
          initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
          transition={SPRING_CONFIG}
          className={`pointer-events-none fixed inset-x-0 bottom-20 z-200 mx-auto flex w-fit items-center justify-center gap-2 rounded-lg p-4 text-center text-white shadow-lg ring-1 shadow-black/10 ring-white/50 ring-offset-2 ring-inset ${
            state === "success"
              ? "bg-linear-to-b from-emerald-400 to-emerald-600 ring-offset-emerald-500"
              : "bg-linear-to-b from-red-400 to-red-600 ring-offset-red-500"
          }`}
        >
          {state === "success" ? (
            <CheckIcon />
          ) : null}
          {message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return (
    <section>
      {mounted ? createPortal(toast, document.body) : null}

      <Subheading>Stay in the loop</Subheading>

      <p className="text-foreground/70 mt-4 text-base">
        Get build logs, shipping notes, and AI product breakdowns delivered to
        your inbox. No spam — just the stuff worth reading.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex flex-1 items-center gap-2">
          <Box className="bg-linear-to-b from-violet-400 to-violet-600 ring-offset-violet-500">
            <IconMailFilled className="size-4 text-white drop-shadow-xl drop-shadow-black/40" />
          </Box>
          <input
            ref={inputRef}
            type="email"
            name="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (state === "error") setState("idle");
            }}
            placeholder="you@domain.com"
            required
            autoComplete="email"
            aria-label="Email address for newsletter"
            className="bg-card/30 border-border text-foreground placeholder:text-foreground/30 w-full rounded-sm border px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <button
          type="submit"
          disabled={state === "submitting"}
          className="bg-linear-to-b from-violet-400 to-violet-600 ring-offset-violet-500 text-white shadow-lg ring-1 ring-white/20 ring-offset-2 ring-inset hover:from-violet-500 hover:to-violet-700 disabled:opacity-60 disabled:cursor-default cursor-pointer rounded-sm px-5 py-2 text-sm font-medium transition-all"
        >
          {state === "submitting" ? (
            <span className="flex items-center gap-2">
              <SpinnerIcon /> Subscribing
            </span>
          ) : (
            "Subscribe"
          )}
        </button>
      </form>

      <p className="text-foreground/40 mt-3 font-mono text-[10px] uppercase tracking-widest">
        Join builders who ship — not just save.
      </p>
    </section>
  );
}

const CheckIcon = () => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="size-4"
    initial={{ scale: 0.5 }}
    animate={{ scale: [0.5, 1.2, 1] }}
    transition={{ duration: 0.3 }}
  >
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
  </motion.svg>
);

const SpinnerIcon = () => (
  <svg
    className="size-3.5 animate-spin"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
);
