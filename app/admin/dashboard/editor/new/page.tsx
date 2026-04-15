"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { authClient } from "@/lib/auth-client"
import { Container } from "@/components/layout/container"
import { ArrowLeft, Save, Terminal, Settings2 } from "lucide-react"
import Link from "next/link"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { useToast } from "@/hooks/use-toast"
import { ToastContainer } from "@/components/ui/toast-container"
import { RichTextEditor } from "@/components/admin/rich-text-editor"

export default function Editor() {
  const { data: session } = authClient.useSession()
  const { toasts, addToast, dismiss } = useToast()
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const [status, setStatus] = useState<"draft" | "published">("draft")
  const [tags, setTags] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [metaTitle, setMetaTitle] = useState("")
  const [metaDescription, setMetaDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [isAutoSlug, setIsAutoSlug] = useState(true)
  const [showMeta, setShowMeta] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [viewMode, setViewMode] = useState<"write" | "preview" | "split">("split")
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  
  useEffect(() => {
    if (isAutoSlug && title) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))
    }
  }, [title, isAutoSlug])

  useEffect(() => {
    if (title || content) setIsDirty(true)
  }, [title, content, excerpt, slug])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) e.preventDefault()
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isDirty])

  useEffect(() => {
    if (!isDirty || !title) return
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
    autosaveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem("editor-draft-new", JSON.stringify({ title, slug, excerpt, content, status, tags, coverImage, metaTitle, metaDescription }))
      } catch (e) {
        console.error("Autosave failed:", e)
      }
    }, 3000)
    return () => { if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current) }
  }, [title, slug, excerpt, content, status, tags, coverImage, metaTitle, metaDescription, isDirty])

  useEffect(() => {
    const saved = localStorage.getItem("editor-draft-new")
    if (saved) {
      try {
        const data = JSON.parse(saved)
        if (data.title) {
          setTitle(data.title); setSlug(data.slug || ""); setExcerpt(data.excerpt || "")
          setContent(data.content || ""); setStatus(data.status || "draft"); setTags(data.tags || "")
          setCoverImage(data.coverImage || ""); setMetaTitle(data.metaTitle || ""); setMetaDescription(data.metaDescription || "")
          setIsAutoSlug(false)
          addToast("Draft restored from autosave", "info")
        }
      } catch { /* ignore */ }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!session) return null

  const handleSave = async () => {
      setLoading(true)
      try {
          const res = await fetch("/api/admin/posts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title, slug, excerpt, content, status,
                tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                coverImage: coverImage || undefined,
                metaTitle: metaTitle || undefined,
                metaDescription: metaDescription || undefined,
              })
          })
          if (res.ok) {
              localStorage.removeItem("editor-draft-new")
              setIsDirty(false)
              addToast("Post created successfully", "success")
              setTimeout(() => { window.location.href = "/admin/dashboard" }, 500)
           } else {
             const data = await res.json()
             addToast(data.error || "Failed to save post", "error")
          }
      } catch {
          addToast("Network error while saving", "error")
      } finally {
          setLoading(false)
      }
  }

  return (
    <div className="min-h-dvh bg-background relative">
      <div className="fixed inset-0 bg-grid-blueprint text-foreground opacity-10 pointer-events-none" />
      <ToastContainer toasts={toasts} dismiss={dismiss} />
      
       <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
           <Container>
               <div className="h-16 flex items-center justify-between">
                   <Link href="/admin/dashboard" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                       <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform"/> ABORT_MISSION
                   </Link>
                   <div className="flex items-center gap-3">
                       <div className="flex items-center border border-border rounded-md overflow-hidden">
                         <button
                           onClick={() => setViewMode("write")}
                           className={`px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${viewMode === "write" ? "bg-primary text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                         >
                           WRITE
                         </button>
                         <button
                           onClick={() => setViewMode("split")}
                           className={`px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${viewMode === "split" ? "bg-primary text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                         >
                           SPLIT
                         </button>
                         <button
                           onClick={() => setViewMode("preview")}
                           className={`px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${viewMode === "preview" ? "bg-primary text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                         >
                           PREVIEW
                         </button>
                       </div>
                       <select
                         value={status}
                         onChange={e => setStatus(e.target.value as "draft" | "published")}
                         className="font-mono text-[10px] uppercase tracking-widest bg-background border border-border px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                       >
                         <option value="draft">DRAFT</option>
                         <option value="published">PUBLISHED</option>
                       </select>
                       <button
                         onClick={() => setShowMeta(!showMeta)}
                         className={`inline-flex items-center justify-center font-mono text-[10px] uppercase tracking-widest border px-3 py-2 transition-colors ${showMeta ? 'bg-primary text-background border-primary' : 'bg-background text-muted-foreground border-border hover:border-primary hover:text-primary'}`}
                       >
                         <Settings2 className="w-3 h-3 mr-1.5" />
                         SEO
                       </button>
                       <button 
                           onClick={handleSave} 
                           disabled={loading || !title || !slug || !content}
                           className="inline-flex items-center justify-center font-mono text-[10px] uppercase tracking-widest bg-primary text-background border border-primary hover:bg-background hover:text-primary px-6 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed monolith-glass"
                       >
                           <Save className="w-3 h-3 mr-2" />
                           {loading ? "DEPLOYING..." : "COMMIT_RECORD"}
                       </button>
                   </div>
               </div>
           </Container>
       </header>

       <section className="pt-24 pb-24 relative z-10">
           <Container>
               {showMeta && (
                 <div className="mb-6 bg-card border border-border monolith-glass p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="block text-[10px] font-mono text-muted-foreground uppercase tracking-widest">META_TITLE (max 70)</label>
                     <input type="text" value={metaTitle} onChange={e => setMetaTitle(e.target.value)} maxLength={70}
                       className="w-full bg-background border border-border p-3 font-mono text-xs text-foreground focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground/50" placeholder="Custom SEO title..." />
                   </div>
                   <div className="space-y-2">
                     <label className="block text-[10px] font-mono text-muted-foreground uppercase tracking-widest">COVER_IMAGE_URL</label>
                     <input type="url" value={coverImage} onChange={e => setCoverImage(e.target.value)}
                       className="w-full bg-background border border-border p-3 font-mono text-xs text-foreground focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground/50" placeholder="https://..." />
                   </div>
                   <div className="space-y-2 md:col-span-2">
                     <label className="block text-[10px] font-mono text-muted-foreground uppercase tracking-widest">META_DESCRIPTION (max 160)</label>
                     <textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)} maxLength={160}
                       className="w-full h-16 bg-background border border-border p-3 font-mono text-xs text-foreground focus:outline-none focus:border-primary/50 resize-none transition-colors placeholder:text-muted-foreground/50" placeholder="Custom SEO description..." />
                   </div>
                   <div className="space-y-2 md:col-span-2">
                     <label className="block text-[10px] font-mono text-muted-foreground uppercase tracking-widest">TAGS (comma separated)</label>
                     <input type="text" value={tags} onChange={e => setTags(e.target.value)}
                       className="w-full bg-background border border-border p-3 font-mono text-xs text-foreground focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground/50" placeholder="ai-agents, saas, next.js" />
                   </div>
                 </div>
               )}

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-12rem)]">
                   <div className="space-y-4 flex flex-col h-full bg-card border border-border monolith-glass p-6 relative">
                       <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-border" />
                       <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-border" />
                       <div className="flex items-center gap-3 border-b border-border pb-4">
                           <Terminal className="w-4 h-4 text-muted-foreground" />
                           <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">INPUT_BUFFER</h2>
                           <span className={`ml-auto font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 border ${status === 'published' ? 'text-primary border-primary/30' : 'text-amber-500 border-amber-500/30'}`}>
                             {status}
                           </span>
                       </div>
                       <input type="text" placeholder="ENTRY_TITLE" value={title} onChange={e => setTitle(e.target.value)}
                          className="w-full font-display text-2xl font-bold bg-transparent border-none focus:outline-none text-foreground placeholder:text-muted-foreground/30 uppercase" />
                       <input type="text" placeholder="SLUG-URL-IDENTIFIER" value={slug}
                          onChange={e => { setSlug(e.target.value); setIsAutoSlug(false) }}
                          className="w-full text-[10px] font-mono bg-transparent border-none focus:outline-none text-primary placeholder:text-primary/30 uppercase tracking-widest" />
                       <textarea placeholder="ENTER_BRIEF_EXCERPT..." value={excerpt} onChange={e => setExcerpt(e.target.value)}
                          className="w-full h-20 bg-background border border-border p-4 font-mono text-xs text-foreground focus:outline-none focus:border-primary/50 resize-none transition-colors placeholder:text-muted-foreground/50" />
                       {(viewMode === "write" || viewMode === "split") && (
                         <RichTextEditor
                           content={content}
                           onChange={setContent}
                           placeholder="WRITE_YOUR_CONTENT_HERE... Use toolbar for formatting or drag & drop images."
                         />
                       )}
                   </div>
                   {(viewMode === "preview" || viewMode === "split") && (
                       <div className="hidden lg:flex flex-col h-full bg-background border border-border monolith-glass overflow-hidden relative">
                           <div className="bg-muted/10 border-b border-border p-4 flex justify-between items-center">
                               <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">RENDER_PREVIEW</h2>
                               <span className="w-2 h-2 bg-primary animate-pulse-slow rounded-full" />
                           </div>
                           <div className="flex-1 overflow-y-auto p-8 border-t border-border">
                               <div className="prose dark:prose-invert prose-headings:font-display prose-headings:text-foreground prose-a:text-primary max-w-none prose-p:font-sans prose-p:text-muted-foreground prose-p:leading-relaxed prose-code:font-mono prose-code:bg-card prose-code:px-1 prose-code:py-0.5 prose-img:rounded-lg">
                                   <h1>{title || "UNTITLED_RECORD"}</h1>
                                   <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
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
  )
}