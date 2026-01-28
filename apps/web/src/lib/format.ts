/**
 * Formats a CPF or CNPJ string
 * CPF: 000.000.000-00
 * CNPJ: 00.000.000/0000-00
 */
export function formatTaxId(taxId: string): string {
  const cleaned = taxId.replace(/\D/g, "")

  if (cleaned.length === 11) {
    // CPF
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  } else if (cleaned.length === 14) {
    // CNPJ
    return cleaned.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5"
    )
  }

  return taxId
}

/**
 * Formats a phone number string
 * (00) 00000-0000 or (00) 0000-0000
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "")

  if (cleaned.length === 11) {
    // Mobile with area code
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  } else if (cleaned.length === 10) {
    // Landline with area code
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
  }

  return phone
}

/**
 * Formats a date timestamp to Brazilian format
 * DD/MM/YYYY HH:mm
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${day}/${month}/${year} ${hours}:${minutes}`
}

/**
 * Formats a date timestamp to Brazilian date only format
 * DD/MM/YYYY
 */
export function formatDateOnly(timestamp: number): string {
  const date = new Date(timestamp)
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()

  return `${day}/${month}/${year}`
}

/**
 * Formats a ZIP code string
 * 00000-000
 */
export function formatZipCode(zipCode: string): string {
  const cleaned = zipCode.replace(/\D/g, "")

  if (cleaned.length === 8) {
    return cleaned.replace(/(\d{5})(\d{3})/, "$1-$2")
  }

  return zipCode
}

/**
 * Formats a currency value to Brazilian format
 * R$ 0.000,00
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

/**
 * Formats an area value
 * 0.000 m²
 */
export function formatArea(area: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(area) + " m²"
}

/**
 * Formats a file size in bytes to human readable format
 * KB, MB, GB
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

/**
 * Formats phone input as user types
 * (00) 00000-0000
 */
export function formatPhoneInput(value: string): string {
  const cleaned = value.replace(/\D/g, "")
  if (cleaned.length <= 2) return cleaned
  if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`
  if (cleaned.length <= 10) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`
}

/**
 * Formats CPF/CNPJ input as user types
 * CPF: 000.000.000-00
 * CNPJ: 00.000.000/0000-00
 */
export function formatTaxIdInput(value: string): string {
  const cleaned = value.replace(/\D/g, "")

  if (cleaned.length <= 11) {
    if (cleaned.length <= 3) return cleaned
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`
    if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`
  }

  if (cleaned.length <= 2) return cleaned
  if (cleaned.length <= 5) return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`
  if (cleaned.length <= 8) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`
  if (cleaned.length <= 12) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8)}`
  return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`
}

/**
 * Formats ZIP code input as user types
 * 00000-000
 */
export function formatZipCodeInput(value: string): string {
  const cleaned = value.replace(/\D/g, "")
  if (cleaned.length <= 5) return cleaned
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`
}

/**
 * Formats currency input as user types (cents to display)
 * 1.234,56
 */
export function formatCurrencyInput(value: string): string {
  const cleaned = value.replace(/\D/g, "")
  if (!cleaned) return ""
  const number = parseInt(cleaned, 10) / 100
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number)
}

/**
 * Parses formatted currency string to number
 * "1.234,56" -> 1234.56
 */
export function parseCurrencyValue(value: string): number {
  const cleaned = value.replace(/\./g, "").replace(",", ".")
  return parseFloat(cleaned) || 0
}
