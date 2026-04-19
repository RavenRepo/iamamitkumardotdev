"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Edit2,
  FileText,
  RefreshCw,
  ArrowLeft,
  Terminal,
  Database,
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdminPost {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  publishedAt?: string | null;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

function PostCard({
  post,
  onEdit,
}: {
  post: AdminPost;
  onEdit: (id: string) => void;
}) {
  return (
    <div className="group bg-card border-border monolith-glass relative overflow-hidden border p-5 transition-all hover:border-primary/30 hover:shadow-lg">
      <div className="border-border absolute top-0 right-0 h-3 w-3 border-t border-r transition-colors group-hover:border-primary/50" />
      <div className="border-border absolute bottom-0 left-0 h-3 w-3 border-b border-l transition-colors group-hover:border-primary/50" />

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-foreground group-hover:text-primary text-lg font-bold uppercase tracking-tight transition-colors truncate">
            {post.title}
          </h3>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase">
              {new Date(post.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span
              className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] tracking-widest uppercase transition-colors ${
                post.status === "published"
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "border-amber-500/30 text-amber-500"
              }`}
            >
              {post.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onEdit(post.id)}
            className="border-border text-muted-foreground hover:text-primary hover:border-primary/50 flex h-9 w-9 items-center justify-center rounded-md border bg-background transition-all hover:bg-primary/5"
            title="Edit post"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          {post.status === "published" && (
            <a
              href={`/blog/${post.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="border-border text-muted-foreground hover:text-primary hover:border-primary/50 flex h-9 w-9 items-center justify-center rounded-md border bg-background transition-all hover:bg-primary/5"
              title="View post"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { session } = useAuth();
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [syncingNotion, setSyncingNotion] = useState(false);

  useEffect(() => {
    if (!session) return;

    const params = new URLSearchParams({
      page: String(page),
      limit: "10",
    });
    if (searchQuery) params.set("search", searchQuery);
    if (statusFilter !== "all") params.set("status", statusFilter);

    fetch(`/api/admin/posts?${params}`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.posts) {
          setPosts(Array.isArray(data.posts) ? data.posts : []);
          setPagination(data.pagination);
        } else if (Array.isArray(data)) {
          setPosts(data);
        }
        setLoadingPosts(false);
      })
      .catch(() => setLoadingPosts(false));
  }, [session, page, searchQuery, statusFilter]);

  const filteredPosts = posts;

  const handlePrevPage = () => {
    if (pagination?.hasPrev) {
      setLoadingPosts(true);
      setPage((p) => p - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination?.hasNext) {
      setLoadingPosts(true);
      setPage((p) => p + 1);
    }
  };

  const handleSyncNotion = async () => {
    if (!session) return;
    setSyncingNotion(true);
    try {
      const res = await fetch("/api/admin/notion/sync", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Successfully synced ${data.syncedCount} posts from Notion!`);
        setLoadingPosts(true);
        const params = new URLSearchParams({ page: String(page), limit: "10" });
        fetch(`/api/admin/posts?${params}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.posts) {
              setPosts(Array.isArray(d.posts) ? d.posts : []);
              setPagination(d.pagination);
            }
            setLoadingPosts(false);
          });
      } else {
        alert(`Failed to sync: ${data.error || "Unknown error"}`);
      }
    } catch {
      alert("An error occurred while syncing with Notion.");
    } finally {
      setSyncingNotion(false);
    }
  };

  if (!session) return null;

  return (
    <div className="bg-background relative min-h-dvh">
      <div className="bg-grid-blueprint text-foreground pointer-events-none fixed inset-0 opacity-10" />

      <header className="bg-background/80 border-border fixed top-0 z-50 w-full border-b backdrop-blur-md">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="text-muted-foreground hover:text-primary group flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase transition-colors"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                SYSTEM
              </Link>
              <span className="text-border">|</span>
              <span className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase">
                CONTROL_CENTER
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncNotion}
                disabled={syncingNotion}
                className="h-9 font-mono text-[10px] tracking-widest uppercase"
              >
                <RefreshCw
                  className={`mr-2 h-3 w-3 ${syncingNotion ? "animate-spin" : ""}`}
                />
                {syncingNotion ? "SYNCING..." : "NOTION_SYNC"}
              </Button>
              <Button
                asChild
                size="sm"
                className="h-9 font-mono text-[10px] tracking-widest uppercase"
              >
                <Link href="/admin/dashboard/editor/new">
                  <Plus className="mr-2 h-3 w-3" />
                  NEW_RECORD
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </header>

      <section className="relative z-10 pt-24 pb-24">
        <Container>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Database className="text-primary h-5 w-5" />
              <h1 className="font-display text-3xl font-bold tracking-tight uppercase">
                CONTENT_DATABASE
              </h1>
            </div>
            <p className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase">
              Manage your content, draft new posts, and track published work.
            </p>
          </div>

          <div className="bg-card border-border monolith-glass mb-6 border p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="SEARCH_RECORDS..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="bg-background border-border text-foreground focus:border-primary/50 placeholder:text-muted-foreground/50 w-full border pl-10 pr-4 py-2 font-mono text-[10px] tracking-widest uppercase transition-colors focus:outline-none"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="border-border bg-background h-9 w-[140px] font-mono text-[10px] tracking-widest uppercase">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border font-mono text-[10px]">
                  <SelectItem value="all" className="font-mono uppercase">
                    ALL_STATUS
                  </SelectItem>
                  <SelectItem value="draft" className="font-mono uppercase">
                    DRAFT
                  </SelectItem>
                  <SelectItem value="published" className="font-mono uppercase">
                    PUBLISHED
                  </SelectItem>
                </SelectContent>
              </Select>
              {pagination && (
                <div className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase">
                  {pagination.total} TOTAL_RECORDS
                </div>
              )}
            </div>
          </div>

          {loadingPosts ? (
            <div className="bg-card border-border monolith-glass flex items-center justify-center border py-16">
              <span className="border-primary mr-3 h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
              <span className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase">
                LOADING_RECORDS...
              </span>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-card border-border monolith-glass text-center border py-20">
              <FileText className="text-muted-foreground/30 mx-auto mb-4 h-12 w-12" />
              <p className="text-foreground font-display text-lg font-bold uppercase tracking-tight">
                NO_RECORDS_FOUND
              </p>
              <p className="text-muted-foreground mt-2 font-mono text-[10px] tracking-widest uppercase">
                Get started by creating your very first record.
              </p>
              <Button asChild className="mt-6 font-mono text-[10px] tracking-widest uppercase">
                <Link href="/admin/dashboard/editor/new">
                  <Plus className="mr-2 h-3 w-3" />
                  CREATE_RECORD
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onEdit={(id) =>
                      (window.location.href = `/admin/dashboard/editor/${id}`)
                    }
                  />
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase">
                    PAGE {pagination.page}/{pagination.totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={!pagination.hasPrev}
                      className="border-border text-muted-foreground hover:bg-muted hover:text-foreground flex h-9 w-9 items-center justify-center rounded-md border transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={!pagination.hasNext}
                      className="border-border text-muted-foreground hover:bg-muted hover:text-foreground flex h-9 w-9 items-center justify-center rounded-md border transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </Container>
      </section>
    </div>
  );
}