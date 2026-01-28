import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, useMutation } from "convex/react"
import { clientsApi } from "@/lib/api"
import { toast } from "sonner"
import { Search, Plus, Users, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EmptyState } from "@/components/ui/empty-state"
import { TablePagination } from "@/components/ui/table-pagination"
import { SortableTableHead, TableHeadPlain } from "@/components/ui/sortable-table-head"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import {
  ClientDialog,
  type ClientDialogSaveData,
  type ClientSubmitData,
  type SpouseFormData,
  ClientsTableActions,
  ExportButton,
} from "@/features/clients"
import { formatTaxId, formatPhone } from "@/lib/format"
import {
  requiresSpouse,
  getClientStatusLabel,
  getClientStatusBadgeVariant,
  getClientStatusBadgeClassName,
} from "@/lib/constants"
import type { Client, ClientStatus } from "@/types/client"

type SortField = "name" | "email" | "createdAt" | "status"
type SortOrder = "asc" | "desc"

export default function Clients() {
  const navigate = useNavigate()

  // Table state
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "all">("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState<SortField>("createdAt")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  // Dialog state
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [pendingSaveData, setPendingSaveData] = useState<{
    clientData: ClientSubmitData
    spouseData?: SpouseFormData
  } | null>(null)
  const [duplicateFields, setDuplicateFields] = useState<{
    name?: boolean
    email?: boolean
    phone?: boolean
    taxId?: boolean
  }>({})

  // Queries
  const clientsData = useQuery(clientsApi.queries.list, {
    page,
    pageSize,
    search: search || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    sortBy,
    sortOrder,
  })

  // Mutations
  const deleteClientMutation = useMutation(clientsApi.mutations.deleteClient)
  const createClientMutation = useMutation(clientsApi.mutations.create)
  const updateClientMutation = useMutation(clientsApi.mutations.update)

  // Duplicate check
  const duplicateCheck = useQuery(
    clientsApi.queries.checkDuplicates,
    pendingSaveData && !editingClient
      ? {
          name: (pendingSaveData.clientData.name as string) || "",
          email: (pendingSaveData.clientData.email as string) || "",
          phone: (pendingSaveData.clientData.phone as string) || undefined,
          taxId: (pendingSaveData.clientData.taxId as string) || "",
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

  const handleDelete = async (client: Client) => {
    try {
      await deleteClientMutation({ id: client._id })
      toast.success("Cliente excluído com sucesso")
    } catch (error) {
      toast.error("Erro ao excluir cliente")
      console.error(error)
    }
  }

  const handleView = (client: Client) => {
    navigate(`/clientes/${client._id}`)
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setIsClientDialogOpen(true)
  }

  const handleOpenNewClient = () => {
    setEditingClient(null)
    setIsClientDialogOpen(true)
  }

  const handleSaveClient = async ({
    clientData,
    spouseData,
    isEditing,
  }: ClientDialogSaveData) => {
    // Check for duplicates if creating new client
    if (!isEditing) {
      setPendingSaveData({ clientData, spouseData })

      // Wait for duplicate check
      if (duplicateCheck) {
        const hasDuplicates =
          duplicateCheck.name || duplicateCheck.email || duplicateCheck.phone || duplicateCheck.taxId

        if (hasDuplicates) {
          setDuplicateFields(duplicateCheck)
          setIsConfirmDialogOpen(true)
          return
        }
      }
    }

    await executeSave(clientData, spouseData, isEditing)
  }

  const executeSave = async (
    clientData: ClientSubmitData,
    spouseData?: SpouseFormData,
    isEditing = false
  ) => {
    try {
      let finalSpouseId = clientData.spouseId

      // Create spouse if needed
      if (spouseData && requiresSpouse(clientData.maritalStatus || "")) {
        const newSpouseId = await createClientMutation({
          name: spouseData.name,
          email: spouseData.email,
          phone: spouseData.phone || undefined,
          taxId: spouseData.taxId,
          status: "active",
          fatherName: spouseData.fatherName || undefined,
          motherName: spouseData.motherName || undefined,
          maritalStatus: clientData.maritalStatus,
          propertyRegime: clientData.propertyRegime,
        })
        finalSpouseId = newSpouseId
      }

      if (isEditing && editingClient) {
        const spouseChanged = finalSpouseId !== editingClient.spouseId
        const spouseRemoved = !finalSpouseId && !spouseData && !!editingClient.spouseId

        await updateClientMutation({
          id: editingClient._id,
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          taxId: clientData.taxId,
          fatherName: clientData.fatherName,
          motherName: clientData.motherName,
          maritalStatus: clientData.maritalStatus,
          propertyRegime: clientData.propertyRegime,
          spouseId: spouseChanged ? finalSpouseId || undefined : undefined,
          removeSpouse: spouseRemoved,
        })
        toast.success("Cliente atualizado com sucesso")
      } else {
        await createClientMutation({
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          taxId: clientData.taxId,
          status: "active",
          fatherName: clientData.fatherName,
          motherName: clientData.motherName,
          maritalStatus: clientData.maritalStatus,
          propertyRegime: clientData.propertyRegime,
          spouseId: finalSpouseId || undefined,
        })
        toast.success("Cliente criado com sucesso")
      }

      setIsClientDialogOpen(false)
      setIsConfirmDialogOpen(false)
      setEditingClient(null)
      setPendingSaveData(null)
      setDuplicateFields({})
    } catch (error) {
      toast.error(isEditing ? "Erro ao atualizar cliente" : "Erro ao criar cliente")
      throw error
    }
  }

  const handleConfirmDuplicate = async () => {
    if (!pendingSaveData) return
    await executeSave(pendingSaveData.clientData, pendingSaveData.spouseData, false)
  }

  const isLoading = clientsData === undefined
  const clients = clientsData?.clients ?? []
  const total = clientsData?.total ?? 0
  const totalPages = clientsData?.totalPages ?? 0

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b backdrop-blur">
        <div className="px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie os clientes da sua empresa.
            </p>
          </div>
          <Button onClick={handleOpenNewClient}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>
      </div>

      <div className="flex-1 space-y-4 p-6">
        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, telefone ou CPF/CNPJ..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-9 pr-9"
              autoComplete="off"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("")
                  setPage(1)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                type="button"
                aria-label="Limpar busca"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value as ClientStatus | "all")
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
          <ExportButton clients={clients} disabled={isLoading} />
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <SortableTableHead
                  field="name"
                  currentSortField={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                  className="w-[400px]"
                >
                  Nome
                </SortableTableHead>
                <SortableTableHead
                  field="email"
                  currentSortField={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                >
                  Email
                </SortableTableHead>
                <TableHeadPlain>Telefone</TableHeadPlain>
                <TableHeadPlain>CPF/CNPJ</TableHeadPlain>
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
                    { width: "w-[200px]" },
                    { width: "w-[180px]" },
                    { width: "w-[120px]" },
                    { width: "w-[140px]" },
                    { width: "w-[80px]" },
                    { width: "w-[60px]" },
                  ]}
                />
              ) : clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState
                      icon={Users}
                      title="Nenhum cliente encontrado"
                      description="Clique para adicionar um novo cliente"
                      onClick={handleOpenNewClient}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client: Client) => (
                  <TableRow
                    key={client._id}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => navigate(`/clientes/${client._id}`)}
                  >
                    <TableCell className="font-semibold text-text-primary">{client.name}</TableCell>
                    <TableCell className="text-text-secondary">{client.email}</TableCell>
                    <TableCell className="text-text-tertiary">
                      {client.phone ? formatPhone(client.phone) : "-"}
                    </TableCell>
                    <TableCell className="text-text-tertiary">{formatTaxId(client.taxId)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={getClientStatusBadgeVariant(client.status)}
                        className={getClientStatusBadgeClassName(client.status)}
                      >
                        {getClientStatusLabel(client.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <ClientsTableActions
                        client={client}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    </TableCell>
                  </TableRow>
                ))
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
            itemsOnPage={clients.length}
            itemLabel="cliente(s)"
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
          />
        )}
      </div>

      {/* Client Dialog */}
      <ClientDialog
        open={isClientDialogOpen}
        onOpenChange={(open) => {
          setIsClientDialogOpen(open)
          if (!open) setEditingClient(null)
        }}
        client={editingClient}
        onSave={handleSaveClient}
      />

      {/* Confirm Duplicate Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Cliente com dados duplicados</DialogTitle>
            <DialogDescription>
              Foi encontrado um cliente existente com os seguintes dados:
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <ul className="list-disc list-inside space-y-2">
              {duplicateFields.name && (
                <li className="text-sm">
                  <strong>Nome:</strong> {pendingSaveData?.clientData.name as string}
                </li>
              )}
              {duplicateFields.email && (
                <li className="text-sm">
                  <strong>Email:</strong> {pendingSaveData?.clientData.email as string}
                </li>
              )}
              {duplicateFields.phone && (
                <li className="text-sm">
                  <strong>Telefone:</strong> {pendingSaveData?.clientData.phone as string || "Não informado"}
                </li>
              )}
              {duplicateFields.taxId && (
                <li className="text-sm">
                  <strong>CPF/CNPJ:</strong> {pendingSaveData?.clientData.taxId as string}
                </li>
              )}
            </ul>
            <p className="mt-6 text-sm text-muted-foreground">
              Deseja realmente criar este cliente?
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsConfirmDialogOpen(false)
                setPendingSaveData(null)
                setDuplicateFields({})
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleConfirmDuplicate}>
              Sim, criar mesmo assim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
