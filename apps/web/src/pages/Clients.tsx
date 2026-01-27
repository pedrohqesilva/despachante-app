import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { toast } from "sonner"
import { Search, Plus, ArrowUpDown, ArrowUp, ArrowDown, Users, X } from "lucide-react"
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
import { ClientsTableActions } from "@/components/clients/ClientsTableActions"
import { ExportButton } from "@/components/clients/ExportButton"
import { formatTaxId, formatPhone } from "@/lib/format"
import { Client, ClientStatus } from "@/types/client"

type SortField = "name" | "email" | "createdAt" | "status"
type SortOrder = "asc" | "desc"

export default function Clients() {
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
  })

  const clientsData = useQuery(
    api.clients.list,
    {
      page,
      pageSize,
      search: search || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      sortBy,
      sortOrder,
    }
  )

  const deleteClientMutation = useMutation(api.clients.deleteClient)
  const createClientMutation = useMutation(api.clients.create)
  const updateClientMutation = useMutation(api.clients.update)

  const duplicateCheck = useQuery(
    api.clients.checkDuplicates,
    isNewClientDialogOpen && !editingClient && newClientForm.name.trim() && newClientForm.email.trim() && newClientForm.taxId.trim()
      ? {
        name: newClientForm.name.trim(),
        email: newClientForm.email.trim(),
        phone: newClientForm.phone.trim() || undefined,
        taxId: newClientForm.taxId.replace(/\D/g, ""),
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
    toast.info(`Visualizando cliente: ${client.name}`)
    // TODO: Implementar modal de visualização
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setNewClientForm({
      name: client.name,
      email: client.email,
      phone: client.phone || "",
      taxId: formatTaxId(client.taxId),
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

  const handleCreateClient = async (skipDuplicateCheck?: boolean) => {
    const shouldSkipCheck = skipDuplicateCheck ?? false
    if (!newClientForm.name.trim() || !newClientForm.email.trim() || !newClientForm.taxId.trim()) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

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
      if (editingClient) {
        // Update existing client
        await updateClientMutation({
          id: editingClient._id,
          name: newClientForm.name.trim(),
          email: newClientForm.email.trim(),
          phone: newClientForm.phone.replace(/\D/g, "") || undefined,
          taxId: newClientForm.taxId.replace(/\D/g, ""),
        })
        toast.success("Cliente atualizado com sucesso")
      } else {
        // Create new client
        await createClientMutation({
          name: newClientForm.name.trim(),
          email: newClientForm.email.trim(),
          phone: newClientForm.phone.replace(/\D/g, "") || undefined,
          taxId: newClientForm.taxId.replace(/\D/g, ""),
          status: "pending",
        })
        toast.success("Cliente criado com sucesso")
      }
      setIsNewClientDialogOpen(false)
      setIsConfirmDialogOpen(false)
      setEditingClient(null)
      setDuplicateFields({})
      setNewClientForm({
        name: "",
        email: "",
        phone: "",
        taxId: "",
      })
    } catch (error) {
      toast.error(editingClient ? "Erro ao atualizar cliente" : "Erro ao criar cliente")
      console.error(error)
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
        return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-medium"
      case "inactive":
        return "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/30 font-medium"
      case "pending":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 font-medium"
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
              })
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
              placeholder="Buscar por nome, email, telefone ou CPF/CNPJ..."
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
                        <p className="text-base font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
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
                  <TableRow key={client._id} className="hover:bg-muted/50">
                    <TableCell className="font-semibold text-foreground">{client.name}</TableCell>
                    <TableCell className="text-foreground/80">{client.email}</TableCell>
                    <TableCell className="text-foreground/70">
                      {client.phone ? formatPhone(client.phone) : "-"}
                    </TableCell>
                    <TableCell className="text-foreground/70">{formatTaxId(client.taxId)}</TableCell>
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
            setNewClientForm({
              name: "",
              email: "",
              phone: "",
              taxId: "",
            })
          }
        }}
      >
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
            <DialogDescription>
              {editingClient
                ? "Atualize os dados do cliente"
                : "Preencha os dados para cadastrar um novo cliente"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Nome <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Nome completo"
                value={newClientForm.name}
                onChange={(e) =>
                  setNewClientForm({ ...newClientForm, name: e.target.value })
                }
                autoComplete="off"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={newClientForm.email}
                onChange={(e) =>
                  setNewClientForm({ ...newClientForm, email: e.target.value })
                }
                autoComplete="off"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                placeholder="(00) 00000-0000"
                value={newClientForm.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                autoComplete="off"
                maxLength={15}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="taxId">
                CPF/CNPJ <span className="text-destructive">*</span>
              </Label>
              <Input
                id="taxId"
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                value={newClientForm.taxId}
                onChange={(e) => handleTaxIdChange(e.target.value)}
                autoComplete="off"
                maxLength={18}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewClientDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={() => handleCreateClient()}>
              Salvar
            </Button>
          </DialogFooter>
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
            >
              Cancelar
            </Button>
            <Button
              onClick={() => handleCreateClient(true)}
            >
              Sim, criar mesmo assim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
