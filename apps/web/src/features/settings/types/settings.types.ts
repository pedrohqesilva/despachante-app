export interface UpdateProfileDTO {
  name?: string
  email?: string
}

export interface ChangePasswordDTO {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface SystemSettings {
  notifications: boolean
  emailNotifications: boolean
  theme: "light" | "dark" | "system"
}

export interface UserPreferences {
  language: "pt-BR" | "en"
  timezone: string
  dateFormat: string
}
