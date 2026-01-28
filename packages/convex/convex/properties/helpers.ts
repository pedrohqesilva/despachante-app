import type { Doc } from "../_generated/dataModel"
import { cleanNumericString, normalizeForSearch } from "../lib/utils"

type Property = Doc<"properties">

/**
 * Filtra imoveis por termo de busca.
 * Busca em rua, bairro, cidade, estado e CEP.
 */
export function filterPropertiesBySearch(
  properties: Property[],
  search: string
): Property[] {
  const searchLower = normalizeForSearch(search)
  const searchCleaned = cleanNumericString(search)

  return properties.filter(
    (property) =>
      property.street.toLowerCase().includes(searchLower) ||
      property.neighborhood.toLowerCase().includes(searchLower) ||
      property.city.toLowerCase().includes(searchLower) ||
      property.state.toLowerCase().includes(searchLower) ||
      property.zipCode.includes(searchCleaned)
  )
}

/**
 * Verifica se existe imovel duplicado pelo endereco.
 */
export function checkPropertyDuplicate(
  properties: Property[],
  data: {
    street: string
    number: string
    zipCode: string
  },
  excludeId?: string
): boolean {
  const streetLower = normalizeForSearch(data.street)
  const numberLower = normalizeForSearch(data.number)
  const zipCodeCleaned = cleanNumericString(data.zipCode)

  for (const property of properties) {
    if (excludeId && property._id === excludeId) {
      continue
    }

    if (
      normalizeForSearch(property.street) === streetLower &&
      normalizeForSearch(property.number) === numberLower &&
      cleanNumericString(property.zipCode) === zipCodeCleaned
    ) {
      return true
    }
  }

  return false
}
