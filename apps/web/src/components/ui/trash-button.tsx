import { forwardRef } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface TrashButtonProps {
  className?: string
  isLoading?: boolean
  iconClassName?: string
  disabled?: boolean
  title?: string
  onClick?: () => void
}

export const TrashButton = forwardRef<HTMLButtonElement, TrashButtonProps>(
  ({ className, isLoading, disabled, onClick, iconClassName, title }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        data-actions
        className={cn(
          "size-8 inline-flex items-center justify-center rounded-md transition-colors",
          "text-destructive hover:text-destructive hover:bg-destructive/10",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "disabled:pointer-events-none disabled:opacity-50",
          "cursor-pointer",
          className
        )}
        disabled={disabled || isLoading}
        title={title}
        onMouseDown={(e) => {
          e.stopPropagation()
          e.preventDefault()
        }}
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          if (!disabled && !isLoading && onClick) {
            onClick()
          }
        }}
      >
        {isLoading ? (
          <Loader2 className={cn("size-4 animate-spin", iconClassName)} />
        ) : (
          <Trash2 className={cn("size-4", iconClassName)} />
        )}
      </button>
    )
  }
)

TrashButton.displayName = "TrashButton"
