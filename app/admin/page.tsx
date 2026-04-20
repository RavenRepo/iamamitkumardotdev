"use client";

import { useState } from "react";
import { signInWithEmail } from "@/lib/auth";
import { motion } from "motion/react";
import { SPRING_CONFIG } from "@/lib/motion-config";
import Container from "@/components/container";
import { Subheading } from "@/components/subheading";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error: authError } = await signInWithEmail(email, password);

      if (authError) {
        setError(authError.message || "Failed to authenticate");
      } else {
        window.location.href = "/admin/dashboard";
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Container className="max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING_CONFIG}
        >
          <Subheading>System access</Subheading>

          <p className="text-foreground mt-4 text-base font-medium">
            Admin panel
          </p>
          <p className="text-foreground/70 text-base">
            Restricted to authorized personnel. All attempts are logged.
          </p>

          <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-4">
            {error && (
              <div className="bg-destructive/10 border-destructive text-destructive border p-3 font-mono text-xs tracking-wider">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-foreground/40 font-mono text-xs uppercase tracking-wide"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="bg-card/30 border-border text-foreground placeholder:text-foreground/30 w-full border px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-foreground/40 font-mono text-xs uppercase tracking-wide"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-card/30 border-border text-foreground placeholder:text-foreground/30 w-full border px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-foreground text-background mt-2 w-full cursor-pointer px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-60"
            >
              {loading ? "Authenticating..." : "Sign in"}
            </button>
          </form>

          <p className="text-foreground/30 mt-6 font-mono text-[10px] tracking-widest uppercase">
            Secure session • Encrypted
          </p>
        </motion.div>
      </Container>
    </div>
  );
}
