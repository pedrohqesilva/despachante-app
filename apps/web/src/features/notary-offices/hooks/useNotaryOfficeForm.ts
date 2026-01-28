import { useState, useCallback } from "react"
import { formatZipCodeInput, formatPhoneInput, formatZipCode, formatPhone } from "@/lib/format"
import type { NotaryOffice, NotaryOfficeStatus } from "@/types/notary-office"

export interface NotaryOfficeFormData {
  name: string
  code: string
  zipCode: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  phone: string
  email: string
  status: NotaryOfficeStatus
}

export interface NotaryOfficeFormErrors {
  name?: boolean
  code?: boolean
  phone?: boolean
  zipCode?: boolean
  street?: boolean
  number?: boolean
  neighborhood?: boolean
  city?: boolean
  state?: boolean
}

export interface NotaryOfficeSubmitData {
  name: string
  code: string
  zipCode: string
  street: string
  number: string
  complement: string | undefined
  neighborhood: string
  city: string
  state: string
  phone: string | undefined
  email: string | undefined
  status: NotaryOfficeStatus
}

const INITIAL_FORM_DATA: NotaryOfficeFormData = {
  name: "",
  code: "",
  zipCode: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "Belo Horizonte",
  state: "MG",
  phone: "",
  email: "",
  status: "active",
}

export function useNotaryOfficeForm(initialNotaryOffice?: NotaryOffice | null) {
  const [formData, setFormData] = useState<NotaryOfficeFormData>(() => {
    if (initialNotaryOffice) {
      return {
        name: initialNotaryOffice.name,
        code: initialNotaryOffice.code,
        zipCode: initialNotaryOffice.zipCode ? formatZipCode(initialNotaryOffice.zipCode) : "",
        street: initialNotaryOffice.street || "",
        number: initialNotaryOffice.number || "",
        complement: initialNotaryOffice.complement || "",
        neighborhood: initialNotaryOffice.neighborhood || "",
        city: initialNotaryOffice.city || "",
        state: initialNotaryOffice.state || "",
        phone: initialNotaryOffice.phone ? formatPhone(initialNotaryOffice.phone) : "",
        email: initialNotaryOffice.email || "",
        status: initialNotaryOffice.status,
      }
    }
    return INITIAL_FORM_DATA
  })

  const [errors, setErrors] = useState<NotaryOfficeFormErrors>({})

  const updateField = useCallback(<K extends keyof NotaryOfficeFormData>(
    field: K,
    value: NotaryOfficeFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field as keyof NotaryOfficeFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: false }))
    }
  }, [errors])

  const handleZipCodeChange = useCallback((value: string) => {
    updateField("zipCode", formatZipCodeInput(value))
  }, [updateField])

  const handlePhoneChange = useCallback((value: string) => {
    updateField("phone", formatPhoneInput(value))
  }, [updateField])

  const handleStateChange = useCallback((value: string) => {
    updateField("state", value.toUpperCase())
  }, [updateField])

  const validate = useCallback((): boolean => {
    const newErrors: NotaryOfficeFormErrors = {}

    if (!formData.name.trim()) newErrors.name = true
    if (!formData.code.trim()) newErrors.code = true
    if (!formData.phone.trim()) newErrors.phone = true
    if (!formData.zipCode.trim()) newErrors.zipCode = true
    if (!formData.street.trim()) newErrors.street = true
    if (!formData.number.trim()) newErrors.number = true
    if (!formData.neighborhood.trim()) newErrors.neighborhood = true
    if (!formData.city.trim()) newErrors.city = true
    if (!formData.state.trim()) newErrors.state = true

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const reset = useCallback((notaryOffice?: NotaryOffice | null) => {
    if (notaryOffice) {
      setFormData({
        name: notaryOffice.name,
        code: notaryOffice.code,
        zipCode: notaryOffice.zipCode ? formatZipCode(notaryOffice.zipCode) : "",
        street: notaryOffice.street || "",
        number: notaryOffice.number || "",
        complement: notaryOffice.complement || "",
        neighborhood: notaryOffice.neighborhood || "",
        city: notaryOffice.city || "",
        state: notaryOffice.state || "",
        phone: notaryOffice.phone ? formatPhone(notaryOffice.phone) : "",
        email: notaryOffice.email || "",
        status: notaryOffice.status,
      })
    } else {
      setFormData(INITIAL_FORM_DATA)
    }
    setErrors({})
  }, [])

  const getSubmitData = useCallback((): NotaryOfficeSubmitData => ({
    name: formData.name.trim(),
    code: formData.code.trim(),
    zipCode: formData.zipCode.replace(/\D/g, ""),
    street: formData.street.trim(),
    number: formData.number.trim(),
    complement: formData.complement.trim() || undefined,
    neighborhood: formData.neighborhood.trim(),
    city: formData.city.trim(),
    state: formData.state.trim(),
    phone: formData.phone.replace(/\D/g, "") || undefined,
    email: formData.email.trim() || undefined,
    status: formData.status,
  }), [formData])

  const setAddressFromCep = useCallback((data: {
    street?: string
    neighborhood?: string
    city?: string
    state?: string
    complement?: string
  }) => {
    setFormData(prev => ({
      ...prev,
      street: data.street || prev.street,
      neighborhood: data.neighborhood || prev.neighborhood,
      city: data.city || prev.city,
      state: data.state || prev.state,
      complement: data.complement || prev.complement,
    }))
  }, [])

  return {
    formData,
    errors,
    updateField,
    handleZipCodeChange,
    handlePhoneChange,
    handleStateChange,
    validate,
    reset,
    getSubmitData,
    setAddressFromCep,
    setErrors,
  }
}
