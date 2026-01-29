import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { contractTemplatesApi } from "@/lib/api"
import { toast } from "sonner"
import { Plus, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
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
  ContractTemplateDialog,
  type ContractTemplateDialogSaveData,
  ContractTemplatesTableActions,
} from "@/features/contract-templates"
import {
  getContractTemplateStatusLabel,
  getContractTemplateStatusBadgeClassName,
} from "@/lib/constants"
import type { ContractTemplate, ContractTemplateStatus } from "@/types/contract-template"
import { formatDateOnly } from "@/lib/format"

type SortField = "name" | "_creationTime" | "status"
type SortOrder = "asc" | "desc"

export default function ContractTemplates() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<ContractTemplateStatus | "all">("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState<SortField>("_creationTime")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ContractTemplate | null>(null)

  const templatesData = useQuery(contractTemplatesApi.queries.list, {
    page,
    pageSize,
    search: search || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    sortBy,
    sortOrder,
  })

  const createMutation = useMutation(contractTemplatesApi.mutations.create)
  const updateMutation = useMutation(contractTemplatesApi.mutations.update)
  const deleteMutation = useMutation(contractTemplatesApi.mutations.remove)

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
  }

  const handleDelete = async (template: ContractTemplate) => {
    try {
      const result = await deleteMutation({ id: template._id })
      if (result.softDeleted) {
        toast.success("Modelo desativado (há contratos vinculados)")
      } else {
        toast.success("Modelo excluído com sucesso")
      }
    } catch (error) {
      toast.error("Erro ao excluir modelo")
      console.error(error)
    }
  }

  const handleOpenDialog = () => {
    setEditingTemplate(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (template: ContractTemplate) => {
    setEditingTemplate(template)
    setIsDialogOpen(true)
  }

  const handleSave = async ({ data, isEditing }: ContractTemplateDialogSaveData) => {
    try {
      if (isEditing && editingTemplate) {
        await updateMutation({
          id: editingTemplate._id,
          ...data,
        })
        toast.success("Modelo atualizado com sucesso")
      } else {
        await createMutation(data)
        toast.success("Modelo criado com sucesso")
      }
      setIsDialogOpen(false)
      setEditingTemplate(null)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao salvar modelo"
      toast.error(errorMessage)
      throw error
    }
  }

  const isLoading = templatesData === undefined
  const templates = templatesData?.data ?? []
  const total = templatesData?.total ?? 0
  const totalPages = templatesData?.totalPages ?? 0

  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b backdrop-blur">
        <div className="px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Modelos de Contrato</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Crie e gerencie modelos de contrato com placeholders.
            </p>
          </div>
          <Button onClick={handleOpenDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Modelo
          </Button>
        </div>
      </div>

      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center gap-4">
          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(value)
              setPage(1)
            }}
            placeholder="Pesquise aqui ..."
          />
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value as ContractTemplateStatus | "all")
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
                  field="name"
                  currentSortField={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                  className="w-[300px]"
                >
                  Nome
                </SortableTableHead>
                <TableHeadPlain>Descrição</TableHeadPlain>
                <SortableTableHead
                  field="_creationTime"
                  currentSortField={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                  className="w-[150px]"
                >
                  Data Criação
                </SortableTableHead>
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
                    { width: "w-[300px]" },
                    { width: "w-[120px]" },
                    { width: "w-[80px]" },
                    { width: "w-[60px]" },
                  ]}
                />
              ) : templates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <EmptyState
                      icon={FileText}
                      title="Nenhum modelo encontrado"
                      description="Clique para criar um novo modelo de contrato"
                      onClick={handleOpenDialog}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                templates.map((template: ContractTemplate) => (
                  <TableRow key={template._id} className="hover:bg-muted/50">
                    <TableCell className="font-semibold text-text-primary">{template.name}</TableCell>
                    <TableCell className="text-text-secondary">{template.description || "-"}</TableCell>
                    <TableCell className="text-text-tertiary">
                      {formatDateOnly(template._creationTime)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="default"
                        className={getContractTemplateStatusBadgeClassName(template.status)}
                      >
                        {getContractTemplateStatusLabel(template.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <ContractTemplatesTableActions
                        template={template}
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
            itemsOnPage={templates.length}
            itemLabel="modelo(s)"
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
          />
        )}
      </div>

      <ContractTemplateDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        template={editingTemplate}
        onSave={handleSave}
      />
    </div>
  )
}
