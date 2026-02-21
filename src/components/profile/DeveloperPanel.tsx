import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Text } from '@/components/ui/text'
import { API_URLS } from '@/constants/appConstants'
import { queryClient } from '@/lib/api/api-setup'
import {
  sendAffiseEvent,
  sendAppsFlyerEvent,
  sendFacebookEvent,
  sendTikTokCustomEvent,
} from '@/lib/events'
import {
  getModulesInstalled,
  getRandomDeviceId,
  getRandomUserId,
  startAffiseAdvertisingModule,
} from '@/lib/events/affise'
import { captureSentryException, captureSentryMessage } from '@/lib/sentry'
import {
  checkAndRequestUserAppReview,
  openAppStoreReview,
} from '@/lib/storeReview'
import { useApiConfigStore } from '@/lib/stores/api-config-store'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useDeveloperStore } from '@/lib/stores/developer-store'
import { useProfileStore } from '@/lib/stores/profile-store'
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet'
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet'
import axios from 'axios'
import { router } from 'expo-router'
import {
  getTrackingPermissionsAsync,
  requestTrackingPermissionsAsync,
} from 'expo-tracking-transparency'
import React from 'react'
import { useCallback, useRef, useState } from 'react'
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native'
import { Settings } from 'react-native-fbsdk-next'
import AppStoreReviewDialog from '../custom/AppStoreReviewDialog'
import { LogDisplay } from './LogDisplay'

export type ApiSource = 'Production' | 'Development' | 'Custom'

const API_SOURCE_OPTIONS = [
  { value: 'Production' as const, label: 'Production' },
  { value: 'Development' as const, label: 'Development' },
  { value: 'Custom' as const, label: 'Custom' },
]

// Helper function to determine API source based on URL
const getApiSourceFromUrl = (url: string | undefined): ApiSource => {
  if (!url || url === API_URLS.PROD) return 'Production'
  if (url === API_URLS.DEV) return 'Development'
  return 'Custom'
}

const getUrlForSource = (
  source: ApiSource,
  customUrl = '',
  fallbackUrl: string = API_URLS.PROD,
) => {
  switch (source) {
    case 'Production':
      return API_URLS.PROD
    case 'Development':
      return API_URLS.DEV
    case 'Custom':
      return customUrl.trim() || fallbackUrl
  }
}

// Health check validation function
const validateApiHealth = async (
  apiUrl: string,
): Promise<{ isValid: boolean; error?: string }> => {
  try {
    const openapiUrl = `${apiUrl}/openapi`

    console.log('Checking openapi endpoint:', openapiUrl)

    const response = await axios.get(openapiUrl, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })

    // Check if response has expected OpenAPI structure
    const data = response.data
    if (data?.info?.title === 'REST API') {
      return { isValid: true }
    }
    return {
      isValid: false,
      error: `Invalid OpenAPI response. Expected info.title: "REST API", got: "${data?.info?.title}"`,
    }
  } catch (error) {
    console.error('OpenAPI check failed:', error)

    return {
      isValid: false,
      error:
        error instanceof Error
          ? error.message
          : 'Unknown error occurred during OpenAPI check',
    }
  }
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const DeveloperPanel = ({ open, onOpenChange }: Props) => {
  const { apiUrl, setApiUrl } = useApiConfigStore()
  const { logout, isAuthenticated } = useAuthStore()
  const { resetStoreReviewDate, storeReviewDate } = useProfileStore()
  const { isRoutePathOverlayEnabled, setIsRoutePathOverlayEnabled } =
    useDeveloperStore()

  // console.log('apiUrl', apiUrl)

  const [pendingSource, setPendingSource] = useState<ApiSource>('Production')
  const [pendingCustomUrl, setPendingCustomUrl] = useState('')
  const [showLogoutWarning, setShowLogoutWarning] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const bottomSheetRef = useRef<BottomSheetModal>(null)
  const [openAppStoreReviewDialog, setOpenAppStoreReviewDialog] =
    useState(false)
  const [trackingStatus, setTrackingStatus] = useState<string | null>(null)
  const [trackingGranted, setTrackingGranted] = useState<boolean | null>(null)
  const [advertiserTrackingEnabled, setAdvertiserTrackingEnabled] = useState<
    boolean | null
  >(null)
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.2}
        pressBehavior="close"
        enableTouchThrough={false}
      />
    ),
    [],
  )

  React.useEffect(() => {
    if (open) {
      bottomSheetRef.current?.present()
      const currentSource = getApiSourceFromUrl(apiUrl)
      setPendingSource(currentSource)
      setPendingCustomUrl(currentSource === 'Custom' ? apiUrl || '' : '')
    } else {
      bottomSheetRef.current?.dismiss()
    }
  }, [open, apiUrl])

  React.useEffect(() => {
    setValidationError(null)
  }, [pendingSource, pendingCustomUrl])

  const handleDismiss = () => {
    onOpenChange(false)
  }

  const handleRoutePathToggle = (enabled: boolean) => {
    setIsRoutePathOverlayEnabled(enabled)
  }

  const handleSave = async () => {
    const newUrl = getUrlForSource(pendingSource, pendingCustomUrl, apiUrl)

    if (newUrl === apiUrl) {
      onOpenChange(false)
      return
    }

    // Clear any previous validation errors
    setValidationError(null)
    setIsValidating(true)

    try {
      // Validate the API health endpoint
      const { isValid, error } = await validateApiHealth(newUrl)

      if (!isValid) {
        setValidationError(error || 'Health check failed')
        setIsValidating(false)
        return
      }

      // Health check passed, proceed with save
      setIsValidating(false)

      if (isAuthenticated) {
        setShowLogoutWarning(true)
      } else {
        handleConfirmSave()
      }
    } catch (error) {
      setIsValidating(false)
      setValidationError('Unexpected error during validation')
      console.error('Validation error:', error)
    }
  }

  const handleConfirmSave = () => {
    const newUrl = getUrlForSource(pendingSource, pendingCustomUrl, apiUrl)
    setApiUrl(newUrl)

    queryClient.clear()

    // Logout if authenticated
    if (isAuthenticated) {
      logout()
    }

    // Close the panel
    onOpenChange(false)

    Alert.alert(
      'API Configuration Updated',
      'The API configuration has been changed successfully. Please restart the app to ensure all changes take effect.',
      [{ text: 'OK' }],
    )
  }

  const handleCancelSave = () => {
    setShowLogoutWarning(false)
  }

  const currentSource = getApiSourceFromUrl(apiUrl)
  const currentUrl = apiUrl || API_URLS.PROD
  const isCustomSelected = pendingSource === 'Custom'

  const hasPendingChanges = () => {
    if (pendingSource !== currentSource) return true
    if (
      pendingSource === 'Custom' &&
      pendingCustomUrl !== (currentSource === 'Custom' ? apiUrl : '')
    )
      return true
    return false
  }

  const displayUrl = isCustomSelected
    ? pendingCustomUrl
    : getUrlForSource(pendingSource)
  const isSaveDisabled =
    !hasPendingChanges() ||
    (isCustomSelected && !pendingCustomUrl.trim()) ||
    isValidating

  const handleRequestTracking = async () => {
    const { status } = await requestTrackingPermissionsAsync()
    const { granted } = await getTrackingPermissionsAsync()
    const advertiserTrackingEnabled =
      await Settings.getAdvertiserTrackingEnabled()

    return { status, granted, advertiserTrackingEnabled }
  }

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      onDismiss={handleDismiss}
      backgroundStyle={{ borderRadius: 32 }}
      handleIndicatorStyle={{ backgroundColor: '#F4F2F3' }}
      enableDismissOnClose={true}
      backdropComponent={renderBackdrop}
      snapPoints={['80%']}
    >
      <BottomSheetView>
        <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
          <Text variant="h2" className="text-center mb-2 mt-2">
            🔧 Developer Tools
          </Text>
          <Text
            variant="footnote"
            className="text-center text-textSecondary mb-6"
          >
            Development and debugging tools
          </Text>

          <View className="gap-6">
            <View className="gap-3">
              <Text variant="heading" className="text-secondaryPink">
                Route Path Overlay
              </Text>
              <View className="flex-row items-center justify-between p-4 bg-background-cards rounded-lg">
                <View className="flex-1">
                  <Text variant="body" className="text-textPrimary">
                    Show Current Route
                  </Text>
                  <Text variant="footnote" className="text-textSecondary">
                    Display current route path on screen
                  </Text>
                </View>
                <Switch
                  checked={isRoutePathOverlayEnabled}
                  onCheckedChange={handleRoutePathToggle}
                />
              </View>
            </View>

            <View className="gap-3 mb-4">
              <Text variant="heading" className="text-secondaryPink">
                Testing Tools
              </Text>
              {/* RevenueCat Subscription Test */}
              <Button
                variant="secondary"
                size="sm"
                onPress={() => {
                  router.push('/subscription/paywall')
                  onOpenChange(false)
                }}
                className="w-full"
              >
                <Text>Open RevenueCat Subscription Test</Text>
              </Button>
              {/* Sentry */}
              <View className="flex-row gap-3 w-full">
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => {
                    try {
                      // Deliberately throw an error for testing
                      throw new Error(
                        'Test error sent to Sentry from Developer Panel',
                      )
                    } catch (error) {
                      if (error instanceof Error) {
                        // Send to Sentry
                        captureSentryException(error)
                        // Show feedback
                        Alert.alert(
                          'Test Error Sent',
                          'A test error was sent to Sentry',
                        )
                      }
                    }
                  }}
                  className="w-[48%]"
                >
                  <Text>Send Error to Sentry</Text>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => {
                    try {
                      // Deliberately throw an error for testing
                      throw new Error(
                        'Test info sent to Sentry from Developer Panel',
                      )
                    } catch (error) {
                      if (error instanceof Error) {
                        // Send to Sentry
                        captureSentryMessage(error.message)
                        // Show feedback
                        Alert.alert(
                          'Test Info Sent',
                          'A test info was sent to Sentry',
                        )
                      }
                    }
                  }}
                  className="w-[48%]"
                >
                  <Text>Send Info to Sentry</Text>
                </Button>
              </View>
              {/* Facebook */}

              {/* <View className="flex-row gap-3 w-full">
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => {
                    sendFacebookEvent('firstAppLaunch')
                  }}
                  className="w-[48%]"
                >
                  <Text>FB Event installApp</Text>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => {
                    sendFacebookEvent('activateApp')
                  }}
                  className="w-[48%]"
                >
                  <Text>FB Event activateApp</Text>
                </Button>
              </View> */}
              <View className="flex-row gap-3 w-full">
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => {
                    sendFacebookEvent('test')
                  }}
                  className="w-[48%]"
                >
                  <Text>FB Event TEST</Text>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => {
                    sendFacebookEvent('purchase')
                  }}
                  className="w-[48%]"
                >
                  <Text>FB purchase</Text>
                </Button>
                {/* <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => {
                    sendFacebookEventCompletedRegistration(
                      'CompletedRegistration',
                    )
                  }}
                >
                  <Text>CompletedRegistration</Text>
                </Button> */}
              </View>
              {/* TikTok */}
              <View className="flex-row gap-3 w-full">
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => {
                    sendTikTokCustomEvent('test')
                  }}
                  className="w-[48%]"
                >
                  <Text>TikTok Ev test</Text>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => {
                    sendTikTokCustomEvent('purchase')
                  }}
                  className="w-[48%]"
                >
                  <Text>TikTok Ev purchase</Text>
                </Button>
              </View>
              <View className="flex flex-row flex-wrap gap-3 w-full">
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => {
                    Alert.alert(
                      'Facebook App Info',
                      `App ID: ${process.env.EXPO_PUBLIC_FACEBOOK_APP_ID}\nApp Name: ${process.env.EXPO_PUBLIC_FACEBOOK_APP_NAME}`,
                    )
                  }}
                  className="w-[48%]"
                >
                  <Text>Show FB App Info</Text>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => {
                    Alert.alert(
                      'AppsFlyer App Info',
                      `AppsFlyer IOS ID: ${process.env.EXPO_PUBLIC_IOS_APP_ID}\nAppsFlyer Dev Key: ${(process.env.EXPO_PUBLIC_APPSFLYER_DEV_KEY ?? '').slice(0, 5)}...`,
                    )
                  }}
                  className="w-[48%]"
                >
                  <Text>Show AppsFlyer Info</Text>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={async () => {
                    Alert.alert(
                      'Affise App Info',
                      `Affise App ID: ${process.env.EXPO_PUBLIC_AFFISE_APP_ID}
                      \nAffise Secret Key: ${(process.env.EXPO_PUBLIC_AFFISE_SECRET_KEY ?? '').slice(0, 5)}...
                      \nAffise Device ID: ${await getRandomDeviceId()}
                      \nAffise User ID: ${await getRandomUserId()}`,
                    )
                  }}
                  className="w-[48%]"
                >
                  <Text>Show Affise Info</Text>
                </Button>
              </View>
              {/* AppsFlyer */}
              <View className="flex-row gap-3 w-full">
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => {
                    sendAppsFlyerEvent({
                      name: 'af_test',
                    })
                  }}
                  className="w-[48%]"
                >
                  <Text className="line-clamp-1">AppsFlyer Ev af_test</Text>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => {
                    sendAppsFlyerEvent({
                      name: 'af_activate_app',
                    })
                  }}
                  className="w-[48%]"
                >
                  <Text className="line-clamp-1">
                    AppsFlyer Ev af_activate_app
                  </Text>
                </Button>
              </View>
              {/* Affise */}
              <View className="flex-row gap-3 w-full">
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => {
                    sendAffiseEvent({
                      name: 'test',
                    })
                  }}
                  className="w-[48%]"
                >
                  <Text className="line-clamp-1">Affise Ev test</Text>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => {
                    sendAffiseEvent({
                      name: 'LaunchApp',
                    })
                  }}
                  className="w-[48%]"
                >
                  <Text className="line-clamp-1">Affise Ev activateApp</Text>
                </Button>
                {/* <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => {
                    sendAffiseEvent({
                      name: 'Subscribe',
                      params: {
                        revenue: 0.99,
                        currency: 'USD',
                        content_id: 'FF1M1W1499',
                        content_type: 'subscription',
                        content_name: 'FemFast 1 Month 0_99 1w trial TEST',
                      },
                    })
                  }}
                  className="w-[48%]"
                >
                  <Text className="line-clamp-1">Affise Ev Subscribe</Text>
                </Button> */}
                {/* <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => {
                    sendAffiseEvent({
                      name: 'StartTrial',
                      params: {
                        plan: 'FF1M1W1499',
                        duration_days: 14,
                      },
                    })
                  }}
                  className="w-[48%]"
                >
                  <Text className="line-clamp-1">Affise Ev StartTrial</Text>
                </Button> */}
              </View>
              {/* <View className="flex-row gap-3 w-full">
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => startAffiseAdvertisingModule()}
                  className="w-[48%]"
                >
                  <Text className="line-clamp-1">
                    Affise Ev StartAdvertising
                  </Text>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => getModulesInstalled()}
                  className="w-[48%]"
                >
                  <Text className="line-clamp-1">
                    Affise Ev GetModulesInstalled
                  </Text>
                </Button>
              </View> */}
              {/* Store Review */}
              <View className="flex-row gap-3 w-full">
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => openAppStoreReview()}
                  className="w-[48%]"
                >
                  <Text>Open App Store Review</Text>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() =>
                    checkAndRequestUserAppReview().then(result => {
                      handleDismiss()
                      if (!result && result !== null) {
                        setOpenAppStoreReviewDialog(true)
                      }
                    })
                  }
                  className="w-[48%]"
                >
                  <Text>Open in App Review</Text>
                </Button>
              </View>
              <View className="flex-row gap-3 w-full">
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => resetStoreReviewDate()}
                  className="w-[48%]"
                  disabled={!storeReviewDate}
                >
                  <Text>Reset Store Review Date</Text>
                </Button>
              </View>
              {/* Tracking */}
              <View className="flex-col gap-3 w-full">
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={async () => {
                    const { status, granted, advertiserTrackingEnabled } =
                      await handleRequestTracking()
                    setTrackingStatus(status)
                    setTrackingGranted(granted)
                    setAdvertiserTrackingEnabled(advertiserTrackingEnabled)
                  }}
                >
                  <Text>Check FB Tracking Permission</Text>
                </Button>
                <Text>
                  FB Tracking permissions status: {trackingStatus ?? '-'}
                </Text>
                <Text>
                  FB Tracking permissions granted:{' '}
                  {trackingGranted === null
                    ? '-'
                    : trackingGranted
                      ? 'Yes'
                      : 'No'}
                </Text>
                <Text>
                  FB Advertiser Tracking Enabled:{' '}
                  {advertiserTrackingEnabled === null
                    ? '-'
                    : advertiserTrackingEnabled
                      ? 'Yes'
                      : 'No'}
                </Text>
              </View>
              <LogDisplay />
            </View>

            <View className="gap-3">
              <Text variant="heading" className="text-secondaryPink">
                API Source
              </Text>

              <View className="flex-row bg-background-cards rounded-lg p-1">
                {API_SOURCE_OPTIONS.map(option => {
                  const isSelected = pendingSource === option.value
                  return (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => setPendingSource(option.value)}
                      className={`flex-1 py-2 px-3 rounded-md ${
                        isSelected ? 'bg-secondaryPink' : 'bg-transparent'
                      }`}
                    >
                      <Text
                        className={`text-center text-sm font-medium ${
                          isSelected ? 'text-white' : 'text-textSecondary'
                        }`}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>

            <View className="gap-3">
              <Text variant="heading" className="text-secondaryPink">
                API URL
              </Text>

              <Input
                placeholder="Enter custom API URL"
                value={displayUrl}
                onChangeText={setPendingCustomUrl}
                editable={isCustomSelected}
                className={isCustomSelected ? '' : 'opacity-60'}
              />
            </View>

            {validationError && (
              <View className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <Text variant="heading" className="text-red-800">
                  ❌ Health Check Failed
                </Text>
                <Text variant="body" className="text-red-700 mt-2">
                  {validationError}
                </Text>
              </View>
            )}

            <Button
              variant="default"
              onPress={handleSave}
              disabled={isSaveDisabled}
              className="w-full"
            >
              <Text>{isValidating ? 'Validating API...' : 'Save Changes'}</Text>
            </Button>

            {showLogoutWarning && (
              <View className="gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <Text variant="heading" className="text-red-800">
                  ⚠️ Warning: API Server Change
                </Text>
                <Text variant="body" className="text-red-700">
                  Changing the API server will log you out and clear all cached
                  data. Your authentication token is only valid for the current
                  server.{'\n\n'}
                  You'll need to manually restart the app and sign in again
                  after the change.
                </Text>
                <View className="flex-row gap-3">
                  <Button
                    variant="secondary"
                    onPress={handleCancelSave}
                    className="flex-1"
                  >
                    <Text>Cancel</Text>
                  </Button>
                  <Button
                    variant="default"
                    onPress={handleConfirmSave}
                    className="flex-1 bg-red-600"
                  >
                    <Text className="text-white">Continue</Text>
                  </Button>
                </View>
              </View>
            )}

            <View className="gap-2">
              <Text variant="heading" className="text-secondaryPink">
                Current Configuration
              </Text>
              <View className="p-3 bg-background-cards rounded-lg">
                <Text variant="footnote" className="text-textSecondary">
                  Source: {currentSource}
                  {'\n'}
                  URL: {currentUrl}
                  {'\n'}
                  Environment: {__DEV__ ? 'Development' : 'Production'}
                  {'\n'}
                  Route Overlay:{' '}
                  {isRoutePathOverlayEnabled ? 'Enabled' : 'Disabled'}
                </Text>
              </View>

              {hasPendingChanges() && (
                <View className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Text variant="footnote" className="text-yellow-800">
                    ⚠️ You have unsaved changes{'\n'}
                    Pending Source: {pendingSource}
                    {'\n'}
                    {isCustomSelected &&
                      `Pending URL: ${pendingCustomUrl}{'\n'}`}
                    Changes will be lost if you close without saving.
                  </Text>
                </View>
              )}
            </View>
          </View>

          <Button
            variant="secondary"
            onPress={handleDismiss}
            className="mt-6 mb-14"
          >
            <Text>Close</Text>
          </Button>
        </ScrollView>
      </BottomSheetView>
      <AppStoreReviewDialog
        open={openAppStoreReviewDialog}
        onOpenChange={setOpenAppStoreReviewDialog}
      />
    </BottomSheetModal>
  )
}
