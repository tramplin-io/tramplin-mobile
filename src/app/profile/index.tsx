import { ScreenWrapper } from '@/components/general'
import { ProfileContent } from '@/components/profile/ProfileContent'
import { ProfileHeader } from '@/components/profile/ProfileHeader'

export default function ProfileScreen() {
  return (
    <ScreenWrapper>
      <ProfileHeader title="Settings" />
      <ProfileContent />
    </ScreenWrapper>
  )
}
