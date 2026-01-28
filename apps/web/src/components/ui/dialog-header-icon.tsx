import { LucideIcon } from "lucide-react"
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface DialogHeaderWithIconProps {
  icon: LucideIcon
  title: string
  description?: string
}

export function DialogHeaderWithIcon({
  icon: Icon,
  title,
  description,
}: DialogHeaderWithIconProps) {
  return (
    <div className="flex items-center gap-gap p-6 border-b border-border/50">
      <div className="size-icon-container-md rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
        <Icon className="size-icon-md text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        {description && (
          <DialogDescription className="text-sm text-muted-foreground mt-0.5">
            {description}
          </DialogDescription>
        )}
      </div>
    </div>
  )
}
