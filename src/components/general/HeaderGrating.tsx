import { View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useCSSVariable } from 'uniwind'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Logo } from '@/components/icons'
import { cn } from '@/lib/utils'

export interface HeaderProps {
  /** Show logo on the left. Default true. */
  showLogo?: boolean
}

/**
 * App header with two variants:
 * - onboarding: gradient (transparent → border), logo only
 * - app: solid bar + gradient fade, logo + wallet address + user icon (press opens profile)
 */
export function HeaderGrating({ showLogo = true }: Readonly<HeaderProps>) {
  const insets = useSafeAreaInsets()

  const contentPrimary = useCSSVariable('--color-content-primary')
  const borderPrimary = useCSSVariable('--color-border-primary')

  const logoColor = '#ffffff'

  return (
    <View
      className={cn('w-full bg-border-primary')}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, paddingTop: insets.top }}
    >
      <View
        className=" w-full"
        style={{
          position: 'absolute',
          top: insets.top,
        }}
      >
        <LinearGradient
          colors={[borderPrimary as string, 'rgba(134, 130, 247, 0.01)']}
          locations={[0.05, 0.95]}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 40,
          }}
        />
        <View className={cn('flex-row items-center justify-between px-4 py-2 w-full h-8')}>
          {showLogo && (
            <View className="flex-row items-center" style={{ maxWidth: 180 }} pointerEvents="none">
              <Logo width={100} height={19} color={logoColor} />
            </View>
          )}
        </View>
      </View>
    </View>
  )
}
