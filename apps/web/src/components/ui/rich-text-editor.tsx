"use client"

import { useEditor, EditorContent, Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import Highlight from "@tiptap/extension-highlight"
import { TextStyle } from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"
import { Image } from "@tiptap/extension-image"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableCell } from "@tiptap/extension-table-cell"
import { TableHeader } from "@tiptap/extension-table-header"
import { useEffect, useImperativeHandle, forwardRef, useCallback, useState } from "react"
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  Minus,
  RemoveFormatting,
  Type,
  Baseline,
  ImageIcon,
  Table as TableIcon,
  Plus,
  Trash2,
  RowsIcon,
  Columns,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const TEXT_COLORS = [
  { name: "Padrão", color: null },
  { name: "Preto", color: "#000000" },
  { name: "Branco", color: "#ffffff" },
  { name: "Cinza", color: "#6b7280" },
  { name: "Vermelho", color: "#dc2626" },
  { name: "Laranja", color: "#ea580c" },
  { name: "Amarelo", color: "#ca8a04" },
  { name: "Verde", color: "#16a34a" },
  { name: "Azul", color: "#2563eb" },
  { name: "Roxo", color: "#9333ea" },
  { name: "Rosa", color: "#db2777" },
  { name: "Marrom", color: "#92400e" },
]

const HIGHLIGHT_COLORS = [
  { name: "Sem realce", color: null },
  { name: "Amarelo", color: "#fef08a" },
  { name: "Verde", color: "#bbf7d0" },
  { name: "Azul", color: "#bfdbfe" },
  { name: "Rosa", color: "#fbcfe8" },
  { name: "Roxo", color: "#e9d5ff" },
  { name: "Laranja", color: "#fed7aa" },
  { name: "Vermelho", color: "#fecaca" },
  { name: "Cinza", color: "#e5e7eb" },
]

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
  tooltip: string
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  children,
  tooltip,
}: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClick}
          disabled={disabled}
          className={cn(
            "h-8 w-8 p-0",
            isActive && "bg-accent text-accent-foreground"
          )}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  )
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-border mx-1" />
}

interface ColorPickerProps {
  editor: Editor
  disabled?: boolean
}

function TextColorPicker({ editor, disabled }: ColorPickerProps) {
  const currentColor = editor.getAttributes("textStyle").color || null

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              className="h-8 w-8 p-0 flex flex-col items-center justify-center gap-0"
            >
              <Type className="size-4" />
              <div
                className="w-4 h-1 rounded-sm -mt-0.5"
                style={{ backgroundColor: currentColor || "#000000" }}
              />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          Cor do texto
        </TooltipContent>
      </Tooltip>
      <PopoverContent className="w-auto p-3" align="start">
        <p className="text-xs font-medium text-muted-foreground mb-2">Cor do Texto</p>
        <div className="grid grid-cols-6 gap-1.5">
          {TEXT_COLORS.map((item) => (
            <Tooltip key={item.name}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => {
                    if (item.color) {
                      editor.chain().focus().setColor(item.color).run()
                    } else {
                      editor.chain().focus().unsetColor().run()
                    }
                  }}
                  className={cn(
                    "size-7 rounded-md border border-border/50 hover:border-border transition-colors flex items-center justify-center",
                    currentColor === item.color && "ring-2 ring-primary ring-offset-1",
                    item.color === "#ffffff" && "bg-white"
                  )}
                  style={{ backgroundColor: item.color || undefined }}
                >
                  {!item.color && (
                    <RemoveFormatting className="size-3.5 text-muted-foreground" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {item.name}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function HighlightColorPicker({ editor, disabled }: ColorPickerProps) {
  const highlightAttr = editor.getAttributes("highlight")
  const currentColor = highlightAttr.color || (editor.isActive("highlight") ? "#fef08a" : null)

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              className={cn(
                "h-8 w-8 p-0 flex flex-col items-center justify-center gap-0",
                editor.isActive("highlight") && "bg-accent text-accent-foreground"
              )}
            >
              <Baseline className="size-4" />
              <div
                className="w-4 h-1 rounded-sm -mt-0.5"
                style={{ backgroundColor: currentColor || "#fef08a" }}
              />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          Realçar texto
        </TooltipContent>
      </Tooltip>
      <PopoverContent className="w-auto p-3" align="start">
        <p className="text-xs font-medium text-muted-foreground mb-2">Cor do Realce</p>
        <div className="grid grid-cols-5 gap-1.5">
          {HIGHLIGHT_COLORS.map((item) => (
            <Tooltip key={item.name}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => {
                    if (item.color) {
                      editor.chain().focus().toggleHighlight({ color: item.color }).run()
                    } else {
                      editor.chain().focus().unsetHighlight().run()
                    }
                  }}
                  className={cn(
                    "size-7 rounded-md border border-border/50 hover:border-border transition-colors flex items-center justify-center",
                    currentColor === item.color && "ring-2 ring-primary ring-offset-1"
                  )}
                  style={{ backgroundColor: item.color || undefined }}
                >
                  {!item.color && (
                    <RemoveFormatting className="size-3.5 text-muted-foreground" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {item.name}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function ImageButton({ editor, disabled }: ColorPickerProps) {
  const [imageUrl, setImageUrl] = useState("")
  const [open, setOpen] = useState(false)

  const handleInsertImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run()
      setImageUrl("")
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              className="h-8 w-8 p-0"
            >
              <ImageIcon className="size-4" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          Inserir imagem
        </TooltipContent>
      </Tooltip>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-3">
          <Label htmlFor="imageUrl" className="text-sm font-medium">
            URL da Imagem
          </Label>
          <Input
            id="imageUrl"
            placeholder="https://exemplo.com/imagem.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleInsertImage()
              }
            }}
          />
          <Button
            size="sm"
            onClick={handleInsertImage}
            disabled={!imageUrl}
            className="w-full"
          >
            Inserir Imagem
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function TableButton({ editor, disabled }: ColorPickerProps) {
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              className={cn(
                "h-8 w-8 p-0",
                editor.isActive("table") && "bg-accent text-accent-foreground"
              )}
            >
              <TableIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          Tabela
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="start">
        <DropdownMenuItem
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
        >
          <Plus className="size-4 mr-2" />
          Inserir tabela 3x3
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 4, cols: 4, withHeaderRow: true }).run()
          }
        >
          <Plus className="size-4 mr-2" />
          Inserir tabela 4x4
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          disabled={!editor.can().addColumnAfter()}
        >
          <Columns className="size-4 mr-2" />
          Adicionar coluna
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => editor.chain().focus().addRowAfter().run()}
          disabled={!editor.can().addRowAfter()}
        >
          <RowsIcon className="size-4 mr-2" />
          Adicionar linha
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => editor.chain().focus().deleteColumn().run()}
          disabled={!editor.can().deleteColumn()}
          className="text-destructive focus:text-destructive"
        >
          <Columns className="size-4 mr-2" />
          Remover coluna
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => editor.chain().focus().deleteRow().run()}
          disabled={!editor.can().deleteRow()}
          className="text-destructive focus:text-destructive"
        >
          <RowsIcon className="size-4 mr-2" />
          Remover linha
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => editor.chain().focus().deleteTable().run()}
          disabled={!editor.can().deleteTable()}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="size-4 mr-2" />
          Excluir tabela
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center justify-between gap-2 p-2 border-b border-border/50 bg-muted/30 flex-wrap">
        <div className="flex items-center gap-0.5 flex-wrap">
          {/* Text Style */}
          <ToolbarButton
            onClick={() => editor.chain().focus().setParagraph().run()}
            isActive={editor.isActive("paragraph") && !editor.isActive("heading")}
            disabled={disabled}
            tooltip="Parágrafo (Ctrl+Alt+0)"
          >
            <Pilcrow className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive("heading", { level: 1 })}
            disabled={disabled}
            tooltip="Título 1 (Ctrl+Alt+1)"
          >
            <Heading1 className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive("heading", { level: 2 })}
            disabled={disabled}
            tooltip="Título 2 (Ctrl+Alt+2)"
          >
            <Heading2 className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive("heading", { level: 3 })}
            disabled={disabled}
            tooltip="Título 3 (Ctrl+Alt+3)"
          >
            <Heading3 className="size-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Text Formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            disabled={disabled}
            tooltip="Negrito (Ctrl+B)"
          >
            <Bold className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            disabled={disabled}
            tooltip="Itálico (Ctrl+I)"
          >
            <Italic className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            disabled={disabled}
            tooltip="Sublinhado (Ctrl+U)"
          >
            <UnderlineIcon className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive("strike")}
            disabled={disabled}
            tooltip="Tachado (Ctrl+Shift+S)"
          >
            <Strikethrough className="size-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Colors */}
          <TextColorPicker editor={editor} disabled={disabled} />
          <HighlightColorPicker editor={editor} disabled={disabled} />

          <ToolbarDivider />

          {/* Alignment */}
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            isActive={editor.isActive({ textAlign: "left" })}
            disabled={disabled}
            tooltip="Alinhar à esquerda"
          >
            <AlignLeft className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            isActive={editor.isActive({ textAlign: "center" })}
            disabled={disabled}
            tooltip="Centralizar"
          >
            <AlignCenter className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            isActive={editor.isActive({ textAlign: "right" })}
            disabled={disabled}
            tooltip="Alinhar à direita"
          >
            <AlignRight className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            isActive={editor.isActive({ textAlign: "justify" })}
            disabled={disabled}
            tooltip="Justificar"
          >
            <AlignJustify className="size-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Lists */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            disabled={disabled}
            tooltip="Lista com marcadores"
          >
            <List className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            disabled={disabled}
            tooltip="Lista numerada"
          >
            <ListOrdered className="size-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Insert */}
          <ImageButton editor={editor} disabled={disabled} />
          <TableButton editor={editor} disabled={disabled} />

          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            disabled={disabled}
            tooltip="Linha horizontal"
          >
            <Minus className="size-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Undo/Redo */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={disabled || !editor.can().undo()}
            tooltip="Desfazer (Ctrl+Z)"
          >
            <Undo className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={disabled || !editor.can().redo()}
            tooltip="Refazer (Ctrl+Y)"
          >
            <Redo className="size-4" />
          </ToolbarButton>
        </div>

        {extra && <div className="flex items-center gap-2">{extra}</div>}
      </div>
    </TooltipProvider>
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
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3],
          },
        }),
        Placeholder.configure({
          placeholder,
          emptyEditorClass: "is-editor-empty",
        }),
        Underline,
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
        Highlight.configure({
          multicolor: true,
        }),
        TextStyle,
        Color,
        Image.configure({
          HTMLAttributes: {
            class: "max-w-full h-auto rounded-lg",
          },
        }),
        Table.configure({
          resizable: true,
          HTMLAttributes: {
            class: "border-collapse table-auto w-full",
          },
        }),
        TableRow,
        TableHeader,
        TableCell,
      ],
      content: value,
      editable: !disabled,
      onUpdate: ({ editor }) => {
        onChange(editor.getHTML())
      },
      editorProps: {
        attributes: {
          class: "tiptap-editor focus:outline-none min-h-[200px]",
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

    const insertText = useCallback(
      (text: string) => {
        if (editor) {
          editor.chain().focus().insertContent(text).run()
        }
      },
      [editor]
    )

    const focus = useCallback(() => {
      if (editor) {
        editor.chain().focus().run()
      }
    }, [editor])

    const getEditor = useCallback(() => editor, [editor])

    useImperativeHandle(
      ref,
      () => ({
        insertText,
        focus,
        getEditor,
      }),
      [insertText, focus, getEditor]
    )

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
            className={cn(
              "h-full",
              "[&_.ProseMirror]:min-h-full [&_.ProseMirror]:p-4 [&_.ProseMirror]:outline-none",
              // Placeholder styles
              "[&_.ProseMirror.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
              "[&_.ProseMirror.is-editor-empty:first-child::before]:text-muted-foreground",
              "[&_.ProseMirror.is-editor-empty:first-child::before]:float-left",
              "[&_.ProseMirror.is-editor-empty:first-child::before]:h-0",
              "[&_.ProseMirror.is-editor-empty:first-child::before]:pointer-events-none",
              // Headings
              "[&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mb-4 [&_.ProseMirror_h1]:mt-6 [&_.ProseMirror_h1]:first:mt-0",
              "[&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:mb-3 [&_.ProseMirror_h2]:mt-5 [&_.ProseMirror_h2]:first:mt-0",
              "[&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_h3]:mt-4 [&_.ProseMirror_h3]:first:mt-0",
              // Paragraphs
              "[&_.ProseMirror_p]:mb-3 [&_.ProseMirror_p]:leading-relaxed",
              // Lists
              "[&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ul]:mb-3 [&_.ProseMirror_ul]:space-y-1",
              "[&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_ol]:mb-3 [&_.ProseMirror_ol]:space-y-1",
              "[&_.ProseMirror_li]:pl-1",
              "[&_.ProseMirror_li_p]:mb-0",
              // Nested lists
              "[&_.ProseMirror_ul_ul]:mt-1 [&_.ProseMirror_ul_ul]:mb-0 [&_.ProseMirror_ul_ul]:list-circle",
              "[&_.ProseMirror_ol_ol]:mt-1 [&_.ProseMirror_ol_ol]:mb-0",
              "[&_.ProseMirror_ul_ul_ul]:list-square",
              // Blockquote
              "[&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-border [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:my-4",
              // Code
              "[&_.ProseMirror_code]:bg-muted [&_.ProseMirror_code]:px-1.5 [&_.ProseMirror_code]:py-0.5 [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:font-mono [&_.ProseMirror_code]:text-sm",
              "[&_.ProseMirror_pre]:bg-muted [&_.ProseMirror_pre]:p-4 [&_.ProseMirror_pre]:rounded-lg [&_.ProseMirror_pre]:my-4 [&_.ProseMirror_pre]:overflow-x-auto",
              "[&_.ProseMirror_pre_code]:bg-transparent [&_.ProseMirror_pre_code]:p-0",
              // Horizontal rule
              "[&_.ProseMirror_hr]:border-border [&_.ProseMirror_hr]:my-6",
              // Strong and emphasis
              "[&_.ProseMirror_strong]:font-bold",
              "[&_.ProseMirror_em]:italic",
              "[&_.ProseMirror_u]:underline",
              "[&_.ProseMirror_s]:line-through",
              // Images
              "[&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:h-auto [&_.ProseMirror_img]:rounded-lg [&_.ProseMirror_img]:my-4",
              // Tables
              "[&_.ProseMirror_table]:w-full [&_.ProseMirror_table]:border-collapse [&_.ProseMirror_table]:my-4",
              "[&_.ProseMirror_th]:border [&_.ProseMirror_th]:border-border [&_.ProseMirror_th]:p-2 [&_.ProseMirror_th]:bg-muted/50 [&_.ProseMirror_th]:font-semibold [&_.ProseMirror_th]:text-left",
              "[&_.ProseMirror_td]:border [&_.ProseMirror_td]:border-border [&_.ProseMirror_td]:p-2",
              "[&_.ProseMirror_.selectedCell]:bg-primary/10"
            )}
          />
        </div>
      </div>
    )
  }
)
