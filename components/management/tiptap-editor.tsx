"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Strikethrough,
  Highlighter,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadContentImage } from "@/lib/api/media";
import { cn } from "@/lib/utils";

export interface TiptapEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  postId?: string | null;
  className?: string;
}

export default function TiptapEditor({
  value,
  onChange,
  placeholder = "Write post content here…",
  disabled = false,
  postId = null,
  className,
}: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        link: {
          openOnClick: false,
          HTMLAttributes: {
            rel: "noopener noreferrer",
            target: "_blank",
          },
        },
      }),
      Highlight,
      Image.configure({
        allowBase64: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }: { editor: Editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter link URL:", previousUrl || "");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run();
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPEG, PNG, and WebP images are allowed.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const contextId = postId || `draft-${crypto.randomUUID()}`;
    setUploading(true);
    try {
      const url = await uploadContentImage("blog", contextId, file);
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Image upload failed. JPEG, PNG or WebP only.",
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div
      className={cn(
        "rounded-md border border-input bg-background overflow-hidden transition-all focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        disabled && "opacity-50 pointer-events-none",
        className,
      )}
    >
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-wrap items-center gap-0.5 border-b border-input bg-muted/30 p-1">
        <Button
          type="button"
          size="icon-sm"
          variant={editor.isActive("bold") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant={editor.isActive("italic") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant={editor.isActive("strike") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant={editor.isActive("highlight") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          title="Highlight"
        >
          <Highlighter className="h-4 w-4" />
        </Button>

        <div className="h-4 w-px bg-border mx-1" />

        <Button
          type="button"
          size="icon-sm"
          variant={
            editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"
          }
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant={
            editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"
          }
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="h-4 w-px bg-border mx-1" />

        <Button
          type="button"
          size="icon-sm"
          variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant={editor.isActive("blockquote") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant={editor.isActive("codeBlock") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Code Block"
        >
          <Code className="h-4 w-4" />
        </Button>

        <div className="h-4 w-px bg-border mx-1" />

        <Button
          type="button"
          size="icon-sm"
          variant={editor.isActive("link") ? "secondary" : "ghost"}
          onClick={setLink}
          title="Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={handleImageClick}
          disabled={uploading}
          className="gap-1.5 px-2 text-xs"
          title="Insert Image"
        >
          {uploading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Uploading…</span>
            </>
          ) : (
            <>
              <ImageIcon className="h-4 w-4" />
              <span>Image</span>
            </>
          )}
        </Button>

        <div className="h-4 w-px bg-border mx-1" />

        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <EditorContent
        editor={editor}
        className="p-3 min-h-60 text-sm text-foreground focus:outline-none tiptap-content"
      />

      <style jsx global>{`
        .tiptap-content .ProseMirror {
          min-height: 220px;
          outline: none;
        }
        .tiptap-content .ProseMirror p.is-editor-empty:first-child::before {
          color: var(--muted-foreground);
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .tiptap-content .ProseMirror h1 {
          font-size: 1.75rem;
          font-weight: 700;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .tiptap-content .ProseMirror h2 {
          font-size: 1.4rem;
          font-weight: 600;
          margin-top: 0.85rem;
          margin-bottom: 0.4rem;
        }
        .tiptap-content .ProseMirror h3 {
          font-size: 1.15rem;
          font-weight: 600;
          margin-top: 0.75rem;
          margin-bottom: 0.35rem;
        }
        .tiptap-content .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.25rem;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .tiptap-content .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.25rem;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .tiptap-content .ProseMirror blockquote {
          border-left: 3px solid var(--gold, #cdbf8a);
          padding-left: 0.75rem;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
          font-style: italic;
          color: var(--muted-foreground);
        }
        .tiptap-content .ProseMirror pre {
          background-color: var(--muted);
          padding: 0.75rem;
          border-radius: 0.375rem;
          font-family: var(--font-mono, monospace);
          font-size: 0.85rem;
          overflow-x: auto;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .tiptap-content .ProseMirror code {
          background-color: var(--muted);
          padding: 0.15rem 0.3rem;
          border-radius: 0.25rem;
          font-family: var(--font-mono, monospace);
          font-size: 0.85rem;
        }
        .tiptap-content .ProseMirror mark {
          background-color: rgba(205, 191, 138, 0.4);
          color: inherit;
          padding: 0.1rem 0.2rem;
          border-radius: 0.15rem;
        }
        .tiptap-content .ProseMirror a {
          color: var(--primary);
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .tiptap-content .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.375rem;
          margin-top: 0.75rem;
          margin-bottom: 0.75rem;
          display: block;
        }
      `}</style>
    </div>
  );
}
