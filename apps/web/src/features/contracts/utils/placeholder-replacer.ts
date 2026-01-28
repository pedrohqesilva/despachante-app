import type { Client, MaritalStatus } from "@/types/client"
import type { Property, PropertyType } from "@/types/property"
import type { NotaryOffice } from "@/types/notary-office"
import {
  formatTaxId,
  formatPhone,
  formatCurrency,
  formatArea,
  formatZipCode,
  formatDateOnly,
} from "@/lib/format"
import { getMaritalStatusLabel } from "@/lib/constants/client.constants"
import { getPropertyTypeLabel } from "@/lib/constants/property.constants"

export interface ReplacementData {
  client: Client
  property: Property
  notaryOffice?: NotaryOffice | null
}

const MONTHS_PT_BR = [
  "janeiro",
  "fevereiro",
  "marco",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
]

function formatDateExtended(timestamp: number): string {
  const date = new Date(timestamp)
  const day = date.getDate()
  const month = MONTHS_PT_BR[date.getMonth()]
  const year = date.getFullYear()
  return `${day} de ${month} de ${year}`
}

function buildFullAddress(property: Property): string {
  const parts = [property.street, property.number]
  if (property.complement) {
    parts.push(property.complement)
  }
  return parts.join(", ")
}

function buildNotaryOfficeAddress(notaryOffice: NotaryOffice): string {
  const parts: string[] = []
  if (notaryOffice.street) {
    parts.push(notaryOffice.street)
    if (notaryOffice.number) {
      parts.push(notaryOffice.number)
    }
    if (notaryOffice.complement) {
      parts.push(notaryOffice.complement)
    }
  }
  return parts.join(", ")
}

type PlaceholderValue = string | number | undefined | null

function getPlaceholderValue(
  key: string,
  data: ReplacementData
): PlaceholderValue {
  const { client, property, notaryOffice } = data
  const now = Date.now()

  const placeholderMap: Record<string, PlaceholderValue> = {
    // Client placeholders
    "client.name": client.name,
    "client.cpf": client.taxId ? formatTaxId(client.taxId) : "",
    "client.email": client.email,
    "client.phone": client.phone ? formatPhone(client.phone) : "",
    "client.maritalStatus": client.maritalStatus
      ? getMaritalStatusLabel(client.maritalStatus as MaritalStatus)
      : "",
    "client.fatherName": client.fatherName || "",
    "client.motherName": client.motherName || "",

    // Property placeholders
    "property.address": buildFullAddress(property),
    "property.street": property.street,
    "property.number": property.number,
    "property.complement": property.complement || "",
    "property.neighborhood": property.neighborhood,
    "property.city": property.city,
    "property.state": property.state,
    "property.zipCode": formatZipCode(property.zipCode),
    "property.area": formatArea(property.area),
    "property.value": formatCurrency(property.value),
    "property.type": getPropertyTypeLabel(property.type as PropertyType),

    // Notary office placeholders
    "notaryOffice.name": notaryOffice?.name || "",
    "notaryOffice.code": notaryOffice?.code || "",
    "notaryOffice.address": notaryOffice
      ? buildNotaryOfficeAddress(notaryOffice)
      : "",
    "notaryOffice.city": notaryOffice?.city || "",

    // Date placeholders
    "date.current": formatDateOnly(now),
    "date.currentExtended": formatDateExtended(now),
  }

  return placeholderMap[key]
}

export function replacePlaceholders(
  template: string,
  data: ReplacementData
): string {
  const placeholderRegex = /\{\{([^}]+)\}\}/g

  return template.replace(placeholderRegex, (match, key: string) => {
    const trimmedKey = key.trim()
    const value = getPlaceholderValue(trimmedKey, data)

    if (value === undefined || value === null) {
      return match
    }

    return String(value)
  })
}
