import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useQuery, useMutation } from "convex/react"
import { propertiesApi, clientsApi } from "@/lib/api"
import { toast } from "sonner"
import { Search, Plus, ArrowUpDown, ArrowUp, ArrowDown, Building2, X, Loader2, Check, ChevronDown, Home, Building, Trees } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import { PropertiesTableActions } from "@/components/properties/PropertiesTableActions"
import { ExportButton } from "@/components/properties/ExportButton"
import { formatZipCode, formatCurrency, formatArea, formatTaxId } from "@/lib/format"
import { Property, PropertyStatus, PropertyType } from "@/types/property"
import { Client } from "@/types/client"
import { Id } from "@despachante/convex/_generated/dataModel"
import { cn } from "@/lib/utils"

type SortField = "address" | "city" | "type" | "area" | "value" | "createdAt" | "status"
type SortOrder = "asc" | "desc"

function PropertyRow({
  property,
  owners,
  getTypeLabel,
  getStatusBadgeVariant,
  getStatusBadgeClassName,
  getStatusLabel,
  onView,
  onEdit,
  onDelete,
}: {
  property: Property
  owners: Client[]
  getTypeLabel: (type: PropertyType) => string
  getStatusBadgeVariant: (status: PropertyStatus) => "default" | "secondary" | "outline"
  getStatusBadgeClassName: (status: PropertyStatus) => string
  getStatusLabel: (status: PropertyStatus) => string
  onView: (property: Property) => void
  onEdit: (property: Property) => void
  onDelete: (property: Property) => Promise<void>
}) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)

  const handleRowClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('[data-actions]')) return
    if (owners.length > 0) {
      setIsTooltipOpen(!isTooltipOpen)
    }
  }

  const handleMenuOpenChange = (open: boolean) => {
    if (open) {
      setIsTooltipOpen(false)
    }
  }

  return (
    <Tooltip open={isTooltipOpen} onOpenChange={(open) => !open && setIsTooltipOpen(false)}>
      <TooltipTrigger asChild>
        <TableRow
          className={cn("hover:bg-muted/50", owners.length > 0 && "cursor-pointer")}
          onClick={handleRowClick}
        >
          <TableCell className="text-text-tertiary">
            {getTypeLabel(property.type)}
          </TableCell>
          <TableCell className="text-text-secondary">
            {property.street}, {property.number}
            {property.complement && `, ${property.complement}`}
            , {property.neighborhood}, {property.city}/{property.state} - {formatZipCode(property.zipCode)}
          </TableCell>
          <TableCell className="text-text-tertiary">
            {formatCurrency(property.value)}
          </TableCell>
          <TableCell className="text-text-tertiary">
            {formatArea(property.area)}
          </TableCell>
          <TableCell>
            <Badge
              variant={getStatusBadgeVariant(property.status)}
              className={getStatusBadgeClassName(property.status)}
            >
              {getStatusLabel(property.status)}
            </Badge>
          </TableCell>
          <TableCell className="text-right" data-actions>
            <PropertiesTableActions
              property={property}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onMenuOpenChange={handleMenuOpenChange}
            />
          </TableCell>
        </TableRow>
      </TooltipTrigger>
      {owners.length > 0 && (
        <TooltipContent
          side="bottom"
          align="start"
          sideOffset={4}
          className="bg-popover text-popover-foreground border border-border shadow-lg p-4 w-(--radix-tooltip-trigger-width)"
        >
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Proprietários
          </p>
          <div className="grid grid-cols-3 gap-2">
            {owners.map((owner) => (
              <div
                key={owner._id}
                className="flex items-center gap-2 p-2 rounded-lg border border-border bg-accent/50"
              >
                <div className="size-7 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                  <span className="text-xs font-medium text-text-tertiary">
                    {owner.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{owner.name}</p>
                  <p className="text-xs text-muted-foreground">{formatTaxId(owner.taxId)}</p>
                </div>
              </div>
            ))}
          </div>
        </TooltipContent>
      )}
    </Tooltip>
  )
}

export default function Properties() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | "all">("all")
  const [typeFilter, setTypeFilter] = useState<PropertyType | "all">("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState<SortField>("createdAt")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [isNewPropertyDialogOpen, setIsNewPropertyDialogOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [ownerSearch, setOwnerSearch] = useState("")
  const [isOwnerPopoverOpen, setIsOwnerPopoverOpen] = useState(false)
  const [isSearchingClients, setIsSearchingClients] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{
    zipCode?: boolean
    street?: boolean
    number?: boolean
    neighborhood?: boolean
    city?: boolean
    state?: boolean
    type?: boolean
    area?: boolean
    value?: boolean
    ownerIds?: boolean
  }>({})
  const [newPropertyForm, setNewPropertyForm] = useState({
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    type: "" as PropertyType | "",
    area: "",
    value: "",
    ownerIds: [] as Id<"clients">[],
  })
  const [isLoadingCep, setIsLoadingCep] = useState(false)
  const numberInputRef = useRef<HTMLInputElement>(null)

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

      setNewPropertyForm(prev => ({
        ...prev,
        street: data.logradouro || prev.street,
        neighborhood: data.bairro || prev.neighborhood,
        city: data.localidade || prev.city,
        state: data.uf || prev.state,
        complement: data.complemento || prev.complement,
      }))
      setTimeout(() => numberInputRef.current?.focus(), 0)
    } catch (error) {
      toast.error("Erro ao buscar CEP")
      console.error(error)
    } finally {
      setIsLoadingCep(false)
    }
  }, [])

  const propertiesData = useQuery(
    propertiesApi.queries.list,
    {
      page,
      pageSize,
      search: search || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      type: typeFilter !== "all" ? typeFilter : undefined,
      sortBy,
      sortOrder,
    }
  )

  const activeClients = useQuery(
    clientsApi.queries.list,
    {
      page: 1,
      pageSize: 10000,
    }
  )

  const deletePropertyMutation = useMutation(propertiesApi.mutations.deleteProperty)
  const createPropertyMutation = useMutation(propertiesApi.mutations.create)
  const updatePropertyMutation = useMutation(propertiesApi.mutations.update)

  const duplicateCheck = useQuery(
    propertiesApi.queries.checkDuplicates,
    isNewPropertyDialogOpen && !editingProperty && newPropertyForm.street.trim() && newPropertyForm.number.trim() && newPropertyForm.zipCode.trim()
      ? {
        street: newPropertyForm.street.trim(),
        number: newPropertyForm.number.trim(),
        zipCode: newPropertyForm.zipCode.replace(/\D/g, ""),
      }
      : "skip"
  )

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
  }

  const handleDelete = async (property: Property): Promise<void> => {
    try {
      await deletePropertyMutation({ id: property._id })
      toast.success("Imóvel excluído com sucesso")
    } catch (error) {
      toast.error("Erro ao excluir imóvel")
      console.error(error)
    }
  }

  const handleView = (property: Property) => {
    toast.info(`Visualizando imóvel: ${property.street}, ${property.number}`)
    // TODO: Implementar modal de visualização
  }

  const handleEdit = (property: Property) => {
    setEditingProperty(property)
    setNewPropertyForm({
      zipCode: formatZipCode(property.zipCode),
      street: property.street || "",
      number: property.number || "",
      complement: property.complement || "",
      neighborhood: property.neighborhood || "",
      city: property.city,
      state: property.state,
      type: property.type,
      area: property.area.toString(),
      value: Math.round(property.value * 100).toString(),
      ownerIds: property.ownerIds,
    })
    setIsNewPropertyDialogOpen(true)
  }

  const handleZipCodeChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    let formatted = value

    if (cleaned.length <= 8) {
      if (cleaned.length <= 5) {
        formatted = cleaned
      } else {
        formatted = `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`
      }
    }

    setNewPropertyForm({ ...newPropertyForm, zipCode: formatted })

    // Buscar endereço quando CEP estiver completo
    if (cleaned.length === 8) {
      fetchAddressByCep(cleaned)
    }
  }

  const handleCurrencyChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    setNewPropertyForm({ ...newPropertyForm, value: cleaned })
  }

  const formatCurrencyInput = (value: string): string => {
    if (!value) return ""
    const numValue = Number(value)
    if (isNaN(numValue)) return ""
    return (numValue / 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const handleCreateProperty = async (skipDuplicateCheck?: boolean) => {
    const shouldSkipCheck = skipDuplicateCheck ?? false

    // Validação de campos obrigatórios
    const errors: typeof fieldErrors = {}
    if (!newPropertyForm.zipCode.trim()) errors.zipCode = true
    if (!newPropertyForm.street.trim()) errors.street = true
    if (!newPropertyForm.number.trim()) errors.number = true
    if (!newPropertyForm.neighborhood.trim()) errors.neighborhood = true
    if (!newPropertyForm.city.trim()) errors.city = true
    if (!newPropertyForm.state) errors.state = true
    if (!newPropertyForm.type) errors.type = true
    if (!newPropertyForm.area.trim()) errors.area = true
    if (!newPropertyForm.value.trim()) errors.value = true
    if (newPropertyForm.ownerIds.length === 0) errors.ownerIds = true

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})

    // Check for duplicates if creating new property
    if (!editingProperty && !shouldSkipCheck && duplicateCheck?.duplicate) {
      setIsConfirmDialogOpen(true)
      return
    }

    setIsSubmitting(true)
    try {
      const propertyData = {
        zipCode: newPropertyForm.zipCode.replace(/\D/g, ""),
        street: newPropertyForm.street.trim(),
        number: newPropertyForm.number.trim(),
        complement: newPropertyForm.complement.trim() || undefined,
        neighborhood: newPropertyForm.neighborhood.trim(),
        city: newPropertyForm.city.trim(),
        state: newPropertyForm.state,
        type: newPropertyForm.type as PropertyType,
        area: Number(newPropertyForm.area),
        value: Number(newPropertyForm.value) / 100,
        ownerIds: newPropertyForm.ownerIds,
      }

      if (editingProperty) {
        await updatePropertyMutation({
          id: editingProperty._id,
          ...propertyData,
        })
        toast.success("Imóvel atualizado com sucesso")
      } else {
        await createPropertyMutation(propertyData)
        toast.success("Imóvel criado com sucesso")
      }
      setIsNewPropertyDialogOpen(false)
      setIsConfirmDialogOpen(false)
      setEditingProperty(null)
      setFieldErrors({})
      setNewPropertyForm({
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        type: "" as PropertyType | "",
        area: "",
        value: "",
        ownerIds: [],
      })
      setOwnerSearch("")
    } catch (error) {
      toast.error(editingProperty ? "Erro ao atualizar imóvel" : "Erro ao criar imóvel")
      console.error(error)
    }
  }

  const getStatusBadgeVariant = (status: PropertyStatus) => {
    switch (status) {
      case "active":
        return "default"
      case "inactive":
        return "secondary"
      case "pending":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getStatusBadgeClassName = (status: PropertyStatus) => {
    switch (status) {
      case "active":
        return "bg-status-success-muted text-status-success-foreground border-status-success-border font-medium"
      case "inactive":
        return "bg-status-neutral-muted text-status-neutral-foreground border-status-neutral-border font-medium"
      case "pending":
        return "bg-status-warning-muted text-status-warning-foreground border-status-warning-border font-medium"
      default:
        return ""
    }
  }

  const getStatusLabel = (status: PropertyStatus) => {
    switch (status) {
      case "active":
        return "Ativo"
      case "inactive":
        return "Inativo"
      case "pending":
        return "Pendente"
      default:
        return status
    }
  }

  const getTypeLabel = (type: PropertyType) => {
    switch (type) {
      case "house":
        return "Casa"
      case "apartment":
        return "Apartamento"
      case "land":
        return "Terreno"
      case "building":
        return "Prédio"
      default:
        return type
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    )
  }

  // Função para normalizar strings removendo acentos e convertendo para minúsculas
  const normalizeString = (str: string): string => {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
  }

  // Efeito para gerenciar o estado de loading durante a busca
  useEffect(() => {
    if (ownerSearch.trim() && activeClients?.clients) {
      setIsSearchingClients(true)
      const timer = setTimeout(() => {
        setIsSearchingClients(false)
      }, 200)
      return () => clearTimeout(timer)
    } else {
      setIsSearchingClients(false)
    }
  }, [ownerSearch, activeClients])

  // Filtro de clientes com busca case-insensitive e accent-insensitive
  const filteredClients = useMemo(() => {
    if (!activeClients?.clients) return []

    if (!ownerSearch.trim()) {
      return activeClients.clients
    }

    const searchNormalized = normalizeString(ownerSearch.trim())
    const searchCleaned = ownerSearch.replace(/\D/g, "")
    const searchWords = searchNormalized.split(/\s+/).filter((w) => w.length > 0)

    return activeClients.clients.filter((client) => {
      const clientNameNormalized = normalizeString(client.name)
      const clientTaxIdCleaned = client.taxId.replace(/\D/g, "")
      const clientPhoneCleaned = client.phone?.replace(/\D/g, "") || ""

      // Busca por nome (qualquer palavra deve estar presente)
      const nameMatch = searchWords.length === 0 || searchWords.some((word) =>
        clientNameNormalized.includes(word)
      )

      // Busca por CPF/CNPJ
      const taxIdMatch = searchCleaned.length > 0 &&
        clientTaxIdCleaned.includes(searchCleaned)

      // Busca por telefone
      const phoneMatch = searchCleaned.length > 0 &&
        clientPhoneCleaned.length > 0 &&
        clientPhoneCleaned.includes(searchCleaned)

      return nameMatch || taxIdMatch || phoneMatch
    })
  }, [activeClients?.clients, ownerSearch])

  const selectedOwners = activeClients?.clients?.filter((client) =>
    newPropertyForm.ownerIds.includes(client._id)
  ) || []

  const toggleOwner = (clientId: Id<"clients">) => {
    if (newPropertyForm.ownerIds.includes(clientId)) {
      setNewPropertyForm({
        ...newPropertyForm,
        ownerIds: newPropertyForm.ownerIds.filter((id) => id !== clientId),
      })
    } else {
      setNewPropertyForm({
        ...newPropertyForm,
        ownerIds: [...newPropertyForm.ownerIds, clientId],
      })
      if (fieldErrors.ownerIds) {
        setFieldErrors({ ...fieldErrors, ownerIds: false })
      }
    }
  }

  const isLoading = propertiesData === undefined
  const properties = propertiesData?.properties ?? []
  const total = propertiesData?.total ?? 0
  const totalPages = propertiesData?.totalPages ?? 0

  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b backdrop-blur">
        <div className="px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Imóveis</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie os imóveis cadastrados.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingProperty(null)
              setNewPropertyForm({
                zipCode: "",
                street: "",
                number: "",
                complement: "",
                neighborhood: "",
                city: "",
                state: "",
                type: "" as PropertyType | "",
                area: "",
                value: "",
                ownerIds: [],
              })
              setOwnerSearch("")
              setIsNewPropertyDialogOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Imóvel
          </Button>
        </div>
      </div>

      <div className="flex-1 space-y-4 p-6">
        {/* Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por endereço, CEP ou cidade..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-9 pr-9"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("")
                  setPage(1)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value as PropertyStatus | "all")
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={typeFilter}
            onValueChange={(value) => {
              setTypeFilter(value as PropertyType | "all")
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="house">Casa</SelectItem>
              <SelectItem value="apartment">Apartamento</SelectItem>
              <SelectItem value="land">Terreno</SelectItem>
              <SelectItem value="building">Prédio</SelectItem>
            </SelectContent>
          </Select>
          <ExportButton properties={properties} disabled={isLoading} />
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-[100px]">
                  <button
                    onClick={() => handleSort("type")}
                    className="flex items-center hover:text-foreground cursor-pointer font-semibold"
                  >
                    Tipo
                    <SortIcon field="type" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("address")}
                    className="flex items-center hover:text-foreground cursor-pointer font-semibold"
                  >
                    Endereço
                    <SortIcon field="address" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("value")}
                    className="flex items-center hover:text-foreground cursor-pointer font-semibold"
                  >
                    Valor
                    <SortIcon field="value" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("area")}
                    className="flex items-center hover:text-foreground cursor-pointer font-semibold"
                  >
                    Área
                    <SortIcon field="area" />
                  </button>
                </TableHead>
                <TableHead className="w-[120px]">
                  <button
                    onClick={() => handleSort("status")}
                    className="flex items-center hover:text-foreground cursor-pointer font-semibold"
                  >
                    Status
                    <SortIcon field="status" />
                  </button>
                </TableHead>
                <TableHead className="w-[100px] text-right font-semibold">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[350px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[60px]" />
                    </TableCell>
                  </TableRow>
                ))
              ) : properties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-72 text-center">
                    <button
                      onClick={() => setIsNewPropertyDialogOpen(true)}
                      className="flex flex-col items-center justify-center gap-3 w-full h-full group cursor-pointer"
                    >
                      <div className="size-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/15 group-hover:border-primary/30 transition-colors">
                        <Building2 className="size-8 text-primary" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-text-secondary group-hover:text-text-primary transition-colors">
                          Nenhum imóvel encontrado
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Clique para adicionar um novo imóvel
                        </p>
                      </div>
                    </button>
                  </TableCell>
                </TableRow>
              ) : (
                properties.map((property) => {
                  const owners = activeClients?.clients?.filter((client) =>
                    property.ownerIds.includes(client._id)
                  ) || []
                  return (
                    <PropertyRow
                      key={property._id}
                      property={property}
                      owners={owners}
                      getTypeLabel={getTypeLabel}
                      getStatusBadgeVariant={getStatusBadgeVariant}
                      getStatusBadgeClassName={getStatusBadgeClassName}
                      getStatusLabel={getStatusLabel}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 0 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Mostrando {properties.length} de {total} imóvel(is)
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  setPageSize(Number(value))
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <div className="text-sm">
                  Página {page} de {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Property Dialog */}
      <Dialog
        open={isNewPropertyDialogOpen}
        onOpenChange={(open) => {
          setIsNewPropertyDialogOpen(open)
          if (!open) {
            setEditingProperty(null)
            setFieldErrors({})
            setNewPropertyForm({
              zipCode: "",
              street: "",
              number: "",
              complement: "",
              neighborhood: "",
              city: "",
              state: "",
              type: "" as PropertyType | "",
              area: "",
              value: "",
              ownerIds: [],
            })
            setOwnerSearch("")
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-gap p-6 border-b border-border/50">
            <div className="size-icon-container-md rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Building2 className="size-icon-md text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold">
                {editingProperty ? "Editar Imóvel" : "Novo Imóvel"}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                {editingProperty
                  ? "Atualize os dados do imóvel selecionado"
                  : "Preencha os dados para cadastrar um novo imóvel"}
              </DialogDescription>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Property Data Section */}
            <div className="space-y-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Dados do Imóvel
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Tipo <span className="text-destructive">*</span>
                  </Label>
                  <div className={cn(
                    "grid grid-cols-4 gap-3 p-1 rounded-xl transition-all duration-200",
                    fieldErrors.type && "bg-destructive/5 ring-1 ring-destructive/20"
                  )}>
                    {[
                      { value: "land" as PropertyType, icon: Trees, label: "Terreno" },
                      { value: "house" as PropertyType, icon: Home, label: "Casa" },
                      { value: "apartment" as PropertyType, icon: Building, label: "Apartamento" },
                      { value: "building" as PropertyType, icon: Building2, label: "Prédio" },
                    ].map(({ value, icon: Icon, label }) => {
                      const isSelected = newPropertyForm.type === value
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            setNewPropertyForm({ ...newPropertyForm, type: value })
                            if (fieldErrors.type) {
                              setFieldErrors({ ...fieldErrors, type: false })
                            }
                          }}
                          className={cn(
                            "relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl text-center transition-all cursor-pointer aspect-square",
                            isSelected
                              ? "border-2 border-primary bg-primary/10 shadow-sm"
                              : "border border-border bg-accent/50 hover:bg-accent hover:border-muted-foreground/30"
                          )}
                        >
                          <div
                            className={cn(
                              "size-10 rounded-lg flex items-center justify-center transition-colors",
                              isSelected
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-background border border-border text-text-tertiary"
                            )}
                          >
                            <Icon className="size-5" />
                          </div>
                          <p
                            className={cn(
                              "text-sm font-medium",
                              isSelected ? "text-text-primary" : "text-text-secondary"
                            )}
                          >
                            {label}
                          </p>
                          {isSelected && (
                            <div className="absolute top-2 right-2 size-5 rounded-full bg-primary flex items-center justify-center">
                              <Check className="size-3 text-primary-foreground" />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
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
                        value={newPropertyForm.area ? Number(newPropertyForm.area).toLocaleString("pt-BR") : ""}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/\D/g, "")
                          setNewPropertyForm({ ...newPropertyForm, area: rawValue })
                          if (fieldErrors.area) {
                            setFieldErrors({ ...fieldErrors, area: false })
                          }
                        }}
                        className="h-10 pr-10"
                        aria-invalid={fieldErrors.area}
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
                        value={formatCurrencyInput(newPropertyForm.value)}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/\D/g, "")
                          handleCurrencyChange(cleaned)
                          if (fieldErrors.value) {
                            setFieldErrors({ ...fieldErrors, value: false })
                          }
                        }}
                        className="h-10 pl-9"
                        aria-invalid={fieldErrors.value}
                      />
                    </div>
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
                      value={newPropertyForm.zipCode}
                      onChange={(e) => {
                        handleZipCodeChange(e.target.value)
                        if (fieldErrors.zipCode) {
                          setFieldErrors({ ...fieldErrors, zipCode: false })
                        }
                      }}
                      maxLength={9}
                      className="h-10 pr-8"
                      aria-invalid={fieldErrors.zipCode}
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
                      value={newPropertyForm.street}
                      onChange={(e) => {
                        setNewPropertyForm({ ...newPropertyForm, street: e.target.value })
                        if (fieldErrors.street) {
                          setFieldErrors({ ...fieldErrors, street: false })
                        }
                      }}
                      className="h-10"
                      aria-invalid={fieldErrors.street}
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
                      value={newPropertyForm.number}
                      onChange={(e) => {
                        setNewPropertyForm({ ...newPropertyForm, number: e.target.value })
                        if (fieldErrors.number) {
                          setFieldErrors({ ...fieldErrors, number: false })
                        }
                      }}
                      className="h-10"
                      aria-invalid={fieldErrors.number}
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
                      value={newPropertyForm.complement}
                      onChange={(e) =>
                        setNewPropertyForm({ ...newPropertyForm, complement: e.target.value })
                      }
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
                      value={newPropertyForm.neighborhood}
                      onChange={(e) => {
                        setNewPropertyForm({ ...newPropertyForm, neighborhood: e.target.value })
                        if (fieldErrors.neighborhood) {
                          setFieldErrors({ ...fieldErrors, neighborhood: false })
                        }
                      }}
                      className="h-10"
                      aria-invalid={fieldErrors.neighborhood}
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
                      value={newPropertyForm.city}
                      onChange={(e) => {
                        setNewPropertyForm({ ...newPropertyForm, city: e.target.value })
                        if (fieldErrors.city) {
                          setFieldErrors({ ...fieldErrors, city: false })
                        }
                      }}
                      className="h-10"
                      aria-invalid={fieldErrors.city}
                    />
                  </div>
                  <div className="col-span-1 space-y-2">
                    <Label htmlFor="state" className="text-sm font-medium">
                      UF <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="state"
                      placeholder="MG"
                      value={newPropertyForm.state}
                      onChange={(e) => {
                        setNewPropertyForm({ ...newPropertyForm, state: e.target.value.toUpperCase() })
                        if (fieldErrors.state) {
                          setFieldErrors({ ...fieldErrors, state: false })
                        }
                      }}
                      maxLength={2}
                      className="h-10 uppercase"
                      aria-invalid={fieldErrors.state}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Owners Section */}
            <div className="space-y-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Proprietários <span className="text-destructive">*</span>
              </p>
              <div className="space-y-3">
                <Popover open={isOwnerPopoverOpen} onOpenChange={setIsOwnerPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between h-10"
                      type="button"
                      aria-invalid={fieldErrors.ownerIds}
                    >
                      <span className="text-muted-foreground">
                        {selectedOwners.length > 0
                          ? `${selectedOwners.length} proprietário(s) selecionado(s)`
                          : "Selecione os proprietários"}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0" align="start" sideOffset={-40} style={{ width: 'var(--radix-popover-trigger-width)', minWidth: '300px' }}>
                    <div className="flex items-center border-b px-3">
                      <Search className="h-4 w-4 shrink-0 opacity-50" />
                      <Input
                        placeholder="Buscar cliente..."
                        value={ownerSearch}
                        onChange={(e) => setOwnerSearch(e.target.value)}
                        className="h-10 border-0 bg-transparent dark:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
                        autoComplete="off"
                      />
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {/* Separador com label */}
                      <div className="px-2 py-1.5">
                        <p className="text-xs font-medium text-muted-foreground px-2">Clientes</p>
                      </div>

                      {/* Lista de resultados */}
                      <div className="p-1 pt-0">
                        {activeClients === undefined || isSearchingClients ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          </div>
                        ) : filteredClients.length === 0 ? (
                          <p className="py-6 text-center text-sm text-muted-foreground">
                            {ownerSearch.trim() ? "Nenhum cliente encontrado." : "Nenhum cliente cadastrado."}
                          </p>
                        ) : (
                          filteredClients.map((client) => {
                            const isSelected = newPropertyForm.ownerIds.includes(client._id)
                            return (
                              <div
                                key={client._id}
                                className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent cursor-pointer"
                                onClick={() => toggleOwner(client._id)}
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
                    </div>
                  </PopoverContent>
                </Popover>
                {selectedOwners.length > 0 && (
                  <div className="rounded-xl border border-border/50 overflow-hidden divide-y divide-border/50">
                    {selectedOwners.map((owner) => (
                      <div
                        key={owner._id}
                        className="group flex items-center gap-3 px-3 py-2.5 bg-accent/30 hover:bg-accent/60 transition-colors"
                      >
                        <div className="size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <span className="text-sm font-semibold text-primary">
                            {owner.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">
                            {owner.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTaxId(owner.taxId)}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                          onClick={() => toggleOwner(owner._id)}
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border/50">
            <Button
              variant="outline"
              onClick={() => setIsNewPropertyDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button onClick={() => handleCreateProperty()} disabled={isSubmitting}>
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

      {/* Confirm Duplicate Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Imóvel com dados duplicados</DialogTitle>
            <DialogDescription>
              Foi encontrado um imóvel existente com o mesmo endereço e CEP:
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <ul className="list-disc list-inside space-y-2">
              <li className="text-sm">
                <strong>Endereço:</strong> {newPropertyForm.street}, {newPropertyForm.number}
                {newPropertyForm.complement && `, ${newPropertyForm.complement}`}
              </li>
              <li className="text-sm">
                <strong>Bairro:</strong> {newPropertyForm.neighborhood}
              </li>
              <li className="text-sm">
                <strong>CEP:</strong> {formatZipCode(newPropertyForm.zipCode)}
              </li>
            </ul>
            <p className="mt-6 text-sm text-muted-foreground">
              Deseja realmente criar este imóvel?
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsConfirmDialogOpen(false)
              }}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button onClick={() => handleCreateProperty(true)} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Sim, criar mesmo assim"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
