import { View, ScrollView, Pressable, Linking } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { Text } from '@/components/ui/text'
import { LinkIcon } from '@/components/icons/icons'
import { WHITE_PAPER_URL, AUDIT_BY_CHAINSAVE_URL } from '@/constants/greeting'

interface Slide8Props {
  width: number
  readonly isActive?: boolean
}

/**
 * Slide 8: Manifesto. Background: var(--fill-primary, #E7E7E7).
 */
export function Slide8({ width }: Slide8Props) {
  const bgColor = (useCSSVariable('--color-fill-primary') as string | undefined) ?? '#E7E7E7'

  return (
    <ScrollView
      style={{ width, flex: 1, backgroundColor: bgColor }}
      contentContainerClassName="flex-1 bg-silver-light px-5 pt-24 gap-5"
      showsVerticalScrollIndicator={false}
    >
      <Text variant="body">Manifesto</Text>

      <View className="gap-4">
        <Text variant="h4" className="text-gray-dark">
          We believe staking should be more than passive income.
        </Text>
        <Text variant="body">
          It should be thrilling. Fair. Shared. We&apos;re building a new system where every delegator has a real chance
          to win — in a world where whales dominate rewards.
        </Text>
        <Text variant="body">
          A provably fair, on-chain game where you stake together — and three of you win big. Every time.
        </Text>
        <Text variant="body">
          No middlemen. No false promises. Just transparent smart contracts and real chances. This is staking
          reimagined. This is what happens when DeFi meets community, randomness, and fun.
        </Text>
        <Text variant="body">And it&apos;s just getting started.</Text>
      </View>
      <View className=" flex-row items-center justify-between mt-6 gap-2 -mx-2">
        <Pressable className="flex-row items-center gap-0" onPress={() => Linking.openURL(WHITE_PAPER_URL)}>
          <Text variant="body" className="text-content-tertiary underline">
            Read white paper
          </Text>
          <LinkIcon size={22} className="text-content-tertiary" />
        </Pressable>
        <Pressable className="flex-row items-center gap-0" onPress={() => Linking.openURL(AUDIT_BY_CHAINSAVE_URL)}>
          <Text variant="body" className="text-content-tertiary underline">
            Read audit by ChainSafe
          </Text>
          <LinkIcon size={22} className="text-content-tertiary" />
        </Pressable>
      </View>
    </ScrollView>
  )
}
