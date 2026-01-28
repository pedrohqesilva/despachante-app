import { useState } from "react"
import { Users, ExternalLink } from "lucide-react"
import { Id } from "@despachante/convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TableRow, TableCell } from "@/components/ui/table"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { TrashButton } from "@/components/ui/trash-button"
import { PropertiesTableActions } from "./PropertiesTableActions"
import {
  getPropertyTypeLabel,
  getPropertyStatusLabel,
  getPropertyStatusBadgeVariant,
  getPropertyStatusBadgeClassName,
  getClientStatusLabel,
  getClientStatusBadgeVariant,
  getClientStatusBadgeClassName,
} from "@/lib/constants"
import { formatZipCode, formatCurrency, formatArea, formatTaxId } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Property } from "@/types/property"
import type { Client } from "@/types/client"

interface PropertyTableRowProps {
  property: Property
  owners: Client[]
  onEdit: (property: Property) => void
  onDelete: (property: Property) => Promise<void>
  onRowClick: (property: Property) => void
  onNavigateToClient: (clientId: Id<"clients">) => void
  onRemoveOwnerRequest: (
    propertyId: Id<"properties">,
    ownerId: Id<"clients">,
    ownerName: string,
    currentOwnerIds: Id<"clients">[]
  ) => void
  isRemovingOwner: boolean
  removingOwnerId: Id<"clients"> | null
}

export function PropertyTableRow({
  property,
  owners,
  onEdit,
  onDelete,
  onRowClick,
  onNavigateToClient,
  onRemoveOwnerRequest,
  isRemovingOwner,
  removingOwnerId,
}: PropertyTableRowProps) {
  const [isOwnersPopoverOpen, setIsOwnersPopoverOpen] = useState(false)

  const handleRowClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('[data-actions]') || target.closest('[data-owners-badge]')) return
    onRowClick(property)
  }

  const handleMenuOpenChange = (open: boolean) => {
    if (open) {
      setIsOwnersPopoverOpen(false)
    }
  }

  return (
    <TableRow
      className="hover:bg-muted/50 cursor-pointer"
      onClick={handleRowClick}
    >
      <TableCell className="text-text-tertiary">
        {getPropertyTypeLabel(property.type)}
      </TableCell>
      <TableCell className="text-text-secondary">
        {property.street}, {property.number}
        {property.complement && `, ${property.complement}`}
        , {property.neighborhood}, {property.city}/{property.state} - {formatZipCode(property.zipCode)}
      </TableCell>
      <TableCell className="text-text-tertiary">
        {formatCurrency(property.value)}
      </TableCell>
      <TableCell className="text-text-tertiary">
        {formatArea(property.area)}
      </TableCell>
      <TableCell data-owners-badge>
        <Popover open={isOwnersPopoverOpen} onOpenChange={setIsOwnersPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-accent hover:bg-accent/80 border border-border hover:border-border/80 transition-colors cursor-pointer"
            >
              <Users className="size-3.5 text-muted-foreground" />
              <span className="text-sm font-medium text-text-secondary">{owners.length}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start" sideOffset={4}>
            <div className="p-3 border-b border-border/50">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Proprietários
              </p>
            </div>
            <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
              {owners.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Nenhum proprietário vinculado
                </p>
              ) : (
                owners.map((owner) => (
                  <div
                    key={owner._id}
                    onClick={(e) => {
                      const target = e.target as HTMLElement
                      if (target.closest('[data-actions]')) return
                      setIsOwnersPopoverOpen(false)
                      onNavigateToClient(owner._id)
                    }}
                    className="group/owner flex items-center gap-2 p-2 rounded-lg hover:bg-accent cursor-pointer relative"
                  >
                    <div className="size-8 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                      <span className="text-xs font-medium text-text-tertiary">
                        {owner.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{owner.name}</p>
                      <p className="text-xs text-muted-foreground">{formatTaxId(owner.taxId)}</p>
                    </div>
                    <div className="shrink-0 opacity-100 group-hover/owner:opacity-0 transition-opacity duration-200 absolute right-2">
                      <Badge
                        variant={getClientStatusBadgeVariant(owner.status)}
                        className={cn("text-[10px]", getClientStatusBadgeClassName(owner.status))}
                      >
                        {getClientStatusLabel(owner.status)}
                      </Badge>
                    </div>
                    <div data-actions className="flex items-center gap-1 shrink-0 opacity-0 group-hover/owner:opacity-100 transition-opacity duration-200 bg-accent rounded-lg p-1 -m-1 relative z-10">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          onNavigateToClient(owner._id)
                          setIsOwnersPopoverOpen(false)
                        }}
                      >
                        <ExternalLink className="size-4 text-muted-foreground" />
                      </Button>
                      <TrashButton
                        onClick={() => {
                          if (owners.length > 1) {
                            onRemoveOwnerRequest(property._id, owner._id, owner.name, property.ownerIds)
                          }
                        }}
                        disabled={owners.length <= 1}
                        isLoading={isRemovingOwner && removingOwnerId === owner._id}
                        title={owners.length <= 1 ? "O imóvel deve ter pelo menos um proprietário" : "Remover proprietário"}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
      </TableCell>
      <TableCell>
        <Badge
          variant={getPropertyStatusBadgeVariant(property.status)}
          className={getPropertyStatusBadgeClassName(property.status)}
        >
          {getPropertyStatusLabel(property.status)}
        </Badge>
      </TableCell>
      <TableCell className="text-right" data-actions>
        <PropertiesTableActions
          property={property}
          onView={() => onRowClick(property)}
          onEdit={onEdit}
          onDelete={onDelete}
          onMenuOpenChange={handleMenuOpenChange}
        />
      </TableCell>
    </TableRow>
  )
}
