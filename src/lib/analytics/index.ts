import { useCallback, useMemo } from 'react'
import { useFormo, type IFormoEventContext, type IFormoEventProperties } from '@formo/analytics-react-native'

import { useAuthStore } from '@/lib/stores/auth-store'

export const AnalyticsEvent = {
  // APP_PAGE_VIEW: 'App Page View',
  CLAIM_INITIATE: 'claim_initiate',
  CLAIM_REWARD_CLICK: 'claim_reward_click',
  CLAIM_SUCCESS: 'claim_success',
  CLAIM_ERROR: 'claim_error',
  STAKE_BUTTON_CLICK: 'stake_button_click',
  STAKE_SUCCESS: 'stake_success',
  STAKE_ERROR: 'stake_error',
  CLICK_MAX_UNSTAKE_BUTTON: 'click_max_unstake_button',
  UNSTAKE_INITIATED: 'unstake_initiated',
  UNSTAKE_SUCCESS: 'unstake_success',
  UNSTAKE_ALL_SUCCESS: 'unstake_all_success',
  UNSTAKE_ERROR: 'unstake_error',
  WALLET_CONNECT_CLICK: 'wallet_connect_click',
  WALLET_CONNECTED: 'wallet_connected',
} as const

const SCREEN_NAME_BY_PATH: Record<string, string> = {
  '/': 'Splash',
  '/index': 'Splash',
  '/splash': 'Splash',
  '/greeting': 'Greeting',
  '/tabs': 'Home',
  '/tabs/leaderboard': 'Stats',
  '/tabs/rewards': 'Rewards',
  '/tabs/faq': 'FAQ',
  '/tabs/settings': 'Settings',
  '/screens/leaderboard-detail': 'Leaderboard detail',
  '/screens/notification-settings': 'Notification settings',
  '/screens/contact-us': 'Contact us',
  '/no-internet': 'No internet',
  '/no-internet/index': 'No internet',
}

export function getScreenName(pathname: string | null | undefined): string {
  if (!pathname) return 'Unknown'
  const normalized = pathname.replace(/\/$/, '') || '/'
  return SCREEN_NAME_BY_PATH[normalized] ?? normalized
}

type Properties = Record<string, unknown>

/**
 * Thin wrapper around the Formo SDK that auto-injects the connected wallet
 * address into every `track()` call's properties.
 *
 * The SDK's root-level `address` field is EVM-only and rejects Solana base58
 * addresses, so we surface the wallet address via event properties instead —
 * which is what the Formo dashboard mappings (`{{dlv - wallet_address}}`) read.
 */
export function useAnalytics() {
  const formo = useFormo()
  const walletAddress = useAuthStore((s) => s.session?.userId)

  const track = useCallback(
    (event: string, properties?: Properties) => {
      const merged: Properties = walletAddress ? { wallet_address: walletAddress, ...properties } : { ...properties }
      return formo.track(event, merged)
    },
    [formo, walletAddress],
  )

  const screen = useCallback(
    (pathname: string, category?: string, properties?: Properties) => {
      const screenName = getScreenName(pathname)
      const merged: Properties = {
        ...(walletAddress ? { wallet_address: walletAddress } : {}),
        path: pathname,
        ...properties,
      }
      return formo.screen(screenName, category, merged)
    },
    [formo, walletAddress],
  )

  const identify = useCallback(
    (
      params: Parameters<typeof formo.identify>[0],
      properties?: IFormoEventProperties,
      context?: IFormoEventContext,
    ) => {
      const merged: IFormoEventProperties = {
        ...(walletAddress ? { wallet_address: walletAddress } : {}),
        ...properties,
      }
      return formo.identify(params, merged, context)
    },
    [formo, walletAddress],
  )

  return useMemo(
    () => ({
      track,
      screen,
      identify,
      reset: formo.reset.bind(formo),
      flush: formo.flush.bind(formo),
    }),
    [track, screen, identify, formo],
  )
}
