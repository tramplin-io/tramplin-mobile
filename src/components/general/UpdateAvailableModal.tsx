import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { ANDROID_APP_STORE_URL } from '@/constants/appConstants'
import React from 'react'
import { Linking, Platform } from 'react-native'
import { View } from 'react-native'

type UpdateAvailableModalProps = {
  visible: boolean
  onClose: () => void
}

export const UpdateAvailableModal = ({ visible, onClose }: UpdateAvailableModalProps) => {
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
    }
  }

  return (
    <AlertDialog open={visible} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader className="items-center justify-center">
          <Text className="text-[72px] leading-[108px]">✨</Text>

          <View className="items-center mt-2 px-4">
            <Text variant="h3" className="text-center mb-3">
              Update Available
            </Text>
            <Text variant="body" className="text-center">
              A new version of Tramplin is available with improvements and bug fixes.
            </Text>
          </View>
        </AlertDialogHeader>

        <AlertDialogFooter className="w-full gap-2 mt-4">
          <Button variant="link" size="xl" onPress={onClose}>
            <Text variant="body">Later</Text>
          </Button>
          <Button size="xl" onPress={handleUpdateApp}>
            <Text>Update Now</Text>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default UpdateAvailableModal
