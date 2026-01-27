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
