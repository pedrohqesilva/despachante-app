import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation } from "convex/react"
import { clientsApi, clientDocumentsApi } from "@/lib/api"
import { Id } from "@despachante/convex/_generated/dataModel"
import { User, Building2, FileText, ArrowLeft, Pencil, Search, Plus, X, Heart, ChevronDown, Check, Loader2, UserRound, HeartHandshake, Gem, CircleDashed, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { DateInput } from "@/components/ui/date-input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "sonner"
import {
  OverviewSection,
  PropertiesSection,
  DocumentsSection,
} from "@/features/clients"
import { formatTaxId } from "@/lib/format"
import { MaritalStatus, PropertyRegime } from "@/types/client"

type ClientSection = "overview" | "properties" | "documents"

const sections = [
  { id: "overview" as const, label: "Visão Geral", icon: User, description: "Dados cadastrais do cliente" },
  { id: "documents" as const, label: "Documentos", icon: FileText, description: "Arquivos e certidões do cliente" },
  { id: "properties" as const, label: "Imóveis", icon: Building2, description: "Imóveis em que o cliente consta como proprietário" },
]

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

export default function ClientDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState<ClientSection>("overview")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [spouseSearch, setSpouseSearch] = useState("")
  const [isSpousePopoverOpen, setIsSpousePopoverOpen] = useState(false)
  const [isCreatingSpouse, setIsCreatingSpouse] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{
    name?: boolean
    email?: boolean
    taxId?: boolean
    phone?: boolean
    maritalStatus?: boolean
    propertyRegime?: boolean
    spouseId?: boolean
  }>({})

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    taxId: "",
    fatherName: "",
    motherName: "",
    maritalStatus: "" as MaritalStatus | "",
    propertyRegime: "" as PropertyRegime | "",
    weddingDate: "",
    spouseId: null as Id<"clients"> | null,
  })

  const [spouseForm, setSpouseForm] = useState({
    name: "",
    email: "",
    phone: "",
    taxId: "",
    fatherName: "",
    motherName: "",
  })

  const client = useQuery(
    clientsApi.queries.get,
    id ? { id: id as Id<"clients"> } : "skip"
  )

  const spouse = useQuery(
    clientsApi.queries.get,
    client?.spouseId ? { id: client.spouseId } : "skip"
  )

  const spouseSearchResults = useQuery(
    clientsApi.queries.searchExcluding,
    requiresSpouse(editForm.maritalStatus) && isEditDialogOpen
      ? {
        query: spouseSearch.trim() || undefined,
        excludeId: client?._id,
      }
      : "skip"
  )

  const selectedSpouse = useQuery(
    clientsApi.queries.get,
    editForm.spouseId ? { id: editForm.spouseId } : "skip"
  )

  const missingDocuments = useQuery(
    clientDocumentsApi.queries.getMissingRequired,
    client ? { clientId: client._id } : "skip"
  )

  const hasMissingDocuments = missingDocuments && missingDocuments.length > 0

  const updateClientMutation = useMutation(clientsApi.mutations.update)
  const createClientMutation = useMutation(clientsApi.mutations.create)

  const isLoading = client === undefined

  const openEditDialog = () => {
    if (!client) return
    setEditForm({
      name: client.name,
      email: client.email,
      phone: client.phone ? formatPhoneInput(client.phone) : "",
      taxId: formatTaxId(client.taxId),
      fatherName: client.fatherName || "",
      motherName: client.motherName || "",
      maritalStatus: client.maritalStatus || "",
      propertyRegime: client.propertyRegime || "",
      weddingDate: client.weddingDate || "",
      spouseId: client.spouseId || null,
    })
    setSpouseForm({ name: "", email: "", phone: "", taxId: "", fatherName: "", motherName: "" })
    setFieldErrors({})
    setIsEditDialogOpen(true)
  }

  const formatPhoneInput = (value: string): string => {
    const cleaned = value.replace(/\D/g, "")
    if (cleaned.length <= 2) return cleaned
    if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`
    if (cleaned.length <= 10) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`
  }

  const handlePhoneChange = (value: string) => {
    setEditForm({ ...editForm, phone: formatPhoneInput(value) })
  }

  const formatTaxIdInput = (value: string): string => {
    const cleaned = value.replace(/\D/g, "")
    if (cleaned.length <= 11) {
      if (cleaned.length <= 3) return cleaned
      if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`
      if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`
      return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`
    }
    if (cleaned.length <= 2) return cleaned
    if (cleaned.length <= 5) return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`
    if (cleaned.length <= 8) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`
    if (cleaned.length <= 12) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8)}`
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`
  }

  const handleTaxIdChange = (value: string) => {
    setEditForm({ ...editForm, taxId: formatTaxIdInput(value) })
  }

  const handleSpousePhoneChange = (value: string) => {
    setSpouseForm({ ...spouseForm, phone: formatPhoneInput(value) })
  }

  const handleSpouseTaxIdChange = (value: string) => {
    setSpouseForm({ ...spouseForm, taxId: formatTaxIdInput(value) })
  }

  const handleSelectSpouse = (clientId: Id<"clients">) => {
    setEditForm({ ...editForm, spouseId: clientId })
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
    setEditForm({ ...editForm, spouseId: null })
    setIsCreatingSpouse(false)
    if (fieldErrors.spouseId) {
      setFieldErrors({ ...fieldErrors, spouseId: false })
    }
    toast.success("Cônjuge adicionado. Será criado ao salvar.")
  }

  const handleSave = async () => {
    if (!client) return

    const errors: typeof fieldErrors = {}
    if (!editForm.name.trim()) errors.name = true
    if (!editForm.email.trim()) errors.email = true
    if (!editForm.taxId.trim()) errors.taxId = true
    if (!editForm.phone.trim()) errors.phone = true
    if (!editForm.maritalStatus) errors.maritalStatus = true

    if (requiresSpouse(editForm.maritalStatus)) {
      if (!editForm.propertyRegime) errors.propertyRegime = true
      if (!editForm.spouseId && !spouseForm.name.trim()) errors.spouseId = true
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    setFieldErrors({})
    setIsSubmitting(true)

    try {
      let finalSpouseId = editForm.spouseId

      if (spouseForm.name.trim() && !editForm.spouseId && requiresSpouse(editForm.maritalStatus)) {
        const newSpouseId = await createClientMutation({
          name: spouseForm.name.trim(),
          email: spouseForm.email.trim(),
          phone: spouseForm.phone.replace(/\D/g, "") || undefined,
          taxId: spouseForm.taxId.replace(/\D/g, ""),
          status: "active",
          fatherName: spouseForm.fatherName.trim() || undefined,
          motherName: spouseForm.motherName.trim() || undefined,
          maritalStatus: editForm.maritalStatus as MaritalStatus,
          propertyRegime: editForm.propertyRegime || undefined,
        })
        finalSpouseId = newSpouseId
      }

      const spouseChanged = finalSpouseId !== client.spouseId
      const spouseRemoved = !finalSpouseId && !spouseForm.name.trim() && !!client.spouseId

      await updateClientMutation({
        id: client._id,
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.replace(/\D/g, ""),
        taxId: editForm.taxId.replace(/\D/g, ""),
        fatherName: editForm.fatherName.trim() || undefined,
        motherName: editForm.motherName.trim() || undefined,
        maritalStatus: editForm.maritalStatus || undefined,
        propertyRegime: editForm.propertyRegime || undefined,
        weddingDate: editForm.weddingDate || undefined,
        spouseId: spouseChanged ? finalSpouseId || undefined : undefined,
        removeSpouse: spouseRemoved,
      })

      toast.success("Cliente atualizado com sucesso")
      setIsEditDialogOpen(false)
    } catch (error) {
      toast.error("Erro ao atualizar cliente")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderSection = () => {
    if (!client) return null

    switch (activeSection) {
      case "overview":
        return <OverviewSection client={client} spouse={spouse} />
      case "properties":
        return <PropertiesSection clientId={client._id} />
      case "documents":
        return <DocumentsSection clientId={client._id} />
      default:
        return null
    }
  }

  const currentSection = sections.find(s => s.id === activeSection)

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="border-b backdrop-blur">
          <div className="px-6 py-6 flex items-center gap-4">
            <Skeleton className="size-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
        <div className="flex-1 flex min-h-0">
          <aside className="w-sidebar border-r border-border/50 shrink-0 p-4">
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          </aside>
          <main className="flex-1 p-8">
            <div className="max-w-content-max mx-auto space-y-6">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="size-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
          <User className="size-8 text-destructive" />
        </div>
        <p className="text-lg font-semibold text-text-secondary">
          Cliente não encontrado
        </p>
        <p className="text-sm text-muted-foreground">
          O cliente que você está procurando não existe ou foi removido.
        </p>
        <Button variant="outline" onClick={() => navigate("/clientes")}>
          <ArrowLeft className="size-4 mr-2" />
          Voltar para Clientes
        </Button>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      <div className="border-b backdrop-blur shrink-0">
        <div className="px-6 py-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{client.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Detalhes e informações do cliente
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-sidebar border-r border-border/50 shrink-0">
          <nav className="p-4 space-y-1">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer",
                  activeSection === id
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-text-tertiary hover:text-text-primary hover:bg-accent"
                )}
              >
                <Icon className={cn(
                  "size-icon-sm",
                  activeSection === id ? "text-primary" : "text-text-disabled"
                )} />
                {label}
                {id === "documents" && hasMissingDocuments && (
                  <AlertCircle className="size-4 text-destructive ml-auto" />
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-content-max mx-auto p-8">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-lg font-semibold">{currentSection?.label}</h2>
                <p className="text-sm text-muted-foreground">{currentSection?.description}</p>
              </div>
              {activeSection === "overview" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openEditDialog}
                >
                  <Pencil className="size-4 mr-2" />
                  Editar
                </Button>
              )}
            </div>
            {renderSection()}
          </div>
        </main>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            setFieldErrors({})
            setSpouseForm({ name: "", email: "", phone: "", taxId: "", fatherName: "", motherName: "" })
            setSpouseSearch("")
            setIsSpousePopoverOpen(false)
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
          <div className="flex items-center gap-3 p-6 border-b border-border/50">
            <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Pencil className="size-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold">
                Editar Cliente
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                Atualize os dados do cliente
              </DialogDescription>
            </div>
          </div>

          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Dados Pessoais */}
            <div className="space-y-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Dados Pessoais</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-sm font-medium">
                    Nome <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-name"
                    placeholder="Nome completo"
                    value={editForm.name}
                    onChange={(e) => {
                      setEditForm({ ...editForm, name: e.target.value })
                      if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: false })
                    }}
                    autoComplete="off"
                    className="h-10"
                    aria-invalid={fieldErrors.name}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-taxId" className="text-sm font-medium">
                    CPF/CNPJ <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-taxId"
                    placeholder="000.000.000-00"
                    value={editForm.taxId}
                    onChange={(e) => {
                      handleTaxIdChange(e.target.value)
                      if (fieldErrors.taxId) setFieldErrors({ ...fieldErrors, taxId: false })
                    }}
                    autoComplete="off"
                    maxLength={18}
                    className="h-10"
                    aria-invalid={fieldErrors.taxId}
                  />
                </div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Filiação</p>
                <div className="space-y-2">
                  <Label htmlFor="edit-motherName" className="text-sm font-medium">Nome da Mãe</Label>
                  <Input
                    id="edit-motherName"
                    placeholder="Nome completo da mãe"
                    value={editForm.motherName}
                    onChange={(e) => setEditForm({ ...editForm, motherName: e.target.value })}
                    autoComplete="off"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-fatherName" className="text-sm font-medium">Nome do Pai</Label>
                  <Input
                    id="edit-fatherName"
                    placeholder="Nome completo do pai"
                    value={editForm.fatherName}
                    onChange={(e) => setEditForm({ ...editForm, fatherName: e.target.value })}
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
                  <Label htmlFor="edit-email" className="text-sm font-medium">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={editForm.email}
                    onChange={(e) => {
                      setEditForm({ ...editForm, email: e.target.value })
                      if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: false })
                    }}
                    autoComplete="off"
                    className="h-10"
                    aria-invalid={fieldErrors.email}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone" className="text-sm font-medium">
                    Telefone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-phone"
                    placeholder="(00) 00000-0000"
                    value={editForm.phone}
                    onChange={(e) => {
                      handlePhoneChange(e.target.value)
                      if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: false })
                    }}
                    autoComplete="off"
                    maxLength={15}
                    className="h-10"
                    aria-invalid={fieldErrors.phone}
                  />
                </div>
              </div>
            </div>

            {/* Estado Civil */}
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
                    const isSelected = editForm.maritalStatus === value
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setEditForm({
                            ...editForm,
                            maritalStatus: value,
                            propertyRegime: requiresSpouse(value)
                              ? (editForm.propertyRegime || "partial_communion")
                              : "",
                            spouseId: requiresSpouse(value) ? editForm.spouseId : null,
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

                {requiresSpouse(editForm.maritalStatus) && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Regime de Bens <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={editForm.propertyRegime}
                      onValueChange={(value) => {
                        setEditForm({ ...editForm, propertyRegime: value as PropertyRegime })
                        if (fieldErrors.propertyRegime) {
                          setFieldErrors({ ...fieldErrors, propertyRegime: false })
                        }
                      }}
                    >
                      <SelectTrigger className="w-full h-10" aria-invalid={fieldErrors.propertyRegime}>
                        <SelectValue placeholder="Selecione o regime de bens" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROPERTY_REGIME_OPTIONS.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {requiresSpouse(editForm.maritalStatus) && (
                  <div className="space-y-3">
                    <Label htmlFor="edit-weddingDate" className="text-sm font-medium">
                      {editForm.maritalStatus === "married" ? "Data do Casamento" : "Desde"}
                    </Label>
                    <DateInput
                      id="edit-weddingDate"
                      value={editForm.weddingDate}
                      onChange={(e) => setEditForm({ ...editForm, weddingDate: e.target.value })}
                      className="h-10"
                    />
                  </div>
                )}

                {requiresSpouse(editForm.maritalStatus) && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Cônjuge <span className="text-destructive">*</span>
                    </Label>

                    {!selectedSpouse && !spouseForm.name && (
                      <Popover open={isSpousePopoverOpen} onOpenChange={setIsSpousePopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between h-10"
                            type="button"
                            aria-invalid={fieldErrors.spouseId}
                          >
                            <span className="text-muted-foreground">Selecione o cônjuge</span>
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
                            <div className="px-2 py-1.5">
                              <p className="text-xs font-medium text-muted-foreground px-2">Clientes existentes</p>
                            </div>
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
                                spouseSearchResults.map((c) => {
                                  const isSelected = editForm.spouseId === c._id
                                  const hasSpouse = !!c.spouseId
                                  return (
                                    <div
                                      key={c._id}
                                      className={cn(
                                        "flex items-center gap-2 px-2 py-2 rounded-md",
                                        hasSpouse ? "opacity-50 cursor-not-allowed" : "hover:bg-accent cursor-pointer"
                                      )}
                                      onClick={() => !hasSpouse && handleSelectSpouse(c._id)}
                                    >
                                      <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                        <span className="text-xs font-medium">{c.name.charAt(0).toUpperCase()}</span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{c.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {hasSpouse ? "Já possui cônjuge vinculado" : formatTaxId(c.taxId)}
                                        </p>
                                      </div>
                                      {hasSpouse && <Heart className="h-3.5 w-3.5 text-rose-500 shrink-0" />}
                                      {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                                    </div>
                                  )
                                })
                              )}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}

                    {selectedSpouse && !spouseForm.name && (
                      <div className="rounded-xl border border-border/50 overflow-hidden">
                        <div className="group flex items-center gap-3 px-3 py-2.5 bg-accent/30 hover:bg-accent/60 transition-colors">
                          <div className="size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                            <span className="text-sm font-semibold text-primary">
                              {selectedSpouse.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary truncate">{selectedSpouse.name}</p>
                            <p className="text-xs text-muted-foreground">{formatTaxId(selectedSpouse.taxId)}</p>
                          </div>
                          <button
                            type="button"
                            className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                            onClick={() => setEditForm({ ...editForm, spouseId: null })}
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {spouseForm.name && !editForm.spouseId && (
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

          <div className="flex items-center justify-end gap-3 p-6 border-t border-border/50">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
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

      {/* Create Spouse Dialog */}
      <Dialog open={isCreatingSpouse} onOpenChange={setIsCreatingSpouse}>
        <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
          <div className="flex items-center gap-3 p-6 border-b border-border/50">
            <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Heart className="size-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold">Novo Cônjuge</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                Cadastre um novo cliente que será definido como cônjuge
              </DialogDescription>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Dados Pessoais</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="spouse-name" className="text-sm font-medium">
                    Nome <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="spouse-name"
                    value={spouseForm.name}
                    onChange={(e) => setSpouseForm({ ...spouseForm, name: e.target.value })}
                    placeholder="Nome completo"
                    autoComplete="off"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spouse-taxId" className="text-sm font-medium">
                    CPF/CNPJ <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="spouse-taxId"
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
            <div className="space-y-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Filiação</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="spouse-motherName" className="text-sm font-medium">Nome da Mãe</Label>
                  <Input
                    id="spouse-motherName"
                    value={spouseForm.motherName}
                    onChange={(e) => setSpouseForm({ ...spouseForm, motherName: e.target.value })}
                    placeholder="Nome completo da mãe"
                    autoComplete="off"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spouse-fatherName" className="text-sm font-medium">Nome do Pai</Label>
                  <Input
                    id="spouse-fatherName"
                    value={spouseForm.fatherName}
                    onChange={(e) => setSpouseForm({ ...spouseForm, fatherName: e.target.value })}
                    placeholder="Nome completo do pai"
                    autoComplete="off"
                    className="h-10"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contato</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="spouse-email" className="text-sm font-medium">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="spouse-email"
                    type="email"
                    value={spouseForm.email}
                    onChange={(e) => setSpouseForm({ ...spouseForm, email: e.target.value })}
                    placeholder="email@exemplo.com"
                    autoComplete="off"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spouse-phone" className="text-sm font-medium">Telefone</Label>
                  <Input
                    id="spouse-phone"
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
              Adicionar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
