"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronDown,
  Settings2,
  Save,
  ArrowLeft,
  Terminal,
} from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast-container";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

export default function Editor() {
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
  const [isAutoSlug, setIsAutoSlug] = useState(true);
  const [showMeta, setShowMeta] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [viewMode, setViewMode] = useState<"write" | "preview" | "split">(
    "split",
  );
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isAutoSlug && title) {
      setSlug(
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, ""),
      );
    }
  }, [title, isAutoSlug]);

  useEffect(() => {
    if (title || content) setIsDirty(true);
  }, [title, content, excerpt, slug]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty || !title) return;
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(
          "editor-draft-new",
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
  ]);

  useEffect(() => {
    const saved = localStorage.getItem("editor-draft-new");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.title) {
          setTitle(data.title);
          setSlug(data.slug || "");
          setExcerpt(data.excerpt || "");
          setContent(data.content || "");
          setStatus(data.status || "draft");
          setTags(data.tags || "");
          setCoverImage(data.coverImage || "");
          setMetaTitle(data.metaTitle || "");
          setMetaDescription(data.metaDescription || "");
          setIsAutoSlug(false);
          addToast("Draft restored from autosave", "info");
        }
      } catch {
        /* ignore */
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!session) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
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
        localStorage.removeItem("editor-draft-new");
        setIsDirty(false);
        addToast("Post created successfully", "success");
        setTimeout(() => {
          window.location.href = "/admin/dashboard";
        }, 500);
      } else {
        const data = await res.json();
        addToast(data.error || "Failed to save post", "error");
      }
    } catch {
      addToast("Network error while saving", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background relative min-h-dvh">
      <div className="bg-grid-blueprint text-foreground pointer-events-none fixed inset-0 opacity-10" />
      <ToastContainer toasts={toasts} dismiss={dismiss} />

      <header className="bg-background/80 border-border fixed top-0 z-50 w-full border-b backdrop-blur-md">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/admin/dashboard"
              className="text-muted-foreground hover:text-primary group flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase transition-colors"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />{" "}
              ABORT_MISSION
            </Link>
            <div className="flex items-center gap-2">
              <Select
                value={status}
                onValueChange={(value) =>
                  setStatus(value as "draft" | "published")
                }
              >
                <SelectTrigger className="border-border bg-background h-9 w-[130px] font-mono text-[10px] tracking-widest uppercase">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border font-mono text-[10px]">
                  <SelectItem
                    value="draft"
                    className="font-mono text-[10px] uppercase"
                  >
                    Draft
                  </SelectItem>
                  <SelectItem
                    value="published"
                    className="font-mono text-[10px] uppercase"
                  >
                    Published
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={showMeta ? "default" : "outline"}
                size="sm"
                onClick={() => setShowMeta(!showMeta)}
                className="h-9 font-mono text-[10px] tracking-widest uppercase"
              >
                <Settings2 className="mr-1.5 h-3 w-3" />
                SEO
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
                disabled={loading || !title || !slug || !content}
                className="h-9 font-mono text-[10px] tracking-widest uppercase"
              >
                <Save className="mr-2 h-3 w-3" />
                {loading ? "DEPLOYING..." : "COMMIT_RECORD"}
              </Button>
            </div>
          </div>
        </Container>
      </header>

      <section className="relative z-10 pt-24 pb-24">
        <Container>
          {showMeta && (
            <div className="bg-card border-border monolith-glass mb-6 grid grid-cols-1 gap-4 border p-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-muted-foreground block font-mono text-[10px] tracking-widest uppercase">
                  META_TITLE (max 70)
                </label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  maxLength={70}
                  className="bg-background border-border text-foreground focus:border-primary/50 placeholder:text-muted-foreground/50 w-full border p-3 font-mono text-xs transition-colors focus:outline-none"
                  placeholder="Custom SEO title..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-muted-foreground block font-mono text-[10px] tracking-widest uppercase">
                  COVER_IMAGE_URL
                </label>
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="bg-background border-border text-foreground focus:border-primary/50 placeholder:text-muted-foreground/50 w-full border p-3 font-mono text-xs transition-colors focus:outline-none"
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-muted-foreground block font-mono text-[10px] tracking-widest uppercase">
                  META_DESCRIPTION (max 160)
                </label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  maxLength={160}
                  className="bg-background border-border text-foreground focus:border-primary/50 placeholder:text-muted-foreground/50 h-16 w-full resize-none border p-3 font-mono text-xs transition-colors focus:outline-none"
                  placeholder="Custom SEO description..."
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-muted-foreground block font-mono text-[10px] tracking-widest uppercase">
                  TAGS (comma separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="bg-background border-border text-foreground focus:border-primary/50 placeholder:text-muted-foreground/50 w-full border p-3 font-mono text-xs transition-colors focus:outline-none"
                  placeholder="ai-agents, saas, next.js"
                />
              </div>
            </div>
          )}

          <div className="grid h-[calc(100vh-12rem)] grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="bg-card border-border monolith-glass relative flex h-full flex-col space-y-4 border p-6">
              <div className="border-border absolute top-0 right-0 h-4 w-4 border-t border-r" />
              <div className="border-border absolute bottom-0 left-0 h-4 w-4 border-b border-l" />
              <div className="border-border flex items-center gap-3 border-b pb-4">
                <Terminal className="text-muted-foreground h-4 w-4" />
                <h2 className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
                  INPUT_BUFFER
                </h2>
                <span
                  className={`ml-auto border px-2 py-0.5 font-mono text-[10px] tracking-widest uppercase ${status === "published" ? "text-primary border-primary/30" : "border-amber-500/30 text-amber-500"}`}
                >
                  {status}
                </span>
              </div>
              <input
                type="text"
                placeholder="ENTRY_TITLE"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="font-display text-foreground placeholder:text-muted-foreground/30 w-full border-none bg-transparent text-2xl font-bold uppercase focus:outline-none"
              />
              <input
                type="text"
                placeholder="SLUG-URL-IDENTIFIER"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setIsAutoSlug(false);
                }}
                className="text-primary placeholder:text-primary/30 w-full border-none bg-transparent font-mono text-[10px] tracking-widest uppercase focus:outline-none"
              />
              <textarea
                placeholder="ENTER_BRIEF_EXCERPT..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="bg-background border-border text-foreground focus:border-primary/50 placeholder:text-muted-foreground/50 h-20 w-full resize-none border p-4 font-mono text-xs transition-colors focus:outline-none"
              />
              {(viewMode === "write" || viewMode === "split") && (
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="WRITE_YOUR_CONTENT_HERE... Use toolbar for formatting or drag & drop images."
                />
              )}
            </div>
            {(viewMode === "preview" || viewMode === "split") && (
              <div className="bg-background border-border monolith-glass relative hidden h-full flex-col overflow-hidden border lg:flex">
                <div className="bg-muted/10 border-border flex items-center justify-between border-b p-4">
                  <h2 className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
                    RENDER_PREVIEW
                  </h2>
                  <span className="bg-primary animate-pulse-slow h-2 w-2 rounded-full" />
                </div>
                <div className="border-border flex-1 overflow-y-auto border-t p-8">
                  <div className="prose dark:prose-invert prose-headings:font-display prose-headings:text-foreground prose-a:text-primary prose-p:font-sans prose-p:text-muted-foreground prose-p:leading-relaxed prose-code:font-mono prose-code:bg-card prose-code:px-1 prose-code:py-0.5 prose-img:rounded-lg max-w-none">
                    <h1>{title || "UNTITLED_RECORD"}</h1>
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
        </Container>
      </section>
    </div>
  );
}
