// Public API da feature settings
export { SettingsTabs } from "./components/SettingsTabs"
export { AccountTab } from "./components/AccountTab"
export { SystemTab } from "./components/SystemTab"
export { ChangePasswordDialog } from "./components/ChangePasswordDialog"
export { ProfileForm } from "./components/ProfileForm"

export { useUpdateProfile } from "./hooks/useUpdateProfile"
export { useChangePassword } from "./hooks/useChangePassword"

export { settingsService } from "./services/settings.service"

export type {
  UpdateProfileDTO,
  ChangePasswordDTO,
  SystemSettings,
  UserPreferences,
} from "./types/settings.types"
