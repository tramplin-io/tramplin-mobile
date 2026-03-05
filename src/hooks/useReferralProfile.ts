import { useReadMyProfile } from '@/lib/api/generated-referrals/restApi'
import type { Profile } from '@/lib/api/generated-referrals/restApi.schemas'

import { useReferralSignIn } from './ReferralContextProvider'

const APP_DOMAIN = 'tramplin.io'

export function useReferralProfile() {
  const { isAuthenticated } = useReferralSignIn()

  const {
    data: profile,
    error,
    isLoading,
  } = useReadMyProfile({
    query: {
      enabled: isAuthenticated,
      refetchInterval: 5 * 60 * 1000,
      retry: (failureCount, err) => {
        const status = (err as { response?: { status?: number } })?.response?.status
        if (status === 400) return false
        return failureCount < 3
      },
    },
  })

  const referralUrl = profile?.referralToken ? `https://${APP_DOMAIN}?ref=${profile.referralToken}` : null

  return {
    profile: (profile as Profile) ?? null,
    referralUrl,
    isLoading,
    error: error instanceof Error ? error : null,
  }
}
