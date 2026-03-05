import type { AxiosRequestConfig } from 'axios'

import { referralTokenStore } from '../referral-token-store'
import { createApiInstance } from './axios-factory'

const BASE_URL = process.env.EXPO_PUBLIC_REFERRALS_API_URL ?? ''

export const referralsAxiosInstance = createApiInstance(BASE_URL, () => referralTokenStore.getToken())

export function setReferralsBaseURL(url: string): void {
  referralsAxiosInstance.defaults.baseURL = url
}

export function resetReferralsBaseURL(): void {
  referralsAxiosInstance.defaults.baseURL = BASE_URL
}

/**
 * Mutator for the referrals API (referenced in orval.config.ts → referrals).
 */
export const referralsInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  return referralsAxiosInstance(config) as unknown as Promise<T>
}

export default referralsInstance
