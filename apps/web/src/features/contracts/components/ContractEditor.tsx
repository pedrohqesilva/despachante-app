"use client"

import { AlertCircle } from "lucide-react"
import { TemplateEditor } from "@/features/contract-templates"
import { cn } from "@/lib/utils"

interface ContractEditorProps {
  content: string
  onChange: (content: string) => void
  disabled?: boolean
  className?: string
}

export function ContractEditor({
  content,
  onChange,
  disabled,
  className,
}: ContractEditorProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
        <AlertCircle className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <p className="text-sm text-amber-700 dark:text-amber-300">
          Edite o texto final do contrato antes de salvar. As alteracoes feitas
          aqui sao definitivas.
        </p>
      </div>

      <TemplateEditor
        value={content}
        onChange={onChange}
        disabled={disabled}
        placeholder="Conteudo do contrato..."
        className="min-h-[400px]"
      />
    </div>
  )
}
