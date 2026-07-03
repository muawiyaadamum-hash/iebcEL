import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code, Link as LinkIcon, Image as ImageIcon,
  Undo2, Redo2, Minus, Pilcrow,
} from "lucide-react";
import { useRef } from "react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  uploadPathPrefix?: string; // e.g. "cursusId/moduleId"
  minHeight?: number;
}

const Btn = ({ active, onClick, children, title }: any) => (
  <Button type="button" size="sm" variant={active ? "secondary" : "ghost"}
    className="h-8 w-8 p-0" onClick={onClick} title={title}>
    {children}
  </Button>
);

export default function RichTextEditor({
  value, onChange, placeholder = "Rédigez le contenu de la leçon…",
  uploadPathPrefix = "editor", minHeight = 260,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { class: "text-primary underline" } }),
      Image.configure({ HTMLAttributes: { class: "rounded-lg my-3 max-w-full" } }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none px-4 py-3",
        style: `min-height:${minHeight}px`,
      },
    },
  }) as Editor | null;

  if (!editor) return null;

  const setLink = () => {
    const url = window.prompt("URL du lien", editor.getAttributes("link").href || "https://");
    if (url === null) return;
    if (url === "") return editor.chain().focus().unsetLink().run();
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const uploadImage = async (file: File) => {
    const path = `${uploadPathPrefix}/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const { error } = await supabase.storage.from("course-content").upload(path, file, { upsert: true });
    if (error) return toast.error(error.message);
    const { data } = await supabase.storage.from("course-content").createSignedUrl(path, 60 * 60 * 24 * 365);
    if (data?.signedUrl) editor.chain().focus().setImage({ src: data.signedUrl }).run();
  };

  return (
    <div className="border rounded-md bg-background">
      <div className="flex flex-wrap items-center gap-1 border-b p-1">
        <Btn title="Gras" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-4 w-4" /></Btn>
        <Btn title="Italique" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-4 w-4" /></Btn>
        <Btn title="Barré" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className="h-4 w-4" /></Btn>
        <span className="w-px h-6 bg-border mx-1" />
        <Btn title="Paragraphe" active={editor.isActive("paragraph")} onClick={() => editor.chain().focus().setParagraph().run()}><Pilcrow className="h-4 w-4" /></Btn>
        <Btn title="Titre 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 className="h-4 w-4" /></Btn>
        <Btn title="Titre 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></Btn>
        <Btn title="Titre 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="h-4 w-4" /></Btn>
        <span className="w-px h-6 bg-border mx-1" />
        <Btn title="Liste à puces" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="h-4 w-4" /></Btn>
        <Btn title="Liste ordonnée" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></Btn>
        <Btn title="Citation" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="h-4 w-4" /></Btn>
        <Btn title="Code" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code className="h-4 w-4" /></Btn>
        <Btn title="Séparateur" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus className="h-4 w-4" /></Btn>
        <span className="w-px h-6 bg-border mx-1" />
        <Btn title="Lien" active={editor.isActive("link")} onClick={setLink}><LinkIcon className="h-4 w-4" /></Btn>
        <Btn title="Image" onClick={() => fileRef.current?.click()}><ImageIcon className="h-4 w-4" /></Btn>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.currentTarget.value = ""; }} />
        <span className="w-px h-6 bg-border mx-1" />
        <Btn title="Annuler" onClick={() => editor.chain().focus().undo().run()}><Undo2 className="h-4 w-4" /></Btn>
        <Btn title="Rétablir" onClick={() => editor.chain().focus().redo().run()}><Redo2 className="h-4 w-4" /></Btn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
