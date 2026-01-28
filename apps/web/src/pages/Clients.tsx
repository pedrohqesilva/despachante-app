import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, useMutation } from "convex/react"
import { clientsApi } from "@/lib/api"
import { Id } from "@despachante/convex/_generated/dataModel"
import { toast } from "sonner"
import { Search, Plus, ArrowUpDown, ArrowUp, ArrowDown, Users, X, User, Loader2, Heart, ChevronDown, Check, UserRound, HeartHandshake, Gem, CircleDashed } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ClientsTableActions } from "@/components/clients/ClientsTableActions"
import { ExportButton } from "@/components/clients/ExportButton"
import { formatTaxId, formatPhone } from "@/lib/format"
import { Client, ClientStatus, MaritalStatus, PropertyRegime } from "@/types/client"
import { cn } from "@/lib/utils"

const MARITAL_STATUS_OPTIONS = [
  { value: "single" as MaritalStatus, icon: UserRound, label: "Solteiro(a)" },
  { value: "common_law_marriage" as MaritalStatus, icon: HeartHandshake, label: "União Estável" },
  { value: "married" as MaritalStatus, icon: Gem, label: "Casado(a)" },
  { value: "widowed" as MaritalStatus, icon: CircleDashed, label: "Viúvo(a)" },
  { value: "divorced" as MaritalStatus, icon: X, label: "Divorciado(a)" },
] as const

const PROPERTY_REGIME_OPTIONS = [
  { value: "partial_communion" as PropertyRegime, label: "Comunhão Parcial de Bens" },
  { value: "total_communion" as PropertyRegime, label: "Comunhão Total de Bens" },
  { value: "total_separation" as PropertyRegime, label: "Separação Total de Bens" },
] as const

const requiresSpouse = (status: string): boolean => {
  return status === "married" || status === "common_law_marriage"
}

type SortField = "name" | "email" | "createdAt" | "status"
type SortOrder = "asc" | "desc"

export default function Clients() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "all">("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState<SortField>("createdAt")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [duplicateFields, setDuplicateFields] = useState<{
    name?: boolean
    email?: boolean
    phone?: boolean
    taxId?: boolean
  }>({})
  const [newClientForm, setNewClientForm] = useState({
    name: "",
    email: "",
    phone: "",
    taxId: "",
    fatherName: "",
    motherName: "",
    maritalStatus: "" as MaritalStatus | "",
    propertyRegime: "" as PropertyRegime | "",
    spouseId: null as Id<"clients"> | null,
  })

  // Estados para seleção de cônjuge
  const [spouseSearch, setSpouseSearch] = useState("")
  const [isSpousePopoverOpen, setIsSpousePopoverOpen] = useState(false)
  const [isCreatingSpouse, setIsCreatingSpouse] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{
    name?: boolean
    email?: boolean
    taxId?: boolean
    phone?: boolean
    maritalStatus?: boolean
    propertyRegime?: boolean
    spouseId?: boolean
  }>({})
  const [spouseForm, setSpouseForm] = useState({
    name: "",
    email: "",
    phone: "",
    taxId: "",
    fatherName: "",
    motherName: "",
  })

  const clientsData = useQuery(
    clientsApi.queries.list,
    {
      page,
      pageSize,
      search: search || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      sortBy,
      sortOrder,
    }
  )

  const deleteClientMutation = useMutation(clientsApi.mutations.deleteClient)
  const createClientMutation = useMutation(clientsApi.mutations.create)
  const updateClientMutation = useMutation(clientsApi.mutations.update)

  const duplicateCheck = useQuery(
    clientsApi.queries.checkDuplicates,
    isNewClientDialogOpen && !editingClient && newClientForm.name.trim() && newClientForm.email.trim() && newClientForm.taxId.trim()
      ? {
        name: newClientForm.name.trim(),
        email: newClientForm.email.trim(),
        phone: newClientForm.phone.trim() || undefined,
        taxId: newClientForm.taxId.replace(/\D/g, ""),
      }
      : "skip"
  )

  // Busca de cônjuge
  const spouseSearchResults = useQuery(
    clientsApi.queries.searchExcluding,
    requiresSpouse(newClientForm.maritalStatus)
      ? {
        query: spouseSearch.trim() || undefined,
        excludeId: editingClient?._id,
      }
      : "skip"
  )

  // Dados do cônjuge selecionado
  const selectedSpouse = useQuery(
    clientsApi.queries.get,
    newClientForm.spouseId ? { id: newClientForm.spouseId } : "skip"
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
    setNewClientForm({
      name: client.name,
      email: client.email,
      phone: client.phone || "",
      taxId: formatTaxId(client.taxId),
      fatherName: client.fatherName || "",
      motherName: client.motherName || "",
      maritalStatus: client.maritalStatus || "",
      propertyRegime: client.propertyRegime || "",
      spouseId: client.spouseId || null,
    })
    setIsNewClientDialogOpen(true)
  }

  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    let formatted = value

    if (cleaned.length <= 2) {
      formatted = cleaned
    } else if (cleaned.length <= 7) {
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`
    } else if (cleaned.length <= 10) {
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
    } else {
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`
    }

    setNewClientForm({ ...newClientForm, phone: formatted })
  }

  const handleTaxIdChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    let formatted = value

    if (cleaned.length <= 11) {
      // CPF
      if (cleaned.length <= 3) {
        formatted = cleaned
      } else if (cleaned.length <= 6) {
        formatted = `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`
      } else if (cleaned.length <= 9) {
        formatted = `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`
      } else {
        formatted = `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`
      }
    } else {
      // CNPJ
      if (cleaned.length <= 2) {
        formatted = cleaned
      } else if (cleaned.length <= 5) {
        formatted = `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`
      } else if (cleaned.length <= 8) {
        formatted = `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`
      } else if (cleaned.length <= 12) {
        formatted = `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8)}`
      } else {
        formatted = `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`
      }
    }

    setNewClientForm({ ...newClientForm, taxId: formatted })
  }

  const handleSpousePhoneChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    let formatted = value

    if (cleaned.length <= 2) {
      formatted = cleaned
    } else if (cleaned.length <= 7) {
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`
    } else if (cleaned.length <= 10) {
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
    } else {
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`
    }

    setSpouseForm({ ...spouseForm, phone: formatted })
  }

  const handleSpouseTaxIdChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    let formatted = value

    if (cleaned.length <= 11) {
      if (cleaned.length <= 3) {
        formatted = cleaned
      } else if (cleaned.length <= 6) {
        formatted = `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`
      } else if (cleaned.length <= 9) {
        formatted = `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`
      } else {
        formatted = `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`
      }
    } else {
      if (cleaned.length <= 2) {
        formatted = cleaned
      } else if (cleaned.length <= 5) {
        formatted = `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`
      } else if (cleaned.length <= 8) {
        formatted = `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`
      } else if (cleaned.length <= 12) {
        formatted = `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8)}`
      } else {
        formatted = `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`
      }
    }

    setSpouseForm({ ...spouseForm, taxId: formatted })
  }

  const handleSelectSpouse = (clientId: Id<"clients">) => {
    setNewClientForm({ ...newClientForm, spouseId: clientId })
    setSpouseForm({ name: "", email: "", phone: "", taxId: "", fatherName: "", motherName: "" })
    setIsSpousePopoverOpen(false)
    setSpouseSearch("")
    if (fieldErrors.spouseId) {
      setFieldErrors({ ...fieldErrors, spouseId: false })
    }
  }

  const handleAddSpouse = () => {
    if (!spouseForm.name.trim() || !spouseForm.email.trim() || !spouseForm.taxId.trim()) {
      toast.error("Preencha todos os campos obrigatórios do cônjuge")
      return
    }

    // Limpa spouseId existente pois estamos criando um novo
    setNewClientForm({ ...newClientForm, spouseId: null })
    setIsCreatingSpouse(false)
    if (fieldErrors.spouseId) {
      setFieldErrors({ ...fieldErrors, spouseId: false })
    }
    toast.success("Cônjuge adicionado. Será criado ao salvar o cliente.")
  }

  const handleCreateClient = async (skipDuplicateCheck?: boolean) => {
    const shouldSkipCheck = skipDuplicateCheck ?? false

    // Validação de campos obrigatórios
    const errors: typeof fieldErrors = {}
    if (!newClientForm.name.trim()) errors.name = true
    if (!newClientForm.email.trim()) errors.email = true
    if (!newClientForm.taxId.trim()) errors.taxId = true
    if (!newClientForm.phone.trim()) errors.phone = true
    if (!newClientForm.maritalStatus) errors.maritalStatus = true

    // Validação condicional para estado civil que requer cônjuge
    if (requiresSpouse(newClientForm.maritalStatus)) {
      if (!newClientForm.propertyRegime) errors.propertyRegime = true
      if (!newClientForm.spouseId && !spouseForm.name.trim()) errors.spouseId = true
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    setFieldErrors({})

    // Check for duplicates if creating new client
    if (!editingClient && !shouldSkipCheck && duplicateCheck) {
      const hasDuplicates =
        duplicateCheck.name || duplicateCheck.email || duplicateCheck.phone || duplicateCheck.taxId

      if (hasDuplicates) {
        setDuplicateFields(duplicateCheck)
        setIsConfirmDialogOpen(true)
        return
      }
    }

    try {
      let finalSpouseId = newClientForm.spouseId

      // Se há um novo cônjuge para criar (spouseForm preenchido e sem spouseId selecionado)
      if (spouseForm.name.trim() && !newClientForm.spouseId && requiresSpouse(newClientForm.maritalStatus)) {
        const newSpouseId = await createClientMutation({
          name: spouseForm.name.trim(),
          email: spouseForm.email.trim(),
          phone: spouseForm.phone.replace(/\D/g, "") || undefined,
          taxId: spouseForm.taxId.replace(/\D/g, ""),
          status: "active",
          fatherName: spouseForm.fatherName.trim() || undefined,
          motherName: spouseForm.motherName.trim() || undefined,
          maritalStatus: newClientForm.maritalStatus as MaritalStatus,
          propertyRegime: newClientForm.propertyRegime || undefined,
        })
        finalSpouseId = newSpouseId
      }

      if (editingClient) {
        // Update existing client
        const spouseChanged = finalSpouseId !== editingClient.spouseId
        const spouseRemoved = !finalSpouseId && !spouseForm.name.trim() && !!editingClient.spouseId

        await updateClientMutation({
          id: editingClient._id,
          name: newClientForm.name.trim(),
          email: newClientForm.email.trim(),
          phone: newClientForm.phone.replace(/\D/g, ""),
          taxId: newClientForm.taxId.replace(/\D/g, ""),
          fatherName: newClientForm.fatherName.trim() || undefined,
          motherName: newClientForm.motherName.trim() || undefined,
          maritalStatus: newClientForm.maritalStatus || undefined,
          propertyRegime: newClientForm.propertyRegime || undefined,
          spouseId: spouseChanged ? finalSpouseId || undefined : undefined,
          removeSpouse: spouseRemoved,
        })
        toast.success("Cliente atualizado com sucesso")
      } else {
        // Create new client
        await createClientMutation({
          name: newClientForm.name.trim(),
          email: newClientForm.email.trim(),
          phone: newClientForm.phone.replace(/\D/g, ""),
          taxId: newClientForm.taxId.replace(/\D/g, ""),
          status: "active",
          fatherName: newClientForm.fatherName.trim() || undefined,
          motherName: newClientForm.motherName.trim() || undefined,
          maritalStatus: newClientForm.maritalStatus || undefined,
          propertyRegime: newClientForm.propertyRegime || undefined,
          spouseId: finalSpouseId || undefined,
        })
        toast.success("Cliente criado com sucesso")
      }
      setIsNewClientDialogOpen(false)
      setIsConfirmDialogOpen(false)
      setEditingClient(null)
      setDuplicateFields({})
      setFieldErrors({})
      setNewClientForm({
        name: "",
        email: "",
        phone: "",
        taxId: "",
        fatherName: "",
        motherName: "",
        maritalStatus: "",
        propertyRegime: "",
        spouseId: null,
      })
      setSpouseForm({ name: "", email: "", phone: "", taxId: "", fatherName: "", motherName: "" })
      setSpouseSearch("")
    } catch (error) {
      toast.error(editingClient ? "Erro ao atualizar cliente" : "Erro ao criar cliente")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadgeVariant = (status: ClientStatus) => {
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

  const getStatusBadgeClassName = (status: ClientStatus) => {
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

  const getStatusLabel = (status: ClientStatus) => {
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

  const isLoading = clientsData === undefined
  const clients = clientsData?.clients ?? []
  const total = clientsData?.total ?? 0
  const totalPages = clientsData?.totalPages ?? 0

  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b backdrop-blur">
        <div className="px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie os clientes da sua empresa.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingClient(null)
              setNewClientForm({
                name: "",
                email: "",
                phone: "",
                taxId: "",
                fatherName: "",
                motherName: "",
                maritalStatus: "",
                propertyRegime: "",
                spouseId: null,
              })
              setSpouseSearch("")
              setIsNewClientDialogOpen(true)
            }}
          >
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
                <TableHead className="w-[400px]">
                  <button
                    onClick={() => handleSort("name")}
                    className="flex items-center hover:text-foreground cursor-pointer font-semibold"
                  >
                    Nome
                    <SortIcon field="name" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("email")}
                    className="flex items-center hover:text-foreground cursor-pointer font-semibold"
                  >
                    Email
                    <SortIcon field="email" />
                  </button>
                </TableHead>
                <TableHead className="font-semibold">Telefone</TableHead>
                <TableHead className="font-semibold">CPF/CNPJ</TableHead>
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
                      <Skeleton className="h-4 w-[200px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[180px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[120px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[140px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[60px]" />
                    </TableCell>
                  </TableRow>
                ))
              ) : clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-72 text-center">
                    <button
                      onClick={() => setIsNewClientDialogOpen(true)}
                      className="flex flex-col items-center justify-center gap-3 w-full h-full group cursor-pointer"
                    >
                      <div className="size-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/15 group-hover:border-primary/30 transition-colors">
                        <Users className="size-8 text-primary" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-text-secondary group-hover:text-text-primary transition-colors">
                          Nenhum cliente encontrado
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Clique para adicionar um novo cliente
                        </p>
                      </div>
                    </button>
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
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
                        variant={getStatusBadgeVariant(client.status)}
                        className={getStatusBadgeClassName(client.status)}
                      >
                        {getStatusLabel(client.status)}
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

        {/* Pagination */}
        {!isLoading && totalPages > 0 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Mostrando {clients.length} de {total} cliente(s)
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

      {/* New Client Dialog */}
      <Dialog
        open={isNewClientDialogOpen}
        onOpenChange={(open) => {
          setIsNewClientDialogOpen(open)
          if (!open) {
            setEditingClient(null)
            setFieldErrors({})
            setNewClientForm({
              name: "",
              email: "",
              phone: "",
              taxId: "",
              fatherName: "",
              motherName: "",
              maritalStatus: "",
              propertyRegime: "",
              spouseId: null,
            })
            setSpouseForm({ name: "", email: "", phone: "", taxId: "", fatherName: "", motherName: "" })
            setSpouseSearch("")
            setIsSpousePopoverOpen(false)
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-gap p-6 border-b border-border/50">
            <div className="size-icon-container-md rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <User className="size-icon-md text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold">
                {editingClient ? "Editar Cliente" : "Novo Cliente"}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                {editingClient
                  ? "Atualize os dados do cliente selecionado"
                  : "Preencha os dados para cadastrar um novo cliente"}
              </DialogDescription>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Personal Data Section */}
            <div className="space-y-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Dados Pessoais</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Nome <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Nome completo"
                    value={newClientForm.name}
                    onChange={(e) => {
                      setNewClientForm({ ...newClientForm, name: e.target.value })
                      if (fieldErrors.name) {
                        setFieldErrors({ ...fieldErrors, name: false })
                      }
                    }}
                    autoComplete="off"
                    className="h-10"
                    aria-invalid={fieldErrors.name}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId" className="text-sm font-medium">
                    CPF/CNPJ <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="taxId"
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                    value={newClientForm.taxId}
                    onChange={(e) => {
                      handleTaxIdChange(e.target.value)
                      if (fieldErrors.taxId) {
                        setFieldErrors({ ...fieldErrors, taxId: false })
                      }
                    }}
                    autoComplete="off"
                    maxLength={18}
                    className="h-10"
                    aria-invalid={fieldErrors.taxId}
                  />
                </div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Filiação</p>
                <div className="space-y-2">
                  <Label htmlFor="motherName" className="text-sm font-medium">
                    Nome da Mãe
                  </Label>
                  <Input
                    id="motherName"
                    placeholder="Nome completo da mãe"
                    value={newClientForm.motherName}
                    onChange={(e) =>
                      setNewClientForm({ ...newClientForm, motherName: e.target.value })
                    }
                    autoComplete="off"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fatherName" className="text-sm font-medium">
                    Nome do Pai
                  </Label>
                  <Input
                    id="fatherName"
                    placeholder="Nome completo do pai"
                    value={newClientForm.fatherName}
                    onChange={(e) =>
                      setNewClientForm({ ...newClientForm, fatherName: e.target.value })
                    }
                    autoComplete="off"
                    className="h-10"
                  />
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="space-y-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contato</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={newClientForm.email}
                    onChange={(e) => {
                      setNewClientForm({ ...newClientForm, email: e.target.value })
                      if (fieldErrors.email) {
                        setFieldErrors({ ...fieldErrors, email: false })
                      }
                    }}
                    autoComplete="off"
                    className="h-10"
                    aria-invalid={fieldErrors.email}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Telefone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    placeholder="(00) 00000-0000"
                    value={newClientForm.phone}
                    onChange={(e) => {
                      handlePhoneChange(e.target.value)
                      if (fieldErrors.phone) {
                        setFieldErrors({ ...fieldErrors, phone: false })
                      }
                    }}
                    autoComplete="off"
                    maxLength={15}
                    className="h-10"
                    aria-invalid={fieldErrors.phone}
                  />
                </div>
              </div>
            </div>

            {/* Marital Status Section */}
            <div className="space-y-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Estado Civil <span className="text-destructive">*</span>
              </p>
              <div className="space-y-4">
                <div className={cn(
                  "grid grid-cols-5 gap-2 p-1 rounded-xl transition-all duration-200",
                  fieldErrors.maritalStatus && "bg-destructive/5 ring-1 ring-destructive/20"
                )}>
                  {MARITAL_STATUS_OPTIONS.map(({ value, icon: Icon, label }) => {
                    const isSelected = newClientForm.maritalStatus === value
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setNewClientForm({
                            ...newClientForm,
                            maritalStatus: value,
                            propertyRegime: requiresSpouse(value)
                              ? (newClientForm.propertyRegime || "partial_communion")
                              : "",
                            spouseId: requiresSpouse(value) ? newClientForm.spouseId : null,
                          })
                          if (fieldErrors.maritalStatus) {
                            setFieldErrors({ ...fieldErrors, maritalStatus: false })
                          }
                          if (!requiresSpouse(value)) {
                            setSpouseForm({ name: "", email: "", phone: "", taxId: "", fatherName: "", motherName: "" })
                          }
                        }}
                        className={cn(
                          "relative flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl text-center transition-all cursor-pointer aspect-square",
                          isSelected
                            ? "border-2 border-primary bg-primary/10 shadow-sm"
                            : "border border-border bg-accent/50 hover:bg-accent hover:border-muted-foreground/30"
                        )}
                      >
                        <div
                          className={cn(
                            "size-8 rounded-lg flex items-center justify-center transition-colors",
                            isSelected
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-background border border-border text-text-tertiary"
                          )}
                        >
                          <Icon className="size-4" />
                        </div>
                        <p
                          className={cn(
                            "text-xs font-medium leading-tight",
                            isSelected ? "text-text-primary" : "text-text-secondary"
                          )}
                        >
                          {label}
                        </p>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 size-4 rounded-full bg-primary flex items-center justify-center">
                            <Check className="size-2.5 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Property Regime Selection */}
                {requiresSpouse(newClientForm.maritalStatus) && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Regime de Bens <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={newClientForm.propertyRegime}
                      onValueChange={(value) => {
                        setNewClientForm({ ...newClientForm, propertyRegime: value as PropertyRegime })
                        if (fieldErrors.propertyRegime) {
                          setFieldErrors({ ...fieldErrors, propertyRegime: false })
                        }
                      }}
                    >
                      <SelectTrigger
                        className="w-full h-10"
                        aria-invalid={fieldErrors.propertyRegime}
                      >
                        <SelectValue placeholder="Selecione o regime de bens" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROPERTY_REGIME_OPTIONS.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Spouse Selection */}
                {requiresSpouse(newClientForm.maritalStatus) && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Cônjuge <span className="text-destructive">*</span>
                    </Label>

                    {/* Spouse Search Popover - Hidden when spouse is selected */}
                    {!selectedSpouse && !spouseForm.name && (
                      <Popover open={isSpousePopoverOpen} onOpenChange={setIsSpousePopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between h-10"
                            type="button"
                            aria-invalid={fieldErrors.spouseId}
                          >
                            <span className="text-muted-foreground">
                              Selecione o cônjuge
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0" align="start" sideOffset={-40} style={{ width: 'var(--radix-popover-trigger-width)', minWidth: '300px' }}>
                          <div className="flex items-center border-b px-3">
                            <Search className="h-4 w-4 shrink-0 opacity-50" />
                            <Input
                              placeholder="Buscar cliente..."
                              value={spouseSearch}
                              onChange={(e) => setSpouseSearch(e.target.value)}
                              className="h-10 border-0 bg-transparent dark:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
                              autoComplete="off"
                            />
                          </div>
                          <div className="max-h-[300px] overflow-y-auto">
                            {/* Ação: Criar novo */}
                            <div className="p-1">
                              <div
                                className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent cursor-pointer"
                                onClick={() => {
                                  setIsSpousePopoverOpen(false)
                                  setIsCreatingSpouse(true)
                                }}
                              >
                                <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center">
                                  <Plus className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">Criar novo cliente</p>
                                  <p className="text-xs text-muted-foreground">Adicionar como cônjuge</p>
                                </div>
                              </div>
                            </div>

                            {/* Separador com label */}
                            <div className="px-2 py-1.5">
                              <p className="text-xs font-medium text-muted-foreground px-2">Clientes existentes</p>
                            </div>

                            {/* Lista de resultados */}
                            <div className="p-1 pt-0">
                              {spouseSearchResults === undefined ? (
                                <div className="flex items-center justify-center py-6">
                                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                </div>
                              ) : spouseSearchResults.length === 0 ? (
                                <p className="py-6 text-center text-sm text-muted-foreground">
                                  Nenhum cliente encontrado.
                                </p>
                              ) : (
                                spouseSearchResults.map((client) => {
                                  const isSelected = newClientForm.spouseId === client._id
                                  const hasSpouse = !!client.spouseId
                                  return (
                                    <div
                                      key={client._id}
                                      className={cn(
                                        "flex items-center gap-2 px-2 py-2 rounded-md",
                                        hasSpouse
                                          ? "opacity-50 cursor-not-allowed"
                                          : "hover:bg-accent cursor-pointer"
                                      )}
                                      onClick={() => !hasSpouse && handleSelectSpouse(client._id)}
                                    >
                                      <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                        <span className="text-xs font-medium">
                                          {client.name.charAt(0).toUpperCase()}
                                        </span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{client.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {hasSpouse ? "Já possui cônjuge vinculado" : formatTaxId(client.taxId)}
                                        </p>
                                      </div>
                                      {hasSpouse && (
                                        <Heart className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                                      )}
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
                    )}

                    {/* Selected Spouse Card - Existing Client */}
                    {selectedSpouse && !spouseForm.name && (
                      <div className="rounded-xl border border-border/50 overflow-hidden">
                        <div className="group flex items-center gap-3 px-3 py-2.5 bg-accent/30 hover:bg-accent/60 transition-colors">
                          <div className="size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                            <span className="text-sm font-semibold text-primary">
                              {selectedSpouse.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary truncate">
                              {selectedSpouse.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatTaxId(selectedSpouse.taxId)}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                            onClick={() => setNewClientForm({ ...newClientForm, spouseId: null })}
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* New Spouse Card - Pending Creation */}
                    {spouseForm.name && !newClientForm.spouseId && (
                      <div className="rounded-xl border border-border/50 overflow-hidden">
                        <div className="group flex items-center gap-3 px-3 py-2.5 bg-status-warning-muted/30 hover:bg-status-warning-muted/50 transition-colors">
                          <div className="size-8 rounded-full bg-status-warning-muted border border-status-warning-border flex items-center justify-center shrink-0">
                            <span className="text-sm font-semibold text-status-warning-foreground">
                              {spouseForm.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary truncate">
                              {spouseForm.name}
                              <span className="ml-2 text-xs text-status-warning-foreground">(novo)</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {spouseForm.taxId ? formatTaxId(spouseForm.taxId.replace(/\D/g, "")) : "CPF não informado"}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                            onClick={() => setSpouseForm({ name: "", email: "", phone: "", taxId: "", fatherName: "", motherName: "" })}
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border/50">
            <Button
              variant="outline"
              onClick={() => setIsNewClientDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button onClick={() => handleCreateClient()} disabled={isSubmitting}>
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
            <DialogTitle>Cliente com dados duplicados</DialogTitle>
            <DialogDescription>
              Foi encontrado um cliente existente com os seguintes dados:
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <ul className="list-disc list-inside space-y-2">
              {duplicateFields.name && (
                <li className="text-sm">
                  <strong>Nome:</strong> {newClientForm.name}
                </li>
              )}
              {duplicateFields.email && (
                <li className="text-sm">
                  <strong>Email:</strong> {newClientForm.email}
                </li>
              )}
              {duplicateFields.phone && (
                <li className="text-sm">
                  <strong>Telefone:</strong> {newClientForm.phone || "Não informado"}
                </li>
              )}
              {duplicateFields.taxId && (
                <li className="text-sm">
                  <strong>CPF/CNPJ:</strong> {newClientForm.taxId}
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
                setDuplicateFields({})
              }}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => handleCreateClient(true)}
              disabled={isSubmitting}
            >
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

      {/* Create Spouse Dialog */}
      <Dialog open={isCreatingSpouse} onOpenChange={setIsCreatingSpouse}>
        <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
          <div className="flex items-center gap-gap p-6 border-b border-border/50">
            <div className="size-icon-container-md rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Heart className="size-icon-md text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold">
                Novo Cônjuge
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                Cadastre um novo cliente que será definido como cônjuge
              </DialogDescription>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {/* Dados Pessoais */}
            <div className="space-y-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Dados Pessoais</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="spouseName" className="text-sm font-medium">
                    Nome <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="spouseName"
                    value={spouseForm.name}
                    onChange={(e) => setSpouseForm({ ...spouseForm, name: e.target.value })}
                    placeholder="Nome completo"
                    autoComplete="off"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spouseTaxId" className="text-sm font-medium">
                    CPF/CNPJ <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="spouseTaxId"
                    value={spouseForm.taxId}
                    onChange={(e) => handleSpouseTaxIdChange(e.target.value)}
                    placeholder="000.000.000-00"
                    autoComplete="off"
                    maxLength={18}
                    className="h-10"
                  />
                </div>
              </div>
            </div>

            {/* Filiação */}
            <div className="space-y-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Filiação</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="spouseMotherName" className="text-sm font-medium">
                    Nome da Mãe
                  </Label>
                  <Input
                    id="spouseMotherName"
                    value={spouseForm.motherName}
                    onChange={(e) => setSpouseForm({ ...spouseForm, motherName: e.target.value })}
                    placeholder="Nome completo da mãe"
                    autoComplete="off"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spouseFatherName" className="text-sm font-medium">
                    Nome do Pai
                  </Label>
                  <Input
                    id="spouseFatherName"
                    value={spouseForm.fatherName}
                    onChange={(e) => setSpouseForm({ ...spouseForm, fatherName: e.target.value })}
                    placeholder="Nome completo do pai"
                    autoComplete="off"
                    className="h-10"
                  />
                </div>
              </div>
            </div>

            {/* Contato */}
            <div className="space-y-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contato</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="spouseEmail" className="text-sm font-medium">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="spouseEmail"
                    type="email"
                    value={spouseForm.email}
                    onChange={(e) => setSpouseForm({ ...spouseForm, email: e.target.value })}
                    placeholder="email@exemplo.com"
                    autoComplete="off"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spousePhone" className="text-sm font-medium">Telefone</Label>
                  <Input
                    id="spousePhone"
                    value={spouseForm.phone}
                    onChange={(e) => handleSpousePhoneChange(e.target.value)}
                    placeholder="(00) 00000-0000"
                    autoComplete="off"
                    maxLength={15}
                    className="h-10"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border/50">
            <Button variant="outline" onClick={() => {
              setIsCreatingSpouse(false)
              setSpouseForm({ name: "", email: "", phone: "", taxId: "", fatherName: "", motherName: "" })
            }} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleAddSpouse} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Adicionando...
                </>
              ) : (
                "Adicionar"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
