"use client"

import { useState, useCallback } from "react"
import type { Id } from "@despachante/convex/_generated/dataModel"
import type { Contract } from "@/types/contract"

export interface ContractFormData {
  name: string
  description: string
  templateId: Id<"contractTemplates"> | null
  clientIds: Id<"clients">[]
  notaryOfficeIds: Id<"notaryOffices">[]
}

export interface ContractFormErrors {
  name?: string
  clientIds?: string
}

export interface UseContractFormOptions {
  contract?: Contract | null
  initialClientIds?: Id<"clients">[]
}

export interface UseContractFormReturn {
  formData: ContractFormData
  errors: ContractFormErrors
  setFormData: React.Dispatch<React.SetStateAction<ContractFormData>>
  updateField: <K extends keyof ContractFormData>(
    field: K,
    value: ContractFormData[K]
  ) => void
  toggleClient: (clientId: Id<"clients">) => void
  toggleNotaryOffice: (notaryOfficeId: Id<"notaryOffices">) => void
  validate: () => boolean
  reset: () => void
  isValid: boolean
}

const initialFormData: ContractFormData = {
  name: "",
  description: "",
  templateId: null,
  clientIds: [],
  notaryOfficeIds: [],
}

export function useContractForm(
  options?: UseContractFormOptions
): UseContractFormReturn {
  const { contract, initialClientIds = [] } = options || {}

  const [formData, setFormData] = useState<ContractFormData>(() => {
    if (contract) {
      return {
        name: contract.name,
        description: contract.description || "",
        templateId: contract.templateId,
        clientIds: contract.clientId ? [contract.clientId] : [],
        notaryOfficeIds: contract.notaryOfficeId ? [contract.notaryOfficeId] : [],
      }
    }
    return {
      ...initialFormData,
      clientIds: initialClientIds,
    }
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

  const toggleClient = useCallback((clientId: Id<"clients">) => {
    setFormData((prev) => {
      const isSelected = prev.clientIds.includes(clientId)
      return {
        ...prev,
        clientIds: isSelected
          ? prev.clientIds.filter((id) => id !== clientId)
          : [...prev.clientIds, clientId],
      }
    })
    if (errors.clientIds) {
      setErrors((prev) => ({ ...prev, clientIds: undefined }))
    }
  }, [errors.clientIds])

  const toggleNotaryOffice = useCallback((notaryOfficeId: Id<"notaryOffices">) => {
    setFormData((prev) => {
      const isSelected = prev.notaryOfficeIds.includes(notaryOfficeId)
      return {
        ...prev,
        notaryOfficeIds: isSelected
          ? prev.notaryOfficeIds.filter((id) => id !== notaryOfficeId)
          : [...prev.notaryOfficeIds, notaryOfficeId],
      }
    })
  }, [])

  const validate = useCallback((): boolean => {
    const newErrors: ContractFormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Nome do contrato é obrigatório"
    }

    if (formData.clientIds.length === 0) {
      newErrors.clientIds = "Selecione pelo menos um cliente"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const reset = useCallback(() => {
    setFormData({
      ...initialFormData,
      clientIds: initialClientIds,
    })
    setErrors({})
  }, [initialClientIds])

  const isValid =
    !!formData.name.trim() &&
    formData.clientIds.length > 0

  return {
    formData,
    errors,
    setFormData,
    updateField,
    toggleClient,
    toggleNotaryOffice,
    validate,
    reset,
    isValid,
  }
}
