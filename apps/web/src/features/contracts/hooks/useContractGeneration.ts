"use client"

import { useState, useCallback } from "react"
import { useQuery } from "convex/react"
import type { Id } from "@despachante/convex/_generated/dataModel"
import { contractTemplatesApi, clientsApi, propertiesApi, notaryOfficesApi } from "@/lib/api"
import { replacePlaceholders, type ReplacementData } from "../utils/placeholder-replacer"

export interface UseContractGenerationOptions {
  templateId: Id<"contractTemplates"> | null
  clientId: Id<"clients"> | null
  propertyId: Id<"properties">
  notaryOfficeId: Id<"notaryOffices"> | null
}

export interface UseContractGenerationReturn {
  generatedContent: string
  isLoading: boolean
  error: string | null
  generate: () => void
  templateName: string | null
  isReady: boolean
}

export function useContractGeneration(
  options: UseContractGenerationOptions
): UseContractGenerationReturn {
  const { templateId, clientId, propertyId, notaryOfficeId } = options

  const [generatedContent, setGeneratedContent] = useState("")
  const [error, setError] = useState<string | null>(null)

  const template = useQuery(
    contractTemplatesApi.queries.getById,
    templateId ? { id: templateId } : "skip"
  )

  const client = useQuery(
    clientsApi.queries.get,
    clientId ? { id: clientId } : "skip"
  )

  const property = useQuery(propertiesApi.queries.get, { id: propertyId })

  const notaryOffice = useQuery(
    notaryOfficesApi.queries.getById,
    notaryOfficeId ? { id: notaryOfficeId } : "skip"
  )

  const isLoading =
    (templateId && template === undefined) ||
    (clientId && client === undefined) ||
    property === undefined ||
    (notaryOfficeId && notaryOffice === undefined)

  const isReady =
    !!template && !!client && !!property && (!notaryOfficeId || !!notaryOffice)

  const generate = useCallback(() => {
    setError(null)

    if (!template) {
      setError("Modelo nao encontrado")
      return
    }

    if (!client) {
      setError("Cliente nao encontrado")
      return
    }

    if (!property) {
      setError("Imovel nao encontrado")
      return
    }

    try {
      const data: ReplacementData = {
        client,
        property,
        notaryOffice: notaryOffice || null,
      }

      const content = replacePlaceholders(template.content, data)
      setGeneratedContent(content)
    } catch (err) {
      setError("Erro ao gerar contrato")
      console.error("Contract generation error:", err)
    }
  }, [template, client, property, notaryOffice])

  return {
    generatedContent,
    isLoading,
    error,
    generate,
    templateName: template?.name || null,
    isReady,
  }
}
