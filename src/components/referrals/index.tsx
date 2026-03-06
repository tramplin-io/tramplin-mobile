import { useCallback, useState } from 'react'
import { Modal, Pressable, View } from 'react-native'
import Toast from 'react-native-toast-message'
import { useCSSVariable } from 'uniwind'

import { QRCode } from '@/components/general'
import { CopyIcon } from '@/components/icons'
import { Text } from '@/components/ui/text'
import { AppConfig } from '@/constants'
import { REFERRALS_LOGIN_PAYLOAD } from '@/constants/auth'
import { useWalletActions } from '@/hooks'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { useReferralsStore } from '@/lib/stores/referrals-store'
import { signatureToBase58 } from '@/utils/format'

import { LinkNewIcon, PointsIcon, SolanaCircleIcon } from '../icons/icons'

export function ReferralStats({ className }: Readonly<{ className?: string }>) {
  const { profile, isLoading, isAuthenticated, error } = useReferralsStore()

  const { signLoginMessage } = useWalletActions()
  const loginWithWallet = useReferralsStore((s) => s.signInWithWallet)

  const { copy, copied } = useCopyToClipboard()
  const [isQrModalOpen, setIsQrModalOpen] = useState(false)

  const [signingIn, setSigningIn] = useState(false)

  const handleConnectReference = useCallback(async () => {
    setSigningIn(true)

    try {
      const result = await signLoginMessage(REFERRALS_LOGIN_PAYLOAD)
      if (!result || !result.publicKey) {
        Toast.show({ type: 'error', text1: 'Signing failed' })
        return
      }
      console.error('handleConnectReference - signLoginMessage - result:', result)

      const signatureBase58 = signatureToBase58(result.signature)
      console.error('handleConnectReference - signatureBase58:', signatureBase58)

      const success = await loginWithWallet({
        digest: result.message,
        signature: signatureBase58,
        publicKey: result.publicKey,
      })

      if (!success) {
        Toast.show({ type: 'error', text1: error ?? 'Login failed' })
      }
    } catch (err) {
      console.error('handleConnectReference - err:', err)
      Toast.show({
        type: 'error',
        text1: err instanceof Error ? err.message : 'Failed to connect to referral program',
      })
    } finally {
      setSigningIn(false)
    }
  }, [loginWithWallet, signLoginMessage, error])

  const colorContentTertiary = useCSSVariable('--color-content-tertiary') as string

  // if ((isAuthenticated && (error || !profile)) || isLoading) return null

  const referralUrl = profile?.referralToken ? `${AppConfig.uri}?ref=${profile.referralToken}` : null

  const shortUrl = referralUrl?.replace('https://', '')?.toUpperCase() ?? null

  async function handleCopy() {
    if (!referralUrl) return
    await copy(referralUrl)
  }

  if (isAuthenticated && referralUrl) {
    return (
      <View className={className}>
        <Pressable
          onPress={handleCopy}
          className="flex-row items-center bg-fill-secondary rounded-xl p-3 gap-3 ring-1 ring-border-quaternary h-22"
        >
          <Pressable onPress={() => setIsQrModalOpen(true)}>
            <QRCode data={referralUrl} size={64} />
          </Pressable>

          <View className="flex-1 shrink gap-1 ">
            <Text variant="small" className="font-family-bold-medium">
              Invite friends and earn points
            </Text>
            <View className="flex-row items-center gap-1 -ml-1">
              <LinkNewIcon size={24} color={colorContentTertiary} />
              <Text variant="small" className="text-content-tertiary uppercase -ml-1.5 flex-1" numberOfLines={1}>
                {copied ? 'Copied!' : shortUrl}
              </Text>
            </View>
          </View>

          <CopyIcon size={24} color={colorContentTertiary} />
        </Pressable>

        <Modal visible={isQrModalOpen} transparent animationType="fade" onRequestClose={() => setIsQrModalOpen(false)}>
          <Pressable
            className="flex-1 items-center justify-center bg-black/60 px-12"
            onPress={() => setIsQrModalOpen(false)}
          >
            <View className="bg-fill-primary rounded-2xl p-8 items-center gap-4 ">
              <QRCode data={referralUrl} size={220} />
              <Text variant="h3">Invite Friends</Text>
              <Pressable onPress={handleCopy} className="flex-row items-center gap-1.5">
                <LinkNewIcon size={24} color={colorContentTertiary} />
                <Text variant="small" className="text-content-tertiary uppercase -mx-1">
                  {copied ? 'Copied!' : shortUrl}
                </Text>
                <CopyIcon size={24} color={colorContentTertiary} />
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      </View>
    )
  }

  return (
    <View className={className}>
      <Pressable
        onPress={handleConnectReference}
        className="flex-row items-center justify-between bg-fill-secondary rounded-xl p-3 gap-3 ring-1 ring-border-quaternary h-22"
      >
        <View className="flex-1 shrink gap-1 items-center justify-center">
          <Text variant="body">Sign up to our referral program</Text>
          <View className="flex-row items-center gap-1">
            <LinkNewIcon size={24} color={colorContentTertiary} />
            <Text variant="small" className="text-content-tertiary uppercase" numberOfLines={1}>
              {signingIn ? 'Signing in…' : 'Create referral link'}
            </Text>
          </View>
        </View>
      </Pressable>

      <View className="flex-row gap-1 items-center justify-center mt-2">
        <Text variant="body" className="text-content-tertiary -mr-1">
          Earn
        </Text>
        <PointsIcon size={24} color={colorContentTertiary} />
        <Text variant="body" className="text-content-tertiary -ml-1 -mr-1">
          points for friends
        </Text>
        <SolanaCircleIcon color={colorContentTertiary} />
        <Text variant="body" className="text-content-tertiary -ml-1">
          stake
        </Text>
      </View>
      {/* {error && (
        <View className="flex items-center justify-center mt-1">
          <Text variant="small" className="text-critical-secondary text-center max-w-[280px]">
            {error}
          </Text>
        </View>
      )} */}
    </View>
  )
}
