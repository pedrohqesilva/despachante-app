import { useState, useCallback } from "react"
import { formatPhoneInput, formatTaxIdInput } from "@/lib/format"

export interface SpouseFormData {
  name: string
  email: string
  phone: string
  taxId: string
  fatherName: string
  motherName: string
}

const INITIAL_SPOUSE_FORM: SpouseFormData = {
  name: "",
  email: "",
  phone: "",
  taxId: "",
  fatherName: "",
  motherName: "",
}

export function useSpouseForm() {
  const [formData, setFormData] = useState<SpouseFormData>(INITIAL_SPOUSE_FORM)

  const updateField = useCallback(<K extends keyof SpouseFormData>(
    field: K,
    value: SpouseFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handlePhoneChange = useCallback((value: string) => {
    updateField("phone", formatPhoneInput(value))
  }, [updateField])

  const handleTaxIdChange = useCallback((value: string) => {
    updateField("taxId", formatTaxIdInput(value))
  }, [updateField])

  const isValid = useCallback((): boolean => {
    return !!(
      formData.name.trim() &&
      formData.email.trim() &&
      formData.taxId.trim()
    )
  }, [formData])

  const hasData = useCallback((): boolean => {
    return !!formData.name.trim()
  }, [formData.name])

  const reset = useCallback(() => {
    setFormData(INITIAL_SPOUSE_FORM)
  }, [])

  const getSubmitData = useCallback(() => ({
    name: formData.name.trim(),
    email: formData.email.trim(),
    phone: formData.phone.replace(/\D/g, "") || undefined,
    taxId: formData.taxId.replace(/\D/g, ""),
    fatherName: formData.fatherName.trim() || undefined,
    motherName: formData.motherName.trim() || undefined,
  }), [formData])

  return {
    formData,
    updateField,
    handlePhoneChange,
    handleTaxIdChange,
    isValid,
    hasData,
    reset,
    getSubmitData,
  }
}
