"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { motion } from "framer-motion";

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
      const { error } = await authClient.signIn.email({
        email,
        password
      });
      if (error) {
         setError(error.message || "Failed to authenticate");
      } else {
         window.location.href = "/admin/dashboard";
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-blueprint text-foreground opacity-10 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-card border border-border p-8 monolith-glass relative">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-100 pointer-events-none" />
          
          <div className="text-center mb-8 pb-6 border-b border-border relative z-10">
            <h1 className="font-display text-2xl font-bold text-foreground uppercase tracking-widest mb-2">
              SYS_ADMIN_ACCESS
            </h1>
            <p className="font-mono text-[10px] text-primary uppercase tracking-widest">
              Restricted to authorized personnel only. Logging all attempts.
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            {error && (
              <div className="text-danger font-mono text-xs bg-danger/10 border border-danger p-3 uppercase tracking-widest">
                [ERROR] {error}
              </div>
            )}
            
            <div className="space-y-3">
              <label className="block text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-widest">
                Identifier_String (Email)
              </label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border focus:outline-none focus:border-primary transition-colors text-foreground font-mono text-sm placeholder:text-muted-foreground/30"
                placeholder="hello@iamamitkumar.dev"
              />
            </div>
            
            <div className="space-y-3">
              <label className="block text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-widest">
                Access_Key (Password)
              </label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border focus:outline-none focus:border-primary transition-colors text-foreground font-mono text-sm placeholder:text-muted-foreground/30"
                placeholder="••••••••••••"
              />
            </div>
            
            <button 
               type="submit" 
               disabled={loading}
               className="w-full mt-4 bg-background text-muted-foreground border border-border hover:border-primary hover:text-primary px-6 py-4 transition-colors font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <>
                  <span className="w-2 h-2 bg-primary animate-ping" />
                  AUTHENTICATING_SYS...
                </>
              ) : (
                <>
                  <span className="w-2 h-2 border border-primary flex items-center justify-center">
                    <span className="w-1 h-1 bg-primary group-hover:animate-pulse" />
                  </span>
                  INIT_SECURE_ACCESS
                </>
              )}
            </button>
          </form>
          
          {/* Decorative Corner Accents */}
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-border" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-border" />
        </div>
      </motion.div>
    </div>
  );
}
