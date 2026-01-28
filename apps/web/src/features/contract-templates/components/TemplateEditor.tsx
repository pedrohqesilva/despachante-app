"use client"

import { useEditor, EditorContent, Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { useEffect, useImperativeHandle, forwardRef, useCallback } from "react"
import { Bold, Italic, List, ListOrdered, Undo, Redo } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TemplateEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  hasError?: boolean
}

export interface TemplateEditorRef {
  insertText: (text: string) => void
  focus: () => void
}

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  children: React.ReactNode
  title: string
}

function ToolbarButton({ onClick, isActive, disabled, children, title }: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "h-8 w-8 p-0",
        isActive && "bg-muted"
      )}
    >
      {children}
    </Button>
  )
}

interface EditorToolbarProps {
  editor: Editor | null
  disabled?: boolean
}

function EditorToolbar({ editor, disabled }: EditorToolbarProps) {
  if (!editor) return null

  return (
    <div className="flex items-center gap-1 p-2 border-b border-border/50 bg-muted/30">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        disabled={disabled}
        title="Negrito"
      >
        <Bold className="size-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        disabled={disabled}
        title="Itálico"
      >
        <Italic className="size-4" />
      </ToolbarButton>

      <div className="w-px h-6 bg-border mx-1" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        disabled={disabled}
        title="Lista com marcadores"
      >
        <List className="size-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        disabled={disabled}
        title="Lista numerada"
      >
        <ListOrdered className="size-4" />
      </ToolbarButton>

      <div className="w-px h-6 bg-border mx-1" />

      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={disabled || !editor.can().undo()}
        title="Desfazer"
      >
        <Undo className="size-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={disabled || !editor.can().redo()}
        title="Refazer"
      >
        <Redo className="size-4" />
      </ToolbarButton>
    </div>
  )
}

export const TemplateEditor = forwardRef<TemplateEditorRef, TemplateEditorProps>(
  function TemplateEditor(
    { value, onChange, placeholder = "Digite o conteúdo do modelo...", disabled, className, hasError },
    ref
  ) {
    const editor = useEditor({
      extensions: [
        StarterKit,
        Placeholder.configure({
          placeholder,
          emptyEditorClass: "is-editor-empty",
        }),
      ],
      content: value,
      editable: !disabled,
      onUpdate: ({ editor }) => {
        onChange(editor.getHTML())
      },
      editorProps: {
        attributes: {
          class: "prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4",
        },
      },
    })

    useEffect(() => {
      if (editor && value !== editor.getHTML()) {
        editor.commands.setContent(value)
      }
    }, [editor, value])

    useEffect(() => {
      if (editor) {
        editor.setEditable(!disabled)
      }
    }, [editor, disabled])

    const insertText = useCallback((text: string) => {
      if (editor) {
        editor.chain().focus().insertContent(text).run()
      }
    }, [editor])

    const focus = useCallback(() => {
      if (editor) {
        editor.chain().focus().run()
      }
    }, [editor])

    useImperativeHandle(ref, () => ({
      insertText,
      focus,
    }), [insertText, focus])

    return (
      <div
        className={cn(
          "rounded-md border border-input bg-background overflow-hidden",
          hasError && "border-destructive",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <EditorToolbar editor={editor} disabled={disabled} />
        <EditorContent editor={editor} />
      </div>
    )
  }
)
