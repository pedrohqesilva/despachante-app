import { Skeleton } from "@/components/ui/skeleton"
import { TableRow, TableCell } from "@/components/ui/table"

interface TableSkeletonColumn {
  width?: string
}

interface TableSkeletonProps {
  rows?: number
  columns: TableSkeletonColumn[]
}

export function TableSkeleton({ rows = 5, columns }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {columns.map((column, colIndex) => (
            <TableCell key={colIndex}>
              <Skeleton className={`h-4 ${column.width || "w-[100px]"}`} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}
