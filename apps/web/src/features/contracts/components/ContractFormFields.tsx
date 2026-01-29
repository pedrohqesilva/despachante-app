"use client"

import { useState, useMemo } from "react"
import { useQuery } from "convex/react"
import { Search, ChevronDown, Check, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { contractTemplatesApi, clientsApi, notaryOfficesApi } from "@/lib/api"
import { cn } from "@/lib/utils"
import { formatTaxId } from "@/lib/format"
import type { Id } from "@despachante/convex/_generated/dataModel"
import type { ContractFormData, ContractFormErrors } from "../hooks/useContractForm"

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

interface ContractFormFieldsProps {
  formData: ContractFormData
  errors: ContractFormErrors
  onFieldChange: <K extends keyof ContractFormData>(
    field: K,
    value: ContractFormData[K]
  ) => void
  onToggleClient: (clientId: Id<"clients">) => void
  onToggleNotaryOffice: (notaryOfficeId: Id<"notaryOffices">) => void
  disabled?: boolean
}

export function ContractFormFields({
  formData,
  errors,
  onFieldChange,
  onToggleClient,
  onToggleNotaryOffice,
  disabled,
}: ContractFormFieldsProps) {
  const activeTemplates = useQuery(contractTemplatesApi.queries.getActive)
  const allClients = useQuery(clientsApi.queries.list, {
    status: "active",
    page: 1,
    pageSize: 100,
  })
  const allNotaryOffices = useQuery(notaryOfficesApi.queries.list, {
    status: "active",
    page: 1,
    pageSize: 100,
  })

  const [templateSearch, setTemplateSearch] = useState("")
  const [templateOpen, setTemplateOpen] = useState(false)
  const [clientSearch, setClientSearch] = useState("")
  const [clientOpen, setClientOpen] = useState(false)
  const [notarySearch, setNotarySearch] = useState("")
  const [notaryOpen, setNotaryOpen] = useState(false)

  const filteredTemplates = useMemo(() => {
    if (!activeTemplates) return []
    if (!templateSearch.trim()) return activeTemplates

    const searchNormalized = normalizeString(templateSearch.trim())
    return activeTemplates.filter((template) =>
      normalizeString(template.name).includes(searchNormalized)
    )
  }, [activeTemplates, templateSearch])

  const filteredClients = useMemo(() => {
    const clients = allClients?.clients || []
    if (!clientSearch.trim()) return clients

    const searchNormalized = normalizeString(clientSearch.trim())
    const searchCleaned = clientSearch.replace(/\D/g, "")

    return clients.filter((client) => {
      const nameMatch = normalizeString(client.name).includes(searchNormalized)
      const taxIdMatch = searchCleaned.length > 0 &&
        client.taxId.replace(/\D/g, "").includes(searchCleaned)
      return nameMatch || taxIdMatch
    })
  }, [allClients, clientSearch])

  const filteredNotaryOffices = useMemo(() => {
    const offices = allNotaryOffices?.data || []
    if (!notarySearch.trim()) return offices

    const searchNormalized = normalizeString(notarySearch.trim())
    return offices.filter((office) =>
      normalizeString(office.name).includes(searchNormalized) ||
      normalizeString(office.code).includes(searchNormalized)
    )
  }, [allNotaryOffices, notarySearch])

  const selectedTemplate = activeTemplates?.find((t) => t._id === formData.templateId)
  const selectedClients = allClients?.clients?.filter((c) =>
    formData.clientIds.includes(c._id)
  ) || []
  const selectedNotaryOffices = allNotaryOffices?.data?.filter((n) =>
    formData.notaryOfficeIds.includes(n._id)
  ) || []

  const handleTemplateSelect = (templateId: Id<"contractTemplates">) => {
    const template = activeTemplates?.find((t) => t._id === templateId)
    onFieldChange("templateId", templateId)
    if (template && !formData.name) {
      onFieldChange("name", template.name)
    }
    setTemplateOpen(false)
    setTemplateSearch("")
  }

  return (
    <div className="space-y-6">
      {/* Modelo */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Modelo{" "}
        </Label>
        <Popover open={templateOpen} onOpenChange={setTemplateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between h-10"
              type="button"
              disabled={disabled || !activeTemplates}
            >
              <span className={selectedTemplate ? "" : "text-muted-foreground"}>
                {selectedTemplate?.name || "Selecione um modelo"}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="p-0"
            align="start"
            style={{ width: "var(--radix-popover-trigger-width)", minWidth: "300px" }}
          >
            <div className="flex items-center border-b px-3">
              <Search className="h-4 w-4 shrink-0 opacity-50" />
              <Input
                placeholder="Buscar modelo..."
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                className="h-10 border-0 bg-transparent dark:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
                autoComplete="off"
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto p-1">
              {!activeTemplates ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : filteredTemplates.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  {templateSearch.trim() ? "Nenhum modelo encontrado." : "Nenhum modelo cadastrado."}
                </p>
              ) : (
                filteredTemplates.map((template) => (
                  <div
                    key={template._id}
                    className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent cursor-pointer"
                    onClick={() => handleTemplateSelect(template._id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{template.name}</p>
                      {template.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {template.description}
                        </p>
                      )}
                    </div>
                    {formData.templateId === template._id && (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Nome do Contrato */}
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

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Descrição{" "}
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onFieldChange("description", e.target.value)}
          placeholder="Breve descrição do contrato..."
          disabled={disabled}
          rows={2}
          className="resize-none max-h-30 overflow-y-auto"
        />
      </div>

      {/* Clientes */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Clientes <span className="text-destructive">*</span>
        </Label>
        <Popover open={clientOpen} onOpenChange={setClientOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-between h-10",
                errors.clientIds && "border-destructive"
              )}
              type="button"
              disabled={disabled || !allClients}
            >
              <span className={selectedClients.length > 0 ? "" : "text-muted-foreground"}>
                {selectedClients.length > 0
                  ? `${selectedClients.length} cliente(s) selecionado(s)`
                  : "Selecione os clientes"}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="p-0"
            align="start"
            style={{ width: "var(--radix-popover-trigger-width)", minWidth: "300px" }}
          >
            <div className="flex items-center border-b px-3">
              <Search className="h-4 w-4 shrink-0 opacity-50" />
              <Input
                placeholder="Buscar cliente..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="h-10 border-0 bg-transparent dark:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
                autoComplete="off"
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto p-1">
              {!allClients ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : filteredClients.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  {clientSearch.trim() ? "Nenhum cliente encontrado." : "Nenhum cliente cadastrado."}
                </p>
              ) : (
                filteredClients.map((client) => {
                  const isSelected = formData.clientIds.includes(client._id)
                  return (
                    <div
                      key={client._id}
                      className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent cursor-pointer"
                      onClick={() => onToggleClient(client._id)}
                    >
                      <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <span className="text-xs font-medium">
                          {client.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{client.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTaxId(client.taxId)}
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </PopoverContent>
        </Popover>
        {errors.clientIds && (
          <p className="text-xs text-destructive">{errors.clientIds}</p>
        )}

        {selectedClients.length > 0 && (
          <div className="rounded-xl border border-border/50 overflow-hidden divide-y divide-border/50">
            {selectedClients.map((client) => (
              <div
                key={client._id}
                className="group flex items-center gap-3 px-3 py-2.5 bg-accent/30 hover:bg-accent/60 transition-colors"
              >
                <div className="size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-primary">
                    {client.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{client.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTaxId(client.taxId)}
                  </p>
                </div>
                <button
                  type="button"
                  className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                  onClick={() => onToggleClient(client._id)}
                  disabled={disabled}
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cartórios */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Cartórios{" "}
        </Label>
        <Popover open={notaryOpen} onOpenChange={setNotaryOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between h-10"
              type="button"
              disabled={disabled || !allNotaryOffices}
            >
              <span className={selectedNotaryOffices.length > 0 ? "" : "text-muted-foreground"}>
                {selectedNotaryOffices.length > 0
                  ? `${selectedNotaryOffices.length} cartório(s) selecionado(s)`
                  : "Selecione os cartórios"}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="p-0"
            align="start"
            style={{ width: "var(--radix-popover-trigger-width)", minWidth: "300px" }}
          >
            <div className="flex items-center border-b px-3">
              <Search className="h-4 w-4 shrink-0 opacity-50" />
              <Input
                placeholder="Buscar cartório..."
                value={notarySearch}
                onChange={(e) => setNotarySearch(e.target.value)}
                className="h-10 border-0 bg-transparent dark:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
                autoComplete="off"
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto p-1">
              {!allNotaryOffices ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : filteredNotaryOffices.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  {notarySearch.trim() ? "Nenhum cartório encontrado." : "Nenhum cartório cadastrado."}
                </p>
              ) : (
                filteredNotaryOffices.map((office) => {
                  const isSelected = formData.notaryOfficeIds.includes(office._id)
                  return (
                    <div
                      key={office._id}
                      className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent cursor-pointer"
                      onClick={() => onToggleNotaryOffice(office._id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{office.name}</p>
                        <p className="text-xs text-muted-foreground">{office.code}</p>
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </PopoverContent>
        </Popover>

        {selectedNotaryOffices.length > 0 && (
          <div className="rounded-xl border border-border/50 overflow-hidden divide-y divide-border/50">
            {selectedNotaryOffices.map((office) => (
              <div
                key={office._id}
                className="group flex items-center gap-3 px-3 py-2.5 bg-accent/30 hover:bg-accent/60 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{office.name}</p>
                  <p className="text-xs text-muted-foreground">{office.code}</p>
                </div>
                <button
                  type="button"
                  className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                  onClick={() => onToggleNotaryOffice(office._id)}
                  disabled={disabled}
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
