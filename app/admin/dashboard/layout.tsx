"use client";

import { useAuth, signOut } from "@/lib/auth";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LayoutDashboard, PenTool, Inbox, ArrowLeft } from "lucide-react";
import Container from "@/components/container";
import { DottedSeparator } from "@/components/separator";

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
      <div className="flex min-h-dvh items-center justify-center px-4">
        <Container>
          <p className="text-foreground/40 font-mono text-xs tracking-widest uppercase">
            Initializing session...
          </p>
        </Container>
      </div>
    );

  if (!session) return null;

  const navItems = [
    { href: "/admin/dashboard", label: "Posts", icon: LayoutDashboard },
    { href: "/admin/dashboard/editor/new", label: "New post", icon: PenTool },
    { href: "/admin/dashboard/leads", label: "Leads", icon: Inbox },
  ];

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") return pathname === "/admin/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-border border-b">
        <Container>
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-foreground/40 hover:text-foreground flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase transition-colors"
              >
                <ArrowLeft className="h-3 w-3" />
                Site
              </Link>
              <span className="text-border">|</span>
              <span className="text-foreground/40 font-mono text-[10px] tracking-widest uppercase">
                Admin
              </span>
            </div>

            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] tracking-widest uppercase transition-colors ${
                      active
                        ? "text-foreground font-medium"
                        : "text-foreground/40 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={() =>
                signOut().then(() => {
                  window.location.href = "/admin";
                })
              }
              className="text-foreground/40 hover:text-red-500 font-mono text-[10px] tracking-widest uppercase transition-colors"
            >
              Logout
            </button>
          </div>
        </Container>
      </header>

      <DottedSeparator />

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
