import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { settingsService } from "../services/settings.service"
import type { ChangePasswordDTO } from "../types/settings.types"

export function useChangePassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const changePasswordMutation = useMutation(api.users.changePassword)

  const changePassword = async (data: ChangePasswordDTO) => {
    setIsLoading(true)
    setError(null)

    try {
      await settingsService.changePassword(changePasswordMutation, data)
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao alterar senha"
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    changePassword,
    isLoading,
    error,
  }
}
