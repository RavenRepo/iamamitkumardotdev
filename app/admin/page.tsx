"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "motion/react";
import Container from "@/components/container";

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
    <div className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="bg-grid-blueprint text-foreground pointer-events-none absolute inset-0 opacity-10" />

      <Container className="relative z-10 max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="bg-card border-border relative border p-8"
        >
          <div className="from-primary/5 pointer-events-none absolute inset-0 bg-linear-to-br to-transparent" />

          <div className="border-border relative z-10 mb-8 border-b pb-6 text-center">
            <h1 className="font-display text-foreground mb-2 text-2xl font-bold tracking-widest uppercase">
              SYS_ADMIN_ACCESS
            </h1>
            <p className="text-primary font-mono text-[10px] tracking-widest uppercase">
              RESTRICTED TO AUTHORIZED PERSONNEL ONLY. LOGGING ALL ATTEMPTS.
            </p>
          </div>

          <form onSubmit={handleLogin} className="relative z-10 space-y-6">
            {error && (
              <div className="bg-destructive/10 border-destructive text-destructive border p-3 font-mono text-[10px] tracking-widest uppercase">
                [ERROR] {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">IDENTIFIER_STRING (EMAIL)</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="HELLO@IAMAMITKUMAR.DEV"
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">ACCESS_KEY (PASSWORD)</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="font-mono"
              />
            </div>

            <Button type="submit" disabled={loading} className="mt-4 w-full">
              {loading ? (
                <>
                  <span className="bg-primary mr-2 h-2 w-2 animate-ping" />
                  AUTHENTICATING_SYS...
                </>
              ) : (
                <>
                  <span className="border-primary mr-2 flex h-2 w-2 items-center justify-center border">
                    <span className="bg-primary h-1 w-1" />
                  </span>
                  INIT_SECURE_ACCESS
                </>
              )}
            </Button>
          </form>

          <div className="border-border absolute top-0 right-0 h-4 w-4 border-t border-r" />
          <div className="border-border absolute bottom-0 left-0 h-4 w-4 border-b border-l" />
        </motion.div>
      </Container>
    </div>
  );
}
