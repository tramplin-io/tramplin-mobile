import { useCallback, useReducer, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'

import { useIndexMyPromos } from '@/lib/api/generated/restApi'
import { cn } from '@/lib/utils'

import { StakeModal } from '../../stake'
import { PromoCardActive } from './PromoCardActive'
import { PromoCardCompleted } from './PromoCardCompleted'
import { PromoCardUpcoming } from './PromoCardUpcoming'

export interface PromoCardProps {
  className?: string
}

export function PromoCard({ className }: Readonly<PromoCardProps>) {
  const { data, isLoading } = useIndexMyPromos()
  const promo = data?.[0]

  // console.log('promo', promo)

  // When the countdown expires, re-evaluate the startsAt condition to transition from teaser to active card
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0)
  const [stakeModalOpen, setStakeModalOpen] = useState(false)
  const handleOpenStake = useCallback(() => setStakeModalOpen(true), [])

  // const promo = {
  //   showStartsAt: '2026-04-25T20:41:00.000Z',
  //   showEndsAt: '2026-05-10T20:41:00.000Z',
  //   startsAt: '2026-04-31T20:41:00.000Z',
  //   endsAt: '2026-05-06T20:41:00.000Z',
  //   title: 'Tramplin x Seeker Promo',
  //   type: 'Promo',
  //   howItWorks:
  //     'Join our draw by simply holding **10 SOL** in your wallet.\n\n- Total prize pool: **$50,000**\n- How it works: We’re aiming for **10,000** participants, each with at least **10 SOL**\n- Who can join: Any wallet holding **10 SOL** or more is automatically entered\n- Timeline: The campaign runs for 3 months initially — if the target isn’t reached, we’ll reassess and continue until we hit 10,000 users\n\nOnce the pool reaches **$50,000,** we’ll run the draw and pick the winners.\n---\nJoin our draw by simply holding **10 SOL** in your wallet.\n\n- Total prize pool: **$50,000**\n- How it works: We’re aiming for **10,000** participants, each with at least **10 SOL**\n- Who can join: Any wallet holding **10 SOL** or more is automatically entered\n- Timeline: The campaign runs for 3 months initially — if the target isn’t reached, we’ll reassess and continue until we hit 10,000 users\n\nOnce the pool reaches **$50,000,** we’ll run the draw and pick the winners.\n---\nJoin our draw by simply holding **10 SOL** in your wallet.\n\n- Total prize pool: **$50,000**\n- How it works: We’re aiming for **10,000** participants, each with at least **10 SOL**\n- Who can join: Any wallet holding **10 SOL** or more is automatically entered\n- Timeline: The campaign runs for 3 months initially — if the target isn’t reached, we’ll reassess and continue until we hit 10,000 users\n\nOnce the pool reaches **$50,000,** we’ll run the draw and pick the winners.',
  //   prize: '$50K',
  //   winnersAmount: '1',
  //   targetAmount: 10000,
  //   targetType: 'stakers',
  //   minStakeAmountInLamports: 10000000000,
  //   winnerWalletAddresses: [],
  //   currentAmount: 999,
  //   isTargetReached: false,
  //   participatedStakedAmountSol: 0,
  //   id: '69f11baafbdb8a571a48657a',
  //   createdAt: '2026-04-28T20:42:18.456Z',
  //   updatedAt: '2026-04-30T09:27:52.345Z',
  // } as Promo

  // winnerWalletAddresses: [
  //   'AxHSotRMCu9pJZgBydM9wLXPmj848CPQairW2kD5V5q5',
  //   'CgwWw8QABBDyvBtQpodybpHea3fhWynzm9mymhVeCG4j',
  //   'Bs6GQQRaKWvRSH22HB9Hgw2VrbHiaUVzP377ekhAynSP',
  // ],
  // currentAmount: 1000,
  // isTargetReached: true,

  if (isLoading) {
    return (
      <View className={cn('rounded-lg overflow-hidden', className)}>
        <View className="bg-brand-primary h-12 items-center justify-center">
          <ActivityIndicator color="white" />
        </View>
        <View className="bg-fill-tertiary h-48" />
      </View>
    )
  }

  if (!promo) return null

  if (promo.startsAt && new Date() < new Date(promo.startsAt)) {
    return (
      <>
        <PromoCardUpcoming promo={promo} className={className} onStakePress={handleOpenStake} onStarted={forceUpdate} />
        <StakeModal open={stakeModalOpen} onOpenChange={setStakeModalOpen} />
      </>
    )
  }

  if (promo.isTargetReached) {
    return <PromoCardCompleted promo={promo} className={className} />
  }

  return (
    <>
      <PromoCardActive promo={promo} className={className} onStakePress={handleOpenStake} />
      <StakeModal open={stakeModalOpen} onOpenChange={setStakeModalOpen} />
    </>
  )
}
