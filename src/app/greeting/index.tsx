import { useCallback, useRef, useState } from 'react'
import { View, FlatList, useWindowDimensions } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { useCSSVariable } from 'uniwind'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { Slide1, Slide2, Slide3, Slide4, Slide5, Slide6, Slide7, Slide8 } from '@/components/greeting/slides'
import { HeaderGrating } from '@/components/general'
import Toast from 'react-native-toast-message'

const SLIDE_COMPONENTS = [
  { key: 'splash', Slide: Slide1 },
  // { key: 'explainer', Slide: Slide2 },
  { key: 'how-it-works', Slide: Slide3 },
  { key: 'tramplin-points', Slide: Slide4 },
  { key: 'redistribution', Slide: Slide5 },
  { key: 'unstake', Slide: Slide6 },
  { key: 'manifesto-teaser', Slide: Slide7 },
  // { key: 'manifesto', Slide: Slide8 },
] as const

/**
 * Greeting / Onboarding Stepper Screen.
 * Horizontal swipe through 8 slides (pages from slides/).
 * "Launch App" → connect wallet; AuthGuard then redirects to tabs.
 */
export default function GreetingScreen() {
  const { connect } = useMobileWallet()
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const flatListRef = useRef<FlatList>(null)

  const fillTop = useCSSVariable('--color-getting-gradient-secondary') as string | undefined
  const fillPrimary = useCSSVariable('--color-getting-gradient-primary') as string | undefined

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: { index: number | null }[] }) => {
    const index = viewableItems[0]?.index
    if (index != null) setCurrentIndex(index)
  }, [])

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current

  const handleLaunchApp = useCallback(async () => {
    setError(null)
    setConnecting(true)
    try {
      await connect()
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: err instanceof Error ? err.message : 'Failed to connect wallet',
      })
      // setError(err instanceof Error ? err.message : 'Failed to connect wallet')
    } finally {
      setConnecting(false)
    }
  }, [connect])

  const renderSlide = useCallback(
    ({ item, index }: { item: (typeof SLIDE_COMPONENTS)[number]; index: number }) => {
      const { Slide } = item
      return <Slide width={width} isActive={index === currentIndex} />
    },
    [width, currentIndex],
  )

  return (
    <Container safe className="flex-1 h-full bg-black" style={{ flex: 1, bottom: 0 }}>
      <FlatList
        ref={flatListRef}
        data={SLIDE_COMPONENTS}
        renderItem={renderSlide}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        style={{
          position: 'absolute',
          top: insets.top,
          bottom: 0,
          left: 0,
          right: 0,
        }}
      />
      <HeaderGrating showLogo={currentIndex !== 0} />

      <LinearGradient
        colors={[fillTop as string, fillPrimary as string]}
        locations={[0, 1]}
        className="w-full h-10"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 150 + 12 + insets.bottom,
        }}
      />
      <View
        className="items-center justify-center px-6 gap-5"
        style={{
          position: 'absolute',
          bottom: 12 + insets.bottom,
          left: 0,
          right: 0,
        }}
      >
        {error !== null && (
          <Text variant="body" className="text-critical-primary text-center mb-3">
            {error}
          </Text>
        )}
        <View className="flex-row gap-1.5">
          {SLIDE_COMPONENTS.map((slide, index) => (
            <View
              key={slide.key}
              className={`h-2 w-2 rounded-full ${index === currentIndex ? 'bg-brand-quaternary' : 'bg-brand-secondary'}`}
            />
          ))}
        </View>
        <Button
          variant="default"
          size="xl"
          onPress={handleLaunchApp}
          disabled={connecting}
          className="w-full border-brand-primary"
        >
          <Text>{connecting ? 'Connecting…' : 'Launch App'}</Text>
        </Button>
      </View>
    </Container>
  )
}
