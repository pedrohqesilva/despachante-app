import { useState, useEffect, useRef, useCallback } from "react"
import { Building2, Loader2 } from "lucide-react"
import { useQuery } from "convex/react"
import { clientsApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { PropertyTypeSelector } from "./PropertyTypeSelector"
import { PropertyFormFields } from "./PropertyFormFields"
import { OwnerSelector } from "./OwnerSelector"
import { usePropertyForm, type PropertySubmitData } from "../hooks/usePropertyForm"
import type { Property } from "@/types/property"

export interface PropertyDialogSaveData {
  data: PropertySubmitData
  isEditing: boolean
}

interface PropertyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  property?: Property | null
  onSave: (data: PropertyDialogSaveData) => Promise<void>
  showOwnerSelector?: boolean
}

export function PropertyDialog({
  open,
  onOpenChange,
  property,
  onSave,
  showOwnerSelector = true,
}: PropertyDialogProps) {
  const isEditing = !!property

  const propertyForm = usePropertyForm(property)
  const numberInputRef = useRef<HTMLInputElement>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingCep, setIsLoadingCep] = useState(false)

  const activeClients = useQuery(
    clientsApi.queries.list,
    showOwnerSelector && open
      ? { page: 1, pageSize: 10000 }
      : "skip"
  )

  useEffect(() => {
    if (open) {
      propertyForm.reset(property)
    }
  }, [open, property])

  const fetchAddressByCep = useCallback(async (cep: string) => {
    const cleanedCep = cep.replace(/\D/g, "")
    if (cleanedCep.length !== 8) return

    setIsLoadingCep(true)
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`)
      const data = await response.json()

      if (data.erro) {
        toast.error("CEP não encontrado")
        return
      }

      propertyForm.setAddressFromCep({
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf,
        complement: data.complemento,
      })
      setTimeout(() => numberInputRef.current?.focus(), 0)
    } catch (error) {
      toast.error("Erro ao buscar CEP")
      console.error(error)
    } finally {
      setIsLoadingCep(false)
    }
  }, [propertyForm])

  const handleZipCodeChange = useCallback((value: string) => {
    propertyForm.handleZipCodeChange(value)
    const cleaned = value.replace(/\D/g, "")
    if (cleaned.length === 8) {
      fetchAddressByCep(cleaned)
    }
  }, [propertyForm, fetchAddressByCep])

  const handleClose = () => {
    propertyForm.reset()
    onOpenChange(false)
  }

  const handleSave = async () => {
    if (!propertyForm.validate(showOwnerSelector)) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    setIsSubmitting(true)

    try {
      await onSave({
        data: propertyForm.getSubmitData(),
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
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-gap p-6 border-b border-border/50">
          <div className="size-icon-container-md rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Building2 className="size-icon-md text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-lg font-semibold">
              {isEditing ? "Editar Imóvel" : "Novo Imóvel"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
              {isEditing
                ? "Atualize os dados do imóvel selecionado"
                : "Preencha os dados para cadastrar um novo imóvel"}
            </DialogDescription>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Property Type */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">
              Tipo <span className="text-destructive">*</span>
            </Label>
            <PropertyTypeSelector
              value={propertyForm.formData.type}
              onChange={(value) => propertyForm.updateField("type", value)}
              hasError={propertyForm.errors.type}
              disabled={isSubmitting}
            />
          </div>

          <PropertyFormFields
            formData={propertyForm.formData}
            errors={propertyForm.errors}
            onFieldChange={propertyForm.updateField}
            onZipCodeChange={handleZipCodeChange}
            onValueChange={propertyForm.handleValueChange}
            onAreaChange={propertyForm.handleAreaChange}
            onStateChange={propertyForm.handleStateChange}
            getFormattedArea={propertyForm.getFormattedArea}
            isLoadingCep={isLoadingCep}
            numberInputRef={numberInputRef}
            disabled={isSubmitting}
          />

          {showOwnerSelector && (
            <OwnerSelector
              selectedOwnerIds={propertyForm.formData.ownerIds}
              clients={activeClients?.clients}
              onToggleOwner={propertyForm.toggleOwner}
              hasError={propertyForm.errors.ownerIds}
              disabled={isSubmitting}
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
  )
}
