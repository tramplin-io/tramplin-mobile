import axios, { isAxiosError, type AxiosInstance, type AxiosRequestHeaders, type AxiosResponse } from 'axios'

// import { useAuthStore } from '@/lib/stores/auth-store'

import { referralTokenStore } from '../referral-token-store'
import { tokenStore } from '../token-store'

const HTTP_ERROR_MESSAGES = {
  400: 'Validation Error',
  401: 'You should be authenticated to be able to see this page',
  403: 'Unauthorized',
  404: 'Not found',
  406: 'Bad request',
  429: 'Too Many Requests - Please wait a moment and try again',
} as const

const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Try again later'

const ignoreErrorList: string[] = []

const getMessage = (status: number, data: { error?: string; message?: string }) =>
  data.error ?? data.message ?? HTTP_ERROR_MESSAGES[status as keyof typeof HTTP_ERROR_MESSAGES] ?? DEFAULT_ERROR_MESSAGE

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
      // console.error('API Error - error:', error)
      // console.error('API Error - error.response:', error?.response)
      if (error?.response) {
        const { status, data } = error.response
        const isDeleteSession = error.config?.url?.includes('deleteMySession') === true

        if (!isDeleteSession) {
          console.error('API Error:', { status, data })
        }

        if (status === 401) {
          if (data?.code && ignoreErrorList.includes(data.code)) {
            return Promise.reject(new Error(getMessage(status, data)))
          }
          if (isDeleteSession) {
            return Promise.reject(new Error(error?.message ?? getMessage(status, data)))
          }

          void tokenStore.clearToken()
          void referralTokenStore.clearToken()
          // void useAuthStore.getState().logout()
          return
        }
        if (status === 400) {
          return Promise.reject(new Error(getMessage(status, data)))
        }
        if (status === 429) {
          return Promise.reject(new Error(getMessage(status, data)))
        }
        return Promise.reject(new Error(getMessage(status, data)))
      }

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

      return Promise.reject(new Error(error?.message ?? 'Something went wrong'))
    },
  )

  return instance
}
