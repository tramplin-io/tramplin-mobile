import React from 'react'
import { Linking, View } from 'react-native'
import Toast from 'react-native-toast-message'

import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'

import HelpCenter from '@/assets/svg/help-center.svg'
import { CONTACT_US_EMAIL } from '@/constants/appConstants'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'

const EMAIL_SUBJECT = 'FemFast App Support'

function ContactUs(): JSX.Element {
  const handleEmailPress = async (): Promise<void> => {
    const emailUrl = `mailto:${CONTACT_US_EMAIL}?subject=${encodeURIComponent(EMAIL_SUBJECT)}`

    const canOpen = await Linking.canOpenURL(emailUrl)
    if (canOpen) {
      try {
        await Linking.openURL(emailUrl)
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Could not open the email app. Please try again later.',
          topOffset: 65,
        })
      }
    } else {
      Toast.show({
        type: 'error',
        text1:
          'No email app is available or configured to send mail on this device. Please install or set up a mail app and try again.',
        topOffset: 65,
      })
    }
  }

  return (
    <View className="flex-1">
      <View className="w-full items-center mt-14 mb-8">
        <View className="w-[297px] h-[200px]">
          <HelpCenter />
        </View>
        <Text variant="h2" className="mt-10 text-center">
          Questions or feedback?
        </Text>
        <Text variant="body" className="mt-4 text-center text-textSecondary">
          We’re here to help! Whether you have a question, want to share your
          thoughts, or need assistance — don’t hesitate to reach out.
        </Text>
      </View>

      <Button onPress={handleEmailPress}>
        <View className="flex-row items-center gap-2">
          <MaterialCommunityIcons
            name="email-outline"
            size={20}
            color="white"
          />
          <Text>{CONTACT_US_EMAIL}</Text>
        </View>
      </Button>
    </View>
  )
}

export default ContactUs
