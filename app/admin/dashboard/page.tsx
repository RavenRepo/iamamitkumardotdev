"use client";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { Plus, Edit2, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function AdminDashboard() {
  const { data: session } = authClient.useSession();
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!session) return;

    fetch(`/api/admin/posts?page=${page}&limit=10`)
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
  }, [session, page]);

  const filteredPosts = searchQuery
    ? posts.filter((post) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : posts;

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

  if (!session) return null;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your content, draft new posts, and track published work.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/dashboard/editor/new">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      <div className="bg-card border-border overflow-hidden rounded-lg border shadow-sm">
        {loadingPosts ? (
          <div className="text-muted-foreground flex items-center justify-center py-16 text-center">
            <span className="border-primary mr-3 h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
            Loading contents...
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-muted/10 py-20 text-center">
            <FileText className="text-muted-foreground/30 mx-auto mb-4 h-12 w-12" />
            <p className="text-foreground font-medium">No posts found</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Get started by creating your very first post.
            </p>
          </div>
        ) : (
          <>
            <div className="border-border border-b p-4">
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-background border-border focus:border-primary/50 w-full max-w-md rounded-md border px-3 py-2 text-sm transition-colors focus:outline-none"
              />
            </div>
            <div className="divide-border divide-y">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="hover:bg-muted/30 group flex items-center justify-between p-5 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-display text-foreground group-hover:text-primary text-lg font-medium transition-colors">
                      {post.title}
                    </h3>
                    <div className="text-muted-foreground mt-2 flex items-center gap-4 text-sm">
                      <span>
                        {new Date(post.createdAt).toLocaleDateString(
                          undefined,
                          { year: "numeric", month: "short", day: "numeric" },
                        )}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide uppercase ${post.status === "published" ? "bg-primary/10 text-primary" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"}`}
                      >
                        {post.status}
                      </span>
                    </div>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/dashboard/editor/${post.id}`}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
            {pagination && pagination.totalPages > 1 && (
              <div className="border-border bg-muted/10 flex items-center justify-between border-t px-4 py-3">
                <span className="text-muted-foreground text-sm">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total,
                  )}{" "}
                  of {pagination.total} posts
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={!pagination.hasPrev}
                    className="border-border text-muted-foreground hover:bg-muted rounded-md border p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-muted-foreground px-2 text-sm">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={!pagination.hasNext}
                    className="border-border text-muted-foreground hover:bg-muted rounded-md border p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
