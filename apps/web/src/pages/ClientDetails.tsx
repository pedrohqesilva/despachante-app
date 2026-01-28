import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation } from "convex/react"
import { clientsApi, clientDocumentsApi } from "@/lib/api"
import { Id } from "@despachante/convex/_generated/dataModel"
import { User, Building2, FileText, ArrowLeft, Pencil, AlertCircle } from "lucide-react"
import { PageSidebar, type SidebarSection } from "@/components/page-sidebar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  OverviewSection,
  PropertiesSection,
  DocumentsSection,
  ClientDialog,
  type ClientDialogSaveData,
} from "@/features/clients"
import { requiresSpouse } from "@/lib/constants"

type ClientSection = "overview" | "properties" | "documents"

const baseSections: SidebarSection<ClientSection>[] = [
  { id: "overview", label: "Visão Geral", icon: User, description: "Dados cadastrais do cliente" },
  { id: "documents", label: "Documentos", icon: FileText, description: "Arquivos e certidões do cliente" },
  { id: "properties", label: "Imóveis", icon: Building2, description: "Imóveis em que o cliente consta como proprietário" },
]

export default function ClientDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState<ClientSection>("overview")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const client = useQuery(
    clientsApi.queries.get,
    id ? { id: id as Id<"clients"> } : "skip"
  )

  const spouse = useQuery(
    clientsApi.queries.get,
    client?.spouseId ? { id: client.spouseId } : "skip"
  )

  const missingDocuments = useQuery(
    clientDocumentsApi.queries.getMissingRequired,
    client ? { clientId: client._id } : "skip"
  )

  const updateClientMutation = useMutation(clientsApi.mutations.update)
  const createClientMutation = useMutation(clientsApi.mutations.create)

  const hasMissingDocuments = missingDocuments && missingDocuments.length > 0
  const isLoading = client === undefined

  const handleSaveClient = async ({
    clientData,
    spouseData,
  }: ClientDialogSaveData) => {
    if (!client) return

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

      const spouseChanged = finalSpouseId !== client.spouseId
      const spouseRemoved = !finalSpouseId && !spouseData && !!client.spouseId

      await updateClientMutation({
        id: client._id,
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        taxId: clientData.taxId,
        fatherName: clientData.fatherName,
        motherName: clientData.motherName,
        maritalStatus: clientData.maritalStatus,
        propertyRegime: clientData.propertyRegime,
        weddingDate: clientData.weddingDate,
        spouseId: spouseChanged ? finalSpouseId || undefined : undefined,
        removeSpouse: spouseRemoved,
      })

      toast.success("Cliente atualizado com sucesso")
      setIsEditDialogOpen(false)
    } catch (error) {
      toast.error("Erro ao atualizar cliente")
      throw error
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

  const currentSection = baseSections.find(s => s.id === activeSection)

  const sections: SidebarSection<ClientSection>[] = baseSections.map(section => ({
    ...section,
    alert: section.id === "documents" && hasMissingDocuments
      ? <AlertCircle className="size-4 text-destructive" />
      : undefined,
  }))

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
      {/* Header */}
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

      {/* Edit Dialog */}
      <ClientDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        client={client}
        onSave={handleSaveClient}
      />
    </div>
  )
}
