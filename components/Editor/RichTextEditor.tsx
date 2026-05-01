"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { useEffect, useCallback, useRef, useState } from "react";

type Props = {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export default function RichTextEditor({ content, onChange, placeholder }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: placeholder || "Begin your transmission…",
      }),
      Underline,
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "tiptap-content min-h-[400px] focus:outline-none",
      },
    },
    immediatelyRender: false,
  });

  // Sync external content changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "", { emitUpdate: false });
    }
  }, [content, editor]);

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const uploadImage = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        editor.chain().focus().setImage({ src: data.url }).run();
      } else {
        setUploadError(data.error || "Upload failed.");
      }
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [editor]);

  if (!editor) return null;

  const btn = (label: string, action: () => boolean | void, isActive?: boolean) => (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        action();
      }}
      className={`px-2.5 py-1.5 text-xs rounded transition-colors ${
        isActive
          ? "bg-[#b87333] text-[#0d1b2a]"
          : "text-[#faf6f0]/60 hover:text-[#faf6f0] hover:bg-[#0d1b2a]/50"
      }`}
      title={label}
    >
      {label}
    </button>
  );

  return (
    <div className="border border-[#b87333]/30 rounded-lg overflow-hidden bg-[#0d1b2a]/50">
      {/* Toolbar */}
      <div className="border-b border-[#b87333]/20 bg-[#1a2f45] px-2 py-1.5 flex flex-wrap gap-0.5">
        {btn("H1", () => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive("heading", { level: 1 }))}
        {btn("H2", () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive("heading", { level: 2 }))}
        {btn("H3", () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive("heading", { level: 3 }))}
        <span className="w-px mx-1 bg-[#b87333]/20 self-stretch" />
        {btn("B", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"))}
        {btn("I", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"))}
        {btn("U", () => editor.chain().focus().toggleUnderline().run(), editor.isActive("underline"))}
        {btn("S", () => editor.chain().focus().toggleStrike().run(), editor.isActive("strike"))}
        <span className="w-px mx-1 bg-[#b87333]/20 self-stretch" />
        {btn("• List", () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList"))}
        {btn("1. List", () => editor.chain().focus().toggleOrderedList().run(), editor.isActive("orderedList"))}
        {btn("❝", () => editor.chain().focus().toggleBlockquote().run(), editor.isActive("blockquote"))}
        <span className="w-px mx-1 bg-[#b87333]/20 self-stretch" />
        {btn("`Code`", () => editor.chain().focus().toggleCode().run(), editor.isActive("code"))}
        {btn("```", () => editor.chain().focus().toggleCodeBlock().run(), editor.isActive("codeBlock"))}
        <span className="w-px mx-1 bg-[#b87333]/20 self-stretch" />
        {btn("Link", setLink, editor.isActive("link"))}
        <label
          className={`px-2.5 py-1.5 text-xs rounded transition-colors cursor-pointer ${
            uploading
              ? "text-[#faf6f0]/30 cursor-not-allowed"
              : "text-[#faf6f0]/60 hover:text-[#faf6f0] hover:bg-[#0d1b2a]/50"
          }`}
          title="Upload image file"
        >
          {uploading ? "Uploading…" : "Upload Img"}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={uploadImage}
          />
        </label>
        {btn("—", () => editor.chain().focus().setHorizontalRule().run())}
      </div>

      {uploadError && (
        <div className="px-4 py-2 bg-red-400/10 border-b border-red-400/20 text-red-400 text-xs">
          {uploadError}
        </div>
      )}

      {/* Editor content */}
      <div className="p-5 text-[#faf6f0]/90">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
