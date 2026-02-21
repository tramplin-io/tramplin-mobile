import { Linking, Pressable, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Text } from '@/components/ui/text'
import { LinkIcon } from '@/components/icons/icons'

interface Slide7Props {
  width: number
}

const GRADIENT_COLORS = ['#DFC56F', '#E7C347'] as const // TODO: Replace with CSS variables

/**
 * Slide 7: Manifesto teaser. Background: linear-gradient(180deg, #DFC56F 0%, #E7C347 100%).
 */
export function Slide7({ width }: Slide7Props) {
  return (
    <LinearGradient
      colors={[...GRADIENT_COLORS]}
      locations={[0, 1]}
      style={{ width, flex: 1 }}
      className="px-5 pt-24 py-8 gap-5"
    >
      <Text variant="h3">You don&apos;t have to risk everything for a chance of extraordinary rewards.</Text>
      <Text variant="body" className="">
        Tramplin offers a new path: transparent, low-risk, with a potential for whale-sized outcomes. Built with a
        vision for the future of internet capital markets — where opportunity is defined by access, not by the size of
        capital.
      </Text>
      {/* <Pressable className="flex-row items-center gap-1" onPress={() => Linking.openURL(MANIFESTO_URL)}>
        <Text variant="body" className="  underline">
          Read Manifesto
        </Text>
        <LinkIcon size={22} />
      </Pressable> */}
      {/* <Text className="text-content-primary text-body mt-4 underline">Read Manifesto</Text> */}
    </LinearGradient>
  )
}
