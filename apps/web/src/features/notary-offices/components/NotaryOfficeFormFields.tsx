import { RefObject } from "react"
import { Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormSection } from "@/components/ui/form-section"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { NotaryOfficeFormData, NotaryOfficeFormErrors } from "../hooks/useNotaryOfficeForm"

interface NotaryOfficeFormFieldsProps {
  formData: NotaryOfficeFormData
  errors: NotaryOfficeFormErrors
  onFieldChange: <K extends keyof NotaryOfficeFormData>(field: K, value: NotaryOfficeFormData[K]) => void
  onZipCodeChange: (value: string) => void
  onPhoneChange: (value: string) => void
  onStateChange: (value: string) => void
  isLoadingCep?: boolean
  isEditing?: boolean
  numberInputRef?: RefObject<HTMLInputElement | null>
  disabled?: boolean
}

export function NotaryOfficeFormFields({
  formData,
  errors,
  onFieldChange,
  onZipCodeChange,
  onPhoneChange,
  onStateChange,
  isLoadingCep,
  isEditing,
  numberInputRef,
  disabled,
}: NotaryOfficeFormFieldsProps) {
  return (
    <>
      <FormSection title="Identificação">
        <div className="space-y-2">
          <Label htmlFor="code" className="text-sm font-medium">
            Código <span className="text-destructive">*</span>
          </Label>
          <Input
            id="code"
            placeholder="Exemplo: 1º OFICIO"
            value={formData.code}
            onChange={(e) => onFieldChange("code", e.target.value)}
            autoComplete="off"
            disabled={disabled}
            className="h-10"
            aria-invalid={errors.code}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Nome <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Exemplo: Cartório de Registro de Imóveis"
            value={formData.name}
            onChange={(e) => onFieldChange("name", e.target.value)}
            autoComplete="off"
            disabled={disabled}
            className="h-10"
            aria-invalid={errors.name}
          />
        </div>
        {isEditing && (
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: "active" | "inactive") => onFieldChange("status", value)}
              disabled={disabled}
            >
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </FormSection>

      <FormSection title="Contato">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            Telefone <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone"
            placeholder="(00) 00000-0000"
            value={formData.phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            autoComplete="off"
            disabled={disabled}
            className="h-10"
            aria-invalid={errors.phone}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@exemplo.com"
            value={formData.email}
            onChange={(e) => onFieldChange("email", e.target.value)}
            autoComplete="off"
            disabled={disabled}
            className="h-10"
          />
        </div>
      </FormSection>

      <FormSection title="Localização">
          <div className="space-y-2">
            <Label htmlFor="zipCode" className="text-sm font-medium">
              CEP <span className="text-destructive">*</span>
            </Label>
            <div className="relative w-32">
              <Input
                id="zipCode"
                placeholder="00000-000"
                value={formData.zipCode}
                onChange={(e) => onZipCodeChange(e.target.value)}
                autoComplete="off"
                maxLength={9}
                disabled={disabled || isLoadingCep}
                className="h-10 pr-8"
                aria-invalid={errors.zipCode}
              />
              {isLoadingCep && (
                <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3 space-y-2">
              <Label htmlFor="street" className="text-sm font-medium">
                Logradouro <span className="text-destructive">*</span>
              </Label>
              <Input
                id="street"
                placeholder="Rua Exemplo"
                value={formData.street}
                onChange={(e) => onFieldChange("street", e.target.value)}
                autoComplete="off"
                disabled={disabled}
                className="h-10"
                aria-invalid={errors.street}
              />
            </div>
            <div className="col-span-1 space-y-2">
              <Label htmlFor="number" className="text-sm font-medium">
                Número <span className="text-destructive">*</span>
              </Label>
              <Input
                ref={numberInputRef}
                id="number"
                placeholder="123"
                value={formData.number}
                onChange={(e) => onFieldChange("number", e.target.value)}
                autoComplete="off"
                disabled={disabled}
                className="h-10"
                aria-invalid={errors.number}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="complement" className="text-sm font-medium">Complemento</Label>
              <Input
                id="complement"
                placeholder="Sala 101, 3º Andar"
                value={formData.complement}
                onChange={(e) => onFieldChange("complement", e.target.value)}
                autoComplete="off"
                disabled={disabled}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="neighborhood" className="text-sm font-medium">
                Bairro <span className="text-destructive">*</span>
              </Label>
              <Input
                id="neighborhood"
                placeholder="Centro"
                value={formData.neighborhood}
                onChange={(e) => onFieldChange("neighborhood", e.target.value)}
                autoComplete="off"
                disabled={disabled}
                className="h-10"
                aria-invalid={errors.neighborhood}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3 space-y-2">
              <Label htmlFor="city" className="text-sm font-medium">
                Cidade <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                placeholder="Belo Horizonte"
                value={formData.city}
                onChange={(e) => onFieldChange("city", e.target.value)}
                autoComplete="off"
                disabled={disabled}
                className="h-10"
                aria-invalid={errors.city}
              />
            </div>
            <div className="col-span-1 space-y-2">
              <Label htmlFor="state" className="text-sm font-medium">
                UF <span className="text-destructive">*</span>
              </Label>
              <Input
                id="state"
                placeholder="MG"
                value={formData.state}
                onChange={(e) => onStateChange(e.target.value)}
                autoComplete="off"
                maxLength={2}
                disabled={disabled}
                className="h-10 uppercase"
                aria-invalid={errors.state}
              />
            </div>
          </div>
      </FormSection>
    </>
  )
}
