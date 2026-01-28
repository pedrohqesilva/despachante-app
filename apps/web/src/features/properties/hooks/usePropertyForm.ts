import { useState, useCallback } from "react"
import { Id } from "@despachante/convex/_generated/dataModel"
import { formatZipCodeInput, formatCurrencyInput, formatZipCode, parseCurrencyValue } from "@/lib/format"
import type { Property, PropertyType, PropertyStatus } from "@/types/property"

export interface PropertyFormData {
  zipCode: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  type: PropertyType | ""
  area: string
  value: string
  ownerIds: Id<"clients">[]
  status: PropertyStatus | ""
}

export interface PropertyFormErrors {
  zipCode?: boolean
  street?: boolean
  number?: boolean
  neighborhood?: boolean
  city?: boolean
  state?: boolean
  type?: boolean
  area?: boolean
  value?: boolean
  ownerIds?: boolean
}

export interface PropertySubmitData {
  zipCode: string
  street: string
  number: string
  complement: string | undefined
  neighborhood: string
  city: string
  state: string
  type: PropertyType
  area: number
  value: number
  ownerIds: Id<"clients">[]
  status?: PropertyStatus
}

const INITIAL_FORM_DATA: PropertyFormData = {
  zipCode: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  type: "",
  area: "",
  value: "",
  ownerIds: [],
  status: "",
}

export function usePropertyForm(initialProperty?: Property | null) {
  const [formData, setFormData] = useState<PropertyFormData>(() => {
    if (initialProperty) {
      return {
        zipCode: formatZipCode(initialProperty.zipCode),
        street: initialProperty.street,
        number: initialProperty.number,
        complement: initialProperty.complement || "",
        neighborhood: initialProperty.neighborhood,
        city: initialProperty.city,
        state: initialProperty.state,
        type: initialProperty.type,
        area: initialProperty.area.toString(),
        value: formatCurrencyInput(Math.round(initialProperty.value * 100).toString()),
        ownerIds: initialProperty.ownerIds,
        status: initialProperty.status,
      }
    }
    return INITIAL_FORM_DATA
  })

  const [errors, setErrors] = useState<PropertyFormErrors>({})

  const updateField = useCallback(<K extends keyof PropertyFormData>(
    field: K,
    value: PropertyFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field as keyof PropertyFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: false }))
    }
  }, [errors])

  const handleZipCodeChange = useCallback((value: string) => {
    updateField("zipCode", formatZipCodeInput(value))
  }, [updateField])

  const handleValueChange = useCallback((value: string) => {
    const cleaned = value.replace(/\D/g, "")
    updateField("value", formatCurrencyInput(cleaned))
  }, [updateField])

  const handleAreaChange = useCallback((value: string) => {
    const rawValue = value.replace(/\D/g, "")
    updateField("area", rawValue)
  }, [updateField])

  const handleStateChange = useCallback((value: string) => {
    updateField("state", value.toUpperCase())
  }, [updateField])

  const toggleOwner = useCallback((clientId: Id<"clients">) => {
    setFormData(prev => {
      const newOwnerIds = prev.ownerIds.includes(clientId)
        ? prev.ownerIds.filter(id => id !== clientId)
        : [...prev.ownerIds, clientId]
      return { ...prev, ownerIds: newOwnerIds }
    })
    if (errors.ownerIds) {
      setErrors(prev => ({ ...prev, ownerIds: false }))
    }
  }, [errors.ownerIds])

  const validate = useCallback((requireOwners: boolean = true): boolean => {
    const newErrors: PropertyFormErrors = {}

    if (!formData.zipCode.trim()) newErrors.zipCode = true
    if (!formData.street.trim()) newErrors.street = true
    if (!formData.number.trim()) newErrors.number = true
    if (!formData.neighborhood.trim()) newErrors.neighborhood = true
    if (!formData.city.trim()) newErrors.city = true
    if (!formData.state.trim()) newErrors.state = true
    if (!formData.type) newErrors.type = true
    if (!formData.area.trim()) newErrors.area = true
    if (!formData.value.trim()) newErrors.value = true
    if (requireOwners && formData.ownerIds.length === 0) newErrors.ownerIds = true

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const reset = useCallback((property?: Property | null) => {
    if (property) {
      setFormData({
        zipCode: formatZipCode(property.zipCode),
        street: property.street,
        number: property.number,
        complement: property.complement || "",
        neighborhood: property.neighborhood,
        city: property.city,
        state: property.state,
        type: property.type,
        area: property.area.toString(),
        value: formatCurrencyInput(Math.round(property.value * 100).toString()),
        ownerIds: property.ownerIds,
        status: property.status,
      })
    } else {
      setFormData(INITIAL_FORM_DATA)
    }
    setErrors({})
  }, [])

  const getSubmitData = useCallback((): PropertySubmitData => ({
    zipCode: formData.zipCode.replace(/\D/g, ""),
    street: formData.street.trim(),
    number: formData.number.trim(),
    complement: formData.complement.trim() || undefined,
    neighborhood: formData.neighborhood.trim(),
    city: formData.city.trim(),
    state: formData.state.trim(),
    type: formData.type as PropertyType,
    area: Number(formData.area),
    value: parseCurrencyValue(formData.value),
    ownerIds: formData.ownerIds,
    status: formData.status ? formData.status as PropertyStatus : undefined,
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

  const getFormattedArea = useCallback((): string => {
    if (!formData.area) return ""
    return Number(formData.area).toLocaleString("pt-BR")
  }, [formData.area])

  return {
    formData,
    errors,
    updateField,
    handleZipCodeChange,
    handleValueChange,
    handleAreaChange,
    handleStateChange,
    toggleOwner,
    validate,
    reset,
    getSubmitData,
    setAddressFromCep,
    getFormattedArea,
    setErrors,
  }
}
