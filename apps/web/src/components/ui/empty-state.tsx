import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  onClick?: () => void
  className?: string
  compact?: boolean
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  onClick,
  className,
  compact = false,
}: EmptyStateProps) {
  const Wrapper = onClick ? "button" : "div"

  return (
    <Wrapper
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-3 w-full",
        compact ? "py-8" : "h-72",
        onClick && "group cursor-pointer",
        className
      )}
    >
      <div
        className={cn(
          "rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center",
          onClick && "group-hover:bg-primary/15 group-hover:border-primary/30 transition-colors",
          compact ? "size-12" : "size-16"
        )}
      >
        <Icon className={cn("text-primary", compact ? "size-6" : "size-8")} />
      </div>
      <div className="text-center">
        <p
          className={cn(
            "font-semibold text-text-secondary",
            onClick && "group-hover:text-text-primary transition-colors",
            compact ? "text-sm" : "text-base"
          )}
        >
          {title}
        </p>
        {description && (
          <p className={cn("text-muted-foreground mt-1", compact ? "text-xs" : "text-sm")}>
            {description}
          </p>
        )}
      </div>
    </Wrapper>
  )
}
