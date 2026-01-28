import type { Doc } from "../_generated/dataModel"
import { cleanNumericString, normalizeForSearch } from "../lib/utils"

type NotaryOffice = Doc<"notaryOffices">

/**
 * Filtra cartorios por termo de busca.
 * Busca em nome, codigo, endereco, bairro, cidade, estado e CEP.
 */
export function filterNotaryOfficesBySearch(
  notaryOffices: NotaryOffice[],
  search: string
): NotaryOffice[] {
  const searchLower = normalizeForSearch(search)
  const searchCleaned = cleanNumericString(search)

  return notaryOffices.filter(
    (office) =>
      office.name.toLowerCase().includes(searchLower) ||
      office.code.toLowerCase().includes(searchLower) ||
      (office.street && office.street.toLowerCase().includes(searchLower)) ||
      (office.neighborhood && office.neighborhood.toLowerCase().includes(searchLower)) ||
      (office.city && office.city.toLowerCase().includes(searchLower)) ||
      (office.state && office.state.toLowerCase().includes(searchLower)) ||
      (office.zipCode && office.zipCode.includes(searchCleaned))
  )
}
