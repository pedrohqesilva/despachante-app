import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { PROPERTY_TYPE_OPTIONS } from "@/lib/constants"
import type { PropertyType } from "@/types/property"

interface PropertyTypeSelectorProps {
  value: PropertyType | ""
  onChange: (value: PropertyType) => void
  hasError?: boolean
  disabled?: boolean
}

export function PropertyTypeSelector({
  value,
  onChange,
  hasError,
  disabled,
}: PropertyTypeSelectorProps) {
  return (
    <div className={cn(
      "grid grid-cols-4 gap-3 p-1 rounded-xl transition-all duration-200",
      hasError && "bg-destructive/5 ring-1 ring-destructive/20"
    )}>
      {PROPERTY_TYPE_OPTIONS.map(({ value: optionValue, icon: Icon, label }) => {
        const isSelected = value === optionValue
        return (
          <button
            key={optionValue}
            type="button"
            onClick={() => !disabled && onChange(optionValue)}
            disabled={disabled}
            className={cn(
              "relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl text-center transition-all cursor-pointer aspect-square",
              isSelected
                ? "border-2 border-primary bg-primary/10 shadow-sm"
                : "border border-border bg-accent/50 hover:bg-accent hover:border-muted-foreground/30",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div
              className={cn(
                "size-10 rounded-lg flex items-center justify-center transition-colors",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background border border-border text-text-tertiary"
              )}
            >
              <Icon className="size-5" />
            </div>
            <p
              className={cn(
                "text-sm font-medium",
                isSelected ? "text-text-primary" : "text-text-secondary"
              )}
            >
              {label}
            </p>
            {isSelected && (
              <div className="absolute top-2 right-2 size-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="size-3 text-primary-foreground" />
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
