"use client"

import { useEditor, EditorContent, Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { useEffect, useImperativeHandle, forwardRef, useCallback } from "react"
import { Bold, Italic, List, ListOrdered, Undo, Redo } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface RichTextEditorRef {
  insertText: (text: string) => void
  focus: () => void
  getEditor: () => Editor | null
}

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  hasError?: boolean
  toolbarExtra?: React.ReactNode
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
  extra?: React.ReactNode
}

function EditorToolbar({ editor, disabled, extra }: EditorToolbarProps) {
  if (!editor) return null

  return (
    <div className="flex items-center justify-between gap-2 p-2 border-b border-border/50 bg-muted/30">
      <div className="flex items-center gap-1">
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

      {extra && <div className="flex items-center gap-2">{extra}</div>}
    </div>
  )
}

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  function RichTextEditor(
    {
      value,
      onChange,
      placeholder = "Digite o conteúdo...",
      disabled,
      className,
      hasError,
      toolbarExtra,
    },
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
          class: "prose prose-sm max-w-none focus:outline-none min-h-[200px]",
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

    const getEditor = useCallback(() => editor, [editor])

    useImperativeHandle(ref, () => ({
      insertText,
      focus,
      getEditor,
    }), [insertText, focus, getEditor])

    return (
      <div
        className={cn(
          "rounded-md border border-input bg-transparent dark:bg-input/30 overflow-hidden flex flex-col shadow-xs",
          hasError && "border-destructive",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <EditorToolbar editor={editor} disabled={disabled} extra={toolbarExtra} />
        <div className="flex-1 overflow-y-auto">
          <EditorContent
            editor={editor}
            className="h-full [&_.ProseMirror]:min-h-full [&_.ProseMirror]:p-4 [&_.ProseMirror]:outline-none"
          />
        </div>
      </div>
    )
  }
)
