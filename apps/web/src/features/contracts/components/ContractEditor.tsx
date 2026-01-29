"use client"

import { forwardRef } from "react"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
        <Alert variant="warning">
          <AlertCircle />
          <AlertDescription>
            Edite o texto final do contrato antes de salvar. As alteracoes feitas
            aqui sao definitivas.
          </AlertDescription>
        </Alert>

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
