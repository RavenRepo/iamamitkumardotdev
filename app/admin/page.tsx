"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

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
      console.log("Attempting login with:", email);
      const result = await authClient.signIn.email({
        email,
        password,
      });
      console.log("Login result:", result);

      if (result.error) {
        setError(result.error.message || "Failed to authenticate");
      } else {
        window.location.href = "/admin/dashboard";
      }
    } catch (err: unknown) {
      console.error("Login error:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background relative flex min-h-dvh items-center justify-center overflow-hidden px-4">
      <div className="bg-grid-blueprint text-foreground pointer-events-none absolute inset-0 opacity-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-card border-border monolith-glass relative border p-8">
          <div className="from-primary/5 pointer-events-none absolute inset-0 bg-linear-to-br to-transparent opacity-100" />

          <div className="border-border relative z-10 mb-8 border-b pb-6 text-center">
            <h1 className="font-display text-foreground mb-2 text-2xl font-bold tracking-widest uppercase">
              SYS_ADMIN_ACCESS
            </h1>
            <p className="text-primary font-mono text-[10px] tracking-widest uppercase">
              Restricted to authorized personnel only. Logging all attempts.
            </p>
          </div>

          <form onSubmit={handleLogin} className="relative z-10 space-y-6">
            {error && (
              <div className="text-danger bg-danger/10 border-danger border p-3 font-mono text-xs tracking-widest uppercase">
                [ERROR] {error}
              </div>
            )}

            <div className="space-y-3">
              <label className="text-muted-foreground block font-mono text-[10px] font-medium tracking-widest uppercase">
                Identifier_String (Email)
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background border-border focus:border-primary text-foreground placeholder:text-muted-foreground/30 w-full border px-4 py-3 font-mono text-sm transition-colors focus:outline-none"
                placeholder="hello@iamamitkumar.dev"
              />
            </div>

            <div className="space-y-3">
              <label className="text-muted-foreground block font-mono text-[10px] font-medium tracking-widest uppercase">
                Access_Key (Password)
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background border-border focus:border-primary text-foreground placeholder:text-muted-foreground/30 w-full border px-4 py-3 font-mono text-sm transition-colors focus:outline-none"
                placeholder="••••••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="outline"
              className="mt-4 flex w-full items-center justify-center gap-3 font-mono text-xs tracking-widest uppercase"
            >
              {loading ? (
                <>
                  <span className="bg-primary h-2 w-2 animate-ping" />
                  AUTHENTICATING_SYS...
                </>
              ) : (
                <>
                  <span className="border-primary flex h-2 w-2 items-center justify-center border">
                    <span className="bg-primary h-1 w-1 group-hover:animate-pulse" />
                  </span>
                  INIT_SECURE_ACCESS
                </>
              )}
            </Button>
          </form>

          {/* Decorative Corner Accents */}
          <div className="border-border absolute top-0 right-0 h-4 w-4 border-t border-r" />
          <div className="border-border absolute bottom-0 left-0 h-4 w-4 border-b border-l" />
        </div>
      </motion.div>
    </div>
  );
}
