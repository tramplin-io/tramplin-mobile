import { useCallback, useEffect, useRef } from 'react'
import { View } from 'react-native'
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useCSSVariable } from 'uniwind'

import { RichInputMarkdown } from '@/components/general/RichInputMarkdown'
import { Button } from '@/components/ui'
import { Text } from '@/components/ui/text'

import { TAB_BAR_HEIGHT } from './utils'

export interface PromoHowItWorksModalProps {
  open: boolean
  onClose: () => void
  title: string
  content: string
}

export function PromoHowItWorksModal({ open, onClose, title, content }: Readonly<PromoHowItWorksModalProps>) {
  const bottomSheetRef = useRef<BottomSheetModal>(null)
  const insets = useSafeAreaInsets()
  const fillTertiary = useCSSVariable('--color-fill-tertiary') as string
  // const brandPrimary = useCSSVariable('--color-brand-primary') as string
  const handleIndicatorColor = useCSSVariable('--color-content-tertiary') as string

  const bottomInset = TAB_BAR_HEIGHT + insets.bottom

  useEffect(() => {
    if (open) {
      bottomSheetRef.current?.present()
    } else {
      bottomSheetRef.current?.dismiss()
    }
  }, [open])

  const handleDismiss = useCallback(() => {
    onClose()
  }, [onClose])

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

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      onDismiss={handleDismiss}
      bottomInset={bottomInset}
      snapPoints={['65%']}
      handleIndicatorStyle={{ backgroundColor: handleIndicatorColor, marginTop: insets.top + 8 }}
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
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 8,
          gap: 12,
          paddingBottom: 8,
          height: '100%',
        }}
      >
        <Text variant="h4" className="text-content-primary">
          {title}
        </Text>
        <BottomSheetScrollView
          // contentContainerStyle={{
          //   paddingHorizontal: 20,
          //   paddingTop: 8,
          //   gap: 16,
          //   paddingBottom: insets.bottom,
          // }}
          showsVerticalScrollIndicator={false}
        >
          <RichInputMarkdown className="flex-1" markdown={content} />
        </BottomSheetScrollView>

        <Button
          onPress={onClose}
          variant="outline"
          size="xl"
          className="sm:h-14 text-body border-brand-primary rounded-full"
        >
          <Text variant="body" className="text-body text-brand-primary">
            Ok, got it
          </Text>
        </Button>
      </View>
    </BottomSheetModal>
  )
}
