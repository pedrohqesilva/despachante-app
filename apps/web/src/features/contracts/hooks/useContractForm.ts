"use client"

import { useState, useCallback } from "react"
import type { Id } from "@despachante/convex/_generated/dataModel"
import type { Contract } from "@/types/contract"

export interface ContractFormData {
  name: string
  description: string
  templateId: Id<"contractTemplates"> | null
  clientId: Id<"clients"> | null
  notaryOfficeId: Id<"notaryOffices"> | null
}

export interface ContractFormErrors {
  name?: string
  templateId?: string
  clientId?: string
}

export interface UseContractFormOptions {
  contract?: Contract | null
}

export interface UseContractFormReturn {
  formData: ContractFormData
  errors: ContractFormErrors
  setFormData: React.Dispatch<React.SetStateAction<ContractFormData>>
  updateField: <K extends keyof ContractFormData>(
    field: K,
    value: ContractFormData[K]
  ) => void
  validate: () => boolean
  reset: () => void
  isValid: boolean
}

const initialFormData: ContractFormData = {
  name: "",
  description: "",
  templateId: null,
  clientId: null,
  notaryOfficeId: null,
}

export function useContractForm(
  options?: UseContractFormOptions
): UseContractFormReturn {
  const { contract } = options || {}

  const [formData, setFormData] = useState<ContractFormData>(() => {
    if (contract) {
      return {
        name: contract.name,
        description: "",
        templateId: contract.templateId,
        clientId: contract.clientId,
        notaryOfficeId: contract.notaryOfficeId || null,
      }
    }
    return initialFormData
  })

  const [errors, setErrors] = useState<ContractFormErrors>({})

  const updateField = useCallback(
    <K extends keyof ContractFormData>(field: K, value: ContractFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      if (errors[field as keyof ContractFormErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }))
      }
    },
    [errors]
  )

  const validate = useCallback((): boolean => {
    const newErrors: ContractFormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Nome do contrato e obrigatorio"
    }

    if (!formData.templateId) {
      newErrors.templateId = "Selecione um modelo"
    }

    if (!formData.clientId) {
      newErrors.clientId = "Selecione um cliente"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const reset = useCallback(() => {
    setFormData(initialFormData)
    setErrors({})
  }, [])

  const isValid =
    !!formData.name.trim() && !!formData.templateId && !!formData.clientId

  return {
    formData,
    errors,
    setFormData,
    updateField,
    validate,
    reset,
    isValid,
  }
}
