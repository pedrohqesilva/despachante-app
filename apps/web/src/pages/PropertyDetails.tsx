import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation } from "convex/react"
import { propertiesApi } from "@/lib/api"
import { Id } from "@despachante/convex/_generated/dataModel"
import {
  Home,
  Building2,
  LandPlot,
  Building,
  FileText,
  ArrowLeft,
  Pencil,
  Users,
  Eye,
  Loader2,
  LucideIcon,
  Trees,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  OverviewSection,
  OwnersSection,
  DocumentsSection,
} from "@/features/properties"

type PropertySection = "overview" | "owners" | "documents"

type PropertyType = "house" | "apartment" | "land" | "building"
type PropertyStatus = "active" | "inactive" | "pending"

const sections = [
  { id: "overview" as const, label: "Visao Geral", icon: Eye, description: "Informacoes do imovel" },
  { id: "owners" as const, label: "Proprietarios", icon: Users, description: "Proprietarios do imovel" },
  { id: "documents" as const, label: "Documentos", icon: FileText, description: "Documentos do imovel" },
]

const TYPE_CONFIG: Record<PropertyType, { label: string; icon: LucideIcon }> = {
  house: { label: "Casa", icon: Home },
  apartment: { label: "Apartamento", icon: Building2 },
  land: { label: "Terreno", icon: LandPlot },
  building: { label: "Predio", icon: Building },
}



const BRAZILIAN_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
]

export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState<PropertySection>("overview")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{
    zipCode?: boolean
    street?: boolean
    number?: boolean
    neighborhood?: boolean
    city?: boolean
    state?: boolean
    type?: boolean
    area?: boolean
    value?: boolean
  }>({})

  const [editForm, setEditForm] = useState({
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    type: "" as PropertyType | "",
    area: "",
    value: "",
    status: "" as PropertyStatus | "",
  })

  const property = useQuery(
    propertiesApi.queries.get,
    id ? { id: id as Id<"properties"> } : "skip"
  )

  const updatePropertyMutation = useMutation(propertiesApi.mutations.update)

  const isLoading = property === undefined

  const openEditDialog = () => {
    if (!property) return
    setEditForm({
      zipCode: formatZipCodeInput(property.zipCode),
      street: property.street,
      number: property.number,
      complement: property.complement || "",
      neighborhood: property.neighborhood,
      city: property.city,
      state: property.state,
      type: property.type as PropertyType,
      area: property.area.toString(),
      value: formatCurrencyInput(Math.round(property.value * 100).toString()),
      status: property.status as PropertyStatus,
    })
    setFieldErrors({})
    setIsEditDialogOpen(true)
  }

  const formatZipCodeInput = (value: string): string => {
    const cleaned = value.replace(/\D/g, "")
    if (cleaned.length <= 5) return cleaned
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`
  }

  const handleZipCodeChange = (value: string) => {
    setEditForm({ ...editForm, zipCode: formatZipCodeInput(value) })
  }

  const formatCurrencyInput = (value: string): string => {
    const cleaned = value.replace(/\D/g, "")
    if (!cleaned) return ""
    const number = parseInt(cleaned, 10) / 100
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number)
  }

  const handleValueChange = (value: string) => {
    setEditForm({ ...editForm, value: formatCurrencyInput(value) })
  }

  const parseCurrencyValue = (value: string): number => {
    const cleaned = value.replace(/\./g, "").replace(",", ".")
    return parseFloat(cleaned) || 0
  }

  const handleSave = async () => {
    if (!property) return

    const errors: typeof fieldErrors = {}
    if (!editForm.zipCode.trim()) errors.zipCode = true
    if (!editForm.street.trim()) errors.street = true
    if (!editForm.number.trim()) errors.number = true
    if (!editForm.neighborhood.trim()) errors.neighborhood = true
    if (!editForm.city.trim()) errors.city = true
    if (!editForm.state.trim()) errors.state = true
    if (!editForm.type) errors.type = true
    if (!editForm.area.trim() || parseFloat(editForm.area) <= 0) errors.area = true
    if (!editForm.value.trim() || parseCurrencyValue(editForm.value) <= 0) errors.value = true

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      toast.error("Preencha todos os campos obrigatorios")
      return
    }

    setFieldErrors({})
    setIsSubmitting(true)

    try {
      await updatePropertyMutation({
        id: property._id,
        zipCode: editForm.zipCode.replace(/\D/g, ""),
        street: editForm.street.trim(),
        number: editForm.number.trim(),
        complement: editForm.complement.trim() || undefined,
        neighborhood: editForm.neighborhood.trim(),
        city: editForm.city.trim(),
        state: editForm.state,
        type: editForm.type as PropertyType,
        area: parseFloat(editForm.area),
        value: parseCurrencyValue(editForm.value),
        status: editForm.status as PropertyStatus,
      })

      toast.success("Imovel atualizado com sucesso")
      setIsEditDialogOpen(false)
    } catch (error) {
      toast.error("Erro ao atualizar imovel")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderSection = () => {
    if (!property) return null

    switch (activeSection) {
      case "overview":
        return <OverviewSection property={property} />
      case "owners":
        return <OwnersSection propertyId={property._id} ownerIds={property.ownerIds} />
      case "documents":
        return <DocumentsSection propertyId={property._id} />
      default:
        return null
    }
  }

  const currentSection = sections.find(s => s.id === activeSection)
  const typeConfig = property ? TYPE_CONFIG[property.type as PropertyType] : null
  const TypeIcon = typeConfig?.icon || Building2

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

  if (!property) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="size-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
          <Building2 className="size-8 text-destructive" />
        </div>
        <p className="text-lg font-semibold text-text-secondary">
          Imovel nao encontrado
        </p>
        <p className="text-sm text-muted-foreground">
          O imovel que voce esta procurando nao existe ou foi removido.
        </p>
        <Button variant="outline" onClick={() => navigate("/imoveis")}>
          <ArrowLeft className="size-4 mr-2" />
          Voltar para Imoveis
        </Button>
      </div>
    )
  }

  const propertyAddress = `${property.street}, ${property.number}${property.complement ? ` - ${property.complement}` : ""}`

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
            <h1 className="text-2xl font-semibold tracking-tight">{propertyAddress}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {typeConfig?.label} - {property.neighborhood}, {property.city}/{property.state}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
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
              </button>
            ))}
          </nav>
        </aside>

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

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            setFieldErrors({})
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
          <div className="flex items-center gap-gap p-6 border-b border-border/50">
            <div className="size-icon-container-md rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Building2 className="size-icon-md text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold">
                Editar Imóvel
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                Atualize os dados do imóvel selecionado
              </DialogDescription>
            </div>
          </div>

          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Dados do Imóvel */}
            <div className="space-y-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Dados do Imóvel
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Tipo <span className="text-destructive">*</span>
                  </Label>
                  <div className={cn(
                    "grid grid-cols-4 gap-3 p-1 rounded-xl transition-all duration-200",
                    fieldErrors.type && "bg-destructive/5 ring-1 ring-destructive/20"
                  )}>
                    {[
                      { value: "land" as PropertyType, icon: Trees, label: "Terreno" },
                      { value: "house" as PropertyType, icon: Home, label: "Casa" },
                      { value: "apartment" as PropertyType, icon: Building, label: "Apartamento" },
                      { value: "building" as PropertyType, icon: Building2, label: "Prédio" },
                    ].map(({ value, icon: Icon, label }) => {
                      const isSelected = editForm.type === value
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            setEditForm({ ...editForm, type: value })
                            if (fieldErrors.type) setFieldErrors({ ...fieldErrors, type: false })
                          }}
                          className={cn(
                            "relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl text-center transition-all cursor-pointer aspect-square",
                            isSelected
                              ? "border-2 border-primary bg-primary/10 shadow-sm"
                              : "border border-border bg-accent/50 hover:bg-accent hover:border-muted-foreground/30"
                          )}
                        >
                          <div
                            className={cn(
                              "size-10 rounded-lg flex items-center justify-center transition-colors",
                              isSelected
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-background border border-border text-text-tertiary"
                            )}
                          >
                            <Icon className="size-5" />
                          </div>
                          <p
                            className={cn(
                              "text-sm font-medium",
                              isSelected ? "text-text-primary" : "text-text-secondary"
                            )}
                          >
                            {label}
                          </p>
                          {isSelected && (
                            <div className="absolute top-2 right-2 size-5 rounded-full bg-primary flex items-center justify-center">
                              <Check className="size-3 text-primary-foreground" />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-area" className="text-sm font-medium">
                      Área <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="edit-area"
                        type="text"
                        placeholder="0"
                        value={editForm.area ? Number(editForm.area).toLocaleString("pt-BR") : ""}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/\D/g, "")
                          setEditForm({ ...editForm, area: rawValue })
                          if (fieldErrors.area) setFieldErrors({ ...fieldErrors, area: false })
                        }}
                        className="h-10 pr-10"
                        aria-invalid={fieldErrors.area}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none pointer-events-none">
                        m²
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-value" className="text-sm font-medium">
                      Valor <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none pointer-events-none">
                        R$
                      </span>
                      <Input
                        id="edit-value"
                        placeholder="0,00"
                        value={editForm.value}
                        onChange={(e) => {
                          handleValueChange(e.target.value)
                          if (fieldErrors.value) setFieldErrors({ ...fieldErrors, value: false })
                        }}
                        className="h-10 pl-9"
                        aria-invalid={fieldErrors.value}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Localização */}
            <div className="space-y-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Localização
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-zipCode" className="text-sm font-medium">
                    CEP <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative w-32">
                    <Input
                      id="edit-zipCode"
                      placeholder="00000-000"
                      value={editForm.zipCode}
                      onChange={(e) => {
                        handleZipCodeChange(e.target.value)
                        if (fieldErrors.zipCode) setFieldErrors({ ...fieldErrors, zipCode: false })
                      }}
                      maxLength={9}
                      className="h-10"
                      aria-invalid={fieldErrors.zipCode}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-3 space-y-2">
                    <Label htmlFor="edit-street" className="text-sm font-medium">
                      Logradouro <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="edit-street"
                      placeholder="Rua Exemplo"
                      value={editForm.street}
                      onChange={(e) => {
                        setEditForm({ ...editForm, street: e.target.value })
                        if (fieldErrors.street) setFieldErrors({ ...fieldErrors, street: false })
                      }}
                      className="h-10"
                      aria-invalid={fieldErrors.street}
                    />
                  </div>
                  <div className="col-span-1 space-y-2">
                    <Label htmlFor="edit-number" className="text-sm font-medium">
                      Número <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="edit-number"
                      placeholder="123"
                      value={editForm.number}
                      onChange={(e) => {
                        setEditForm({ ...editForm, number: e.target.value })
                        if (fieldErrors.number) setFieldErrors({ ...fieldErrors, number: false })
                      }}
                      className="h-10"
                      aria-invalid={fieldErrors.number}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-complement" className="text-sm font-medium">
                      Complemento
                    </Label>
                    <Input
                      id="edit-complement"
                      placeholder="Apto 101, Bloco A"
                      value={editForm.complement}
                      onChange={(e) => setEditForm({ ...editForm, complement: e.target.value })}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-neighborhood" className="text-sm font-medium">
                      Bairro <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="edit-neighborhood"
                      placeholder="Centro"
                      value={editForm.neighborhood}
                      onChange={(e) => {
                        setEditForm({ ...editForm, neighborhood: e.target.value })
                        if (fieldErrors.neighborhood) setFieldErrors({ ...fieldErrors, neighborhood: false })
                      }}
                      className="h-10"
                      aria-invalid={fieldErrors.neighborhood}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-3 space-y-2">
                    <Label htmlFor="edit-city" className="text-sm font-medium">
                      Cidade <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="edit-city"
                      placeholder="Belo Horizonte"
                      value={editForm.city}
                      onChange={(e) => {
                        setEditForm({ ...editForm, city: e.target.value })
                        if (fieldErrors.city) setFieldErrors({ ...fieldErrors, city: false })
                      }}
                      className="h-10"
                      aria-invalid={fieldErrors.city}
                    />
                  </div>
                  <div className="col-span-1 space-y-2">
                    <Label htmlFor="edit-state" className="text-sm font-medium">
                      UF <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="edit-state"
                      placeholder="MG"
                      value={editForm.state}
                      onChange={(e) => {
                        setEditForm({ ...editForm, state: e.target.value.toUpperCase() })
                        if (fieldErrors.state) setFieldErrors({ ...fieldErrors, state: false })
                      }}
                      maxLength={2}
                      className="h-10 uppercase"
                      aria-invalid={fieldErrors.state}
                    />
                  </div>
                </div>
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
    </div>
  )
}
