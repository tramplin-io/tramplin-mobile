import type { AxiosRequestConfig } from 'axios'

import { createApiInstance } from './axios-factory'

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? ''

export const axiosInstance = createApiInstance(BASE_URL)

export function setBaseURL(url: string): void {
  axiosInstance.defaults.baseURL = url
}

export function resetBaseURL(): void {
  axiosInstance.defaults.baseURL = BASE_URL
}

/**
 * Mutator for the main API (referenced in orval.config.ts → api).
 */
export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  return axiosInstance(config) as unknown as Promise<T>
}

export default customInstance
