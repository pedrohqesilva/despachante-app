import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DateInput } from "@/components/ui/date-input"
import { MARITAL_STATUS_OPTIONS, PROPERTY_REGIME_OPTIONS, requiresSpouse } from "@/lib/constants"
import type { MaritalStatus, PropertyRegime } from "@/types/client"

interface MaritalStatusSelectorProps {
  maritalStatus: MaritalStatus | ""
  propertyRegime: PropertyRegime | ""
  weddingDate?: string
  onMaritalStatusChange: (value: MaritalStatus) => void
  onPropertyRegimeChange: (value: PropertyRegime) => void
  onWeddingDateChange?: (value: string) => void
  maritalStatusError?: boolean
  propertyRegimeError?: boolean
  showWeddingDate?: boolean
}

export function MaritalStatusSelector({
  maritalStatus,
  propertyRegime,
  weddingDate,
  onMaritalStatusChange,
  onPropertyRegimeChange,
  onWeddingDateChange,
  maritalStatusError,
  propertyRegimeError,
  showWeddingDate = false,
}: MaritalStatusSelectorProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Estado Civil <span className="text-destructive">*</span>
      </p>
      <div className="space-y-4">
        <div
          className={cn(
            "grid grid-cols-3 sm:grid-cols-5 gap-2 p-1 rounded-xl transition-all duration-200",
            maritalStatusError && "bg-destructive/5 ring-1 ring-destructive/20"
          )}
          role="radiogroup"
          aria-label="Estado civil"
        >
          {MARITAL_STATUS_OPTIONS.map(({ value, icon: Icon, label }) => {
            const isSelected = maritalStatus === value
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onMaritalStatusChange(value)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl text-center transition-all cursor-pointer aspect-square",
                  isSelected
                    ? "border-2 border-primary bg-primary/10 shadow-sm"
                    : "border border-border bg-accent/50 hover:bg-accent hover:border-muted-foreground/30"
                )}
              >
                <div
                  className={cn(
                    "size-8 rounded-lg flex items-center justify-center transition-colors",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-background border border-border text-text-tertiary"
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <p
                  className={cn(
                    "text-xs font-medium leading-tight",
                    isSelected ? "text-text-primary" : "text-text-secondary"
                  )}
                >
                  {label}
                </p>
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 size-4 rounded-full bg-primary flex items-center justify-center">
                    <Check className="size-2.5 text-primary-foreground" />
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Regime de Bens */}
        {requiresSpouse(maritalStatus) && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Regime de Bens <span className="text-destructive">*</span>
            </Label>
            <Select
              value={propertyRegime}
              onValueChange={(value) => onPropertyRegimeChange(value as PropertyRegime)}
            >
              <SelectTrigger
                className="w-full h-10"
                aria-invalid={propertyRegimeError}
              >
                <SelectValue placeholder="Selecione o regime de bens" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_REGIME_OPTIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Data do Casamento */}
        {showWeddingDate && requiresSpouse(maritalStatus) && onWeddingDateChange && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              {maritalStatus === "married" ? "Data do Casamento" : "Desde"}
            </Label>
            <DateInput
              value={weddingDate || ""}
              onChange={(e) => onWeddingDateChange(e.target.value)}
              className="h-10"
            />
          </div>
        )}
      </div>
    </div>
  )
}
