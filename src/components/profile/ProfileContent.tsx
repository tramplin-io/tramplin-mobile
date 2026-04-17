import { useCallback, useState } from 'react'
import { Linking, Pressable, ScrollView, TouchableOpacity, View } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

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
import { APP_VERSION, BUILD_NUMBER, DEV_TOOLS_ENABLED } from '@/constants/appConstants'
import { PRIVACY_POLICY_URL, TERMS_OF_USE_URL } from '@/constants/profile'
import { useDeleteMyProfile } from '@/lib/api/generated/restApi'
import { useAuthStore } from '@/lib/stores/auth-store'

export interface MenuSectionItem {
  title: string
  href?: string
  textClassName?: string
  showChevron?: boolean
  onPress?: () => void
}

export interface ProfileContentProps {
  isTab?: boolean
}

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

export function ProfileContent({ isTab = false }: Readonly<ProfileContentProps>) {
  const insets = useSafeAreaInsets()
  const { disconnect } = useMobileWallet()
  const logout = useAuthStore((s) => s.logout)

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false)

  const { mutate: deleteProfile, isPending: isDeleting } = useDeleteMyProfile({
    mutation: {
      onSuccess: () => {
        setShowDeleteDialog(false)
        logout({ disconnect, router })
        setShowDeleteSuccess(true)
      },
      onError: () => {
        Toast.show({ type: 'error', text1: 'Could not delete account' })
      },
    },
  })

  const [showDeveloperPanel, setShowDeveloperPanel] = useState(false)
  const [versionTapCount, setVersionTapCount] = useState(0)
  const [lastTapTime, setLastTapTime] = useState(0)

  const generalItems: MenuSectionItem[] = [
    {
      title: 'Notifications',
      onPress: () => router.push('/screens/notification-settings'),
    },
    {
      title: 'Subscription',
      onPress: () => router.push('/screens/subscription'),
    },
  ]

  const helpItems: MenuSectionItem[] = [
    {
      title: 'Contact Us',
      onPress: () => router.push('/screens/contact-us'),
    },
  ]

  const legalItems: MenuSectionItem[] = [
    {
      title: 'Terms of Use',
      onPress: () => {
        Linking.openURL(TERMS_OF_USE_URL)
      },
    },
    {
      title: 'Privacy Policy',
      onPress: () => {
        Linking.openURL(PRIVACY_POLICY_URL)
      },
    },
    {
      title: 'Revoke my Consent & Delete Account',
      textClassName: 'text-critical-primary',
      showChevron: false,
      onPress: () => setShowDeleteDialog(true),
    },
  ]

  const handleVersionTap = useCallback(() => {
    if (!DEV_TOOLS_ENABLED) {
      return
    }

    const currentTime = Date.now()
    const timeDiff = currentTime - lastTapTime

    if (timeDiff > 2000) {
      setVersionTapCount(1)
    } else {
      setVersionTapCount((prev) => prev + 1)
    }

    setLastTapTime(currentTime)

    if (versionTapCount >= 6) {
      setShowDeveloperPanel(true)
      setVersionTapCount(0)
    }
  }, [lastTapTime, versionTapCount])

  const handleSignOut = useCallback(() => {
    logout({ disconnect, router })
  }, [logout, disconnect])

  const handleDeleteConfirm = useCallback(() => {
    deleteProfile()
  }, [deleteProfile])

  const handleDeleteSuccessClose = useCallback(() => {
    setShowDeleteSuccess(false)
    router.replace('/')
  }, [])

  const content = (
    <View className="gap-6 pt-2">
      {/* <Section title="GENERAL" items={generalItems} /> */}
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
  )

  return (
    <>
      {isTab ? (
        <View className="relative flex-1">{content}</View>
      ) : (
        <ScrollView
          className="relative flex-1 px-4 pt-6"
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      )}

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
    </>
  )
}
