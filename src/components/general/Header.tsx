import { View, Text, Pressable } from 'react-native'
import { useRouter, usePathname, useNavigation } from 'expo-router'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { LinearGradient } from 'expo-linear-gradient'
import { useCSSVariable } from 'uniwind'
import { Logo, ThreeDotsIcon } from '@/components/icons'
import { UserIcon } from './UserIcon'
import { formatWalletAddress } from '@/utils/wallet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { cn } from '@/lib/utils'

export type HeaderVariant = 'onboarding' | 'app'

export interface HeaderProps {
  /** 'onboarding' = gradient only + logo; 'app' = bar + logo + wallet (press → profile) */
  variant: HeaderVariant
  /** Show logo on the left. Default true. */
  showLogo?: boolean
}

/**
 * App header with two variants:
 * - onboarding: gradient (transparent → border), logo only
 * - app: solid bar + gradient fade, logo + wallet address + user icon (press opens profile)
 */
export function Header({ variant, showLogo = true }: Readonly<HeaderProps>) {
  const router = useRouter()
  const pathname = usePathname()
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()

  const { account } = useMobileWallet()
  const fillPrimary = useCSSVariable('--color-fill-primary')
  const fillFade = useCSSVariable('--color-fill-fade')

  const contentPrimary = useCSSVariable('--color-content-primary')
  const borderPrimary = useCSSVariable('--color-border-primary')

  const addressStr = account?.address?.toString()
  const isApp = variant === 'app'
  const logoColor = variant === 'onboarding' ? '#ffffff' : String(contentPrimary ?? 'black')

  const isProfile = pathname === '/profile' //|| pathname.endsWith('/profile')
  /** We only want "back" when we're on the pushed /profile stack screen; on tab /tabs/profile there's no stack to pop. */
  const isPushedProfileScreen = pathname === '/profile'

  const handlePressWallet = () => {
    if (isApp && !isProfile) {
      router.push('/profile')
      return
    }
    if (isProfile) {
      if (isPushedProfileScreen && navigation.canGoBack()) {
        router.back()
      } else {
        router.replace('/tabs/')
      }
    }
  }

  return (
    <View
      className={cn('w-full bg-fill-primary', variant === 'onboarding' && 'bg-black')}
      style={{ paddingTop: insets.top }}
    >
      {variant === 'onboarding' && (
        <LinearGradient
          colors={['rgba(0, 0, 0, 1)', 'rgba(134, 130, 247, 0.15)', 'rgba(134, 130, 247, 0.01)']}
          locations={[0, 0.4, 1]}
          className="absolute left-0 top-0 w-full"
          style={{ top: insets.top, height: 87 }}
        />
      )}
      <View className="flex-row items-center justify-between px-4 py-2 w-full">
        {showLogo && (
          <View className="flex-row items-center" style={{ maxWidth: 180 }} pointerEvents="none">
            <Logo width={100} height={19} color={logoColor} />
          </View>
        )}

        {isApp && addressStr && (
          <Pressable
            onPress={handlePressWallet}
            className="flex-row items-center gap-1.5 active:opacity-80"
            hitSlop={8}
          >
            <ThreeDotsIcon size={24} />
            <Text className="text-content-primary text-sm font-bold" style={{ lineHeight: 18 }} numberOfLines={1}>
              {formatWalletAddress(addressStr)}
            </Text>
            <UserIcon size={20} />
          </Pressable>
        )}
      </View>
      {isApp && (
        <LinearGradient
          colors={[fillPrimary as string, fillFade as string]}
          locations={[0, 1]}
          className="w-full h-10"
          // style={{ top: 30, height: 32 }}
          style={{
            position: 'absolute',
            top: 40 + insets.top,
            left: 0,
            right: 0,
            height: 32,
          }}
        />
      )}
    </View>
  )
}
