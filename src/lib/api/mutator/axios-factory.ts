import axios, { isAxiosError, type AxiosInstance, type AxiosRequestHeaders, type AxiosResponse } from 'axios'

import { tokenStore } from '../token-store'

/**
 * Creates a configured Axios instance with auth token injection and response unwrapping.
 *
 * Shared factory so every API target gets identical interceptor behavior
 * without duplicating the setup code.
 *
 * @param baseURL - API base URL
 * @param customGetToken - Optional token getter. Defaults to the main `tokenStore`.
 *   Pass a different getter for APIs with separate auth (e.g. referrals).
 */
export function createApiInstance(baseURL: string, customGetToken?: () => string | null): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout: 30_000,
    headers: { 'Content-Type': 'application/json' },
  })

  // ── Request interceptor: attach auth token ──
  instance.interceptors.request.use(
    (config) => {
      const token = customGetToken ? customGetToken() : tokenStore.getToken()
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
  instance.interceptors.response.use(
    (response: AxiosResponse) => response.data,
    (error) => {
      if (isAxiosError(error) && error.response?.status === 401) {
        tokenStore.clearToken()
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

  return instance
}
