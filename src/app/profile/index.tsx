import { useCallback, useState } from 'react'
import { Linking, Pressable, ScrollView, TouchableOpacity, View } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { useCSSVariable } from 'uniwind'

import { ScreenWrapper } from '@/components/general'
import { BackButton } from '@/components/general/BackButton'
import { DeveloperPanel } from '@/components/profile/DeveloperPanel'
import { Card } from '@/components/ui'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { APP_VERSION, BUILD_NUMBER } from '@/constants/appConstants'
import { PRIVACY_POLICY_URL, TERMS_OF_USE_URL } from '@/constants/profile'
import { useDeleteMyProfile } from '@/lib/api/generated/restApi'
import { useAuthStore } from '@/lib/stores/auth-store'

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
        <DialogTitle>Delete My Account & Revoke Consent</DialogTitle>
        <DialogDescription className="text-center">
          <Text variant="body" className="text-content-primary">
            This action will permanently delete your account and all personal data.
          </Text>{' '}
          {'\n'}
          <Text variant="body" className="font-bold">
            This cannot be undone.
          </Text>
          {'\n\n'}
          {/* <Text variant="small" className="text-content-tertiary">
            Type "DELETE" below to confirm:
          </Text> */}
          <Text variant="small" className="text-content-tertiary">
            Type{' '}
            <Text variant="body" className="text-content-primary">
              &quot;DELETE&quot;
            </Text>{' '}
            below to confirm:
          </Text>
        </DialogDescription>

        <Input value={deleteInput} placeholder="DELETE" onChangeText={setDeleteInput} className="w-full" />

        <DialogFooter className="gap-3">
          <Button variant="destructive" size="xl" onPress={onConfirm} disabled={!isDelete || isLoading}>
            <Text>{isLoading ? 'Deleting...' : 'Confirm'}</Text>
          </Button>
          <Button variant="ghost" onPress={handleClose} disabled={isLoading}>
            <Text className="font-bold">Cancel</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DeleteSuccessDialog({
  open,
  onOpenChange,
  onConfirm,
}: Readonly<{
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}>) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="gap-8">
        <AlertDialogTitle>Your account has been deleted</AlertDialogTitle>
        <AlertDialogDescription className="text-center">
          <Text variant="body">All your data and preferences have been erased.</Text>
        </AlertDialogDescription>
        <AlertDialogFooter>
          <Button size="xl" onPress={onConfirm}>
            <Text>Back to Start</Text>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const { disconnect } = useMobileWallet()
  const logout = useAuthStore((s) => s.logout)

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false)

  const fillPrimary = useCSSVariable('--color-fill-primary') as string
  const fillFade = useCSSVariable('--color-fill-fade') as string

  const { mutate: deleteProfile, isPending: isDeleting } = useDeleteMyProfile({
    mutation: {
      onSuccess: () => {
        setShowDeleteDialog(false)
        void logout({ disconnect, router })
        setShowDeleteSuccess(true)
      },
      onError: () => {
        Toast.show({ type: 'error', text1: 'Could not delete account' })
      },
    },
  })

  // Developer panel state
  const [showDeveloperPanel, setShowDeveloperPanel] = useState(false)
  const [versionTapCount, setVersionTapCount] = useState(0)
  const [lastTapTime, setLastTapTime] = useState(0)

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

  // const systemItems: MenuSectionItem[] = [
  //   {
  //     title: 'System settings',
  //     onPress: () => {
  //       router.push('/screens/system-settings')
  //     },
  //   },
  // ]

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

  const handleVersionTap = () => {
    const currentTime = Date.now()
    const timeDiff = currentTime - lastTapTime

    // Reset counter if more than 2 seconds between taps
    if (timeDiff > 2000) {
      setVersionTapCount(1)
    } else {
      setVersionTapCount((prev) => prev + 1)
    }

    setLastTapTime(currentTime)

    // Open developer panel after 7 taps
    if (versionTapCount >= 6) {
      setShowDeveloperPanel(true)
      setVersionTapCount(0)
    }
  }

  const handleSignOut = useCallback(() => {
    void logout({ disconnect, router })
  }, [logout, disconnect])

  const handleDeleteConfirm = useCallback(() => {
    deleteProfile()
  }, [deleteProfile])

  const handleDeleteSuccessClose = useCallback(() => {
    setShowDeleteSuccess(false)
    router.replace('/')
  }, [])

  const handleBack = useCallback(() => {
    router.replace('/tabs/')
  }, [])

  return (
    <ScreenWrapper>
      <View className="flex-row items-center justify-between mb-2 mt-2 px-4">
        <BackButton onPress={handleBack} className="mb-0 z-10" />
        <Text variant="h4" className="text-center w-full -ml-10">
          My Profile
        </Text>
      </View>
      <LinearGradient
        colors={[fillPrimary, fillFade]}
        locations={[0, 1]}
        className="w-full h-10 z-10"
        style={{
          position: 'absolute',
          top: 56,
          left: 0,
          right: 0,
          height: 32,
        }}
      />
      <ScrollView
        className="relative flex-1 px-4 pt-6 "
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-6 pt-2">
          <Section title="GENERAL" items={generalItems} />
          {/* <Section title="SYSTEM" items={systemItems} /> */}
          <Section title="NEED HELP?" items={helpItems} />
          <Section title="LEGAL" items={legalItems} />

          {__DEV__ && (
            <Section
              title="DEV"
              items={[
                {
                  title: 'Dev Test Screen',
                  onPress: () => router.push('/screens/devTest'),
                },
              ]}
            />
          )}

          <Button variant="destructive" size="xl" onPress={handleSignOut}>
            <Text>Sign Out</Text>
          </Button>
          <Pressable onPress={handleVersionTap} className="items-center mb-4">
            <Text variant="small" className="text-textAdditional">
              Version {APP_VERSION} ({BUILD_NUMBER})
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <DeveloperPanel open={showDeveloperPanel} onOpenChange={setShowDeveloperPanel} />

      <DeleteAccountDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />

      <DeleteSuccessDialog
        open={showDeleteSuccess}
        onOpenChange={setShowDeleteSuccess}
        onConfirm={handleDeleteSuccessClose}
      />
    </ScreenWrapper>
  )
}
