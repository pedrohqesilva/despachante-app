"use client"

import { forwardRef } from "react"
import { AlertCircle } from "lucide-react"
import { TemplateEditor, type TemplateEditorRef } from "@/features/contract-templates"
import { cn } from "@/lib/utils"

interface ContractEditorProps {
  content: string
  onChange: (content: string) => void
  disabled?: boolean
  className?: string
}

export interface ContractEditorRef {
  focus: () => void
}

export const ContractEditor = forwardRef<ContractEditorRef, ContractEditorProps>(
  function ContractEditor({ content, onChange, disabled, className }, ref) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
          <AlertCircle className="size-4 text-yellow-500 shrink-0" />
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            Edite o texto final do contrato antes de salvar. As alteracoes feitas
            aqui sao definitivas.
          </p>
        </div>

        <TemplateEditor
          ref={ref as React.Ref<TemplateEditorRef>}
          value={content}
          onChange={onChange}
          disabled={disabled}
          placeholder="Conteudo do contrato..."
          className="min-h-[400px]"
        />
      </div>
    )
  }
)
