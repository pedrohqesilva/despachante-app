import { useState, useCallback } from "react"
import { Id } from "@despachante/convex/_generated/dataModel"
import { formatPhoneInput, formatTaxIdInput, formatTaxId } from "@/lib/format"
import { requiresSpouse } from "@/lib/constants"
import type { Client, MaritalStatus, PropertyRegime } from "@/types/client"

export interface ClientFormData {
  name: string
  email: string
  phone: string
  taxId: string
  fatherName: string
  motherName: string
  maritalStatus: MaritalStatus | ""
  propertyRegime: PropertyRegime | ""
  weddingDate: string
  spouseId: Id<"clients"> | null
}

export interface ClientFormErrors {
  name?: boolean
  email?: boolean
  taxId?: boolean
  phone?: boolean
  maritalStatus?: boolean
  propertyRegime?: boolean
  spouseId?: boolean
}

export interface ClientSubmitData {
  name: string
  email: string
  phone: string
  taxId: string
  fatherName: string | undefined
  motherName: string | undefined
  maritalStatus: MaritalStatus | undefined
  propertyRegime: PropertyRegime | undefined
  weddingDate: string | undefined
  spouseId: Id<"clients"> | undefined
}

const INITIAL_FORM_DATA: ClientFormData = {
  name: "",
  email: "",
  phone: "",
  taxId: "",
  fatherName: "",
  motherName: "",
  maritalStatus: "",
  propertyRegime: "",
  weddingDate: "",
  spouseId: null,
}

export function useClientForm(initialClient?: Client | null) {
  const [formData, setFormData] = useState<ClientFormData>(() => {
    if (initialClient) {
      return {
        name: initialClient.name,
        email: initialClient.email,
        phone: initialClient.phone ? formatPhoneInput(initialClient.phone) : "",
        taxId: formatTaxId(initialClient.taxId),
        fatherName: initialClient.fatherName || "",
        motherName: initialClient.motherName || "",
        maritalStatus: initialClient.maritalStatus || "",
        propertyRegime: initialClient.propertyRegime || "",
        weddingDate: initialClient.weddingDate || "",
        spouseId: initialClient.spouseId || null,
      }
    }
    return INITIAL_FORM_DATA
  })

  const [errors, setErrors] = useState<ClientFormErrors>({})

  const updateField = useCallback(<K extends keyof ClientFormData>(
    field: K,
    value: ClientFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field as keyof ClientFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: false }))
    }
  }, [errors])

  const handlePhoneChange = useCallback((value: string) => {
    updateField("phone", formatPhoneInput(value))
  }, [updateField])

  const handleTaxIdChange = useCallback((value: string) => {
    updateField("taxId", formatTaxIdInput(value))
  }, [updateField])

  const handleMaritalStatusChange = useCallback((value: MaritalStatus) => {
    setFormData(prev => ({
      ...prev,
      maritalStatus: value,
      propertyRegime: requiresSpouse(value)
        ? (prev.propertyRegime || "partial_communion")
        : "",
      spouseId: requiresSpouse(value) ? prev.spouseId : null,
    }))
    if (errors.maritalStatus) {
      setErrors(prev => ({ ...prev, maritalStatus: false }))
    }
  }, [errors.maritalStatus])

  const validate = useCallback((hasSpouseForm: boolean): boolean => {
    const newErrors: ClientFormErrors = {}

    if (!formData.name.trim()) newErrors.name = true
    if (!formData.email.trim()) newErrors.email = true
    if (!formData.taxId.trim()) newErrors.taxId = true
    if (!formData.phone.trim()) newErrors.phone = true
    if (!formData.maritalStatus) newErrors.maritalStatus = true

    if (requiresSpouse(formData.maritalStatus)) {
      if (!formData.propertyRegime) newErrors.propertyRegime = true
      if (!formData.spouseId && !hasSpouseForm) newErrors.spouseId = true
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const reset = useCallback((client?: Client | null) => {
    if (client) {
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone ? formatPhoneInput(client.phone) : "",
        taxId: formatTaxId(client.taxId),
        fatherName: client.fatherName || "",
        motherName: client.motherName || "",
        maritalStatus: client.maritalStatus || "",
        propertyRegime: client.propertyRegime || "",
        weddingDate: client.weddingDate || "",
        spouseId: client.spouseId || null,
      })
    } else {
      setFormData(INITIAL_FORM_DATA)
    }
    setErrors({})
  }, [])

  const getSubmitData = useCallback((): ClientSubmitData => ({
    name: formData.name.trim(),
    email: formData.email.trim(),
    phone: formData.phone.replace(/\D/g, ""),
    taxId: formData.taxId.replace(/\D/g, ""),
    fatherName: formData.fatherName.trim() || undefined,
    motherName: formData.motherName.trim() || undefined,
    maritalStatus: formData.maritalStatus || undefined,
    propertyRegime: formData.propertyRegime || undefined,
    weddingDate: formData.weddingDate || undefined,
    spouseId: formData.spouseId || undefined,
  }), [formData])

  return {
    formData,
    errors,
    updateField,
    handlePhoneChange,
    handleTaxIdChange,
    handleMaritalStatusChange,
    validate,
    reset,
    getSubmitData,
    setErrors,
  }
}
