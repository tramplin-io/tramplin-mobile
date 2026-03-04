import { ScrollView } from 'react-native'

import { ScreenWrapper } from '@/components/general'
import { DashboardHeader } from '@/components/main'
import { ProfileContent } from '@/components/profile'

export default function SettingsTab() {
  return (
    <ScreenWrapper>
      <ScrollView contentContainerClassName="px-4 pb-30 py-8 flex-grow" showsVerticalScrollIndicator={false}>
        <DashboardHeader title="Settings" className="mb-6" />
        <ProfileContent isTab />
      </ScrollView>
    </ScreenWrapper>
  )
}
