import axios, { isAxiosError, type AxiosRequestConfig, type AxiosRequestHeaders, type AxiosResponse } from 'axios'

import { tokenStore } from '../token-store'

/**
 * Base URL from environment variable.
 * Falls back to empty string for development.
 */
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? ''

/**
 * Axios instance with auth token injection and response unwrapping.
 *
 * - Request interceptor: attaches Bearer token from tokenStore
 * - Response interceptor: returns response.data directly
 *
 */
export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Update the base URL at runtime (e.g., after loading from config).
 */
export function setBaseURL(url: string): void {
  axiosInstance.defaults.baseURL = url
}

/**
 * Reset the base URL to the default from environment.
 */
export function resetBaseURL(): void {
  axiosInstance.defaults.baseURL = BASE_URL
}

// ── Request interceptor: attach auth token ──
axiosInstance.interceptors.request.use(
  (config) => {
    const token = tokenStore.getToken()
    if (token) {
      if (!config.headers) {
        config.headers = {} as AxiosRequestHeaders
      }

      config.headers.auth = token
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ── Response interceptor: unwrap data, handle 401 ──
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error) => {
    if (isAxiosError(error) && error.response?.status === 401) {
      tokenStore.clearToken()
      // Handle 401: token cleared, UI should react to auth state change
    }
    const isCanceled = error.code === 'ERR_CANCELED' || error.message === 'canceled'
    const is404NoSession = error.response?.status === 404 && error.config?.url?.includes('readMySession')

    if (!isCanceled && !is404NoSession) {
      console.error('API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      })
    }
    return Promise.reject(error)
  },
)

/**
 * Custom Axios instance for Orval-generated API client.
 *
 * This function is referenced in orval.config.ts as the mutator.
 * Orval will call this for every API request.
 *
 * @param config - Axios request configuration from Orval
 * @returns Promise with the response data (already unwrapped by interceptor)
 */
export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  return axiosInstance(config) as unknown as Promise<T>
}

export default customInstance
