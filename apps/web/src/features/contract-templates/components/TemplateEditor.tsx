"use client"

import { forwardRef } from "react"
import { RichTextEditor, type RichTextEditorRef } from "@/components/ui/rich-text-editor"

interface TemplateEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  hasError?: boolean
  toolbarExtra?: React.ReactNode
}

export interface TemplateEditorRef {
  insertText: (text: string) => void
  focus: () => void
}

export const TemplateEditor = forwardRef<TemplateEditorRef, TemplateEditorProps>(
  (
    {
      value,
      onChange,
      placeholder = "Digite o conteúdo do modelo...",
      disabled,
      className,
      hasError,
      toolbarExtra,
    },
    ref
  ) => {
    return (
      <RichTextEditor
        ref={ref as React.Ref<RichTextEditorRef>}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        hasError={hasError}
        toolbarExtra={toolbarExtra}
      />
    )
  }
)
