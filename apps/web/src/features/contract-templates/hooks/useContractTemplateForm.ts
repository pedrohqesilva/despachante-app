import { useState, useCallback } from "react"
import type { ContractTemplate, ContractTemplateStatus } from "@/types/contract-template"

export interface ContractTemplateFormData {
  name: string
  description: string
  content: string
  status: ContractTemplateStatus
}

export interface ContractTemplateFormErrors {
  name?: boolean
  content?: boolean
}

export interface ContractTemplateSubmitData {
  name: string
  description: string | undefined
  content: string
  status: ContractTemplateStatus
}

const INITIAL_FORM_DATA: ContractTemplateFormData = {
  name: "",
  description: "",
  content: "",
  status: "active",
}

export function useContractTemplateForm(initialTemplate?: ContractTemplate | null) {
  const [formData, setFormData] = useState<ContractTemplateFormData>(() => {
    if (initialTemplate) {
      return {
        name: initialTemplate.name,
        description: initialTemplate.description || "",
        content: initialTemplate.content,
        status: initialTemplate.status,
      }
    }
    return INITIAL_FORM_DATA
  })

  const [errors, setErrors] = useState<ContractTemplateFormErrors>({})

  const updateField = useCallback(<K extends keyof ContractTemplateFormData>(
    field: K,
    value: ContractTemplateFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field as keyof ContractTemplateFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: false }))
    }
  }, [errors])

  const validate = useCallback((): boolean => {
    const newErrors: ContractTemplateFormErrors = {}

    if (!formData.name.trim()) newErrors.name = true
    if (!formData.content.trim()) newErrors.content = true

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const reset = useCallback((template?: ContractTemplate | null) => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description || "",
        content: template.content,
        status: template.status,
      })
    } else {
      setFormData(INITIAL_FORM_DATA)
    }
    setErrors({})
  }, [])

  const getSubmitData = useCallback((): ContractTemplateSubmitData => ({
    name: formData.name.trim(),
    description: formData.description.trim() || undefined,
    content: formData.content,
    status: formData.status,
  }), [formData])

  const insertTextAtContent = useCallback((text: string, cursorPosition?: number) => {
    setFormData(prev => {
      if (cursorPosition !== undefined) {
        const before = prev.content.slice(0, cursorPosition)
        const after = prev.content.slice(cursorPosition)
        return { ...prev, content: before + text + after }
      }
      return { ...prev, content: prev.content + text }
    })
    if (errors.content) {
      setErrors(prev => ({ ...prev, content: false }))
    }
  }, [errors])

  return {
    formData,
    errors,
    updateField,
    validate,
    reset,
    getSubmitData,
    insertTextAtContent,
    setErrors,
  }
}
