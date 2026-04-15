"use client"
import { useState, useEffect, use, useRef } from "react"
import { authClient } from "@/lib/auth-client"
import { ArrowLeft, Save, Trash2, Settings2 } from "lucide-react"
import Link from "next/link"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { useToast } from "@/hooks/use-toast"
import { ToastContainer } from "@/components/ui/toast-container"
import { RichTextEditor } from "@/components/admin/rich-text-editor"

export default function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { id } = resolvedParams
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
  const [initialFetchDone, setInitialFetchDone] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showMeta, setShowMeta] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [viewMode, setViewMode] = useState<"write" | "preview" | "split">("split")
  const initialValuesRef = useRef<string>("")
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  
  useEffect(() => {
     if (id && session) {
         fetch(`/api/admin/posts/${id}`)
           .then(res => res.json())
           .then(data => {
               if (data && !data.error) {
                   setTitle(data.title || "")
                   setSlug(data.slug || "")
                   setExcerpt(data.excerpt || "")
                   setContent(data.content || "")
                   setStatus(data.status || "draft")
                   setCoverImage(data.coverImage || "")
                   setMetaTitle(data.metaTitle || "")
                   setMetaDescription(data.metaDescription || "")
                   if (data.tags) {
                     try {
                       const parsed = JSON.parse(data.tags)
                       setTags(Array.isArray(parsed) ? parsed.join(', ') : data.tags)
                     } catch {
                       setTags(data.tags)
                     }
                   }
                   initialValuesRef.current = JSON.stringify({ title: data.title, slug: data.slug, content: data.content, excerpt: data.excerpt })
               }
               setInitialFetchDone(true)
           })
           .catch(() => setInitialFetchDone(true))
     }
  }, [id, session])

  useEffect(() => {
    if (!initialFetchDone) return
    const current = JSON.stringify({ title, slug, content, excerpt })
    setIsDirty(current !== initialValuesRef.current)
  }, [title, slug, content, excerpt, initialFetchDone])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) e.preventDefault()
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isDirty])

  useEffect(() => {
    if (!isDirty || !initialFetchDone) return
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
    autosaveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(`editor-draft-${id}`, JSON.stringify({ title, slug, excerpt, content, status, tags, coverImage, metaTitle, metaDescription }))
      } catch (e) {
        console.error("Autosave failed:", e)
      }
    }, 3000)
    return () => { if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current) }
  }, [title, slug, excerpt, content, status, tags, coverImage, metaTitle, metaDescription, isDirty, initialFetchDone, id])

  if (!session) return null

  const handleSave = async () => {
      setLoading(true)
      try {
          const res = await fetch(`/api/admin/posts/${id}`, {
              method: "PUT",
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
              localStorage.removeItem(`editor-draft-${id}`)
              setIsDirty(false)
              initialValuesRef.current = JSON.stringify({ title, slug, content, excerpt })
              addToast("Post updated successfully", "success")
          } else {
             const data = await res.json()
             addToast(data.error || "Failed to update post", "error")
          }
      } catch {
          addToast("Network error while saving", "error")
      } finally {
          setLoading(false)
      }
  }

  const handleDelete = async () => {
      if (!confirm("Are you sure you want to permanently delete this post?")) return;
      setIsDeleting(true)
      try {
          const res = await fetch(`/api/admin/posts/${id}`, {
              method: "DELETE"
          })
          if (res.ok) {
              localStorage.removeItem(`editor-draft-${id}`)
              addToast("Post deleted", "success")
              setTimeout(() => { window.location.href = "/admin/dashboard" }, 500)
          } else {
             addToast("Failed to delete post", "error")
          }
      } catch {
          addToast("Network error while deleting", "error")
      } finally {
          setIsDeleting(false)
      }
  }

  if (!initialFetchDone) return (
     <div className="h-full flex items-center justify-center text-muted-foreground">
        <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3" />
        Loading post data...
     </div>
  )

  return (
    <div className="flex flex-col h-screen overflow-hidden">
       <ToastContainer toasts={toasts} dismiss={dismiss} />
       <header className="h-16 flex items-center justify-between border-b border-border px-6 shrink-0 bg-background/95 backdrop-blur-md sticky top-0 z-40">
           <Link href="/admin/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
               <ArrowLeft className="w-4 h-4" /> Back to Dashboard
           </Link>
           <div className="flex items-center gap-3">
               {isDirty && (
                 <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest">UNSAVED_CHANGES</span>
               )}
               <div className="flex items-center border border-border rounded-md overflow-hidden">
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
                 onChange={e => setStatus(e.target.value as "draft" | "published")}
                 className="text-sm bg-background border border-border rounded-md px-3 py-1.5 focus:outline-none focus:border-primary"
               >
                 <option value="draft">Draft</option>
                 <option value="published">Published</option>
               </select>
               <button
                 onClick={() => setShowMeta(!showMeta)}
                 className={`inline-flex items-center text-sm border rounded-md px-3 py-1.5 transition-colors ${showMeta ? 'bg-primary text-background border-primary' : 'bg-background text-muted-foreground border-border hover:border-primary hover:text-foreground'}`}
               >
                 <Settings2 className="w-4 h-4 mr-1.5" /> SEO
               </button>
               <button 
                   onClick={handleDelete} 
                   disabled={isDeleting}
                   className="inline-flex items-center text-sm bg-transparent text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 rounded-md px-3 py-1.5 transition-colors disabled:opacity-50 font-medium"
               >
                   <Trash2 className="w-4 h-4 mr-1.5" />
                   {isDeleting ? "Deleting..." : "Delete"}
               </button>
               <button 
                   onClick={handleSave} 
                   disabled={loading || !title || !slug || !content}
                   className="inline-flex items-center text-sm bg-primary text-background border border-primary rounded-md hover:bg-primary/90 px-4 py-1.5 transition-colors disabled:opacity-50 font-medium shadow-sm"
               >
                   <Save className="w-4 h-4 mr-1.5" />
                   {status === 'published' ? 'Update Post' : 'Save Draft'}
               </button>
           </div>
       </header>

       <div className="flex-1 overflow-y-auto p-6">
           <div className="mx-auto w-full h-full space-y-6">
               {showMeta && (
                 <div className="bg-card border border-border rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">Meta Title</label>
                      <input type="text" value={metaTitle} onChange={e => setMetaTitle(e.target.value)} maxLength={70}
                        className="w-full bg-background border border-border rounded-md p-2.5 text-sm focus:outline-none focus:border-primary/50 transition-colors text-foreground placeholder:text-muted-foreground/50" placeholder="SEO title..." />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">Cover Image URL</label>
                      <input type="url" value={coverImage} onChange={e => setCoverImage(e.target.value)}
                        className="w-full bg-background border border-border rounded-md p-2.5 text-sm focus:outline-none focus:border-primary/50 transition-colors text-foreground placeholder:text-muted-foreground/50" placeholder="https://..." />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">Meta Description</label>
                      <textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)} maxLength={160}
                        className="w-full h-16 bg-background border border-border rounded-md p-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 resize-none transition-colors placeholder:text-muted-foreground/50" placeholder="SEO description..." />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">Tags</label>
                      <input type="text" value={tags} onChange={e => setTags(e.target.value)}
                        className="w-full bg-background border border-border rounded-md p-2.5 text-sm focus:outline-none focus:border-primary/50 transition-colors text-foreground placeholder:text-muted-foreground/50" placeholder="ai, agent, startup (comma separated)" />
                    </div>
                 </div>
               )}

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[75vh]">
                   <div className="flex flex-col gap-4 h-full">
                       <input 
                          type="text" 
                          placeholder="Post Title" 
                          value={title}
                          onChange={e => setTitle(e.target.value)}
                          className="w-full font-display text-4xl font-bold bg-transparent border-none focus:outline-none text-foreground placeholder:text-muted-foreground/30"
                       />
                       <input 
                          type="text" 
                          placeholder="slug-url-identifier" 
                          value={slug}
                          onChange={e => setSlug(e.target.value)}
                          className="w-full text-sm font-mono text-muted-foreground bg-transparent border-none focus:outline-none placeholder:text-muted-foreground/30"
                       />
                       <textarea 
                          placeholder="Write a brief excerpt (optional)..." 
                          value={excerpt}
                          onChange={e => setExcerpt(e.target.value)}
                          className="w-full h-24 bg-card border border-border rounded-md p-4 text-sm focus:outline-none focus:border-primary/50 resize-none transition-colors text-foreground placeholder:text-muted-foreground/50"
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
                     <div className="hidden lg:flex flex-col bg-card border border-border rounded-md overflow-hidden relative h-full">
                         <div className="bg-muted/10 border-b border-border p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider flex justify-between">
                             Live Preview
                             <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-slow"></span>
                         </div>
                         <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                             <div className="prose dark:prose-invert prose-headings:font-display prose-headings:font-bold max-w-none prose-a:text-primary prose-img:rounded-lg">
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
  )
}