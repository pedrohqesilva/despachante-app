import type { SortOrder } from "./validators"

/**
 * Remove caracteres nao numericos de uma string.
 * Util para comparar CPF, telefone, CEP.
 */
export function cleanNumericString(value: string): string {
  return value.replace(/\D/g, "")
}

/**
 * Normaliza string para busca (lowercase + trim).
 */
export function normalizeForSearch(value: string): string {
  return value.toLowerCase().trim()
}

/**
 * Calcula parametros de paginacao.
 */
export function getPaginationParams(page?: number, pageSize?: number) {
  const currentPage = page ?? 1
  const currentPageSize = pageSize ?? 10
  const skip = (currentPage - 1) * currentPageSize

  return {
    page: currentPage,
    pageSize: currentPageSize,
    skip,
  }
}

/**
 * Retorna resultado paginado com metadados.
 */
export function paginateResults<T>(
  items: T[],
  page: number,
  pageSize: number,
  skip: number
): {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
} {
  const total = items.length
  const data = items.slice(skip, skip + pageSize)

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

/**
 * Funcao generica para ordenacao de arrays.
 */
export function sortItems<T extends Record<string, unknown>>(
  items: T[],
  sortBy?: string,
  sortOrder: SortOrder = "asc"
): T[] {
  if (!sortBy) return items

  return [...items].sort((a, b) => {
    const aValue = a[sortBy]
    const bValue = b[sortBy]

    if (aValue === undefined || aValue === null) return 1
    if (bValue === undefined || bValue === null) return -1

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue
    }

    return 0
  })
}

/**
 * Retorna timestamp atual em milliseconds.
 */
export function getCurrentTimestamp(): number {
  return Date.now()
}
