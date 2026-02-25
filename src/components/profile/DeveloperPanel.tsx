import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Text } from '@/components/ui/text'
import { API_URLS } from '@/constants/appConstants'
import { queryClient } from '@/lib/api/api-setup'
import { captureSentryException, captureSentryMessage } from '@/lib/sentry'
import { useApiConfigStore } from '@/lib/stores/api-config-store'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useDeveloperStore } from '@/lib/stores/developer-store'
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet'
import axios from 'axios'
import React from 'react'
import { useCallback, useRef, useState } from 'react'
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native'
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

const getUrlForSource = (source: ApiSource, customUrl = '', fallbackUrl: string = API_URLS.PROD) => {
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
const validateApiHealth = async (apiUrl: string): Promise<{ isValid: boolean; error?: string }> => {
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
      error: error instanceof Error ? error.message : 'Unknown error occurred during OpenAPI check',
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
  const { isRoutePathOverlayEnabled, setIsRoutePathOverlayEnabled } = useDeveloperStore()

  // console.log('apiUrl', apiUrl)

  const [pendingSource, setPendingSource] = useState<ApiSource>('Production')
  const [pendingCustomUrl, setPendingCustomUrl] = useState('')
  const [showLogoutWarning, setShowLogoutWarning] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const bottomSheetRef = useRef<BottomSheetModal>(null)

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: need to use pendingSource, pendingCustomUrl
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
    if (pendingSource === 'Custom' && pendingCustomUrl !== (currentSource === 'Custom' ? apiUrl : '')) return true
    return false
  }

  const displayUrl = isCustomSelected ? pendingCustomUrl : getUrlForSource(pendingSource)
  const isSaveDisabled = !hasPendingChanges() || (isCustomSelected && !pendingCustomUrl.trim()) || isValidating

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
        <ScrollView className="px-4 pb-60" showsVerticalScrollIndicator={false}>
          <Text variant="h3" className="text-center mb-2 mt-2">
            🔧 Developer Tools
          </Text>
          <Text variant="body" className="text-center text-textSecondary mb-6">
            Development and debugging tools
          </Text>

          <View className="gap-4">
            <View className="gap-2">
              <Text variant="h4" className="text-secondaryPink">
                Route Path Overlay
              </Text>
              <View className="flex-row items-center justify-between p-4 bg-background-cards rounded-lg">
                <View className="flex-1">
                  <Text variant="body" className="text-textPrimary">
                    Show Current Route
                  </Text>
                  <Text variant="body" className="text-textSecondary">
                    Display current route path on screen
                  </Text>
                </View>
                <Switch checked={isRoutePathOverlayEnabled} onCheckedChange={handleRoutePathToggle} />
              </View>
            </View>

            <View className="gap-2 mb-4">
              <Text variant="h4" className="text-secondaryPink">
                Testing Tools
              </Text>

              {/* Sentry */}
              <View className="flex-row gap-3 w-full">
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => {
                    try {
                      // Deliberately throw an error for testing
                      throw new Error('Test error sent to Sentry from Developer Panel')
                    } catch (error) {
                      if (error instanceof Error) {
                        // Send to Sentry
                        captureSentryException(error)
                        // Show feedback
                        Alert.alert('Test Error Sent', 'A test error was sent to Sentry')
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
                      throw new Error('Test info sent to Sentry from Developer Panel')
                    } catch (error) {
                      if (error instanceof Error) {
                        // Send to Sentry
                        captureSentryMessage(error.message)
                        // Show feedback
                        Alert.alert('Test Info Sent', 'A test info was sent to Sentry')
                      }
                    }
                  }}
                  className="w-[48%]"
                >
                  <Text>Send Info to Sentry</Text>
                </Button>
              </View>
              <LogDisplay />
            </View>

            {/* <View className="gap-2">
              <Text variant="h4" className="text-secondaryPink">
                API Source
              </Text>

              <View className="flex-row bg-background-cards rounded-lg p-1">
                {API_SOURCE_OPTIONS.map((option) => {
                  const isSelected = pendingSource === option.value
                  return (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => setPendingSource(option.value)}
                      className={`flex-1 py-2 px-3 rounded-md ${isSelected ? 'bg-secondaryPink' : 'bg-transparent'}`}
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
            </View> */}

            <View className="gap-2">
              <Text variant="h4" className="text-secondaryPink">
                API URL
              </Text>

              <Input
                placeholder="Enter custom API URL"
                value={displayUrl}
                onChangeText={setPendingCustomUrl}
                editable={isCustomSelected}
                className={isCustomSelected ? '' : 'opacity-60'}
              />

              {validationError && (
                <View className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <Text variant="h4" className="text-red-800">
                    ❌ Health Check Failed
                  </Text>
                  <Text variant="body" className="text-red-700 mt-2">
                    {validationError}
                  </Text>
                </View>
              )}

              <Button variant="default" onPress={handleSave} disabled={isSaveDisabled} className="w-full">
                <Text>{isValidating ? 'Validating API...' : 'Save Changes'}</Text>
              </Button>
            </View>

            {showLogoutWarning && (
              <View className="gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <Text variant="h4" className="text-red-800">
                  ⚠️ Warning: API Server Change
                </Text>
                <Text variant="body" className="text-red-700">
                  Changing the API server will log you out and clear all cached data. Your authentication token is only
                  valid for the current server.{'\n\n'}
                  You`&apos;`ll need to manually restart the app and sign in again after the change.
                </Text>
                <View className="flex-row gap-3">
                  <Button variant="secondary" onPress={handleCancelSave} className="flex-1">
                    <Text>Cancel</Text>
                  </Button>
                  <Button variant="default" onPress={handleConfirmSave} className="flex-1 bg-red-600">
                    <Text className="text-white">Continue</Text>
                  </Button>
                </View>
              </View>
            )}

            <View className="gap-2">
              <Text variant="h4" className="text-secondaryPink">
                Current Configuration
              </Text>
              <View className="p-3 bg-background-cards rounded-lg">
                <Text variant="body" className="text-textSecondary">
                  Source: {currentSource}
                  {'\n'}
                  URL: {currentUrl}
                  {'\n'}
                  Environment: {__DEV__ ? 'Development' : 'Production'}
                  {'\n'}
                  Route Overlay: {isRoutePathOverlayEnabled ? 'Enabled' : 'Disabled'}
                </Text>
              </View>

              {hasPendingChanges() && (
                <View className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Text variant="body" className="text-yellow-800">
                    ⚠️ You have unsaved changes{'\n'}
                    Pending Source: {pendingSource}
                    {'\n'}
                    {isCustomSelected && `Pending URL: ${pendingCustomUrl}{'\n'}`}
                    Changes will be lost if you close without saving.
                  </Text>
                </View>
              )}
            </View>
          </View>

          <Button variant="secondary" onPress={handleDismiss} className="mt-6 mb-14">
            <Text>Close</Text>
          </Button>
        </ScrollView>
      </BottomSheetView>
    </BottomSheetModal>
  )
}
