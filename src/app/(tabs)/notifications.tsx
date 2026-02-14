import { View, Text } from 'react-native'
import { Container } from '@/components/ui/Container'

/**
 * Notifications Tab.
 *
 * TODO: Implementation
 * ─────────────────────
 * 1. Layout:
 *    - Header with "Notifications" title + mark-all-read button
 *    - FlatList of notification items (grouped by date: Today, Yesterday, Earlier)
 *    - Each item: icon, title, description, timestamp, read/unread indicator
 *    - Swipe-to-dismiss (optional, future)
 *
 * 2. Components needed:
 *    - Header (new: @/components/ui/Header)
 *    - NotificationItem (new: @/components/ui/NotificationItem)
 *    - EmptyState (new: @/components/ui/EmptyState) — "No notifications yet"
 *    - Divider (new: @/components/ui/Divider) — section separators
 *
 * 3. Data:
 *    - Notifications from API (useQuery with Orval-generated hook)
 *    - Local push notification history
 *    - Mark as read mutation
 *
 * 4. Empty state:
 *    - Bell icon + "You're all caught up!" message
 *
 * 5. Push notifications:
 *    - Request permission on first visit (useNotifications hook)
 *    - Register device token with backend
 */
export default function NotificationsTab() {
  return (
    <Container safe>
      <View className="px-6 py-8">
        <Text className="text-2xl font-bold text-content-primary mb-6">Notifications</Text>
        <Text className="text-content-secondary">[Notifications list placeholder]</Text>
      </View>
    </Container>
  )
}
