"use client"

import { useState } from "react"
import { ChevronDown, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface CollapsibleSectionProps {
  icon?: LucideIcon
  title: string
  children: React.ReactNode
  defaultExpanded?: boolean
  expanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  className?: string
}

export function CollapsibleSection({
  icon: Icon,
  title,
  children,
  defaultExpanded = false,
  expanded: controlledExpanded,
  onExpandedChange,
  className,
}: CollapsibleSectionProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded)

  const isControlled = controlledExpanded !== undefined
  const isExpanded = isControlled ? controlledExpanded : internalExpanded

  const handleToggle = () => {
    if (isControlled) {
      onExpandedChange?.(!controlledExpanded)
    } else {
      setInternalExpanded((prev) => !prev)
    }
  }

  return (
    <div className={className}>
      <div className="px-2">
        <button
          type="button"
          onClick={handleToggle}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium cursor-pointer rounded-lg hover:bg-white/10 transition-colors"
        >
          {Icon && (
            <div
              className={cn(
                "size-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                isExpanded ? "bg-primary/10" : "bg-muted"
              )}
            >
              <Icon
                className={cn(
                  "size-4 transition-colors",
                  isExpanded ? "text-primary" : "text-muted-foreground"
                )}
              />
            </div>
          )}
          <span className="flex-1 text-left">{title}</span>
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transform transition-transform duration-200 ease-out",
              isExpanded ? "rotate-0" : "rotate-180"
            )}
          />
        </button>
      </div>

      <div
        className={cn(
          "grid transition-all duration-200 ease-out",
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="pl-7 pr-2 pb-1 ml-2 pt-1">
            <div className="border-l border-border/50 pl-4">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
