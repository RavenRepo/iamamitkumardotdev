"use client";

import { useAuth, signOut } from "@/lib/auth";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, PenTool, Globe, LogOut, Inbox } from "lucide-react";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, isPending } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/admin");
    }
  }, [isPending, session, router]);

  if (isPending)
    return (
      <div className="bg-background text-foreground flex min-h-dvh items-center justify-center font-mono text-xs tracking-widest uppercase">
        <span className="bg-primary mr-3 h-2 w-2 animate-ping" />
        INITIALIZING_SECURE_SESSION...
      </div>
    );

  if (!session) return null;

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/dashboard/editor/new", label: "New Post", icon: PenTool },
    { href: "/admin/dashboard/leads", label: "Leads", icon: Inbox },
  ];

  return (
    <div className="bg-background flex min-h-dvh">
      <aside className="border-border bg-card/50 sticky top-0 flex h-screen w-64 flex-col border-r">
        <div className="border-border bg-background flex h-16 items-center justify-center border-b">
          <span className="font-display text-primary text-lg font-bold tracking-tighter uppercase">
            Admin_Panel
          </span>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          <div className="mb-6 px-4">
            <p className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase">
              Menu
            </p>
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-4 py-3 transition-all ${isActive ? "bg-primary/10 text-primary border-primary/20 border font-medium" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent"}`}
              >
                <item.icon className="h-4 w-4" />
                <span className="font-mono text-xs tracking-widest uppercase">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
        <div className="border-border bg-background space-y-2 border-t p-4">
          <Link
            href="/"
            className="text-muted-foreground hover:bg-muted/50 hover:text-foreground flex items-center gap-3 rounded-md border border-transparent px-4 py-3 transition-colors"
          >
            <Globe className="h-4 w-4" />
            <span className="font-mono text-xs tracking-widest uppercase">
              Back to Site
            </span>
          </Link>
          <button
            onClick={() =>
              signOut().then(() => {
                window.location.href = "/admin";
              })
            }
            className="flex w-full items-center gap-3 rounded-md border border-transparent px-4 py-3 text-red-500 transition-colors hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" />
            <span className="font-mono text-xs tracking-widest uppercase">
              Logout
            </span>
          </button>
        </div>
      </aside>

      <main className="relative min-h-screen flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
