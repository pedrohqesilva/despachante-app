import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

export type IconContainerSize = "sm" | "md" | "lg"

const sizeStyles: Record<IconContainerSize, { container: string; icon: string }> = {
  sm: {
    container: "size-icon-container-sm",
    icon: "size-icon-sm",
  },
  md: {
    container: "size-icon-container-md",
    icon: "size-icon-md",
  },
  lg: {
    container: "size-icon-container-lg",
    icon: "size-icon-lg",
  },
}

interface IconContainerProps {
  size?: IconContainerSize
  icon: LucideIcon
  className?: string
  iconClassName?: string
  variant?: "default" | "primary" | "muted"
}

const variantStyles: Record<string, { container: string; icon: string }> = {
  default: {
    container: "bg-background border border-border",
    icon: "text-text-tertiary",
  },
  primary: {
    container: "bg-primary text-primary-foreground shadow-sm",
    icon: "text-primary-foreground",
  },
  muted: {
    container: "bg-muted",
    icon: "text-text-tertiary",
  },
}

function IconContainer({
  size = "md",
  icon: Icon,
  className,
  iconClassName,
  variant = "default",
}: IconContainerProps) {
  return (
    <div
      className={cn(
        sizeStyles[size].container,
        "rounded-xl flex items-center justify-center shrink-0",
        variantStyles[variant].container,
        className
      )}
    >
      <Icon
        className={cn(
          sizeStyles[size].icon,
          variantStyles[variant].icon,
          iconClassName
        )}
      />
    </div>
  )
}

export { IconContainer, sizeStyles, variantStyles }
