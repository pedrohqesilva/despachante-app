import type { Doc } from "../_generated/dataModel"
import type { DocumentType } from "../lib/validators"

type ClientDocument = Doc<"clientDocuments">
type Client = Doc<"clients">

const REQUIRED_DOCUMENT_TYPES: DocumentType[] = [
  "cpf",
  "birth_certificate",
  "address_proof",
]

/**
 * Retorna documentos faltantes obrigatorios para um cliente.
 * Considera certidao de casamento obrigatoria para casados.
 */
export function getMissingRequiredDocuments(
  documents: ClientDocument[],
  client: Client
): DocumentType[] {
  const existingTypes = new Set(documents.map((doc) => doc.type))
  const missing: DocumentType[] = []

  for (const type of REQUIRED_DOCUMENT_TYPES) {
    if (!existingTypes.has(type)) {
      missing.push(type)
    }
  }

  const requiresMarriageCertificate =
    client.maritalStatus === "married" ||
    client.maritalStatus === "common_law_marriage"

  if (requiresMarriageCertificate && !existingTypes.has("marriage_certificate")) {
    missing.push("marriage_certificate")
  }

  return missing
}
