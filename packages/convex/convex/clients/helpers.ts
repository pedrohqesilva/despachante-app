import type { Doc } from "../_generated/dataModel"
import { cleanNumericString, normalizeForSearch } from "../lib/utils"

type Client = Doc<"clients">

/**
 * Filtra clientes por termo de busca.
 * Busca em nome, taxId e telefone.
 */
export function filterClientsBySearch(clients: Client[], search: string): Client[] {
  const searchLower = normalizeForSearch(search)
  const searchCleaned = cleanNumericString(search)

  return clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchLower) ||
      client.taxId.includes(searchLower) ||
      (searchCleaned.length > 0 &&
        client.phone &&
        cleanNumericString(client.phone).includes(searchCleaned))
  )
}

/**
 * Verifica duplicidade de campos em clientes.
 */
export function checkClientDuplicates(
  clients: Client[],
  data: {
    name: string
    email: string
    phone?: string
    taxId: string
  },
  excludeId?: string
): {
  name?: boolean
  email?: boolean
  phone?: boolean
  taxId?: boolean
} {
  const duplicates: {
    name?: boolean
    email?: boolean
    phone?: boolean
    taxId?: boolean
  } = {}

  const nameLower = normalizeForSearch(data.name)
  const emailLower = data.email.toLowerCase()
  const phoneCleaned = data.phone ? cleanNumericString(data.phone) : undefined
  const taxIdCleaned = cleanNumericString(data.taxId)

  for (const client of clients) {
    if (excludeId && client._id === excludeId) {
      continue
    }

    if (normalizeForSearch(client.name) === nameLower) {
      duplicates.name = true
    }

    if (client.email.toLowerCase() === emailLower) {
      duplicates.email = true
    }

    if (phoneCleaned && client.phone) {
      if (cleanNumericString(client.phone) === phoneCleaned) {
        duplicates.phone = true
      }
    }

    if (cleanNumericString(client.taxId) === taxIdCleaned) {
      duplicates.taxId = true
    }
  }

  return duplicates
}
