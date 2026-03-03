import React from 'react'
import { Linking, Platform, View } from 'react-native'
import LottieView from 'lottie-react-native'
import Toast from 'react-native-toast-message'

import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { ANDROID_APP_STORE_URL } from '@/constants/appConstants'

const updateAvailableAnimation = require('@/assets/animation/update.json')

type ForceUpdateModalProps = {
  visible: boolean
}

export const ForceUpdateModal = ({ visible }: ForceUpdateModalProps) => {
  const handleUpdateApp = async () => {
    try {
      const storeUrl = Platform.select({
        ios: '',
        android: ANDROID_APP_STORE_URL,
      })

      if (storeUrl) {
        await Linking.openURL(storeUrl)
      }
    } catch (error) {
      console.error('Failed to open store:', error)
      Toast.show({
        type: 'error',
        text1: 'Failed to open store',
        // text2: error.message,
      })
    }
  }

  return (
    <AlertDialog open={visible}>
      <AlertDialogContent>
        <AlertDialogHeader className="items-center justify-center">
          <View className="mt-0">
            <LottieView source={updateAvailableAnimation} autoPlay loop style={{ width: 150, height: 150 }} />
          </View>

          <View className="items-center mt-4 mb-4 px-4">
            <Text variant="h3" className="text-center mb-3">
              Update Required
            </Text>
            <Text variant="body" className="text-center">
              A new version of Tramplin is available. Please update to continue using the app.
            </Text>
          </View>
        </AlertDialogHeader>

        <AlertDialogFooter className="w-full gap-2 mt-2">
          <Button size="xl" onPress={handleUpdateApp}>
            <Text>Update Now</Text>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ForceUpdateModal
