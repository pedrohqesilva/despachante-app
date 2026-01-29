"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { DialogHeaderWithIcon } from "@/components/ui/dialog-header-icon"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { TemplateEditor, type TemplateEditorRef } from "./TemplateEditor"
import { PlaceholdersDialog } from "./PlaceholdersDialog"
import { useContractTemplateForm, type ContractTemplateSubmitData } from "../hooks/useContractTemplateForm"
import { CONTRACT_TEMPLATE_STATUS_OPTIONS } from "@/lib/constants/contract-template.constants"
import type { ContractTemplate } from "@/types/contract-template"

export interface ContractTemplateDialogSaveData {
  data: ContractTemplateSubmitData
  isEditing: boolean
}

interface ContractTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: ContractTemplate | null
  onSave: (data: ContractTemplateDialogSaveData) => Promise<void>
}

export function ContractTemplateDialog({
  open,
  onOpenChange,
  template,
  onSave,
}: ContractTemplateDialogProps) {
  const isEditing = !!template

  const form = useContractTemplateForm(template)
  const editorRef = useRef<TemplateEditorRef>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      form.reset(template)
    }
  }, [open, template])

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
      <DialogContent className="max-w-[1200px] sm:max-w-[1200px] w-full h-[90vh] p-0 gap-0 flex flex-col overflow-hidden">
        <DialogHeaderWithIcon
          icon={FileText}
          title={isEditing ? "Editar Modelo de Contrato" : "Novo Modelo de Contrato"}
          description={isEditing
            ? "Atualize os dados do modelo selecionado"
            : "Preencha os dados para cadastrar um novo modelo de contrato"}
        />

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Form Fields - Compact Header */}
          <div className="p-6 pb-4 border-b border-border/50 bg-muted/20 space-y-4">
            <div className="flex items-end gap-4">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nome <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Ex: Contrato de Compra e Venda"
                  value={form.formData.name}
                  onChange={(e) => form.updateField("name", e.target.value)}
                  autoComplete="off"
                  disabled={isSubmitting}
                  className="h-10"
                  aria-invalid={form.errors.name}
                />
              </div>

              {isEditing && (
                <div className="space-y-1.5">
                  <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                  <Select
                    value={form.formData.status}
                    onValueChange={(value: "active" | "inactive") => form.updateField("status", value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="h-10 w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTRACT_TEMPLATE_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-sm font-medium">
                Descrição
              </Label>
              <Textarea
                id="description"
                placeholder="Breve descrição do modelo..."
                value={form.formData.description}
                onChange={(e) => form.updateField("description", e.target.value)}
                disabled={isSubmitting}
                rows={2}
                className="resize-none max-h-30 overflow-y-auto"
              />
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 p-6 overflow-hidden flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium">
                Conteúdo do Modelo <span className="text-destructive">*</span>
              </Label>
              <PlaceholdersDialog
                onPlaceholderClick={handlePlaceholderClick}
                disabled={isSubmitting}
              />
            </div>
            <div className="flex-1 min-h-0">
              <TemplateEditor
                ref={editorRef}
                value={form.formData.content}
                onChange={handleContentChange}
                placeholder="Digite o conteúdo do modelo de contrato aqui..."
                disabled={isSubmitting}
                hasError={form.errors.content}
                className="h-full"
              />
            </div>
            {form.errors.content && (
              <p className="text-sm text-destructive mt-2">
                O conteúdo do modelo é obrigatório
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border/50 bg-muted/20">
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
