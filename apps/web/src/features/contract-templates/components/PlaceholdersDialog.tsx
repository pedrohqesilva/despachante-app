"use client"

import { useState } from "react"
import { User, Building2, Landmark, Calendar, Braces, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CollapsibleSection } from "@/components/ui/collapsible-section"
import { PLACEHOLDER_GROUPS } from "@/lib/constants/contract-template.constants"
import type { Placeholder } from "@/types/contract-template"

interface PlaceholdersDialogProps {
  onPlaceholderClick: (placeholder: string) => void
  disabled?: boolean
  tabIndex?: number
}

const ICON_MAP: Record<string, LucideIcon> = {
  User,
  Building2,
  Landmark,
  Calendar,
}

interface PlaceholderItemProps {
  placeholder: Placeholder
  onClick: () => void
}

function PlaceholderItem({ placeholder, onClick }: PlaceholderItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between gap-4 px-3 py-2.5 text-left cursor-pointer rounded-lg border border-border/50 hover:bg-white/10 transition-colors"
    >
      <span className="text-sm text-foreground">
        {placeholder.label}
      </span>
      <code className="text-xs font-mono shrink-0 text-muted-foreground bg-background/50 px-2 py-0.5 rounded">
        {`{{${placeholder.key}}}`}
      </code>
    </button>
  )
}

export function PlaceholdersDialog({
  onPlaceholderClick,
  disabled,
  tabIndex,
}: PlaceholdersDialogProps) {
  const [open, setOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(["Cliente"])
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

  const handlePlaceholderClick = (placeholder: string) => {
    onPlaceholderClick(placeholder)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled} tabIndex={tabIndex}>
          <Braces className="size-4 mr-2" />
          Campos Disponíveis
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[500px] p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Campos Disponíveis</DialogTitle>
          <DialogDescription>
            Clique em um campo para inserir no editor. O valor será substituído automaticamente ao gerar o contrato.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="pb-4 pr-2 space-y-1">
            {PLACEHOLDER_GROUPS.map((group) => (
              <CollapsibleSection
                key={group.category}
                icon={ICON_MAP[group.icon]}
                title={group.category}
                expanded={expandedGroups.has(group.category)}
                onExpandedChange={() => toggleGroup(group.category)}
              >
                <div className="space-y-1">
                  {group.placeholders.map((placeholder) => (
                    <PlaceholderItem
                      key={placeholder.key}
                      placeholder={placeholder}
                      onClick={() => handlePlaceholderClick(`{{${placeholder.key}}}`)}
                    />
                  ))}
                </div>
              </CollapsibleSection>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
