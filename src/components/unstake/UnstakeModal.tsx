import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet'
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Keyboard, Platform, type KeyboardEvent } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useCSSVariable } from 'uniwind'

import { ErrorBoundary } from '@/components/error-boundary'
import { UnstakeForm } from './UnstakeForm'

const TAB_BAR_HEIGHT = 70

type Props = Readonly<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>

export function UnstakeModal({ open, onOpenChange }: Props) {
  const bottomSheetRef = useRef<BottomSheetModal>(null)
  const insets = useSafeAreaInsets()
  const fillPrimary = useCSSVariable('--color-fill-primary')
  const handleIndicatorColor = useCSSVariable('--color-brand-secondary')

  const [keyboardHeight, setKeyboardHeight] = useState(0)
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'
    const showSub = Keyboard.addListener(showEvent, (e: KeyboardEvent) => setKeyboardHeight(e.endCoordinates.height))
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0))
    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [])

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
        style={{
          bottom: bottomInset,
        }}
      />
    ),
    [bottomInset],
  )

  React.useEffect(() => {
    if (open) {
      bottomSheetRef.current?.present()
    } else {
      bottomSheetRef.current?.dismiss()
    }
  }, [open])

  const handleDismiss = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      onDismiss={handleDismiss}
      bottomInset={bottomInset}
      handleIndicatorStyle={{ backgroundColor: handleIndicatorColor as string }}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      enableDismissOnClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: (fillPrimary as string) ?? undefined,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
      }}
    >
      <BottomSheetScrollView>
        <BottomSheetView style={{ flex: 1, paddingBottom: keyboardHeight - TAB_BAR_HEIGHT }}>
          <ErrorBoundary>
            <UnstakeForm onClose={handleDismiss} />
          </ErrorBoundary>
        </BottomSheetView>
      </BottomSheetScrollView>
    </BottomSheetModal>
  )
}
