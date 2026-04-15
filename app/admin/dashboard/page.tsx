"use client"
import { useState, useEffect } from "react"
import { authClient } from "@/lib/auth-client"
import Link from "next/link"
import { Plus, Edit2, FileText, ChevronLeft, ChevronRight } from "lucide-react"

interface AdminPost {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  publishedAt?: string | null;
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function AdminDashboard() {
  const { data: session } = authClient.useSession()
  const [posts, setPosts] = useState<AdminPost[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!session) return

    fetch(`/api/admin/posts?page=${page}&limit=10`)
      .then(res => res.json())
      .then(data => {
          if (data.posts) {
            setPosts(Array.isArray(data.posts) ? data.posts : [])
            setPagination(data.pagination)
          } else if (Array.isArray(data)) {
            setPosts(data)
          }
          setLoadingPosts(false)
      })
      .catch(() => setLoadingPosts(false))
  }, [session, page])

  const filteredPosts = searchQuery
    ? posts.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : posts

  const handlePrevPage = () => {
    if (pagination?.hasPrev) {
      setLoadingPosts(true)
      setPage(p => p - 1)
    }
  }

  const handleNextPage = () => {
    if (pagination?.hasNext) {
      setLoadingPosts(true)
      setPage(p => p + 1)
    }
  }

  if (!session) return null

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
         <div>
           <h1 className="font-display text-3xl font-bold tracking-tight">Dashboard</h1>
           <p className="text-muted-foreground mt-1 text-sm">Manage your content, draft new posts, and track published work.</p>
         </div>
         <Link 
            href="/admin/dashboard/editor/new"
            className="inline-flex items-center justify-center bg-primary text-background px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors shadow-sm"
         >
            <Plus className="w-4 h-4 mr-2" />
            New Post
         </Link>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
          {loadingPosts ? (
              <div className="text-center py-16 text-muted-foreground flex items-center justify-center">
                  <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3" />
                  Loading contents...
              </div>
          ) : posts.length === 0 ? (
              <div className="text-center py-20 bg-muted/10">
                  <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-foreground font-medium">No posts found</p>
                  <p className="text-sm text-muted-foreground mt-1">Get started by creating your very first post.</p>
              </div>
          ) : (
              <>
                <div className="p-4 border-b border-border">
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-md bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div className="divide-y divide-border">
                    {filteredPosts.map((post) => (
                       <div key={post.id} className="flex justify-between items-center p-5 hover:bg-muted/30 transition-colors group">
                           <div className="flex-1">
                              <h3 className="font-display font-medium text-foreground text-lg group-hover:text-primary transition-colors">
                                {post.title}
                              </h3>
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                  <span>{new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide uppercase ${post.status === 'published' ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                                    {post.status}
                                  </span>
                              </div>
                           </div>
                           <Link 
                              href={`/admin/dashboard/editor/${post.id}`}
                              className="text-muted-foreground hover:text-primary p-2 border border-transparent hover:border-border hover:bg-background rounded-md transition-all flex items-center gap-2"
                           >
                              <Edit2 className="w-4 h-4" /> <span className="text-sm font-medium">Edit</span>
                           </Link>
                       </div>
                    ))}
                </div>
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/10">
                    <span className="text-sm text-muted-foreground">
                      Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} posts
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrevPage}
                        disabled={!pagination.hasPrev}
                        className="p-2 rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-sm text-muted-foreground px-2">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>
                      <button
                        onClick={handleNextPage}
                        disabled={!pagination.hasNext}
                        className="p-2 rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
          )}
      </div>
    </div>
  )
}
