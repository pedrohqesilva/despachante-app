import { Heart, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSpouseForm, type SpouseFormData } from "../hooks/useSpouseForm"

interface CreateSpouseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (data: SpouseFormData) => void
  isSubmitting?: boolean
}

export function CreateSpouseDialog({
  open,
  onOpenChange,
  onAdd,
  isSubmitting = false,
}: CreateSpouseDialogProps) {
  const spouseForm = useSpouseForm()

  const handleClose = () => {
    spouseForm.reset()
    onOpenChange(false)
  }

  const handleAdd = () => {
    if (!spouseForm.isValid()) return
    onAdd(spouseForm.formData)
    spouseForm.reset()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
        <div className="flex items-center gap-3 p-6 border-b border-border/50">
          <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Heart className="size-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-lg font-semibold">
              Novo Cônjuge
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
              Cadastre um novo cliente que será definido como cônjuge
            </DialogDescription>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Dados Pessoais */}
          <div className="space-y-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Dados Pessoais
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="spouse-name" className="text-sm font-medium">
                  Nome <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="spouse-name"
                  value={spouseForm.formData.name}
                  onChange={(e) => spouseForm.updateField("name", e.target.value)}
                  placeholder="Nome completo"
                  autoComplete="off"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spouse-taxId" className="text-sm font-medium">
                  CPF/CNPJ <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="spouse-taxId"
                  value={spouseForm.formData.taxId}
                  onChange={(e) => spouseForm.handleTaxIdChange(e.target.value)}
                  placeholder="000.000.000-00"
                  autoComplete="off"
                  maxLength={18}
                  className="h-10"
                />
              </div>
            </div>
          </div>

          {/* Filiação */}
          <div className="space-y-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Filiação
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="spouse-motherName" className="text-sm font-medium">
                  Nome da Mãe
                </Label>
                <Input
                  id="spouse-motherName"
                  value={spouseForm.formData.motherName}
                  onChange={(e) => spouseForm.updateField("motherName", e.target.value)}
                  placeholder="Nome completo da mãe"
                  autoComplete="off"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spouse-fatherName" className="text-sm font-medium">
                  Nome do Pai
                </Label>
                <Input
                  id="spouse-fatherName"
                  value={spouseForm.formData.fatherName}
                  onChange={(e) => spouseForm.updateField("fatherName", e.target.value)}
                  placeholder="Nome completo do pai"
                  autoComplete="off"
                  className="h-10"
                />
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Contato
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="spouse-email" className="text-sm font-medium">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="spouse-email"
                  type="email"
                  value={spouseForm.formData.email}
                  onChange={(e) => spouseForm.updateField("email", e.target.value)}
                  placeholder="email@exemplo.com"
                  autoComplete="off"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spouse-phone" className="text-sm font-medium">
                  Telefone
                </Label>
                <Input
                  id="spouse-phone"
                  value={spouseForm.formData.phone}
                  onChange={(e) => spouseForm.handlePhoneChange(e.target.value)}
                  placeholder="(00) 00000-0000"
                  autoComplete="off"
                  maxLength={15}
                  className="h-10"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-border/50">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleAdd} disabled={isSubmitting || !spouseForm.isValid()}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Adicionando...
              </>
            ) : (
              "Adicionar"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
