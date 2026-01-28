import { useState, useCallback, useRef } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@despachante/convex/_generated/api"
import { toast } from "sonner"
import { Search, Plus, Loader2, ArrowUpDown, ArrowUp, ArrowDown, Building2, X } from "lucide-react"
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
import { NotaryOfficesTableActions } from "@/components/notary-offices/NotaryOfficesTableActions"
import type { NotaryOffice, NotaryOfficeStatus } from "@/types/notary-office"

type SortField = "name" | "code" | "createdAt" | "status"
type SortOrder = "asc" | "desc"

export default function Cartorios() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<NotaryOfficeStatus | "all">("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState<SortField>("createdAt")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingNotaryOffice, setEditingNotaryOffice] = useState<NotaryOffice | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "Belo Horizonte",
    state: "MG",
    phone: "",
    email: "",
    status: "active" as "active" | "inactive",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingCep, setIsLoadingCep] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{
    name?: boolean
    code?: boolean
    phone?: boolean
    zipCode?: boolean
    street?: boolean
    number?: boolean
    neighborhood?: boolean
    city?: boolean
    state?: boolean
  }>({})
  const numberInputRef = useRef<HTMLInputElement>(null)

  const notaryOfficesData = useQuery(api.notaryOffices.list, {
    page,
    pageSize,
    search: search || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    sortBy,
    sortOrder,
  })

  const createMutation = useMutation(api.notaryOffices.create)
  const updateMutation = useMutation(api.notaryOffices.update)
  const deleteMutation = useMutation(api.notaryOffices.remove)

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

      setFormData(prev => ({
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
    setFormData({
      name: "",
      code: "",
      zipCode: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "Belo Horizonte",
      state: "MG",
      phone: "",
      email: "",
      status: "active",
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (notaryOffice: NotaryOffice) => {
    setEditingNotaryOffice(notaryOffice)
    setFormData({
      name: notaryOffice.name,
      code: notaryOffice.code,
      zipCode: notaryOffice.zipCode || "",
      street: notaryOffice.street || "",
      number: notaryOffice.number || "",
      complement: notaryOffice.complement || "",
      neighborhood: notaryOffice.neighborhood || "",
      city: notaryOffice.city || "",
      state: notaryOffice.state || "",
      phone: notaryOffice.phone || "",
      email: notaryOffice.email || "",
      status: notaryOffice.status,
    })
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingNotaryOffice(null)
    setFieldErrors({})
    setFormData({
      name: "",
      code: "",
      zipCode: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "Belo Horizonte",
      state: "MG",
      phone: "",
      email: "",
      status: "active",
    })
  }

  const handleSubmit = async () => {
    // Validação de campos obrigatórios
    const errors: typeof fieldErrors = {}
    if (!formData.name.trim()) errors.name = true
    if (!formData.code.trim()) errors.code = true
    if (!formData.phone.trim()) errors.phone = true
    if (!formData.zipCode.trim()) errors.zipCode = true
    if (!formData.street.trim()) errors.street = true
    if (!formData.number.trim()) errors.number = true
    if (!formData.neighborhood.trim()) errors.neighborhood = true
    if (!formData.city.trim()) errors.city = true
    if (!formData.state.trim()) errors.state = true

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      toast.error("Preencha os campos obrigatórios")
      return
    }

    setFieldErrors({})

    setIsSubmitting(true)
    try {
      const locationData = {
        zipCode: formData.zipCode.replace(/\D/g, ""),
        street: formData.street.trim(),
        number: formData.number.trim(),
        complement: formData.complement.trim() || undefined,
        neighborhood: formData.neighborhood.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
      }

      if (editingNotaryOffice) {
        await updateMutation({
          id: editingNotaryOffice._id,
          name: formData.name.trim(),
          code: formData.code.trim(),
          ...locationData,
          phone: formData.phone.trim() || undefined,
          email: formData.email.trim() || undefined,
          status: formData.status,
        })
        toast.success("Cartório atualizado com sucesso")
      } else {
        await createMutation({
          name: formData.name.trim(),
          code: formData.code.trim(),
          ...locationData,
          phone: formData.phone.trim(),
          email: formData.email.trim() || undefined,
          status: "active",
        })
        toast.success("Cartório criado com sucesso")
      }
      handleCloseDialog()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao salvar cartório"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadgeVariant = (status: NotaryOfficeStatus) => {
    switch (status) {
      case "active":
        return "default"
      case "inactive":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getStatusBadgeClassName = (status: NotaryOfficeStatus) => {
    switch (status) {
      case "active":
        return "bg-status-success-muted text-status-success-foreground border-status-success-border font-medium"
      case "inactive":
        return "bg-status-neutral-muted text-status-neutral-foreground border-status-neutral-border font-medium"
      default:
        return ""
    }
  }

  const getStatusLabel = (status: NotaryOfficeStatus) => {
    switch (status) {
      case "active":
        return "Ativo"
      case "inactive":
        return "Inativo"
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
                    <TableCell>
                      <Skeleton className="h-4 w-[120px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[200px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[150px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[120px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[180px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[60px]" />
                    </TableCell>
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
                        variant={getStatusBadgeVariant(notaryOffice.status)}
                        className={getStatusBadgeClassName(notaryOffice.status)}
                      >
                        {getStatusLabel(notaryOffice.status)}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-gap p-6 border-b border-border/50">
            <div className="size-icon-container-md rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Building2 className="size-icon-md text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold">
                {editingNotaryOffice ? "Editar Cartório" : "Novo Cartório"}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                {editingNotaryOffice
                  ? "Atualize os dados do cartório selecionado"
                  : "Preencha os dados para cadastrar um novo cartório"}
              </DialogDescription>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Identification Section */}
            <div className="space-y-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Identificação</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-sm font-medium">
                    Código <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="code"
                    placeholder="Exemplo: 1º OFICIO"
                    value={formData.code}
                    onChange={(e) => {
                      setFormData({ ...formData, code: e.target.value })
                      if (fieldErrors.code) {
                        setFieldErrors({ ...fieldErrors, code: false })
                      }
                    }}
                    autoComplete="off"
                    disabled={isSubmitting}
                    className="h-10"
                    aria-invalid={fieldErrors.code}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Nome <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Exemplo: Cartório de Registro de Imóveis"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value })
                      if (fieldErrors.name) {
                        setFieldErrors({ ...fieldErrors, name: false })
                      }
                    }}
                    autoComplete="off"
                    disabled={isSubmitting}
                    className="h-10"
                    aria-invalid={fieldErrors.name}
                  />
                </div>
                {editingNotaryOffice && (
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: "active" | "inactive") => setFormData({ ...formData, status: value })}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Section */}
            <div className="space-y-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contato</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Telefone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    placeholder="(00) 00000-0000"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value })
                      if (fieldErrors.phone) {
                        setFieldErrors({ ...fieldErrors, phone: false })
                      }
                    }}
                    autoComplete="off"
                    disabled={isSubmitting}
                    className="h-10"
                    aria-invalid={fieldErrors.phone}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    autoComplete="off"
                    disabled={isSubmitting}
                    className="h-10"
                  />
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="space-y-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Localização</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode" className="text-sm font-medium">
                    CEP <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative w-32">
                    <Input
                      id="zipCode"
                      placeholder="00000-000"
                      value={formData.zipCode}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, "")
                        let formatted = e.target.value
                        if (cleaned.length <= 8) {
                          if (cleaned.length <= 5) {
                            formatted = cleaned
                          } else {
                            formatted = `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`
                          }
                        }
                        setFormData({ ...formData, zipCode: formatted })
                        if (fieldErrors.zipCode) {
                          setFieldErrors({ ...fieldErrors, zipCode: false })
                        }
                        if (cleaned.length === 8) {
                          fetchAddressByCep(cleaned)
                        }
                      }}
                      autoComplete="off"
                      maxLength={9}
                      disabled={isSubmitting || isLoadingCep}
                      className="h-10 pr-8"
                      aria-invalid={fieldErrors.zipCode}
                    />
                    {isLoadingCep && (
                      <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
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
                      value={formData.street}
                      onChange={(e) => {
                        setFormData({ ...formData, street: e.target.value })
                        if (fieldErrors.street) {
                          setFieldErrors({ ...fieldErrors, street: false })
                        }
                      }}
                      autoComplete="off"
                      disabled={isSubmitting}
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
                      value={formData.number}
                      onChange={(e) => {
                        setFormData({ ...formData, number: e.target.value })
                        if (fieldErrors.number) {
                          setFieldErrors({ ...fieldErrors, number: false })
                        }
                      }}
                      autoComplete="off"
                      disabled={isSubmitting}
                      className="h-10"
                      aria-invalid={fieldErrors.number}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="complement" className="text-sm font-medium">Complemento</Label>
                    <Input
                      id="complement"
                      placeholder="Sala 101, 3º Andar"
                      value={formData.complement}
                      onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                      autoComplete="off"
                      disabled={isSubmitting}
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
                      value={formData.neighborhood}
                      onChange={(e) => {
                        setFormData({ ...formData, neighborhood: e.target.value })
                        if (fieldErrors.neighborhood) {
                          setFieldErrors({ ...fieldErrors, neighborhood: false })
                        }
                      }}
                      autoComplete="off"
                      disabled={isSubmitting}
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
                      value={formData.city}
                      onChange={(e) => {
                        setFormData({ ...formData, city: e.target.value })
                        if (fieldErrors.city) {
                          setFieldErrors({ ...fieldErrors, city: false })
                        }
                      }}
                      autoComplete="off"
                      disabled={isSubmitting}
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
                      value={formData.state}
                      onChange={(e) => {
                        setFormData({ ...formData, state: e.target.value.toUpperCase() })
                        if (fieldErrors.state) {
                          setFieldErrors({ ...fieldErrors, state: false })
                        }
                      }}
                      autoComplete="off"
                      maxLength={2}
                      disabled={isSubmitting}
                      className="h-10 uppercase"
                      aria-invalid={fieldErrors.state}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border/50">
            <Button variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
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
    </div>
  )
}
