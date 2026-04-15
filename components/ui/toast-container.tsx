"use client";

import { X } from "lucide-react";
import type { Toast } from "@/hooks/use-toast";

const TYPE_STYLES = {
  success: "border-primary/50 bg-primary/10 text-primary",
  error: "border-danger/50 bg-danger/10 text-danger",
  info: "border-border bg-card text-foreground",
};

export function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 border font-mono text-xs uppercase tracking-widest animate-in slide-in-from-right-full ${TYPE_STYLES[toast.type]}`}
        >
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => dismiss(toast.id)} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity" aria-label="Dismiss">
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
