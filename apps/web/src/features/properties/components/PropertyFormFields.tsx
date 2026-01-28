import { RefObject } from "react"
import { Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { PropertyFormData, PropertyFormErrors } from "../hooks/usePropertyForm"

interface PropertyFormFieldsProps {
  formData: PropertyFormData
  errors: PropertyFormErrors
  onFieldChange: <K extends keyof PropertyFormData>(field: K, value: PropertyFormData[K]) => void
  onZipCodeChange: (value: string) => void
  onValueChange: (value: string) => void
  onAreaChange: (value: string) => void
  onStateChange: (value: string) => void
  getFormattedArea: () => string
  isLoadingCep?: boolean
  numberInputRef?: RefObject<HTMLInputElement | null>
  disabled?: boolean
}

export function PropertyFormFields({
  formData,
  errors,
  onFieldChange,
  onZipCodeChange,
  onValueChange,
  onAreaChange,
  onStateChange,
  getFormattedArea,
  isLoadingCep,
  numberInputRef,
  disabled,
}: PropertyFormFieldsProps) {
  return (
    <>
      {/* Property Data Section */}
      <div className="space-y-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Dados do Imóvel
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="area" className="text-sm font-medium">
              Área <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="area"
                type="text"
                placeholder="0"
                value={getFormattedArea()}
                onChange={(e) => onAreaChange(e.target.value)}
                className="h-10 pr-10"
                aria-invalid={errors.area}
                disabled={disabled}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none pointer-events-none">
                m²
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="value" className="text-sm font-medium">
              Valor <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none pointer-events-none">
                R$
              </span>
              <Input
                id="value"
                placeholder="0,00"
                value={formData.value}
                onChange={(e) => onValueChange(e.target.value)}
                className="h-10 pl-9"
                aria-invalid={errors.value}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Location Section */}
      <div className="space-y-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Localização
        </p>
        <div className="space-y-4">
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
                maxLength={9}
                className="h-10 pr-8"
                aria-invalid={errors.zipCode}
                disabled={disabled || isLoadingCep}
              />
              {isLoadingCep && (
                <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
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
                className="h-10"
                aria-invalid={errors.street}
                disabled={disabled}
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
                className="h-10"
                aria-invalid={errors.number}
                disabled={disabled}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="complement" className="text-sm font-medium">
                Complemento
              </Label>
              <Input
                id="complement"
                placeholder="Apto 101, Bloco A"
                value={formData.complement}
                onChange={(e) => onFieldChange("complement", e.target.value)}
                className="h-10"
                disabled={disabled}
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
                className="h-10"
                aria-invalid={errors.neighborhood}
                disabled={disabled}
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
                className="h-10"
                aria-invalid={errors.city}
                disabled={disabled}
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
                maxLength={2}
                className="h-10 uppercase"
                aria-invalid={errors.state}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
