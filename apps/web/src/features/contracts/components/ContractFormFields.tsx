"use client"

import { useQuery } from "convex/react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { contractTemplatesApi, clientsApi, notaryOfficesApi } from "@/lib/api"
import { cn } from "@/lib/utils"
import type { Id } from "@despachante/convex/_generated/dataModel"
import type { ContractFormData, ContractFormErrors } from "../hooks/useContractForm"

interface ContractFormFieldsProps {
  formData: ContractFormData
  errors: ContractFormErrors
  ownerIds: Id<"clients">[]
  onFieldChange: <K extends keyof ContractFormData>(
    field: K,
    value: ContractFormData[K]
  ) => void
  disabled?: boolean
}

export function ContractFormFields({
  formData,
  errors,
  ownerIds,
  onFieldChange,
  disabled,
}: ContractFormFieldsProps) {
  const activeTemplates = useQuery(contractTemplatesApi.queries.getActive)

  const clients = useQuery(clientsApi.queries.getByIds, {
    ids: ownerIds,
  })

  const notaryOffices = useQuery(notaryOfficesApi.queries.list, {
    status: "active",
    page: 1,
    pageSize: 100,
  })

  const handleTemplateChange = (templateId: string) => {
    const selectedTemplate = activeTemplates?.find((t) => t._id === templateId)
    onFieldChange("templateId", templateId as Id<"contractTemplates">)

    if (selectedTemplate && !formData.name) {
      onFieldChange("name", selectedTemplate.name)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="template" className="text-sm font-medium">
          Modelo <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formData.templateId || ""}
          onValueChange={handleTemplateChange}
          disabled={disabled || !activeTemplates}
        >
          <SelectTrigger
            id="template"
            className={cn("h-10", errors.templateId && "border-destructive")}
          >
            <SelectValue placeholder="Selecione um modelo" />
          </SelectTrigger>
          <SelectContent>
            {activeTemplates?.map((template) => (
              <SelectItem key={template._id} value={template._id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.templateId && (
          <p className="text-xs text-destructive">{errors.templateId}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="client" className="text-sm font-medium">
          Cliente <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formData.clientId || ""}
          onValueChange={(value) =>
            onFieldChange("clientId", value as Id<"clients">)
          }
          disabled={disabled || !clients}
        >
          <SelectTrigger
            id="client"
            className={cn("h-10", errors.clientId && "border-destructive")}
          >
            <SelectValue placeholder="Selecione um proprietario" />
          </SelectTrigger>
          <SelectContent>
            {clients?.map((client) => (
              <SelectItem key={client._id} value={client._id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.clientId && (
          <p className="text-xs text-destructive">{errors.clientId}</p>
        )}
        {ownerIds.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Este imovel nao possui proprietarios cadastrados
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notaryOffice" className="text-sm font-medium">
          Cartorio{" "}
          <span className="text-muted-foreground text-xs">(opcional)</span>
        </Label>
        <Select
          value={formData.notaryOfficeId || "none"}
          onValueChange={(value) =>
            onFieldChange(
              "notaryOfficeId",
              value === "none" ? null : (value as Id<"notaryOffices">)
            )
          }
          disabled={disabled || !notaryOffices}
        >
          <SelectTrigger id="notaryOffice" className="h-10">
            <SelectValue placeholder="Selecione um cartorio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhum</SelectItem>
            {notaryOffices?.data?.map((office) => (
              <SelectItem key={office._id} value={office._id}>
                {office.name} ({office.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          Nome do Contrato <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onFieldChange("name", e.target.value)}
          placeholder="Ex: Contrato de Compra e Venda - Apto 101"
          disabled={disabled}
          className={cn("h-10", errors.name && "border-destructive")}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name}</p>
        )}
      </div>
    </div>
  )
}
