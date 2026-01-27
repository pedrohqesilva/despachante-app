import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type StatusType = "success" | "warning" | "error" | "neutral" | "info"

const statusStyles: Record<StatusType, string> = {
  success: "bg-status-success-muted text-status-success-foreground border-status-success-border",
  warning: "bg-status-warning-muted text-status-warning-foreground border-status-warning-border",
  error: "bg-status-error-muted text-status-error-foreground border-status-error-border",
  neutral: "bg-status-neutral-muted text-status-neutral-foreground border-status-neutral-border",
  info: "bg-status-info-muted text-status-info-foreground border-status-info-border",
}

interface StatusBadgeProps extends React.ComponentProps<typeof Badge> {
  status: StatusType
}

function StatusBadge({ status, className, children, ...props }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(statusStyles[status], "font-medium", className)}
      {...props}
    >
      {children}
    </Badge>
  )
}

export { StatusBadge, statusStyles }
