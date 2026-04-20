"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/lib/auth";
import Container from "@/components/container";
import { Subheading } from "@/components/subheading";
import { DottedSeparator } from "@/components/separator";
import { Box } from "@/components/box";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
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
  const [viewMode, setViewMode] = useState<"write" | "preview" | "split">("split");
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
          JSON.stringify({ title, slug, excerpt, content, status, tags, coverImage, metaTitle, metaDescription }),
        );
      } catch (e) {
        console.error("Autosave failed:", e);
      }
    }, 3000);
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [title, slug, excerpt, content, status, tags, coverImage, metaTitle, metaDescription, isDirty]);

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
      } catch { /* ignore */ }
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
          tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
          coverImage: coverImage || undefined,
          metaTitle: metaTitle || undefined,
          metaDescription: metaDescription || undefined,
        }),
      });
      if (res.ok) {
        localStorage.removeItem("editor-draft-new");
        setIsDirty(false);
        addToast("Post created", "success");
        setTimeout(() => {
          window.location.href = "/admin/dashboard";
        }, 500);
      } else {
        const data = await res.json();
        addToast(data.error || "Failed to save", "error");
      }
    } catch {
      addToast("Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="pt-4 pb-24">
      <ToastContainer toasts={toasts} dismiss={dismiss} />

      <div className="flex items-start justify-between">
        <div>
          <Subheading>New post</Subheading>
          <div className="mt-4 flex flex-col gap-1 md:flex-row md:items-center md:gap-2">
            <p className="text-foreground font-medium">Compose</p>
            <div className="hidden size-1 rounded-full bg-neutral-200 md:block" />
            <p className="text-foreground/70">Write, preview, and publish.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as "draft" | "published")}
          >
            <SelectTrigger className="border-border bg-card/30 h-8 w-[100px] font-mono text-[10px] tracking-widest uppercase">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-border font-mono text-xs">
              <SelectItem value="draft" className="uppercase">Draft</SelectItem>
              <SelectItem value="published" className="uppercase">Published</SelectItem>
            </SelectContent>
          </Select>
          <button
            onClick={() => setShowMeta(!showMeta)}
            className={`font-mono text-[10px] tracking-widest uppercase transition-colors ${
              showMeta ? "text-foreground" : "text-foreground/40 hover:text-foreground"
            }`}
          >
            <Settings2 className="mr-1 inline h-3 w-3" />
            SEO
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !title || !slug || !content}
            className="bg-foreground text-background cursor-pointer px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-50"
          >
            <Save className="mr-1.5 inline h-3 w-3" />
            {loading ? "Saving..." : "Publish"}
          </button>
        </div>
      </div>

      <DottedSeparator className="my-4" />

      {showMeta && (
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-foreground/40 font-mono text-xs uppercase tracking-wide">Meta title (max 70)</label>
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              maxLength={70}
              className="bg-card/30 border-border text-foreground placeholder:text-foreground/30 w-full border px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Custom SEO title..."
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-foreground/40 font-mono text-xs uppercase tracking-wide">Cover image URL</label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="bg-card/30 border-border text-foreground placeholder:text-foreground/30 w-full border px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="https://..."
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-foreground/40 font-mono text-xs uppercase tracking-wide">Meta description (max 160)</label>
            <textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              maxLength={160}
              className="bg-card/30 border-border text-foreground placeholder:text-foreground/30 h-16 w-full resize-none border px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Custom SEO description..."
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-foreground/40 font-mono text-xs uppercase tracking-wide">Tags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="bg-card/30 border-border text-foreground placeholder:text-foreground/30 w-full border px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="ai-agents, saas, next.js"
            />
          </div>
          <DottedSeparator className="my-2" />
        </div>
      )}

      <div className="grid h-[calc(100vh-14rem)] grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex h-full flex-col gap-4 overflow-y-auto">
          <input
            type="text"
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-foreground placeholder:text-foreground/30 w-full border-none bg-transparent text-2xl font-bold focus:outline-none"
          />
          <input
            type="text"
            placeholder="slug-url-identifier"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setIsAutoSlug(false);
            }}
            className="text-foreground/40 placeholder:text-foreground/20 w-full border-none bg-transparent font-mono text-[10px] tracking-widest uppercase focus:outline-none"
          />
          <textarea
            placeholder="Brief excerpt (optional)..."
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="bg-card/30 border-border text-foreground placeholder:text-foreground/30 h-20 w-full resize-none border p-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {(viewMode === "write" || viewMode === "split") && (
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Write your content here..."
            />
          )}
        </div>

        {(viewMode === "preview" || viewMode === "split") && (
          <div className="border-border relative hidden h-full flex-col overflow-hidden border lg:flex">
            <div className="border-border flex items-center justify-between border-b p-3">
              <span className="text-foreground/40 font-mono text-[10px] tracking-widest uppercase">
                Preview
              </span>
              <span className="bg-primary h-1.5 w-1.5 rounded-full" />
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose dark:prose-invert prose-headings:font-display prose-headings:font-bold prose-a:text-primary prose-p:text-muted-foreground prose-code:font-mono prose-img:rounded-lg max-w-none">
                <h2>{title || "Untitled"}</h2>
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                  {content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
