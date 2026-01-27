import type { UpdateProfileDTO, ChangePasswordDTO, SystemSettings, UserPreferences } from "../types/settings.types"

class SettingsService {
  private readonly STORAGE_KEYS = {
    SYSTEM_SETTINGS: "despachante_system_settings",
    USER_PREFERENCES: "despachante_user_preferences",
  }

  // Profile operations (via Convex)
  async updateProfile(mutationFn: any, data: UpdateProfileDTO) {
    return await mutationFn({
      name: data.name,
      email: data.email,
    })
  }

  async changePassword(mutationFn: any, data: ChangePasswordDTO) {
    if (data.newPassword !== data.confirmPassword) {
      throw new Error("As senhas não coincidem")
    }

    if (data.newPassword.length < 8) {
      throw new Error("A senha deve ter pelo menos 8 caracteres")
    }

    return await mutationFn({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    })
  }

  // System settings (sessionStorage)
  getSystemSettings(): SystemSettings {
    if (typeof window === "undefined") {
      return {
        notifications: true,
        emailNotifications: true,
        theme: "system",
      }
    }

    const stored = sessionStorage.getItem(this.STORAGE_KEYS.SYSTEM_SETTINGS)
    if (!stored) {
      return {
        notifications: true,
        emailNotifications: true,
        theme: "system",
      }
    }

    try {
      return JSON.parse(stored) as SystemSettings
    } catch {
      return {
        notifications: true,
        emailNotifications: true,
        theme: "system",
      }
    }
  }

  updateSystemSettings(settings: Partial<SystemSettings>) {
    if (typeof window === "undefined") return

    const current = this.getSystemSettings()
    const updated = { ...current, ...settings }
    sessionStorage.setItem(this.STORAGE_KEYS.SYSTEM_SETTINGS, JSON.stringify(updated))
  }

  // User preferences (sessionStorage)
  getUserPreferences(): UserPreferences {
    if (typeof window === "undefined") {
      return {
        language: "pt-BR",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        dateFormat: "DD/MM/YYYY",
      }
    }

    const stored = sessionStorage.getItem(this.STORAGE_KEYS.USER_PREFERENCES)
    if (!stored) {
      return {
        language: "pt-BR",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        dateFormat: "DD/MM/YYYY",
      }
    }

    try {
      return JSON.parse(stored) as UserPreferences
    } catch {
      return {
        language: "pt-BR",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        dateFormat: "DD/MM/YYYY",
      }
    }
  }

  updateUserPreferences(preferences: Partial<UserPreferences>) {
    if (typeof window === "undefined") return

    const current = this.getUserPreferences()
    const updated = { ...current, ...preferences }
    sessionStorage.setItem(this.STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updated))
  }
}

export const settingsService = new SettingsService()
