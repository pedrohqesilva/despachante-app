"use client"

import { User, Building2, Landmark, Calendar, ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { PLACEHOLDER_GROUPS } from "@/lib/constants/contract-template.constants"
import type { PlaceholderGroup, Placeholder } from "@/types/contract-template"

interface PlaceholdersSidebarProps {
  onPlaceholderClick: (placeholder: string) => void
  disabled?: boolean
  className?: string
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  User,
  Building2,
  Landmark,
  Calendar,
}

interface PlaceholderGroupSectionProps {
  group: PlaceholderGroup
  isExpanded: boolean
  onToggle: () => void
  onPlaceholderClick: (placeholder: string) => void
  disabled?: boolean
}

function PlaceholderGroupSection({
  group,
  isExpanded,
  onToggle,
  onPlaceholderClick,
  disabled,
}: PlaceholderGroupSectionProps) {
  const Icon = ICON_MAP[group.icon] || User

  return (
    <div className="border-b border-border/50 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium",
          "hover:bg-muted/50 transition-colors",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <Icon className="size-4 text-muted-foreground" />
        <span className="flex-1 text-left">{group.category}</span>
        {isExpanded ? (
          <ChevronDown className="size-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-4 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="pb-2">
          {group.placeholders.map((placeholder) => (
            <PlaceholderItem
              key={placeholder.key}
              placeholder={placeholder}
              onClick={() => onPlaceholderClick(`{{${placeholder.key}}}`)}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface PlaceholderItemProps {
  placeholder: Placeholder
  onClick: () => void
  disabled?: boolean
}

function PlaceholderItem({ placeholder, onClick, disabled }: PlaceholderItemProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClick}
            disabled={disabled}
            className={cn(
              "w-full justify-start h-auto py-1.5 px-3 pl-9",
              "text-sm font-normal hover:bg-primary/5 hover:text-primary",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <span className="truncate">{placeholder.label}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-[200px]">
          <div className="space-y-1">
            <p className="font-medium text-xs">Exemplo:</p>
            <p className="text-xs text-muted-foreground">{placeholder.example}</p>
            <p className="font-mono text-xs text-primary/80">{`{{${placeholder.key}}}`}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function PlaceholdersSidebar({
  onPlaceholderClick,
  disabled,
  className,
}: PlaceholdersSidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(PLACEHOLDER_GROUPS.map((g) => g.category))
  )

  const toggleGroup = (category: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  return (
    <div
      className={cn(
        "flex flex-col border-l border-border/50 bg-muted/20",
        className
      )}
    >
      <div className="px-3 py-2.5 border-b border-border/50">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Campos Disponíveis
        </h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="py-1">
          {PLACEHOLDER_GROUPS.map((group) => (
            <PlaceholderGroupSection
              key={group.category}
              group={group}
              isExpanded={expandedGroups.has(group.category)}
              onToggle={() => toggleGroup(group.category)}
              onPlaceholderClick={onPlaceholderClick}
              disabled={disabled}
            />
          ))}
        </div>
      </ScrollArea>

      <div className="px-3 py-2 border-t border-border/50 bg-muted/30">
        <p className="text-xs text-muted-foreground">
          Clique em um campo para inserir no editor
        </p>
      </div>
    </div>
  )
}
