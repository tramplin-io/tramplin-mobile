import { useState } from 'react'
import { Linking, Pressable, RefreshControl, ScrollView, View } from 'react-native'
import { router } from 'expo-router'

import { ScreenWrapper } from '@/components/general'
import { MinusIcon, PlusIcon } from '@/components/icons'
import { LinkIcon } from '@/components/icons/icons'
import { DashboardHeader } from '@/components/main'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Text } from '@/components/ui/text'
import { FAQ_CONFIG } from '@/constants/faq'
import { cn } from '@/lib/utils'

type QAItem = { q: string; a: React.ReactNode }
type Section = { title: string; items: QAItem[] }

function Link({ href, children }: Readonly<{ href: string; children: string }>) {
  return (
    <Text variant="body" className="text-brand-primary underline" onPress={() => void Linking.openURL(href)}>
      {children}
    </Text>
  )
}

function ExternalLink({
  href,
  children,
  className,
}: Readonly<{
  href: string
  children: string
  className?: string
}>) {
  return (
    <Pressable
      onPress={() => void Linking.openURL(href)}
      className={cn('self-start border-b border-border-quaternary pb-1', className)}
    >
      <View className="flex-row items-center">
        <Text variant="body">{children}</Text>
        <LinkIcon size={22} />
      </View>
    </Pressable>
  )
}

const sections: Section[] = [
  {
    title: 'Safety & Risk',
    items: [
      {
        q: 'Are my funds at risk in any way?',
        a: (
          <View className="gap-4">
            <Text variant="body">
              Staking with Tramplin is safe by design, proven by independent{' '}
              <Link href={FAQ_CONFIG.AUDIT_LINK}>audit by MixBytes</Link>.
            </Text>
            <Text variant="body">
              When you stake your SOL with Tramplin, you delegate it to our validator. Your SOL remains in native Solana
              staking – it is not wrapped, locked in a smart contract, or exposed to external protocols.
            </Text>
            <Text variant="body">Your tokens remain in your wallet and can be unstaked at any time.</Text>
            <Text variant="body">
              However, as any crypto asset,{' '}
              <Text variant="body" className="font-bold">
                SOL itself is subject to market volatility
              </Text>
              , which may affect the value of your holdings in fiat terms.
            </Text>
          </View>
        ),
      },
    ],
  },
  {
    title: 'Rewards & Mechanics',
    items: [
      {
        q: 'How is the reward pool funded?',
        a: (
          <View className="gap-4">
            <Text variant="body">
              The reward pool comes from native staking yield on Solana. Tramplin does not change how native staking
              works, only how rewards are distributed once they are earned.
            </Text>
            <Text variant="body">
              Solana is a Proof-of-Stake network that relies on independent validator nodes to work correctly, which
              makes native staking essential to Solana{"'"}s decentralization and long-term security.
            </Text>
            <Text variant="body">
              Delegators stake their SOL to a validator and secure the network, and Solana rewards them with more SOL.
              These rewards are inflationary, meaning that Solana issues new SOL and distributes it to the network
              participants.
            </Text>
            <Text variant="body">
              Instead of standard distribution proportional to stake size, Tramplin collects the rewards redistributes
              them in a randomized and verifiable way.
            </Text>
          </View>
        ),
      },
      {
        q: 'How are reward recipients selected, and what guarantees fairness?',
        a: (
          <View className="gap-4">
            <Text variant="body">
              Every Solana epoch (2-3 days), a snapshot of all currently active stakers is taken to determine the list
              of participants.
            </Text>
            <Text variant="body">
              Tramplin then uses a Commit–Reveal scheme combined with ORAO VRF to generate random outcomes.
            </Text>
            <Text variant="body">
              No party (including Tramplin) can influence or predict the outcome, because doing so would require
              breaking both VRF proofs and the commit hash, which is cryptographically impossible.
            </Text>
          </View>
        ),
      },
      {
        q: 'How many rewards are distributed each round?',
        a: (
          <Text variant="body">
            The rewards amount is different each round and depends on the total delegated stake. The next redistribution
            pool is available in the app dashboard.
          </Text>
        ),
      },
      {
        q: 'How many reward recipients are chosen each round?',
        a: (
          <View className="gap-2">
            <Text variant="body">Tramplin runs two cycles of rewards redistribution:</Text>
            <Text variant="body" className=" ml-4">
              • 1 user receives a small reward every 10 minutes. Approximately 144 users per day or 4320 per month.
            </Text>
            <Text variant="body" className=" ml-4">
              • 1 user receives a large reward every 12 epochs (~30 days)
            </Text>
          </View>
        ),
      },
      {
        q: 'What do I need to do to qualify for rewards?',
        a: (
          <Text variant="body">
            To participate in a small redistribution that happens every 10 minutes, you need to stake 1 SOL for at least
            1 epoch (~2,5 days) to be eligible. To participate in a big redistribution that happens every month, you
            need to stake 1 SOL for at least 12 consecutive epochs (~30 days) to be eligible.
          </Text>
        ),
      },
      {
        q: 'Do I need to opt in for every distribution?',
        a: (
          <Text variant="body">
            No. Once you{"'"}ve staked and reached the minimal required stake time (1 and 12 epochs for small and big
            redistribution respectively), you{"'"}re automatically included in all future redistributions as long as
            your stake remains active.
          </Text>
        ),
      },
      {
        q: 'What are my chances of getting a reward?',
        a: (
          <View className="gap-4">
            <Text variant="body">
              One staked SOL gives you one share in the pool. The more SOL you stake, the more pool shares you take up.
              Since every draw is random and verifiable, even a 1 SOL stake always has a real shot at meaningful
              rewards.
            </Text>
            <Text variant="body">
              Your overall chances are proportional to your stake size and your stake multiplier relative to the total
              redistribution pool.
            </Text>
          </View>
        ),
      },
      {
        q: 'How will I know if I got the reward?',
        a: (
          <View className="gap-4">
            <Text variant="body">
              If you{"'"}re in the app during the redistribution, you{"'"}ll see the selection happening in real time.
              If your address is chosen, the {"'"}Claim{"'"} button will appear in your dashboard.
            </Text>
            <Text variant="body">
              If you weren{"'"}t online at that moment, you will see the Claim tab once you log back in.
            </Text>
          </View>
        ),
      },
      {
        q: 'If I am selected, what do I need to do to claim the reward?',
        a: (
          <View className="gap-2">
            <Text variant="body">
              1. Open {"'"}Claim{"'"} tab
            </Text>
            <Text variant="body">
              2. Click {"'"}Claim reward{"'"}
            </Text>
            <Text variant="body">3. Sign the transaction in your connected wallet and pay the gas fee</Text>
          </View>
        ),
      },
      {
        q: 'Can I view previous reward recipients?',
        a: (
          <Text variant="body">
            Yes. All past distributions are publicly visible onchain and on our app for full transparency and
            verifiability.
          </Text>
        ),
      },
      {
        q: 'Can I withdraw anytime, and is there a fee?',
        a: (
          <Text variant="body">
            You can unstake anytime. As with any other validator, Solana{"'"}s standard{' '}
            <Text variant="body" className="font-bold">
              cooldown period
            </Text>{' '}
            (about 2,5 days) applies before your funds become fully liquid. Tramplin doesn{"'"}t charge any withdrawal
            fees — what you stake is what you get back.
          </Text>
        ),
      },
      {
        q: 'What are premium bonds?',
        a: (
          <Text variant="body">
            Premium bonds are an old-school financial instrument with 70+ year history that replaces fixed interest with
            monthly chance to get outsized cash redistributions. With 22M holders and £120B+ invested, it is among the
            most widely held retail savings products in the UK and beyond.
          </Text>
        ),
      },
    ],
  },
  {
    title: 'If you are new to Solana',
    items: [
      {
        q: 'Where can I get SOL?',
        a: (
          <View className="gap-4">
            <Text variant="body">
              You can get SOL on any major crypto exchange such as Coinbase, Binance, Kraken, or OKX. Simply create an
              account, buy SOL with your local currency or crypto, and then withdraw it to your Solana wallet (Phantom,
              Backpack, Solflare, or any wallet you use with Tramplin).
            </Text>
            <Text variant="body">
              You can also buy SOL directly inside most Solana wallets using built-in on-ramps like MoonPay or Ramp.
              Once you have at least 1 SOL is in your wallet, you{"'"}re ready to stake with Tramplin.
            </Text>
          </View>
        ),
      },
    ],
  },
]

function QAItemComponent({
  item,
  isOpen,
  onToggle,
}: Readonly<{ item: QAItem; isOpen: boolean; onToggle: () => void }>) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex w-full flex-row items-center justify-between gap-5 border-b border-content-tertiary py-2.5">
        <Text variant="body" className="flex-1 text-left">
          {item.q}
        </Text>
        {isOpen ? <MinusIcon size={20} className="shrink-0" /> : <PlusIcon size={20} className="shrink-0" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="mb-10 mt-[13px]">{item.a}</CollapsibleContent>
    </Collapsible>
  )
}

export default function FAQTab() {
  const [openItem, setOpenItem] = useState<string | null>(null)

  return (
    <ScreenWrapper>
      <ScrollView contentContainerClassName="px-4 pb-40 py-8 flex-grow" showsVerticalScrollIndicator={false}>
        <DashboardHeader title="Questions & Answers" className="mb-6" />

        <View className="mb-8">
          {sections.map((section) => (
            <View key={section.title} className="mb-6">
              <Text variant="small" className="uppercase tracking-wide mb-2.5">
                {section.title}
              </Text>
              {section.items.map((item) => {
                const key = `${section.title}-${item.q}`
                return (
                  <QAItemComponent
                    key={key}
                    item={item}
                    isOpen={openItem === key}
                    onToggle={() => setOpenItem(openItem === key ? null : key)}
                  />
                )
              })}
            </View>
          ))}
        </View>

        <View className="gap-2">
          <Text variant="small" className="uppercase tracking-wide">
            Learn More
          </Text>
          <ExternalLink href={FAQ_CONFIG.SOCIAL_BLOG_LINK}>Blog</ExternalLink>
          <ExternalLink href={FAQ_CONFIG.PARTNERS_LINK}>Partnership</ExternalLink>
          <ExternalLink href={FAQ_CONFIG.VALIDATOR_LINK}>Validator</ExternalLink>
          <ExternalLink href={FAQ_CONFIG.AUDIT_LINK}>Audit</ExternalLink>
        </View>
      </ScrollView>
    </ScreenWrapper>
  )
}
