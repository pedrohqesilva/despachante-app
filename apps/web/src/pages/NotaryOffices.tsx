import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { notaryOfficesApi } from "@/lib/api"
import { toast } from "sonner"
import { Search, Plus, Building2, X } from "lucide-react"
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
import { EmptyState } from "@/components/ui/empty-state"
import { TablePagination } from "@/components/ui/table-pagination"
import { SortableTableHead, TableHeadPlain } from "@/components/ui/sortable-table-head"
import { TableSkeleton } from "@/components/ui/table-skeleton"
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
                <SortableTableHead
                  field="code"
                  currentSortField={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                  className="w-[150px]"
                >
                  Código
                </SortableTableHead>
                <SortableTableHead
                  field="name"
                  currentSortField={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                  className="w-[300px]"
                >
                  Nome
                </SortableTableHead>
                <TableHeadPlain>Cidade/Estado</TableHeadPlain>
                <TableHeadPlain>Telefone</TableHeadPlain>
                <TableHeadPlain>Email</TableHeadPlain>
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
                    { width: "w-[120px]" },
                    { width: "w-[200px]" },
                    { width: "w-[150px]" },
                    { width: "w-[120px]" },
                    { width: "w-[180px]" },
                    { width: "w-[80px]" },
                    { width: "w-[60px]" },
                  ]}
                />
              ) : notaryOffices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <EmptyState
                      icon={Building2}
                      title="Nenhum cartório encontrado"
                      description="Clique para adicionar um novo cartório"
                      onClick={handleOpenDialog}
                    />
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
          <TablePagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={total}
            itemsOnPage={notaryOffices.length}
            itemLabel="cartório(s)"
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
          />
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
