"use client"

import { useState, useCallback, useEffect } from "react"
import { useMutation } from "convex/react"
import { ScrollText, ChevronLeft, ChevronRight, Save, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { contractsApi } from "@/lib/api"
import type { Id } from "@despachante/convex/_generated/dataModel"
import type { ContractStatus } from "@/types/contract"
import { useContractForm } from "../hooks/useContractForm"
import { useContractGeneration } from "../hooks/useContractGeneration"
import { ContractFormFields } from "./ContractFormFields"
import { ContractPreview } from "./ContractPreview"
import { ContractEditor } from "./ContractEditor"
import { generateContractPdf } from "../utils/pdf-generator"

type DialogStep = "select" | "preview" | "edit"

const STEP_CONFIG: Record<DialogStep, { title: string; description: string }> = {
  select: {
    title: "Selecionar Dados",
    description: "Escolha o modelo e as informacoes do contrato",
  },
  preview: {
    title: "Visualizar Contrato",
    description: "Confira o contrato gerado antes de salvar",
  },
  edit: {
    title: "Editar Contrato",
    description: "Faca ajustes finais no texto do contrato",
  },
}

interface StepIndicatorProps {
  currentStep: DialogStep
  steps: DialogStep[]
}

function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  const currentIndex = steps.indexOf(currentStep)

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => {
        const isActive = index === currentIndex
        const isCompleted = index < currentIndex

        return (
          <div key={step} className="flex items-center gap-2">
            <div
              className={cn(
                "size-7 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                isActive && "bg-primary text-primary-foreground",
                isCompleted && "bg-primary/20 text-primary",
                !isActive && !isCompleted && "bg-muted text-muted-foreground"
              )}
            >
              {isCompleted ? <Check className="size-3.5" /> : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-8 h-0.5 rounded-full transition-all",
                  index < currentIndex ? "bg-primary/40" : "bg-muted"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

interface ContractDialogProps {
  propertyId: Id<"properties">
  ownerIds: Id<"clients">[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContractDialog({
  propertyId,
  ownerIds,
  open,
  onOpenChange,
}: ContractDialogProps) {
  const [step, setStep] = useState<DialogStep>("select")
  const [editedContent, setEditedContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const { formData, errors, updateField, validate, reset, isValid } =
    useContractForm()

  const {
    generatedContent,
    isLoading: isGenerating,
    error: generationError,
    generate,
    templateName,
    isReady,
  } = useContractGeneration({
    templateId: formData.templateId,
    clientId: formData.clientId,
    propertyId,
    notaryOfficeId: formData.notaryOfficeId,
  })

  const createContract = useMutation(contractsApi.mutations.create)
  const generateUploadUrl = useMutation(contractsApi.mutations.generateUploadUrl)
  const updatePdfStorageId = useMutation(contractsApi.mutations.updatePdfStorageId)
  const createPropertyDocument = useMutation(contractsApi.mutations.createPropertyDocument)

  const steps: DialogStep[] = ["select", "preview", "edit"]

  const handleClose = useCallback(() => {
    onOpenChange(false)
    setTimeout(() => {
      setStep("select")
      setEditedContent("")
      reset()
    }, 200)
  }, [onOpenChange, reset])

  const handleGenerate = useCallback(() => {
    if (!validate()) return
    generate()
  }, [validate, generate])

  useEffect(() => {
    if (generatedContent && step === "select") {
      setEditedContent(generatedContent)
      setStep("preview")
    }
  }, [generatedContent, step])

  const handleBack = useCallback(() => {
    const currentIndex = steps.indexOf(step)
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1])
    }
  }, [step, steps])

  const handleNext = useCallback(() => {
    const currentIndex = steps.indexOf(step)
    if (currentIndex < steps.length - 1) {
      if (step === "preview") {
        setEditedContent(generatedContent)
      }
      setStep(steps[currentIndex + 1])
    }
  }, [step, steps, generatedContent])

  const handleSave = useCallback(
    async (status: ContractStatus) => {
      if (!formData.templateId || !formData.clientId) return

      setIsSaving(true)
      try {
        const content = step === "edit" ? editedContent : generatedContent

        const contractId = await createContract({
          name: formData.name,
          templateId: formData.templateId,
          propertyId,
          clientId: formData.clientId,
          notaryOfficeId: formData.notaryOfficeId || undefined,
          content,
          status,
        })

        if (status === "final") {
          try {
            const pdfBlob = await generateContractPdf({
              content,
              filename: formData.name,
            })

            const uploadUrl = await generateUploadUrl()
            const uploadResponse = await fetch(uploadUrl, {
              method: "POST",
              headers: { "Content-Type": "application/pdf" },
              body: pdfBlob,
            })

            if (uploadResponse.ok) {
              const { storageId } = await uploadResponse.json()

              await updatePdfStorageId({
                id: contractId,
                pdfStorageId: storageId,
              })

              await createPropertyDocument({
                contractId,
                storageId,
                mimeType: "application/pdf",
                size: pdfBlob.size,
              })
            }
          } catch (pdfError) {
            console.error("PDF generation error:", pdfError)
          }
        }

        toast.success(
          status === "draft"
            ? "Contrato salvo como rascunho"
            : "Contrato finalizado com sucesso"
        )
        handleClose()
      } catch (error) {
        toast.error("Erro ao salvar contrato")
        console.error("Save contract error:", error)
      } finally {
        setIsSaving(false)
      }
    },
    [
      formData,
      propertyId,
      editedContent,
      generatedContent,
      step,
      createContract,
      generateUploadUrl,
      updatePdfStorageId,
      createPropertyDocument,
      handleClose,
    ]
  )

  const stepConfig = STEP_CONFIG[step]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[1200px] sm:max-w-[1200px] p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between gap-4 p-6 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <ScrollText className="size-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                {stepConfig.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                {stepConfig.description}
              </DialogDescription>
            </div>
          </div>
          <StepIndicator currentStep={step} steps={steps} />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-6">
          {step === "select" && (
            <ContractFormFields
              formData={formData}
              errors={errors}
              ownerIds={ownerIds}
              onFieldChange={updateField}
              disabled={isGenerating}
            />
          )}

          {step === "preview" && (
            <ContractPreview content={generatedContent} />
          )}

          {step === "edit" && (
            <ContractEditor
              content={editedContent}
              onChange={setEditedContent}
              disabled={isSaving}
            />
          )}

          {generationError && (
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{generationError}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 p-6 border-t border-border/50 shrink-0">
          <div>
            {step !== "select" && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isSaving}
              >
                <ChevronLeft className="size-4 mr-1" />
                Voltar
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleClose} disabled={isSaving}>
              Cancelar
            </Button>

            {step === "select" && (
              <Button
                onClick={handleGenerate}
                disabled={!isValid || isGenerating || !isReady}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    Gerar Contrato
                    <ChevronRight className="size-4 ml-1" />
                  </>
                )}
              </Button>
            )}

            {step === "preview" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleSave("draft")}
                  disabled={isSaving}
                >
                  <Save className="size-4 mr-2" />
                  Salvar Rascunho
                </Button>
                <Button onClick={handleNext} disabled={isSaving}>
                  Editar
                  <ChevronRight className="size-4 ml-1" />
                </Button>
              </>
            )}

            {step === "edit" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleSave("draft")}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="size-4 mr-2" />
                  )}
                  Salvar Rascunho
                </Button>
                <Button onClick={() => handleSave("final")} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="size-4 mr-2" />
                  )}
                  Finalizar
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
