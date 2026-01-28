import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ClientFormData, ClientFormErrors } from "../hooks/useClientForm"

interface ClientFormFieldsProps {
  formData: ClientFormData
  errors: ClientFormErrors
  onFieldChange: <K extends keyof ClientFormData>(field: K, value: ClientFormData[K]) => void
  onPhoneChange: (value: string) => void
  onTaxIdChange: (value: string) => void
  idPrefix?: string
}

export function ClientFormFields({
  formData,
  errors,
  onFieldChange,
  onPhoneChange,
  onTaxIdChange,
  idPrefix = "",
}: ClientFormFieldsProps) {
  const prefix = idPrefix ? `${idPrefix}-` : ""

  return (
    <>
      {/* Dados Pessoais */}
      <div className="space-y-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Dados Pessoais
        </p>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${prefix}name`} className="text-sm font-medium">
              Nome <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`${prefix}name`}
              placeholder="Nome completo"
              value={formData.name}
              onChange={(e) => onFieldChange("name", e.target.value)}
              autoComplete="off"
              className="h-10"
              aria-invalid={errors.name}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${prefix}taxId`} className="text-sm font-medium">
              CPF/CNPJ <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`${prefix}taxId`}
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              value={formData.taxId}
              onChange={(e) => onTaxIdChange(e.target.value)}
              autoComplete="off"
              maxLength={18}
              className="h-10"
              aria-invalid={errors.taxId}
            />
          </div>

          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Filiação
          </p>
          <div className="space-y-2">
            <Label htmlFor={`${prefix}motherName`} className="text-sm font-medium">
              Nome da Mãe
            </Label>
            <Input
              id={`${prefix}motherName`}
              placeholder="Nome completo da mãe"
              value={formData.motherName}
              onChange={(e) => onFieldChange("motherName", e.target.value)}
              autoComplete="off"
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${prefix}fatherName`} className="text-sm font-medium">
              Nome do Pai
            </Label>
            <Input
              id={`${prefix}fatherName`}
              placeholder="Nome completo do pai"
              value={formData.fatherName}
              onChange={(e) => onFieldChange("fatherName", e.target.value)}
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
            <Label htmlFor={`${prefix}email`} className="text-sm font-medium">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`${prefix}email`}
              type="email"
              placeholder="email@exemplo.com"
              value={formData.email}
              onChange={(e) => onFieldChange("email", e.target.value)}
              autoComplete="off"
              className="h-10"
              aria-invalid={errors.email}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${prefix}phone`} className="text-sm font-medium">
              Telefone <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`${prefix}phone`}
              placeholder="(00) 00000-0000"
              value={formData.phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              autoComplete="off"
              maxLength={15}
              className="h-10"
              aria-invalid={errors.phone}
            />
          </div>
        </div>
      </div>
    </>
  )
}
