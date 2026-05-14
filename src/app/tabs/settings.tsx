import { ScrollView } from 'react-native'

import { ScreenWrapper } from '@/components/general'
import { DashboardHeader } from '@/components/main'
import { ProfileContent } from '@/components/profile'

export default function SettingsTab() {
  return (
    <ScreenWrapper>
      <DashboardHeader title="Settings" />
      <ScrollView contentContainerClassName="px-4 pb-16 pt-6 flex-grow" showsVerticalScrollIndicator={false}>
        <ProfileContent isTab />
      </ScrollView>
    </ScreenWrapper>
  )
}
