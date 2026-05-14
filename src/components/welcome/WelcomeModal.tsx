import { useCallback, useEffect, useRef } from 'react'
import { Image, View } from 'react-native'
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useCSSVariable } from 'uniwind'

import { PlusIcon } from '@/components/icons/icons'
import { Button } from '@/components/ui'
import { Text } from '@/components/ui/text'

const welcomeImage = require('@/assets/images/welcome/welcome_01.png')

const TAB_BAR_HEIGHT = 0

type Props = Readonly<{
  open: boolean
  onOpenChange: (open: boolean) => void
  onStakePress?: () => void
}>

export function WelcomeModal({ open, onOpenChange, onStakePress }: Props) {
  const bottomSheetRef = useRef<BottomSheetModal>(null)
  const insets = useSafeAreaInsets()
  const fillTertiary = useCSSVariable('--color-fill-tertiary') as string
  const handleIndicatorColor = useCSSVariable('--color-content-tertiary') as string

  const bottomInset = TAB_BAR_HEIGHT + insets.bottom

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.2}
        pressBehavior="close"
        enableTouchThrough={false}
        style={{ bottom: bottomInset }}
      />
    ),
    [bottomInset],
  )

  useEffect(() => {
    if (open) {
      bottomSheetRef.current?.present()
    } else {
      bottomSheetRef.current?.dismiss()
    }
  }, [open])

  const handleDismiss = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const handleStakePress = useCallback(() => {
    onOpenChange(false)
    onStakePress?.()
  }, [onOpenChange, onStakePress])

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      onDismiss={handleDismiss}
      bottomInset={bottomInset}
      snapPoints={['100%']}
      enableDynamicSizing={false}
      handleIndicatorStyle={{ backgroundColor: handleIndicatorColor, marginTop: insets.top + 8, width: 48, height: 4 }}
      enableDismissOnClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: fillTertiary,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        marginTop: insets.top + 8,
      }}
    >
      <BottomSheetView style={{ flex: 1, height: '100%' }}>
        <View className="px-5 gap-6 pb-4 flex-1">
          <View className="rounded-lg overflow-hidden flex-1">
            <Image source={welcomeImage} className="w-full h-full" resizeMode="cover" />
          </View>

          <View className="gap-3">
            <Text variant="h3" className="text-content-primary">
              Welcome to Tramplin!
            </Text>
            <Text variant="body" className="text-content-tertiary">
              Stake SOL, enter draws every 20 minutes. Your SOL stays in your own wallet.
            </Text>
          </View>

          <View className="flex-row gap-3 mt-4">
            <Button variant="default" size="xl" onPress={handleStakePress} className="flex-1 border-brand-primary">
              <PlusIcon size={20} className="drop-shadow-md" />
              <Text variant="body">Stake SOL</Text>
            </Button>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  )
}
