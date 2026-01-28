"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { DialogHeaderWithIcon } from "@/components/ui/dialog-header-icon"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ContractTemplateFormFields } from "./ContractTemplateFormFields"
import { TemplateEditor, type TemplateEditorRef } from "./TemplateEditor"
import { PlaceholdersSidebar } from "./PlaceholdersSidebar"
import { useContractTemplateForm, type ContractTemplateSubmitData } from "../hooks/useContractTemplateForm"
import type { ContractTemplate } from "@/types/contract-template"

export interface ContractTemplateDialogSaveData {
  data: ContractTemplateSubmitData
  isEditing: boolean
}

interface ContractTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contractTemplate?: ContractTemplate | null
  onSave: (data: ContractTemplateDialogSaveData) => Promise<void>
}

export function ContractTemplateDialog({
  open,
  onOpenChange,
  contractTemplate,
  onSave,
}: ContractTemplateDialogProps) {
  const isEditing = !!contractTemplate

  const form = useContractTemplateForm(contractTemplate)
  const editorRef = useRef<TemplateEditorRef>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      form.reset(contractTemplate)
    }
  }, [open, contractTemplate])

  const handlePlaceholderClick = useCallback((placeholder: string) => {
    if (editorRef.current) {
      editorRef.current.insertText(placeholder)
      editorRef.current.focus()
    }
  }, [])

  const handleContentChange = useCallback((value: string) => {
    form.updateField("content", value)
  }, [form])

  const handleClose = () => {
    form.reset()
    onOpenChange(false)
  }

  const handleSave = async () => {
    if (!form.validate()) {
      toast.error("Preencha os campos obrigatórios")
      return
    }

    setIsSubmitting(true)

    try {
      await onSave({
        data: form.getSubmitData(),
        isEditing,
      })
      handleClose()
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] w-[1200px] max-h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeaderWithIcon
          icon={FileText}
          title={isEditing ? "Editar Modelo de Contrato" : "Novo Modelo de Contrato"}
          description={isEditing
            ? "Atualize os dados do modelo selecionado"
            : "Preencha os dados para cadastrar um novo modelo de contrato"}
        />

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            <ContractTemplateFormFields
              formData={form.formData}
              errors={form.errors}
              onFieldChange={form.updateField}
              isEditing={isEditing}
              disabled={isSubmitting}
            />

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Conteúdo do Modelo <span className="text-destructive">*</span>
              </Label>
              <TemplateEditor
                ref={editorRef}
                value={form.formData.content}
                onChange={handleContentChange}
                placeholder="Digite o conteúdo do modelo de contrato. Use os campos disponíveis na barra lateral para inserir placeholders que serão substituídos automaticamente..."
                disabled={isSubmitting}
                hasError={form.errors.content}
                className="min-h-[300px]"
              />
              {form.errors.content && (
                <p className="text-sm text-destructive">
                  O conteúdo do modelo é obrigatório
                </p>
              )}
            </div>
          </div>

          {/* Placeholders Sidebar */}
          <PlaceholdersSidebar
            onPlaceholderClick={handlePlaceholderClick}
            disabled={isSubmitting}
            className="w-full lg:w-[280px] h-[300px] lg:h-auto border-t lg:border-t-0"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border/50">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
