import { router } from 'expo-router'
import { useCallback, useState } from 'react'
import { Linking, Pressable, ScrollView, TouchableOpacity, View } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Logo, ThreeDotsIcon } from '@/components/icons'
import { UserIcon } from '@/components/general/UserIcon'
import { formatWalletAddress } from '@/utils/wallet'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { BackButton } from '@/components/general/BackButton'
import { Card } from '@/components/ui'
import { PRIVACY_POLICY_URL, TERMS_OF_USE_URL } from '@/constants/profile'

interface MenuSectionItem {
  title: string
  href?: string
  textClassName?: string
  showChevron?: boolean
  onPress?: () => void
}

// function ProfileHeader() {
//   const { account } = useMobileWallet()
//   const addressStr = account?.address?.toString()

//   return (
//     <View className="flex-row items-center justify-between w-full px-4 py-3">
//       <View className="flex-row items-center" style={{ maxWidth: 180 }} pointerEvents="none">
//         <Logo width={100} height={19} />
//       </View>
//       {addressStr ? (
//         <View className="flex-row items-center gap-1.5">
//           <ThreeDotsIcon size={24} />
//           <Text className="text-content-primary text-sm font-bold" style={{ lineHeight: 18 }} numberOfLines={1}>
//             {formatWalletAddress(addressStr)}
//           </Text>
//           <UserIcon size={20} />
//         </View>
//       ) : null}
//     </View>
//   )
// }

function MenuItem({
  title,
  isLast,
  textClassName,
  showChevron = true,
  onPress,
}: Readonly<{
  title: string
  isLast?: boolean
  textClassName?: string
  showChevron?: boolean
  onPress?: () => void
}>) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row justify-between items-center py-4 ${isLast ? '' : 'border-b border-border-tertiary'}`}
      activeOpacity={0.7}
    >
      <Text variant="body" className={`${textClassName ?? ''}`}>
        {title}
      </Text>
      {showChevron && (
        <Text className="text-brand-primary text-lg font-semibold" style={{ lineHeight: 20 }}>
          ›
        </Text>
      )}
    </TouchableOpacity>
  )
}

function Section({ title, items }: Readonly<{ title: string; items: MenuSectionItem[] }>) {
  return (
    <View className="gap-2">
      <Text variant="body" className="text-content-primary uppercase tracking-wide">
        {title}
      </Text>
      <Card variant="profile">
        {items.map((item, index) => (
          <MenuItem
            key={item.title}
            title={item.title}
            isLast={index === items.length - 1}
            textClassName={item.textClassName}
            showChevron={item.showChevron ?? true}
            onPress={item.onPress}
          />
        ))}
      </Card>
    </View>
  )
}

function DeleteAccountDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: Readonly<{
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isLoading: boolean
}>) {
  const [deleteInput, setDeleteInput] = useState('')
  const isDelete = deleteInput === 'DELETE'

  const handleClose = useCallback(() => {
    onOpenChange(false)
    setDeleteInput('')
  }, [onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle className="text-center">Delete My Account & Revoke Consent</DialogTitle>
        <DialogDescription className="text-center">
          <Text className="text-content-primary">
            This action will permanently delete your account and all personal data. This cannot be undone.
          </Text>
          {'\n\n'}
          <Text variant="small" className="text-content-tertiary">
            {'Type "DELETE" below to confirm:'}
          </Text>
        </DialogDescription>
        <Input value={deleteInput} onChangeText={setDeleteInput} />
        <DialogFooter className="gap-3">
          <Button onPress={onConfirm} disabled={!isDelete || isLoading}>
            <Text className="text-primary-foreground">{isLoading ? 'Deleting...' : 'Confirm'}</Text>
          </Button>
          <Button variant="ghost" onPress={handleClose} disabled={isLoading}>
            <Text>Cancel</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const { disconnect } = useMobileWallet()
  const logout = useAuthStore((s) => s.logout)

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const generalItems: MenuSectionItem[] = [
    {
      title: 'Notifications',
      onPress: () => {
        router.push('/screens/notification-settings')
      },
    },
    {
      title: 'Subscription',
      onPress: () => {
        router.push('/screens/subscription')
      },
    },
  ]

  const helpItems: MenuSectionItem[] = [
    {
      title: 'Contact Us',
      onPress: () => {
        router.push('/screens/contact-us')
      },
    },
  ]

  const legalItems: MenuSectionItem[] = [
    {
      title: 'Terms of Use',
      onPress: () => {
        void Linking.openURL(TERMS_OF_USE_URL)
      },
    },
    {
      title: 'Privacy Policy',
      onPress: () => {
        void Linking.openURL(PRIVACY_POLICY_URL)
      },
    },
    {
      title: 'Revoke my Consent & Delete Account',
      textClassName: 'text-critical-primary',
      showChevron: false,
      onPress: () => setShowDeleteDialog(true),
    },
  ]

  const handleSignOut = useCallback(() => {
    void logout({ disconnect, router })
  }, [logout, disconnect])

  const handleDeleteConfirm = useCallback(() => {
    setIsDeleting(true)
    // TODO: wire delete account API when available
    void Promise.resolve()
      .then(() => new Promise((r) => setTimeout(r, 800)))
      .then(() => {
        setIsDeleting(false)
        setShowDeleteDialog(false)
        setShowDeleteSuccess(true)
      })
  }, [])

  const handleDeleteSuccessClose = useCallback(() => {
    setShowDeleteSuccess(false)
    router.replace('/')
  }, [])

  return (
    <Container safe={false} className="bg-fill-primary">
      {/* <ProfileHeader /> */}
      <ScrollView
        className="flex-1 px-4 pt-6"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-6 pt-2">
          <Section title="GENERAL" items={generalItems} />
          <Section title="NEED HELP?" items={helpItems} />
          <Section title="LEGAL" items={legalItems} />

          <Button variant="destructive" size="xl" onPress={handleSignOut}>
            <Text>Sign Out</Text>
          </Button>
        </View>
      </ScrollView>

      <DeleteAccountDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />

      <AlertDialog open={showDeleteSuccess} onOpenChange={setShowDeleteSuccess}>
        <AlertDialogContent className="py-8">
          <AlertDialogTitle className="text-center">Your account has been deleted</AlertDialogTitle>
          <AlertDialogDescription>
            <Text className="text-center text-content-primary">All your data and preferences have been erased.</Text>
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogAction onPress={handleDeleteSuccessClose}>
              <Text>Back to Start</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Container>
  )
}
