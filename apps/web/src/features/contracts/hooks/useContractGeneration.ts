"use client"

import { useState, useCallback } from "react"
import { useQuery } from "convex/react"
import type { Id } from "@despachante/convex/_generated/dataModel"
import { contractTemplatesApi, clientsApi, propertiesApi, notaryOfficesApi } from "@/lib/api"
import { replacePlaceholders, type ReplacementData } from "../utils/placeholder-replacer"

export interface UseContractGenerationOptions {
  templateId: Id<"contractTemplates"> | null
  clientIds: Id<"clients">[]
  propertyId: Id<"properties">
  notaryOfficeIds: Id<"notaryOffices">[]
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
  const { templateId, clientIds, propertyId, notaryOfficeIds } = options

  const [generatedContent, setGeneratedContent] = useState("")
  const [error, setError] = useState<string | null>(null)

  const primaryClientId = clientIds[0] || null
  const primaryNotaryOfficeId = notaryOfficeIds[0] || null

  const template = useQuery(
    contractTemplatesApi.queries.getById,
    templateId ? { id: templateId } : "skip"
  )

  const client = useQuery(
    clientsApi.queries.get,
    primaryClientId ? { id: primaryClientId } : "skip"
  )

  const property = useQuery(propertiesApi.queries.get, { id: propertyId })

  const notaryOffice = useQuery(
    notaryOfficesApi.queries.getById,
    primaryNotaryOfficeId ? { id: primaryNotaryOfficeId } : "skip"
  )

  const isLoading = Boolean(
    (templateId && template === undefined) ||
    (primaryClientId && client === undefined) ||
    property === undefined ||
    (primaryNotaryOfficeId && notaryOffice === undefined)
  )

  const isReady =
    !!template && !!client && !!property && (!primaryNotaryOfficeId || !!notaryOffice)

  const generate = useCallback(() => {
    setError(null)

    if (!template) {
      setError("Modelo não encontrado")
      return
    }

    if (!client) {
      setError("Cliente não encontrado")
      return
    }

    if (!property) {
      setError("Imóvel não encontrado")
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
