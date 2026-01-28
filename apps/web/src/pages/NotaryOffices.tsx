import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { notaryOfficesApi } from "@/lib/api"
import { toast } from "sonner"
import { Search, Plus, ArrowUpDown, ArrowUp, ArrowDown, Building2, X } from "lucide-react"
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
  NotaryOfficeDialog,
  type NotaryOfficeDialogSaveData,
  NotaryOfficesTableActions,
} from "@/features/notary-offices"
import {
  getNotaryOfficeStatusLabel,
  getNotaryOfficeStatusBadgeVariant,
  getNotaryOfficeStatusBadgeClassName,
} from "@/lib/constants"
import type { NotaryOffice, NotaryOfficeStatus } from "@/types/notary-office"

type SortField = "name" | "code" | "createdAt" | "status"
type SortOrder = "asc" | "desc"

export default function NotaryOffices() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<NotaryOfficeStatus | "all">("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState<SortField>("createdAt")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingNotaryOffice, setEditingNotaryOffice] = useState<NotaryOffice | null>(null)

  const notaryOfficesData = useQuery(notaryOfficesApi.queries.list, {
    page,
    pageSize,
    search: search || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    sortBy,
    sortOrder,
  })

  const createMutation = useMutation(notaryOfficesApi.mutations.create)
  const updateMutation = useMutation(notaryOfficesApi.mutations.update)
  const deleteMutation = useMutation(notaryOfficesApi.mutations.remove)

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
  }

  const handleDelete = async (notaryOffice: NotaryOffice) => {
    try {
      await deleteMutation({ id: notaryOffice._id })
      toast.success("Cartório excluído com sucesso")
    } catch (error) {
      toast.error("Erro ao excluir cartório")
      console.error(error)
    }
  }

  const handleOpenDialog = () => {
    setEditingNotaryOffice(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (notaryOffice: NotaryOffice) => {
    setEditingNotaryOffice(notaryOffice)
    setIsDialogOpen(true)
  }

  const handleSave = async ({ data, isEditing }: NotaryOfficeDialogSaveData) => {
    try {
      if (isEditing && editingNotaryOffice) {
        await updateMutation({
          id: editingNotaryOffice._id,
          ...data,
        })
        toast.success("Cartório atualizado com sucesso")
      } else {
        await createMutation({
          ...data,
          phone: data.phone || "",
        })
        toast.success("Cartório criado com sucesso")
      }
      setIsDialogOpen(false)
      setEditingNotaryOffice(null)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao salvar cartório"
      toast.error(errorMessage)
      throw error
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

  const isLoading = notaryOfficesData === undefined
  const notaryOffices = notaryOfficesData?.data ?? []
  const total = notaryOfficesData?.total ?? 0
  const totalPages = notaryOfficesData?.totalPages ?? 0

  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b backdrop-blur">
        <div className="px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Cartórios</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie os cartórios cadastrados no sistema.
            </p>
          </div>
          <Button onClick={handleOpenDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cartório
          </Button>
        </div>
      </div>

      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, código, cidade ou estado..."
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
              setStatusFilter(value as NotaryOfficeStatus | "all")
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
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-xl border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-[150px]">
                  <button
                    onClick={() => handleSort("code")}
                    className="flex items-center hover:text-foreground cursor-pointer font-semibold"
                  >
                    Código
                    <SortIcon field="code" />
                  </button>
                </TableHead>
                <TableHead className="w-[300px]">
                  <button
                    onClick={() => handleSort("name")}
                    className="flex items-center hover:text-foreground cursor-pointer font-semibold"
                  >
                    Nome
                    <SortIcon field="name" />
                  </button>
                </TableHead>
                <TableHead className="font-semibold">Cidade/Estado</TableHead>
                <TableHead className="font-semibold">Telefone</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
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
                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                  </TableRow>
                ))
              ) : notaryOffices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-72 text-center">
                    <button
                      onClick={handleOpenDialog}
                      className="flex flex-col items-center justify-center gap-3 w-full h-full group cursor-pointer"
                    >
                      <div className="size-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/15 group-hover:border-primary/30 transition-colors">
                        <Building2 className="size-8 text-primary" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-text-secondary group-hover:text-text-primary transition-colors">
                          Nenhum cartório encontrado
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Clique para adicionar um novo cartório
                        </p>
                      </div>
                    </button>
                  </TableCell>
                </TableRow>
              ) : (
                notaryOffices.map((notaryOffice: NotaryOffice) => (
                  <TableRow key={notaryOffice._id} className="hover:bg-muted/50">
                    <TableCell className="font-semibold text-text-primary">{notaryOffice.code}</TableCell>
                    <TableCell className="text-text-secondary">{notaryOffice.name}</TableCell>
                    <TableCell className="text-text-tertiary">
                      {notaryOffice.city && notaryOffice.state
                        ? `${notaryOffice.city}/${notaryOffice.state}`
                        : notaryOffice.city || notaryOffice.state || "-"}
                    </TableCell>
                    <TableCell className="text-text-tertiary">{notaryOffice.phone || "-"}</TableCell>
                    <TableCell className="text-text-tertiary">{notaryOffice.email || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={getNotaryOfficeStatusBadgeVariant(notaryOffice.status)}
                        className={getNotaryOfficeStatusBadgeClassName(notaryOffice.status)}
                      >
                        {getNotaryOfficeStatusLabel(notaryOffice.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <NotaryOfficesTableActions
                        notaryOffice={notaryOffice}
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
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Mostrando {notaryOffices.length} de {total} cartório(s)
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

      <NotaryOfficeDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        notaryOffice={editingNotaryOffice}
        onSave={handleSave}
      />
    </div>
  )
}
