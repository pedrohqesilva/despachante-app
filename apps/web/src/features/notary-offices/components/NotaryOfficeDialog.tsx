import { useState, useEffect, useRef, useCallback } from "react"
import { Building2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { DialogHeaderWithIcon } from "@/components/ui/dialog-header-icon"
import { toast } from "sonner"
import { NotaryOfficeFormFields } from "./NotaryOfficeFormFields"
import { useNotaryOfficeForm, type NotaryOfficeSubmitData } from "../hooks/useNotaryOfficeForm"
import type { NotaryOffice } from "@/types/notary-office"

export interface NotaryOfficeDialogSaveData {
  data: NotaryOfficeSubmitData
  isEditing: boolean
}

interface NotaryOfficeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  notaryOffice?: NotaryOffice | null
  onSave: (data: NotaryOfficeDialogSaveData) => Promise<void>
}

export function NotaryOfficeDialog({
  open,
  onOpenChange,
  notaryOffice,
  onSave,
}: NotaryOfficeDialogProps) {
  const isEditing = !!notaryOffice

  const form = useNotaryOfficeForm(notaryOffice)
  const numberInputRef = useRef<HTMLInputElement>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingCep, setIsLoadingCep] = useState(false)

  useEffect(() => {
    if (open) {
      form.reset(notaryOffice)
    }
  }, [open, notaryOffice])

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

      form.setAddressFromCep({
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
  }, [form])

  const handleZipCodeChange = useCallback((value: string) => {
    form.handleZipCodeChange(value)
    const cleaned = value.replace(/\D/g, "")
    if (cleaned.length === 8) {
      fetchAddressByCep(cleaned)
    }
  }, [form, fetchAddressByCep])

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
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
        <DialogHeaderWithIcon
          icon={Building2}
          title={isEditing ? "Editar Cartório" : "Novo Cartório"}
          description={isEditing
            ? "Atualize os dados do cartório selecionado"
            : "Preencha os dados para cadastrar um novo cartório"}
        />

        {/* Form Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          <NotaryOfficeFormFields
            formData={form.formData}
            errors={form.errors}
            onFieldChange={form.updateField}
            onZipCodeChange={handleZipCodeChange}
            onPhoneChange={form.handlePhoneChange}
            onStateChange={form.handleStateChange}
            isLoadingCep={isLoadingCep}
            isEditing={isEditing}
            numberInputRef={numberInputRef}
            disabled={isSubmitting}
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
