import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * Type-safe AsyncStorage wrapper with JSON serialization.
 *
 * Follows the same pattern used in the Settle and SKR example projects.
 *
 * @example
 * // Store a value
 * await storage.set('theme_mode', 'dark')
 *
 * // Get a value
 * const theme = await storage.get<string>('theme_mode')
 *
 * // Store an object
 * await storage.setObject('user', { name: 'Alice', address: '7nYB...' })
 *
 * // Get an object
 * const user = await storage.getObject<User>('user')
 */
export const storage = {
  /**
   * Store a string value.
   */
  async set(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value)
    } catch (error) {
      console.error(`[Storage] Failed to set "${key}":`, error)
    }
  },

  /**
   * Get a string value.
   */
  async get(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key)
    } catch (error) {
      console.error(`[Storage] Failed to get "${key}":`, error)
      return null
    }
  },

  /**
   * Store a JSON-serializable object.
   */
  async setObject<T>(key: string, value: T): Promise<void> {
    try {
      const json = JSON.stringify(value)
      await AsyncStorage.setItem(key, json)
    } catch (error) {
      console.error(`[Storage] Failed to set object "${key}":`, error)
    }
  },

  /**
   * Get a JSON-parsed object. Returns null if not found or parse fails.
   */
  async getObject<T>(key: string): Promise<T | null> {
    try {
      const json = await AsyncStorage.getItem(key)
      if (json == null) return null
      return JSON.parse(json) as T
    } catch (error) {
      console.error(`[Storage] Failed to get object "${key}":`, error)
      return null
    }
  },

  /**
   * Remove a value by key.
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key)
    } catch (error) {
      console.error(`[Storage] Failed to remove "${key}":`, error)
    }
  },

  /**
   * Get all storage keys.
   */
  async getAllKeys(): Promise<readonly string[]> {
    try {
      return await AsyncStorage.getAllKeys()
    } catch (error) {
      console.error('[Storage] Failed to get all keys:', error)
      return []
    }
  },

  /**
   * Clear all storage.
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear()
    } catch (error) {
      console.error('[Storage] Failed to clear storage:', error)
    }
  },
} as const

/**
 * Storage keys used throughout the app.
 * Centralized here to avoid typos and make it easy to find usages.
 */
export const STORAGE_KEYS = {
  THEME_MODE: '@tramplin_theme_mode',
  AUTH_TOKEN: '@tramplin_auth_token',
  USER_DATA: '@tramplin_user_data',
  ONBOARDING_COMPLETE: '@tramplin_onboarding_complete',
  PROFILE_DATA: '@tramplin_profile_data',
  NOTIFICATION_PREFS: '@tramplin_notification_prefs',
  PUSH_TOKEN: '@tramplin_push_token',
} as const
