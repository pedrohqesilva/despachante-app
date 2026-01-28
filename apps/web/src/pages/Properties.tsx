import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, useMutation } from "convex/react"
import { propertiesApi, clientsApi } from "@/lib/api"
import { toast } from "sonner"
import {
  Search, Plus, ArrowUpDown, ArrowUp, ArrowDown, Building2, X, Users, ExternalLink, AlertTriangle,
} from "lucide-react"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogMedia,
  AlertDialogBody,
} from "@/components/ui/alert-dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { TrashButton } from "@/components/ui/trash-button"
import { PropertiesTableActions } from "@/components/properties/PropertiesTableActions"
import { ExportButton } from "@/components/properties/ExportButton"
import { PropertyDialog, type PropertyDialogSaveData } from "@/features/properties"
import {
  getPropertyTypeLabel,
  getPropertyStatusLabel,
  getPropertyStatusBadgeVariant,
  getPropertyStatusBadgeClassName,
} from "@/lib/constants"
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
  onEdit,
  onDelete,
  onRowClick,
  onNavigateToClient,
  onRemoveOwnerRequest,
  isRemovingOwner,
  removingOwnerId,
}: {
  property: Property
  owners: Client[]
  onEdit: (property: Property) => void
  onDelete: (property: Property) => Promise<void>
  onRowClick: (property: Property) => void
  onNavigateToClient: (clientId: Id<"clients">) => void
  onRemoveOwnerRequest: (propertyId: Id<"properties">, ownerId: Id<"clients">, ownerName: string, currentOwnerIds: Id<"clients">[]) => void
  isRemovingOwner: boolean
  removingOwnerId: Id<"clients"> | null
}) {
  const [isOwnersPopoverOpen, setIsOwnersPopoverOpen] = useState(false)

  const handleRowClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('[data-actions]') || target.closest('[data-owners-badge]')) return
    onRowClick(property)
  }

  const handleMenuOpenChange = (open: boolean) => {
    if (open) {
      setIsOwnersPopoverOpen(false)
    }
  }

  return (
    <TableRow
      className="hover:bg-muted/50 cursor-pointer"
      onClick={handleRowClick}
    >
      <TableCell className="text-text-tertiary">
        {getPropertyTypeLabel(property.type)}
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
      <TableCell data-owners-badge>
        <Popover open={isOwnersPopoverOpen} onOpenChange={setIsOwnersPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-accent hover:bg-accent/80 border border-border hover:border-border/80 transition-colors cursor-pointer"
            >
              <Users className="size-3.5 text-muted-foreground" />
              <span className="text-sm font-medium text-text-secondary">{owners.length}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start" sideOffset={4}>
            <div className="p-3 border-b border-border/50">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Proprietários
              </p>
            </div>
            <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
              {owners.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Nenhum proprietário vinculado
                </p>
              ) : (
                owners.map((owner) => (
                  <div
                    key={owner._id}
                    onClick={(e) => {
                      const target = e.target as HTMLElement
                      if (target.closest('[data-actions]')) return
                      setIsOwnersPopoverOpen(false)
                      onNavigateToClient(owner._id)
                    }}
                    className="group/owner flex items-center gap-2 p-2 rounded-lg hover:bg-accent cursor-pointer relative"
                  >
                    <div className="size-8 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                      <span className="text-xs font-medium text-text-tertiary">
                        {owner.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{owner.name}</p>
                      <p className="text-xs text-muted-foreground">{formatTaxId(owner.taxId)}</p>
                    </div>
                    <div className="shrink-0 opacity-100 group-hover/owner:opacity-0 transition-opacity duration-200 absolute right-2">
                      <Badge
                        variant={owner.status === "active" ? "default" : owner.status === "pending" ? "outline" : "secondary"}
                        className={cn(
                          "text-[10px]",
                          owner.status === "active"
                            ? "bg-status-success-muted text-status-success-foreground border-status-success-border"
                            : owner.status === "pending"
                              ? "bg-status-warning-muted text-status-warning-foreground border-status-warning-border"
                              : "bg-status-neutral-muted text-status-neutral-foreground border-status-neutral-border"
                        )}
                      >
                        {owner.status === "active" ? "Ativo" : owner.status === "pending" ? "Pendente" : "Inativo"}
                      </Badge>
                    </div>
                    <div data-actions className="flex items-center gap-1 shrink-0 opacity-0 group-hover/owner:opacity-100 transition-opacity duration-200 bg-accent rounded-lg p-1 -m-1 relative z-10">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          onNavigateToClient(owner._id)
                          setIsOwnersPopoverOpen(false)
                        }}
                      >
                        <ExternalLink className="size-4 text-muted-foreground" />
                      </Button>
                      <TrashButton
                        onClick={() => {
                          if (owners.length > 1) {
                            onRemoveOwnerRequest(property._id, owner._id, owner.name, property.ownerIds)
                          }
                        }}
                        disabled={owners.length <= 1}
                        isLoading={isRemovingOwner && removingOwnerId === owner._id}
                        title={owners.length <= 1 ? "O imóvel deve ter pelo menos um proprietário" : "Remover proprietário"}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
      </TableCell>
      <TableCell>
        <Badge
          variant={getPropertyStatusBadgeVariant(property.status)}
          className={getPropertyStatusBadgeClassName(property.status)}
        >
          {getPropertyStatusLabel(property.status)}
        </Badge>
      </TableCell>
      <TableCell className="text-right" data-actions>
        <PropertiesTableActions
          property={property}
          onView={() => onRowClick(property)}
          onEdit={onEdit}
          onDelete={onDelete}
          onMenuOpenChange={handleMenuOpenChange}
        />
      </TableCell>
    </TableRow>
  )
}

export default function Properties() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | "all">("all")
  const [typeFilter, setTypeFilter] = useState<PropertyType | "all">("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState<SortField>("createdAt")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [isPropertyDialogOpen, setIsPropertyDialogOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [pendingPropertyData, setPendingPropertyData] = useState<PropertyDialogSaveData | null>(null)
  const [isRemovingOwner, setIsRemovingOwner] = useState(false)
  const [ownerToRemove, setOwnerToRemove] = useState<{
    propertyId: Id<"properties">
    ownerId: Id<"clients">
    ownerName: string
    currentOwnerIds: Id<"clients">[]
  } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    { page: 1, pageSize: 10000 }
  )

  const duplicateCheck = useQuery(
    propertiesApi.queries.checkDuplicates,
    pendingPropertyData && !editingProperty
      ? {
        street: pendingPropertyData.data.street,
        number: pendingPropertyData.data.number,
        zipCode: pendingPropertyData.data.zipCode,
      }
      : "skip"
  )

  const deletePropertyMutation = useMutation(propertiesApi.mutations.deleteProperty)
  const createPropertyMutation = useMutation(propertiesApi.mutations.create)
  const updatePropertyMutation = useMutation(propertiesApi.mutations.update)

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

  const handleRowClick = (property: Property) => {
    navigate(`/imoveis/${property._id}`)
  }

  const handleNavigateToClient = (clientId: Id<"clients">) => {
    navigate(`/clientes/${clientId}`)
  }

  const handleRemoveOwnerRequest = (propertyId: Id<"properties">, ownerId: Id<"clients">, ownerName: string, currentOwnerIds: Id<"clients">[]) => {
    setOwnerToRemove({ propertyId, ownerId, ownerName, currentOwnerIds })
  }

  const handleRemoveOwnerConfirm = async () => {
    if (!ownerToRemove) return

    if (ownerToRemove.currentOwnerIds.length <= 1) {
      toast.error("O imóvel deve ter pelo menos um proprietário")
      setOwnerToRemove(null)
      return
    }

    setIsRemovingOwner(true)
    try {
      await updatePropertyMutation({
        id: ownerToRemove.propertyId,
        ownerIds: ownerToRemove.currentOwnerIds.filter(id => id !== ownerToRemove.ownerId),
      })
      toast.success("Proprietário removido com sucesso")
    } catch (error) {
      toast.error("Erro ao remover proprietário")
      console.error(error)
    } finally {
      setIsRemovingOwner(false)
      setOwnerToRemove(null)
    }
  }

  const handleEdit = (property: Property) => {
    setEditingProperty(property)
    setIsPropertyDialogOpen(true)
  }

  const handleOpenNewDialog = () => {
    setEditingProperty(null)
    setIsPropertyDialogOpen(true)
  }

  const handleSaveProperty = useCallback(async (saveData: PropertyDialogSaveData) => {
    if (!saveData.isEditing && duplicateCheck?.duplicate) {
      setPendingPropertyData(saveData)
      setIsConfirmDialogOpen(true)
      return
    }

    await executePropertySave(saveData)
  }, [duplicateCheck])

  const executePropertySave = async (saveData: PropertyDialogSaveData, _skipDuplicateCheck?: boolean) => {
    setIsSubmitting(true)
    try {
      if (editingProperty) {
        await updatePropertyMutation({
          id: editingProperty._id,
          ...saveData.data,
        })
        toast.success("Imóvel atualizado com sucesso")
      } else {
        await createPropertyMutation(saveData.data)
        toast.success("Imóvel criado com sucesso")
      }
      setIsPropertyDialogOpen(false)
      setIsConfirmDialogOpen(false)
      setEditingProperty(null)
      setPendingPropertyData(null)
    } catch (error) {
      toast.error(editingProperty ? "Erro ao atualizar imóvel" : "Erro ao criar imóvel")
      console.error(error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmDuplicate = async () => {
    if (pendingPropertyData) {
      await executePropertySave(pendingPropertyData, true)
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
          <Button onClick={handleOpenNewDialog}>
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
                  <span className="font-semibold">Proprietários</span>
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
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[350px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                  </TableRow>
                ))
              ) : properties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-72 text-center">
                    <button
                      onClick={handleOpenNewDialog}
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
                properties.map((property: Property) => {
                  const owners = activeClients?.clients?.filter((client: Client) =>
                    property.ownerIds.includes(client._id)
                  ) || []
                  return (
                    <PropertyRow
                      key={property._id}
                      property={property}
                      owners={owners}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onRowClick={handleRowClick}
                      onNavigateToClient={handleNavigateToClient}
                      onRemoveOwnerRequest={handleRemoveOwnerRequest}
                      isRemovingOwner={isRemovingOwner}
                      removingOwnerId={ownerToRemove?.ownerId ?? null}
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

      {/* Property Dialog */}
      <PropertyDialog
        open={isPropertyDialogOpen}
        onOpenChange={setIsPropertyDialogOpen}
        property={editingProperty}
        onSave={handleSaveProperty}
      />

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
            {pendingPropertyData && (
              <ul className="list-disc list-inside space-y-2">
                <li className="text-sm">
                  <strong>Endereço:</strong> {pendingPropertyData.data.street}, {pendingPropertyData.data.number}
                  {pendingPropertyData.data.complement && `, ${pendingPropertyData.data.complement}`}
                </li>
                <li className="text-sm">
                  <strong>Bairro:</strong> {pendingPropertyData.data.neighborhood}
                </li>
                <li className="text-sm">
                  <strong>CEP:</strong> {formatZipCode(pendingPropertyData.data.zipCode)}
                </li>
              </ul>
            )}
            <p className="mt-6 text-sm text-muted-foreground">
              Deseja realmente criar este imóvel?
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsConfirmDialogOpen(false)
                setPendingPropertyData(null)
              }}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button onClick={handleConfirmDuplicate} disabled={isSubmitting}>
              Sim, criar mesmo assim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Owner Dialog */}
      <AlertDialog open={!!ownerToRemove} onOpenChange={(open) => !open && setOwnerToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <AlertTriangle />
            </AlertDialogMedia>
            <AlertDialogBody>
              <AlertDialogTitle>Remover proprietário</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover <span className="font-medium text-foreground">{ownerToRemove?.ownerName}</span> como proprietário deste imóvel?
              </AlertDialogDescription>
            </AlertDialogBody>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemovingOwner}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveOwnerConfirm}
              disabled={isRemovingOwner}
              variant="destructive"
            >
              {isRemovingOwner ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
