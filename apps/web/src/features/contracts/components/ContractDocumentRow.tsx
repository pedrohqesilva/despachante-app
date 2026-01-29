"use client"

import { useCallback, useState } from "react"
import { useQuery, useMutation } from "convex/react"
import {
  ScrollText,
  Pencil,
  Download,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrashButton } from "@/components/ui/trash-button"
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
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { formatDateOnly, formatFileSize } from "@/lib/format"
import {
  getContractStatusLabel,
  getContractStatusBadgeClassName,
} from "@/lib/constants/contract.constants"
import { contractsApi } from "@/lib/api"
import type { Contract, ContractStatus } from "@/types/contract"

interface ContractDocumentRowProps {
  contract: Contract
  onView?: (contract: Contract) => void
  onEdit?: (contract: Contract) => void
}

export function ContractDocumentRow({
  contract,
  onView,
  onEdit,
}: ContractDocumentRowProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const pdfUrl = useQuery(
    contractsApi.queries.getPdfUrl,
    contract.pdfStorageId ? { storageId: contract.pdfStorageId } : "skip"
  )

  const removeContract = useMutation(contractsApi.mutations.remove)

  const handleView = useCallback(() => {
    if (onView) {
      onView(contract)
    }
  }, [contract, onView])

  const handleEdit = useCallback(() => {
    if (onEdit && contract.status === "draft") {
      onEdit(contract)
    }
  }, [contract, onEdit])

  const handleOpenPdf = useCallback(() => {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank")
    } else {
      toast.error("PDF não disponível")
    }
  }, [pdfUrl])

  const handleExportPdf = useCallback(async () => {
    if (!pdfUrl) {
      toast.error("PDF nao disponivel")
      return
    }

    setIsExporting(true)
    try {
      const response = await fetch(pdfUrl)
      if (!response.ok) throw new Error("Falha ao baixar PDF")

      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = downloadUrl
      a.download = `${contract.name}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      toast.error("Erro ao exportar PDF")
      console.error("PDF export error:", error)
    } finally {
      setIsExporting(false)
    }
  }, [pdfUrl, contract.name])

  const handleDelete = useCallback(async () => {
    setIsDeleting(true)
    try {
      await removeContract({ id: contract._id })
      toast.success("Contrato removido")
    } catch (error) {
      toast.error("Erro ao remover contrato")
      console.error("Delete contract error:", error)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }, [contract._id, removeContract])

  const canEdit = contract.status === "draft"
  const canExport = !!contract.pdfStorageId

  return (
    <>
      <div
        onClick={(e) => {
          const target = e.target as HTMLElement
          if (target.closest("[data-actions]")) return
          if (canEdit) {
            handleEdit()
          } else if (canExport) {
            handleOpenPdf()
          }
        }}
        className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all cursor-pointer border border-border bg-accent/50 hover:bg-accent hover:border-border group relative"
      >
        <div className="size-10 rounded-xl flex items-center justify-center shrink-0 bg-primary/10 border border-primary/20 text-primary">
          <ScrollText className="size-5" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-text-secondary truncate">{contract.name}</p>
          <p className="text-sm text-muted-foreground truncate">
            {contract.description || "Contrato"}
          </p>
        </div>

        <div className="flex flex-col items-end gap-0.5 shrink-0 opacity-100 group-hover:opacity-0 transition-opacity duration-200 absolute right-4">
          {contract.status === "final" || contract.status === "signed" ? (
            <>
              {contract.pdfSize && (
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(contract.pdfSize)}
                </span>
              )}
              <span className="text-xs text-muted-foreground/70">
                {formatDateOnly(contract._creationTime)}
              </span>
            </>
          ) : (
            <>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  getContractStatusBadgeClassName(contract.status as ContractStatus)
                )}
              >
                {getContractStatusLabel(contract.status as ContractStatus)}
              </Badge>
              <span className="text-xs text-muted-foreground/70">
                {formatDateOnly(contract._creationTime)}
              </span>
            </>
          )}
        </div>

        <div
          data-actions
          className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-accent rounded-lg p-1 -m-1 absolute right-4 z-10"
        >
          {canEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={handleEdit}
              title="Editar"
            >
              <Pencil className="size-4" />
            </Button>
          )}

          {canExport && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={handleExportPdf}
              disabled={isExporting}
              title="Exportar PDF"
            >
              {isExporting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
            </Button>
          )}

          <TrashButton
            onClick={() => setShowDeleteDialog(true)}
            title="Excluir"
          />
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <AlertTriangle />
            </AlertDialogMedia>
            <AlertDialogBody>
              <AlertDialogTitle>Remover contrato</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover o contrato{" "}
                <span className="font-medium text-foreground">
                  {contract.name}
                </span>
                ?
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
    </>
  )
}
