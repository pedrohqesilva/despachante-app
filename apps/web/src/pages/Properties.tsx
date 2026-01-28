import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, useMutation } from "convex/react"
import { propertiesApi, clientsApi } from "@/lib/api"
import { toast } from "sonner"
import { Search, Plus, Building2, X, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EmptyState } from "@/components/ui/empty-state"
import { TablePagination } from "@/components/ui/table-pagination"
import { SortableTableHead, TableHeadPlain } from "@/components/ui/sortable-table-head"
import { TableSkeleton } from "@/components/ui/table-skeleton"
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
  PropertyDialog,
  type PropertyDialogSaveData,
  ExportButton,
  PropertyTableRow,
} from "@/features/properties"
import { formatZipCode } from "@/lib/format"
import { Property, PropertyStatus, PropertyType } from "@/types/property"
import { Client } from "@/types/client"
import { Id } from "@despachante/convex/_generated/dataModel"

type SortField = "address" | "city" | "type" | "area" | "value" | "createdAt" | "status"
type SortOrder = "asc" | "desc"

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
                <SortableTableHead
                  field="type"
                  currentSortField={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                  className="w-[100px]"
                >
                  Tipo
                </SortableTableHead>
                <SortableTableHead
                  field="address"
                  currentSortField={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                >
                  Endereço
                </SortableTableHead>
                <SortableTableHead
                  field="value"
                  currentSortField={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                >
                  Valor
                </SortableTableHead>
                <SortableTableHead
                  field="area"
                  currentSortField={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                >
                  Área
                </SortableTableHead>
                <TableHeadPlain className="w-[120px]">Proprietários</TableHeadPlain>
                <SortableTableHead
                  field="status"
                  currentSortField={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                  className="w-[120px]"
                >
                  Status
                </SortableTableHead>
                <TableHeadPlain className="w-[100px] text-right">Ações</TableHeadPlain>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton
                  columns={[
                    { width: "w-[80px]" },
                    { width: "w-[350px]" },
                    { width: "w-[100px]" },
                    { width: "w-[80px]" },
                    { width: "w-[50px]" },
                    { width: "w-[80px]" },
                    { width: "w-[60px]" },
                  ]}
                />
              ) : properties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <EmptyState
                      icon={Building2}
                      title="Nenhum imóvel encontrado"
                      description="Clique para adicionar um novo imóvel"
                      onClick={handleOpenNewDialog}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                properties.map((property: Property) => {
                  const owners = activeClients?.clients?.filter((client: Client) =>
                    property.ownerIds.includes(client._id)
                  ) || []
                  return (
                    <PropertyTableRow
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

        {!isLoading && totalPages > 0 && (
          <TablePagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={total}
            itemsOnPage={properties.length}
            itemLabel="imóvel(is)"
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
          />
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
