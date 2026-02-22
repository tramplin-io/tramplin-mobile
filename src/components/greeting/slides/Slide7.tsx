import { Linking, Pressable, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Text } from '@/components/ui/text'
import { LinkIcon } from '@/components/icons/icons'

interface Slide7Props {
  width: number
  readonly isActive?: boolean
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
      <Text variant="h3">It&apos;s just a savings platform. Only the rewards are extraordinary.</Text>
      <Text variant="body" className="">
        Tramplin introduces a new way to stake SOL, equal chance for everybody to grow yield and get outsized rewards.
        Stake, collect, invite, claim, grow.
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
