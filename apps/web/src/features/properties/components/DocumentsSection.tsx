import { FileText } from "lucide-react"
import { Id } from "@despachante/convex/_generated/dataModel"

interface DocumentsSectionProps {
  propertyId: Id<"properties">
}

export function DocumentsSection({ propertyId }: DocumentsSectionProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="size-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
        <FileText className="size-8 text-primary" />
      </div>
      <p className="text-base font-semibold text-text-secondary">
        Documentos do imovel
      </p>
      <p className="text-sm text-muted-foreground mt-1 text-center max-w-xs">
        Em breve voce podera adicionar documentos relacionados a este imovel.
      </p>
    </div>
  )
}
