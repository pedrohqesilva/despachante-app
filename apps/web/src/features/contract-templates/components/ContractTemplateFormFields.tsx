import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FormSection } from "@/components/ui/form-section"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CONTRACT_TEMPLATE_STATUS_OPTIONS } from "@/lib/constants/contract-template.constants"
import type { ContractTemplateFormData, ContractTemplateFormErrors } from "../hooks/useContractTemplateForm"

interface ContractTemplateFormFieldsProps {
  formData: ContractTemplateFormData
  errors: ContractTemplateFormErrors
  onFieldChange: <K extends keyof ContractTemplateFormData>(field: K, value: ContractTemplateFormData[K]) => void
  isEditing?: boolean
  disabled?: boolean
}

export function ContractTemplateFormFields({
  formData,
  errors,
  onFieldChange,
  isEditing,
  disabled,
}: ContractTemplateFormFieldsProps) {
  return (
    <FormSection title="Informações do Modelo">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          Nome <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Exemplo: Contrato de Compra e Venda"
          value={formData.name}
          onChange={(e) => onFieldChange("name", e.target.value)}
          autoComplete="off"
          disabled={disabled}
          className="h-10"
          aria-invalid={errors.name}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Descrição
        </Label>
        <Textarea
          id="description"
          placeholder="Descreva brevemente o propósito deste modelo..."
          value={formData.description}
          onChange={(e) => onFieldChange("description", e.target.value)}
          disabled={disabled}
          className="min-h-[80px] resize-none"
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
            <SelectTrigger className="h-10 w-40">
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
    </FormSection>
  )
}
