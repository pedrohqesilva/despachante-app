import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation } from "convex/react"
import { propertiesApi } from "@/lib/api"
import { Id } from "@despachante/convex/_generated/dataModel"
import {
  Building2,
  FileText,
  ArrowLeft,
  Pencil,
  Users,
  Eye,
} from "lucide-react"
import { PageSidebar, type SidebarSection } from "@/components/page-sidebar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  OverviewSection,
  OwnersSection,
  DocumentsSection,
  PropertyDialog,
  type PropertyDialogSaveData,
} from "@/features/properties"
import { getPropertyTypeLabel } from "@/lib/constants"
import type { PropertyType } from "@/types/property"

type PropertySection = "overview" | "owners" | "documents"

const sections: SidebarSection<PropertySection>[] = [
  { id: "overview", label: "Visão Geral", icon: Eye, description: "Informações do imóvel" },
  { id: "owners", label: "Proprietários", icon: Users, description: "Proprietários do imóvel" },
  { id: "documents", label: "Documentos", icon: FileText, description: "Documentos do imóvel" },
]

export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState<PropertySection>("overview")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const property = useQuery(
    propertiesApi.queries.get,
    id ? { id: id as Id<"properties"> } : "skip"
  )

  const updatePropertyMutation = useMutation(propertiesApi.mutations.update)

  const isLoading = property === undefined

  const handleSaveProperty = async ({ data }: PropertyDialogSaveData) => {
    if (!property) return

    try {
      await updatePropertyMutation({
        id: property._id,
        ...data,
      })

      toast.success("Imóvel atualizado com sucesso")
      setIsEditDialogOpen(false)
    } catch (error) {
      toast.error("Erro ao atualizar imóvel")
      throw error
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
          Imóvel não encontrado
        </p>
        <p className="text-sm text-muted-foreground">
          O imóvel que você está procurando não existe ou foi removido.
        </p>
        <Button variant="outline" onClick={() => navigate("/imoveis")}>
          <ArrowLeft className="size-4 mr-2" />
          Voltar para Imóveis
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
              {getPropertyTypeLabel(property.type as PropertyType)} - {property.neighborhood}, {property.city}/{property.state}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <PageSidebar
          sections={sections}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        <main className="flex-1 min-h-0 overflow-auto">
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
                  onClick={() => setIsEditDialogOpen(true)}
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

      <PropertyDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        property={property}
        onSave={handleSaveProperty}
        showOwnerSelector={false}
      />
    </div>
  )
}
