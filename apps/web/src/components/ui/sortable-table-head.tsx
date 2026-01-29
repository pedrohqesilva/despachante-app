import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { TableHead } from "@/components/ui/table"

interface SortableTableHeadProps<T extends string> {
  field: T
  currentSortField: T
  currentSortOrder: "asc" | "desc"
  onSort: (field: T) => void
  children: React.ReactNode
  className?: string
}

export function SortableTableHead<T extends string>({
  field,
  currentSortField,
  currentSortOrder,
  onSort,
  children,
  className,
}: SortableTableHeadProps<T>) {
  const isActive = currentSortField === field

  return (
    <TableHead className={className}>
      <button
        onClick={() => onSort(field)}
        className="flex items-center hover:text-foreground cursor-pointer font-semibold"
      >
        {children}
        {isActive ? (
          currentSortOrder === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : (
            <ArrowDown className="ml-2 h-4 w-4" />
          )
        ) : (
          <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
        )}
      </button>
    </TableHead>
  )
}

interface TableHeadPlainProps {
  children: React.ReactNode
  className?: string
}

export function TableHeadPlain({ children, className }: TableHeadPlainProps) {
  return (
    <TableHead className={className}>
      <span className="font-semibold">{children}</span>
    </TableHead>
  )
}
