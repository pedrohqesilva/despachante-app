import { useState, useEffect } from "react"
import { User, Loader2 } from "lucide-react"
import { useQuery } from "convex/react"
import { Id } from "@despachante/convex/_generated/dataModel"
import { clientsApi } from "@/lib/api"
import { requiresSpouse } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { ClientFormFields } from "./ClientFormFields"
import { MaritalStatusSelector } from "./MaritalStatusSelector"
import { SpouseSelector } from "./SpouseSelector"
import { CreateSpouseDialog } from "./CreateSpouseDialog"
import { useClientForm, type ClientSubmitData } from "../hooks/useClientForm"
import { useSpouseForm, type SpouseFormData } from "../hooks/useSpouseForm"
import type { Client, MaritalStatus } from "@/types/client"

export interface ClientDialogSaveData {
  clientData: ClientSubmitData
  spouseData?: SpouseFormData
  isEditing: boolean
}

interface ClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: Client | null
  onSave: (data: ClientDialogSaveData) => Promise<void>
}

export function ClientDialog({
  open,
  onOpenChange,
  client,
  onSave,
}: ClientDialogProps) {
  const isEditing = !!client

  const clientForm = useClientForm(client)
  const spouseForm = useSpouseForm()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [spouseSearch, setSpouseSearch] = useState("")
  const [isCreatingSpouse, setIsCreatingSpouse] = useState(false)

  // Reset forms when dialog opens/closes
  useEffect(() => {
    if (open) {
      clientForm.reset(client)
      spouseForm.reset()
      setSpouseSearch("")
    }
  }, [open, client])

  // Busca de cônjuge
  const spouseSearchResults = useQuery(
    clientsApi.queries.searchExcluding,
    requiresSpouse(clientForm.formData.maritalStatus) && open
      ? {
          query: spouseSearch.trim() || undefined,
          excludeId: client?._id,
        }
      : "skip"
  )

  // Dados do cônjuge selecionado
  const selectedSpouse = useQuery(
    clientsApi.queries.get,
    clientForm.formData.spouseId ? { id: clientForm.formData.spouseId } : "skip"
  )

  const handleClose = () => {
    clientForm.reset()
    spouseForm.reset()
    setSpouseSearch("")
    onOpenChange(false)
  }

  const handleMaritalStatusChange = (value: MaritalStatus) => {
    clientForm.handleMaritalStatusChange(value)
    if (!requiresSpouse(value)) {
      spouseForm.reset()
    }
  }

  const handleSelectSpouse = (clientId: Id<"clients">) => {
    clientForm.updateField("spouseId", clientId)
    spouseForm.reset()
    if (clientForm.errors.spouseId) {
      clientForm.setErrors({ ...clientForm.errors, spouseId: false })
    }
  }

  const handleAddNewSpouse = (data: SpouseFormData) => {
    // Armazena os dados do cônjuge no spouseForm
    spouseForm.updateField("name", data.name)
    spouseForm.updateField("email", data.email)
    spouseForm.updateField("phone", data.phone)
    spouseForm.updateField("taxId", data.taxId)
    spouseForm.updateField("fatherName", data.fatherName)
    spouseForm.updateField("motherName", data.motherName)

    // Limpa spouseId pois estamos criando um novo
    clientForm.updateField("spouseId", null)
    setIsCreatingSpouse(false)

    if (clientForm.errors.spouseId) {
      clientForm.setErrors({ ...clientForm.errors, spouseId: false })
    }
    toast.success("Cônjuge adicionado. Será criado ao salvar.")
  }

  const handleSave = async () => {
    const hasSpouseFormData = spouseForm.hasData()

    if (!clientForm.validate(hasSpouseFormData)) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    setIsSubmitting(true)

    try {
      await onSave({
        clientData: clientForm.getSubmitData(),
        spouseData: hasSpouseFormData ? spouseForm.formData : undefined,
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
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-gap p-6 border-b border-border/50">
            <div className="size-icon-container-md rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <User className="size-icon-md text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold">
                {isEditing ? "Editar Cliente" : "Novo Cliente"}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                {isEditing
                  ? "Atualize os dados do cliente selecionado"
                  : "Preencha os dados para cadastrar um novo cliente"}
              </DialogDescription>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            <ClientFormFields
              formData={clientForm.formData}
              errors={clientForm.errors}
              onFieldChange={clientForm.updateField}
              onPhoneChange={clientForm.handlePhoneChange}
              onTaxIdChange={clientForm.handleTaxIdChange}
            />

            <MaritalStatusSelector
              maritalStatus={clientForm.formData.maritalStatus}
              propertyRegime={clientForm.formData.propertyRegime}
              weddingDate={clientForm.formData.weddingDate}
              onMaritalStatusChange={handleMaritalStatusChange}
              onPropertyRegimeChange={(value) => clientForm.updateField("propertyRegime", value)}
              onWeddingDateChange={isEditing ? (value) => clientForm.updateField("weddingDate", value) : undefined}
              maritalStatusError={clientForm.errors.maritalStatus}
              propertyRegimeError={clientForm.errors.propertyRegime}
              showWeddingDate={isEditing}
            />

            {/* Spouse Selector */}
            {requiresSpouse(clientForm.formData.maritalStatus) && (
              <SpouseSelector
                selectedSpouse={selectedSpouse}
                pendingSpouseName={spouseForm.formData.name}
                pendingSpouseTaxId={spouseForm.formData.taxId}
                searchResults={spouseSearchResults}
                searchQuery={spouseSearch}
                onSearchChange={setSpouseSearch}
                onSelectSpouse={handleSelectSpouse}
                onRemoveSpouse={() => clientForm.updateField("spouseId", null)}
                onCreateNew={() => setIsCreatingSpouse(true)}
                onRemovePending={spouseForm.reset}
                hasError={clientForm.errors.spouseId}
              />
            )}
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

      {/* Create Spouse Dialog */}
      <CreateSpouseDialog
        open={isCreatingSpouse}
        onOpenChange={setIsCreatingSpouse}
        onAdd={handleAddNewSpouse}
        isSubmitting={isSubmitting}
      />
    </>
  )
}
