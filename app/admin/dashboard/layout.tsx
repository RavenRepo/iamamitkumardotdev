"use client"
import { authClient } from "@/lib/auth-client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, PenTool, Globe, LogOut, Inbox } from "lucide-react"
import { useEffect } from "react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/admin")
    }
  }, [isPending, session, router])

  if (isPending) return (
     <div className="min-h-dvh flex items-center justify-center bg-background text-foreground font-mono uppercase tracking-widest text-xs">
        <span className="w-2 h-2 bg-primary animate-ping mr-3" />
        INITIALIZING_SECURE_SESSION...
     </div>
  )
  
  if (!session) return null

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/dashboard/editor/new", label: "New Post", icon: PenTool },
    { href: "/admin/dashboard/leads", label: "Leads", icon: Inbox },
  ]

  return (
    <div className="min-h-dvh bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/50 flex flex-col h-screen sticky top-0">
        <div className="h-16 flex items-center justify-center border-b border-border bg-background">
          <span className="font-display font-bold text-lg tracking-tighter uppercase text-primary">Admin_Panel</span>
        </div>
        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="mb-6 px-4">
             <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Menu</p>
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all ${isActive ? 'bg-primary/10 text-primary font-medium border border-primary/20' : 'text-muted-foreground border border-transparent hover:bg-muted/50 hover:text-foreground'}`}>
                <item.icon className="w-4 h-4" />
                <span className="font-mono text-xs uppercase tracking-widest">{item.label}</span>
              </Link>
            )
          })}
        </div>
        <div className="p-4 border-t border-border space-y-2 bg-background">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-muted/50 hover:text-foreground rounded-md transition-colors border border-transparent">
            <Globe className="w-4 h-4" />
            <span className="font-mono text-xs uppercase tracking-widest">Back to Site</span>
          </Link>
          <button onClick={() => authClient.signOut().then(() => window.location.href = "/admin")} className="w-full flex items-center gap-3 px-4 py-3 text-danger hover:bg-danger/10 rounded-md transition-colors border border-transparent">
            <LogOut className="w-4 h-4" />
            <span className="font-mono text-xs uppercase tracking-widest">Logout</span>
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden min-h-screen relative">
        {children}
      </main>
    </div>
  )
}
