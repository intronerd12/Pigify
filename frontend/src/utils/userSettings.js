/**
 * User Preferences & Navigation Header Settings Store
 * Manages per-user configuration for header display modes, profile metadata, and study preferences.
 */

const DEFAULT_SETTINGS = {
  navDisplayMode: 'words', // 'words' | 'icons' | 'both'
  brandDisplayMode: 'both', // 'both' | 'icon' | 'word'
  showAiBadge: true,
  density: 'comfortable', // 'comfortable' | 'compact'
  defaultTab: '/home',
  tempUnit: 'celsius', // 'celsius' | 'fahrenheit'
  soundAlerts: true,
}

const getStorageKey = (userId) => {
  if (!userId) return 'pigify_user_settings_default'
  return `pigify_user_settings_${userId}`
}

export const getUserSettings = (userId) => {
  try {
    const key = getStorageKey(userId)
    const raw = localStorage.getItem(key)
    if (!raw) return { ...DEFAULT_SETTINGS }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch (_e) {
    return { ...DEFAULT_SETTINGS }
  }
}

export const saveUserSettings = (userId, newSettings) => {
  try {
    const key = getStorageKey(userId)
    const current = getUserSettings(userId)
    const updated = { ...current, ...newSettings }
    localStorage.setItem(key, JSON.stringify(updated))

    // Broadcast instant update event across components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('pigify:settings-updated', {
          detail: { userId, settings: updated },
        })
      )
    }
    return updated
  } catch (_e) {
    return newSettings
  }
}
