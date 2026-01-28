import { useState, useCallback, DragEvent } from "react"
import { FileText, Upload, Download, AlertCircle, IdCard, FileCheck, Heart, MapPin, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogMedia,
  AlertDialogBody,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Id } from "@despachante/convex/_generated/dataModel"
import { cn } from "@/lib/utils"
import { TrashButton } from "@/components/ui/trash-button"
import { toast } from "sonner"
import { useQuery, useMutation } from "convex/react"
import { clientDocumentsApi } from "@/lib/api"
import { DocumentType, ClientDocument } from "@/types/client"
import { formatDateOnly, formatFileSize } from "@/lib/format"

interface DocumentsSectionProps {
  clientId: Id<"clients">
}

interface DocumentRowProps {
  doc: ClientDocument
  onDelete: (id: Id<"clientDocuments">, name: string) => void
}

interface PendingFile {
  file: File
  name: string
  type: DocumentType
}

const DOCUMENT_TYPE_CONFIG: Record<DocumentType, { icon: typeof FileText; label: string }> = {
  cpf: { icon: IdCard, label: "CPF" },
  birth_certificate: { icon: FileCheck, label: "Certidão de Nascimento" },
  marriage_certificate: { icon: Heart, label: "Certidão de Casamento" },
  identity: { icon: IdCard, label: "Identidade" },
  address_proof: { icon: MapPin, label: "Comprovante de Endereço" },
  other: { icon: FileText, label: "Outro" },
}

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: "cpf", label: "CPF" },
  { value: "birth_certificate", label: "Certidão de Nascimento" },
  { value: "marriage_certificate", label: "Certidão de Casamento" },
  { value: "address_proof", label: "Comprovante de Endereço" },
  { value: "other", label: "Outro" },
]


function DocumentRow({ doc, onDelete }: DocumentRowProps) {
  const url = useQuery(clientDocumentsApi.queries.getUrl, { storageId: doc.storageId })
  const config = DOCUMENT_TYPE_CONFIG[doc.type as DocumentType] || DOCUMENT_TYPE_CONFIG.other
  const Icon = config.icon

  const handlePreview = useCallback(() => {
    if (!url) {
      toast.error("URL do arquivo não disponível")
      return
    }
    window.open(url, "_blank")
  }, [url])

  const handleDownload = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!url) {
      toast.error("URL do arquivo não disponível")
      return
    }
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error("Failed to fetch file")

      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = downloadUrl
      a.download = doc.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      toast.error("Erro ao baixar arquivo")
      console.error("Download error:", error)
    }
  }, [url, doc.name])

  return (
    <div
      onClick={(e) => {
        const target = e.target as HTMLElement
        if (target.closest('[data-actions]')) return
        handlePreview()
      }}
      className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all cursor-pointer border border-border bg-accent/50 hover:bg-accent hover:border-border group relative"
    >
      <div className="size-10 rounded-xl flex items-center justify-center shrink-0 bg-background border border-border text-text-tertiary">
        <Icon className="size-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-secondary truncate">{config.label}</p>
        <p className="text-sm text-muted-foreground truncate">{doc.name}</p>
      </div>
      <div className="flex flex-col items-end gap-0.5 shrink-0 opacity-100 group-hover:opacity-0 transition-opacity duration-200 absolute right-4">
        <span className="text-xs text-muted-foreground">{formatFileSize(doc.size)}</span>
        <span className="text-xs text-muted-foreground/70">{formatDateOnly(doc.createdAt)}</span>
      </div>
      <div data-actions className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-accent rounded-lg p-1 -m-1 relative z-10">
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={(e) => {
            e.stopPropagation()
            handleDownload(e)
          }}
        >
          <Download className="size-4" />
        </Button>
        <TrashButton
          onClick={() => onDelete(doc._id, doc.name)}
          title="Remover documento"
        />
      </div>
    </div>
  )
}

export function DocumentsSection({ clientId }: DocumentsSectionProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [pendingFile, setPendingFile] = useState<PendingFile | null>(null)
  const [fileQueue, setFileQueue] = useState<File[]>([])
  const [totalFiles, setTotalFiles] = useState(0)
  const [currentFileIndex, setCurrentFileIndex] = useState(0)
  const [documentToDelete, setDocumentToDelete] = useState<{ id: Id<"clientDocuments">; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const documents = useQuery(clientDocumentsApi.queries.listByClient, { clientId })
  const missingDocuments = useQuery(clientDocumentsApi.queries.getMissingRequired, { clientId })
  const generateUploadUrl = useMutation(clientDocumentsApi.mutations.generateUploadUrl)
  const createDocument = useMutation(clientDocumentsApi.mutations.create)
  const removeDocument = useMutation(clientDocumentsApi.mutations.remove)

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const openUploadDialog = useCallback((files: File[]) => {
    if (files.length === 0) return

    const [firstFile, ...remainingFiles] = files
    setFileQueue(remainingFiles)
    setTotalFiles(files.length)
    setCurrentFileIndex(1)

    const nameWithoutExt = firstFile.name.replace(/\.[^/.]+$/, "")
    setPendingFile({
      file: firstFile,
      name: nameWithoutExt,
      type: "other",
    })
    setIsDialogOpen(true)
  }, [])

  const uploadFile = useCallback(async () => {
    if (!pendingFile) return

    setIsUploading(true)
    try {
      const uploadUrl = await generateUploadUrl()
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": pendingFile.file.type },
        body: pendingFile.file,
      })

      if (!result.ok) {
        throw new Error(`Falha ao enviar ${pendingFile.name}`)
      }

      const { storageId } = await result.json()

      const extension = pendingFile.file.name.split(".").pop() || ""
      const finalName = extension ? `${pendingFile.name}.${extension}` : pendingFile.name

      await createDocument({
        name: finalName,
        type: pendingFile.type,
        storageId,
        clientId,
        mimeType: pendingFile.file.type,
        size: pendingFile.file.size,
      })

      toast.success("Documento enviado com sucesso")

      // Processa próximo arquivo da fila
      if (fileQueue.length > 0) {
        const [nextFile, ...remainingFiles] = fileQueue
        setFileQueue(remainingFiles)
        setCurrentFileIndex((prev) => prev + 1)
        const nameWithoutExt = nextFile.name.replace(/\.[^/.]+$/, "")
        setPendingFile({
          file: nextFile,
          name: nameWithoutExt,
          type: "other",
        })
      } else {
        setIsDialogOpen(false)
        setPendingFile(null)
        setTotalFiles(0)
        setCurrentFileIndex(0)
      }
    } catch (error) {
      toast.error("Erro ao enviar documento")
      console.error("Upload error:", error)
    } finally {
      setIsUploading(false)
    }
  }, [pendingFile, generateUploadUrl, createDocument, clientId, fileQueue])

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      openUploadDialog(files)
    }
  }, [openUploadDialog])

  const handleFileSelect = useCallback(() => {
    const input = document.createElement("input")
    input.type = "file"
    input.multiple = true
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || [])
      if (files.length > 0) {
        openUploadDialog(files)
      }
    }
    input.click()
  }, [openUploadDialog])

  const handleDelete = useCallback(async () => {
    if (!documentToDelete) return

    setIsDeleting(true)
    try {
      await removeDocument({ id: documentToDelete.id })
      toast.success("Documento removido")
    } catch (error) {
      toast.error("Erro ao remover documento")
      console.error("Delete error:", error)
    } finally {
      setIsDeleting(false)
      setDocumentToDelete(null)
    }
  }, [removeDocument, documentToDelete])

  const hasDocuments = documents && documents.length > 0
  const hasMissingDocuments = missingDocuments && missingDocuments.length > 0
  const uploadedTypes = new Set(documents?.map((doc) => doc.type) || [])

  return (
    <div className="space-y-6">
      {/* Alerta de documentos pendentes */}
      {hasMissingDocuments && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/10">
          <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">Documentos pendentes</p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              {missingDocuments.map(type => (
                <li key={type} className="flex items-center gap-2">
                  <span className="size-1 rounded-full bg-muted-foreground/50 shrink-0" />
                  {DOCUMENT_TYPE_CONFIG[type as DocumentType]?.label || type}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Área de upload */}
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 p-6 py-12",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border/50 hover:border-border"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div
          className={cn(
            "size-16 rounded-2xl flex items-center justify-center mb-3 transition-all duration-200",
            isDragging
              ? "bg-primary/20 border-2 border-primary"
              : "bg-primary/10 border border-primary/20"
          )}
        >
          <Upload
            className={cn(
              "size-8 transition-all duration-200",
              isDragging ? "text-primary scale-110" : "text-primary"
            )}
          />
        </div>
        <p className="font-semibold text-text-secondary text-center text-base">
          {isDragging ? "Solte o arquivo aqui" : "Arraste um arquivo ou clique para selecionar"}
        </p>
        {!isDragging && (
          <p className="text-sm text-muted-foreground mt-1 text-center max-w-xs">
            Adicione documentos do cliente
          </p>
        )}
        {!isDragging && (
          <Button
            variant="outline"
            className="mt-3"
            onClick={handleFileSelect}
          >
            <FileText className="size-4 mr-2" />
            Selecionar Arquivo
          </Button>
        )}
      </div>

      {/* Lista de documentos */}
      {hasDocuments && (
        <div className="space-y-3">
          {[...documents].sort((a, b) => b.createdAt - a.createdAt).map((doc) => (
            <DocumentRow
              key={doc._id}
              doc={doc as ClientDocument}
              onDelete={(id, name) => setDocumentToDelete({ id, name })}
            />
          ))}
        </div>
      )}

      {/* Dialog de upload */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open)
        if (!open) {
          setPendingFile(null)
          setFileQueue([])
          setTotalFiles(0)
          setCurrentFileIndex(0)
        }
      }}>
        <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
          <div className="flex items-center gap-3 p-6 border-b border-border/50">
            <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Upload className="size-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold">
                Adicionar Documento
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                {totalFiles > 1
                  ? `Arquivo ${currentFileIndex} de ${totalFiles}`
                  : "Preencha as informações do documento"}
              </DialogDescription>
            </div>
          </div>

          {pendingFile && (
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/50 border border-border">
                <div className="size-10 rounded-xl bg-background border border-border flex items-center justify-center shrink-0">
                  <FileText className="size-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-secondary truncate">
                    {pendingFile.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(pendingFile.file.size)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="doc-type" className="text-sm font-medium">
                    Tipo <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={pendingFile.type}
                    onValueChange={(value) => setPendingFile({ ...pendingFile, type: value as DocumentType })}
                  >
                    <SelectTrigger id="doc-type" className="w-full h-10">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map((type) => (
                        <SelectItem
                          key={type.value}
                          value={type.value}
                          className={uploadedTypes.has(type.value) ? "text-muted-foreground" : ""}
                        >
                          {type.label}
                          {uploadedTypes.has(type.value)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doc-name" className="text-sm font-medium">
                    Nome <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="doc-name"
                    value={pendingFile.name}
                    onChange={(e) => setPendingFile({ ...pendingFile, name: e.target.value })}
                    placeholder="Nome do documento"
                    className="h-10"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 p-6 border-t border-border/50">
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false)
                setPendingFile(null)
                setFileQueue([])
                setTotalFiles(0)
                setCurrentFileIndex(0)
              }}
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button
              onClick={uploadFile}
              disabled={isUploading || !pendingFile?.name.trim()}
            >
              {isUploading ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!documentToDelete} onOpenChange={(open) => !open && setDocumentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <AlertTriangle />
            </AlertDialogMedia>
            <AlertDialogBody>
              <AlertDialogTitle>Remover documento</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover o documento <span className="font-medium text-foreground">{documentToDelete?.name}</span>?
              </AlertDialogDescription>
            </AlertDialogBody>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              variant="destructive"
            >
              {isDeleting ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
