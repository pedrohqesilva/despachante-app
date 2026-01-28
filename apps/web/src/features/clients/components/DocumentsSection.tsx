import { useState, useCallback, DragEvent } from "react"
import { FileText, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Id } from "../../../../convex/_generated/dataModel"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface DocumentsSectionProps {
  clientId: Id<"clients">
}

export function DocumentsSection({ clientId: _clientId }: DocumentsSectionProps) {
  const [isDragging, setIsDragging] = useState(false)

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

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      // TODO: Implementar upload de arquivos
      toast.info(`${files.length} arquivo(s) selecionado(s) para upload`)
      console.log("Files dropped:", files)
    }
  }, [])

  const handleFileSelect = useCallback(() => {
    const input = document.createElement("input")
    input.type = "file"
    input.multiple = true
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || [])
      if (files.length > 0) {
        // TODO: Implementar upload de arquivos
        toast.info(`${files.length} arquivo(s) selecionado(s) para upload`)
        console.log("Files selected:", files)
      }
    }
    input.click()
  }, [])

  return (
    <div
      className={cn(
        "relative min-h-[400px] rounded-xl border-2 border-dashed transition-all duration-200",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border/50 hover:border-border"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        <div
          className={cn(
            "size-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-200",
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
        <p className="text-base font-semibold text-text-secondary">
          {isDragging ? "Solte os arquivos aqui" : "Nenhum arquivo cadastrado"}
        </p>
        <p className="text-sm text-muted-foreground mt-1 text-center max-w-xs">
          {isDragging
            ? "Solte para fazer upload"
            : "Arraste arquivos ou clique para selecionar"}
        </p>
        {!isDragging && (
          <Button variant="outline" className="mt-4" onClick={handleFileSelect}>
            <FileText className="size-4 mr-2" />
            Selecionar Arquivos
          </Button>
        )}
      </div>
    </div>
  )
}
