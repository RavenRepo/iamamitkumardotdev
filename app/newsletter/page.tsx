"use client";

import React, { useState } from "react";
import Container from "@/components/container";
import { Subheading } from "@/components/subheading";
import { DottedSeparator } from "@/components/separator";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "You're in! Check your inbox.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Failed to connect. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            disabled={status === "loading"}
            className="flex-1 px-4 py-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-transparent text-foreground placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity50"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-6 py-3 rounded-md bg-primary text-white font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {status === "loading" ? "Joining..." : "Join"}
          </button>
        </div>
        {message && (
          <p
            className={`text-sm ${
              status === "success"
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

export default function NewsletterPage() {
  return (
    <Container>
      <div className="py-12 md:py-20">
        <Subheading>Newsletter</Subheading>

        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mt-2 mb-6">
          Get smarter about <span className="text-primary">AI Agents</span>
        </h1>

        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-lg mb-12">
          Every week, I share what I learned building autonomous AI agents, orchestrating multi-agent workflows, and shipping SaaS products in public.
          Zero fluff. Real code. Actual results.
        </p>

        <NewsletterSignup />

        <DottedSeparator className="my-12" />

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-medium mb-2">What you'll get</h3>
            <ul className="text-neutral-600 dark:text-neutral-400 space-y-2">
              <li>✓ Real builds with code examples</li>
              <li>✓ Mistakes I made (so you don't)</li>
              <li>✓ Tool recommendations that actually work</li>
              <li>✓ Early access to my projects</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Join 200+ indie hackers</h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              I respect your inbox. No spam, no fluff, no "buy my course" emails.
              Just real insights from someone building in public.
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
}