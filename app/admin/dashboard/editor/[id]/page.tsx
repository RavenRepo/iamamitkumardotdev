"use client";
import { useState, useEffect, use, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { ArrowLeft, Save, Trash2, Settings2 } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast-container";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

export default function EditPost({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { session } = useAuth();
  const { toasts, addToast, dismiss } = useToast();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMeta, setShowMeta] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [viewMode, setViewMode] = useState<"write" | "preview" | "split">(
    "split",
  );
  const initialValuesRef = useRef<string>("");
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (id && session) {
      fetch(`/api/admin/posts/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setTitle(data.title || "");
            setSlug(data.slug || "");
            setExcerpt(data.excerpt || "");
            setContent(data.content || "");
            setStatus(data.status || "draft");
            setCoverImage(data.coverImage || "");
            setMetaTitle(data.metaTitle || "");
            setMetaDescription(data.metaDescription || "");
            if (data.tags) {
              try {
                const parsed = JSON.parse(data.tags);
                setTags(Array.isArray(parsed) ? parsed.join(", ") : data.tags);
              } catch {
                setTags(data.tags);
              }
            }
            initialValuesRef.current = JSON.stringify({
              title: data.title,
              slug: data.slug,
              content: data.content,
              excerpt: data.excerpt,
            });
          }
          setInitialFetchDone(true);
        })
        .catch(() => setInitialFetchDone(true));
    }
  }, [id, session]);

  useEffect(() => {
    if (!initialFetchDone) return;
    const current = JSON.stringify({ title, slug, content, excerpt });
    setIsDirty(current !== initialValuesRef.current);
  }, [title, slug, content, excerpt, initialFetchDone]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty || !initialFetchDone) return;
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(
          `editor-draft-${id}`,
          JSON.stringify({
            title,
            slug,
            excerpt,
            content,
            status,
            tags,
            coverImage,
            metaTitle,
            metaDescription,
          }),
        );
      } catch (e) {
        console.error("Autosave failed:", e);
      }
    }, 3000);
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [
    title,
    slug,
    excerpt,
    content,
    status,
    tags,
    coverImage,
    metaTitle,
    metaDescription,
    isDirty,
    initialFetchDone,
    id,
  ]);

  if (!session) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          excerpt,
          content,
          status,
          tags: tags
            ? tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : [],
          coverImage: coverImage || undefined,
          metaTitle: metaTitle || undefined,
          metaDescription: metaDescription || undefined,
        }),
      });
      if (res.ok) {
        localStorage.removeItem(`editor-draft-${id}`);
        setIsDirty(false);
        initialValuesRef.current = JSON.stringify({
          title,
          slug,
          content,
          excerpt,
        });
        addToast("Post updated successfully", "success");
      } else {
        const data = await res.json();
        addToast(data.error || "Failed to update post", "error");
      }
    } catch {
      addToast("Network error while saving", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this post?"))
      return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        localStorage.removeItem(`editor-draft-${id}`);
        addToast("Post deleted", "success");
        setTimeout(() => {
          window.location.href = "/admin/dashboard";
        }, 500);
      } else {
        addToast("Failed to delete post", "error");
      }
    } catch {
      addToast("Network error while deleting", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!initialFetchDone)
    return (
      <div className="text-muted-foreground flex h-full items-center justify-center">
        <span className="border-primary mr-3 h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
        Loading post data...
      </div>
    );

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <ToastContainer toasts={toasts} dismiss={dismiss} />
      <header className="border-border bg-background/95 sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b px-6 backdrop-blur-md">
        <Link
          href="/admin/dashboard"
          className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          {isDirty && (
            <span className="font-mono text-[10px] tracking-widest text-amber-500 uppercase">
              UNSAVED_CHANGES
            </span>
          )}
          <div className="border-border flex items-center overflow-hidden rounded-md border">
            <button
              onClick={() => setViewMode("write")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === "write" ? "bg-primary text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
            >
              Write
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === "split" ? "bg-primary text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
            >
              Split
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === "preview" ? "bg-primary text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
            >
              Preview
            </button>
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "draft" | "published")}
            className="bg-background border-border focus:border-primary rounded-md border px-3 py-1.5 text-sm focus:outline-none"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <button
            onClick={() => setShowMeta(!showMeta)}
            className={`inline-flex items-center rounded-md border px-3 py-1.5 text-sm transition-colors ${showMeta ? "bg-primary text-background border-primary" : "bg-background text-muted-foreground border-border hover:border-primary hover:text-foreground"}`}
          >
            <Settings2 className="mr-1.5 h-4 w-4" /> SEO
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center rounded-md border border-transparent bg-transparent px-3 py-1.5 text-sm font-medium text-red-500 transition-colors hover:border-red-500/30 hover:bg-red-500/10 disabled:opacity-50"
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !title || !slug || !content}
            className="bg-primary text-background border-primary hover:bg-primary/90 inline-flex items-center rounded-md border px-4 py-1.5 text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
          >
            <Save className="mr-1.5 h-4 w-4" />
            {status === "published" ? "Update Post" : "Save Draft"}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto h-full w-full space-y-6">
          {showMeta && (
            <div className="bg-card border-border grid grid-cols-1 gap-4 rounded-lg border p-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-muted-foreground block text-xs font-medium tracking-wider uppercase">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  maxLength={70}
                  className="bg-background border-border focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50 w-full rounded-md border p-2.5 text-sm transition-colors focus:outline-none"
                  placeholder="SEO title..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-muted-foreground block text-xs font-medium tracking-wider uppercase">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="bg-background border-border focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50 w-full rounded-md border p-2.5 text-sm transition-colors focus:outline-none"
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-muted-foreground block text-xs font-medium tracking-wider uppercase">
                  Meta Description
                </label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  maxLength={160}
                  className="bg-background border-border text-foreground focus:border-primary/50 placeholder:text-muted-foreground/50 h-16 w-full resize-none rounded-md border p-2.5 text-sm transition-colors focus:outline-none"
                  placeholder="SEO description..."
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-muted-foreground block text-xs font-medium tracking-wider uppercase">
                  Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="bg-background border-border focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50 w-full rounded-md border p-2.5 text-sm transition-colors focus:outline-none"
                  placeholder="ai, agent, startup (comma separated)"
                />
              </div>
            </div>
          )}

          <div className="grid h-[75vh] grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="flex h-full flex-col gap-4">
              <input
                type="text"
                placeholder="Post Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="font-display text-foreground placeholder:text-muted-foreground/30 w-full border-none bg-transparent text-4xl font-bold focus:outline-none"
              />
              <input
                type="text"
                placeholder="slug-url-identifier"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="text-muted-foreground placeholder:text-muted-foreground/30 w-full border-none bg-transparent font-mono text-sm focus:outline-none"
              />
              <textarea
                placeholder="Write a brief excerpt (optional)..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="bg-card border-border focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50 h-24 w-full resize-none rounded-md border p-4 text-sm transition-colors focus:outline-none"
              />
              {(viewMode === "write" || viewMode === "split") && (
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Write your content here... Use the toolbar for formatting, or drag and drop images."
                />
              )}
            </div>

            {(viewMode === "preview" || viewMode === "split") && (
              <div className="bg-card border-border relative hidden h-full flex-col overflow-hidden rounded-md border lg:flex">
                <div className="bg-muted/10 border-border text-muted-foreground flex justify-between border-b p-3 text-xs font-medium tracking-wider uppercase">
                  Live Preview
                  <span className="bg-primary animate-pulse-slow h-1.5 w-1.5 rounded-full"></span>
                </div>
                <div className="custom-scrollbar flex-1 overflow-y-auto p-8">
                  <div className="prose dark:prose-invert prose-headings:font-display prose-headings:font-bold prose-a:text-primary prose-img:rounded-lg max-w-none">
                    <h1>{title || "Untitled Post"}</h1>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                    >
                      {content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
