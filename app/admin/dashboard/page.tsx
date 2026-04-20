"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import Container from "@/components/container";
import { Subheading } from "@/components/subheading";
import { DottedSeparator } from "@/components/separator";
import { Box } from "@/components/box";
import {
  Plus,
  Edit2,
  FileText,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "motion/react";
import { SPRING_CONFIG } from "@/lib/motion-config";

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

function PostRow({
  post,
  onEdit,
}: {
  post: AdminPost;
  onEdit: (id: string) => void;
}) {
  return (
    <div className="group flex flex-col gap-1.5 md:flex-row md:items-center md:gap-2">
      <div className="flex shrink-0 items-center gap-2">
        <Box
          className={
            post.status === "published"
              ? "bg-linear-to-b from-emerald-400 to-emerald-600 ring-offset-emerald-500"
              : "bg-linear-to-b from-amber-400 to-amber-600 ring-offset-amber-500"
          }
        >
          <FileText className="size-4 text-white drop-shadow-xl drop-shadow-black/40" />
        </Box>
        <p className="text-foreground font-medium">{post.title}</p>
      </div>
      <div className="hidden size-1 rounded-full bg-neutral-200 md:block" />
      <div className="flex items-center gap-3">
        <span className="text-foreground/40 font-mono text-[10px] tracking-widest uppercase">
          {new Date(post.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
        <span
          className={`font-mono text-[10px] tracking-widest uppercase ${
            post.status === "published"
              ? "text-emerald-500"
              : "text-amber-500"
          }`}
        >
          {post.status}
        </span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => onEdit(post.id)}
          className="text-foreground/40 hover:text-foreground transition-colors"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
        {post.status === "published" && (
          <a
            href={`/blog/${post.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/40 hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
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
        alert(`Synced ${data.syncedCount} posts from Notion.`);
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
        alert(`Failed: ${data.error || "Unknown error"}`);
      }
    } catch {
      alert("Error syncing with Notion.");
    } finally {
      setSyncingNotion(false);
    }
  };

  if (!session) return null;

  return (
    <Container className="pt-4 pb-24">
      <Subheading>Content database</Subheading>

      <div className="mt-4 flex flex-col gap-1 md:flex-row md:items-center md:gap-2">
        <p className="text-foreground font-medium">
          {pagination ? `${pagination.total} posts` : "Posts"}
        </p>
        <div className="hidden size-1 rounded-full bg-neutral-200 md:block" />
        <p className="text-foreground/70">
          Manage content, draft new posts, and track published work.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          className="bg-card/30 border-border text-foreground placeholder:text-foreground/30 flex-1 border px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-w-[180px]"
        />
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="border-border bg-card/30 h-9 w-[120px] font-mono text-xs tracking-wider uppercase">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-border font-mono text-xs">
            <SelectItem value="all" className="uppercase">
              All
            </SelectItem>
            <SelectItem value="draft" className="uppercase">
              Draft
            </SelectItem>
            <SelectItem value="published" className="uppercase">
              Published
            </SelectItem>
          </SelectContent>
        </Select>
        <button
          onClick={handleSyncNotion}
          disabled={syncingNotion}
          className="text-foreground/40 hover:text-foreground font-mono text-[10px] tracking-widest uppercase transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`mr-1 inline h-3 w-3 ${syncingNotion ? "animate-spin" : ""}`}
          />
          Notion sync
        </button>
        <Link
          href="/admin/dashboard/editor/new"
          className="text-foreground/40 hover:text-foreground font-mono text-[10px] tracking-widest uppercase transition-colors"
        >
          <Plus className="mr-1 inline h-3 w-3" />
          New post
        </Link>
      </div>

      <DottedSeparator className="my-6" />

      {loadingPosts ? (
        <p className="text-foreground/40 font-mono text-xs tracking-widest uppercase">
          Loading records...
        </p>
      ) : posts.length === 0 ? (
        <div className="flex flex-col gap-3">
          <p className="text-foreground font-medium">No posts found</p>
          <p className="text-foreground/70 text-sm">
            Get started by creating your first record.
          </p>
          <Link
            href="/admin/dashboard/editor/new"
            className="text-foreground/40 hover:text-foreground font-mono text-[10px] tracking-widest uppercase transition-colors"
          >
            <Plus className="mr-1 inline h-3 w-3" />
            Create post
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <PostRow
              key={post.id}
              post={post}
              onEdit={(id) =>
                (window.location.href = `/admin/dashboard/editor/${id}`)
              }
            />
          ))}

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-foreground/40 font-mono text-[10px] tracking-widest uppercase">
                Page {pagination.page} / {pagination.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={!pagination.hasPrev}
                  className="text-foreground/40 hover:text-foreground font-mono text-xs transition-colors disabled:opacity-30"
                >
                  Prev
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={!pagination.hasNext}
                  className="text-foreground/40 hover:text-foreground font-mono text-xs transition-colors disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </Container>
  );
}
