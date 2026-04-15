"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import TextAlign from "@tiptap/extension-text-align"
import Placeholder from "@tiptap/extension-placeholder"
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, List, ListOrdered,
  CheckSquare, Link as LinkIcon, Image as ImageIcon,
  Quote, Code, Undo, Redo, AlignLeft, AlignCenter, AlignRight
} from "lucide-react"
import { useCallback, useState, useRef } from "react"
import { useToast } from "@/hooks/use-toast"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export function RichTextEditor({ content, onChange, placeholder = "Start writing..." }: RichTextEditorProps) {
  const { addToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto my-4",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline hover:text-primary/80",
        },
      }),
      Underline,
      TaskList.configure({
        HTMLAttributes: {
          class: "not-prose list-none pl-0",
        },
      }),
      TaskItem.configure({
        nested: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: convertMarkdownToHtml(content),
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const markdown = convertHtmlToMarkdown(html)
      onChange(markdown)
    },
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert prose-headings:font-display prose-headings:font-bold prose-a:text-primary max-w-none focus:outline-none min-h-[300px] px-4 py-3",
      },
    },
  })

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Upload failed")
      }

      const data = await res.json()
      
      editor.chain().focus().setImage({ src: data.url, alt: file.name }).run()
      addToast("Image uploaded successfully", "success")
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Failed to upload image", "error")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }, [editor, addToast])

  const setLink = useCallback(() => {
    if (!editor) return
    const url = window.prompt("Enter URL:")
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }, [editor])

  if (!editor) return null

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    children, 
    title,
    disabled = false 
  }: { 
    onClick: () => void
    isActive?: boolean
    children: React.ReactNode
    title: string
    disabled?: boolean
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        isActive 
          ? "bg-primary/20 text-primary" 
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  )

  const Divider = () => (
    <div className="w-px h-5 bg-border mx-1" />
  )

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-border bg-muted/30">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          isActive={editor.isActive("taskList")}
          title="Task List"
        >
          <CheckSquare className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive("codeBlock")}
          title="Code Block"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={setLink}
          isActive={editor.isActive("link")}
          title="Add Link"
        >
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>
        <div className="relative">
          <ToolbarButton
            onClick={() => fileInputRef.current?.click()}
            title="Insert Image"
          >
            <ImageIcon className="w-4 h-4" />
          </ToolbarButton>
          {isUploading && (
            <span className="absolute inset-0 flex items-center justify-center bg-background/80">
              <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </span>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </div>

      <div className="min-h-[400px] max-h-[600px] overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

function convertMarkdownToHtml(markdown: string): string {
  if (!markdown) return ""
  
  let html = markdown
  
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>")
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>")
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>")
  
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>")
  html = html.replace(/__(.+?)__/g, "<u>$1</u>")
  html = html.replace(/~~(.+?)~~/g, "<s>$1</s>")
  
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>")
  
  html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
  
  html = html.replace(/^\- (.+)$/gm, "<li>$1</li>")
  html = html.replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>")
  
  html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
  
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
  
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
  
  html = html.replace(/\n\n/g, "</p><p>")
  html = `<p>${html}</p>`
  html = html.replace(/<p><\/p>/g, "")
  html = html.replace(/<p>(<h[1-3]>)/g, "$1")
  html = html.replace(/(<\/h[1-3]>)<\/p>/g, "$1")
  html = html.replace(/<p>(<pre>)/g, "$1")
  html = html.replace(/(<\/pre>)<\/p>/g, "$1")
  html = html.replace(/<p>(<ul>)/g, "$1")
  html = html.replace(/(<\/ul>)<\/p>/g, "$1")
  html = html.replace(/<p>(<ol>)/g, "$1")
  html = html.replace(/(<\/ol>)<\/p>/g, "$1")
  html = html.replace(/<p>(<blockquote>)/g, "$1")
  html = html.replace(/(<\/blockquote>)<\/p>/g, "$1")
  html = html.replace(/<p>(<img )/g, "$1")
  html = html.replace(/( \/>)<\/p>/g, " />")
  
  return html
}

function convertHtmlToMarkdown(html: string): string {
  if (!html) return ""
  
  let markdown = html
  
  markdown = markdown.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "# $1\n")
  markdown = markdown.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "## $1\n")
  markdown = markdown.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "### $1\n")
  
  markdown = markdown.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**")
  markdown = markdown.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**")
  markdown = markdown.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*")
  markdown = markdown.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "*$1*")
  markdown = markdown.replace(/<u[^>]*>([\s\S]*?)<\/u>/gi, "_$1_")
  markdown = markdown.replace(/<s[^>]*>([\s\S]*?)<\/s>/gi, "~~$1~~")
  markdown = markdown.replace(/<strike[^>]*>([\s\S]*?)<\/strike>/gi, "~~$1~~")
  
  markdown = markdown.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, "```\n$1\n```")
  markdown = markdown.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`")
  
  markdown = markdown.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, "> $1\n")
  
  markdown = markdown.replace(/<ul[^>]*>/gi, "\n")
  markdown = markdown.replace(/<\/ul>/gi, "\n")
  markdown = markdown.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n")
  
  markdown = markdown.replace(/<ol[^>]*>/gi, "\n")
  markdown = markdown.replace(/<\/ol>/gi, "\n")
  
  markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
  
  markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, "![$2]($1)")
  markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, "![]($1)")
  
  markdown = markdown.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "$1\n\n")
  markdown = markdown.replace(/<br\s*\/?>/gi, "\n")
  
  markdown = markdown.replace(/<div[^>]*>/gi, "\n")
  markdown = markdown.replace(/<\/div>/gi, "")
  
  markdown = markdown.replace(/&nbsp;/g, " ")
  markdown = markdown.replace(/&lt;/g, "<")
  markdown = markdown.replace(/&gt;/g, ">")
  markdown = markdown.replace(/&amp;/g, "&")
  
  markdown = markdown.replace(/<[^>]+>/g, "")
  
  markdown = markdown.replace(/\n{3,}/g, "\n\n")
  markdown = markdown.trim()
  
  return markdown
}

export { convertMarkdownToHtml, convertHtmlToMarkdown }