import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { settingsService } from "../services/settings.service"
import type { UpdateProfileDTO } from "../types/settings.types"

export function useUpdateProfile() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const updateProfileMutation = useMutation(api.users.updateProfile)

  const updateProfile = async (data: UpdateProfileDTO) => {
    setIsLoading(true)
    setError(null)

    try {
      // Validate
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        throw new Error("Email inválido")
      }

      if (data.name && data.name.trim().length < 2) {
        throw new Error("O nome deve ter pelo menos 2 caracteres")
      }

      await settingsService.updateProfile(updateProfileMutation, data)
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar perfil"
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    updateProfile,
    isLoading,
    error,
  }
}
