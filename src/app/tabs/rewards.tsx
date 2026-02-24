import { useCallback, useState } from 'react'
import { View, ScrollView, Pressable, Linking } from 'react-native'
import { Container } from '@/components/ui/Container'
import { Text } from '@/components/ui/text'
import { RewardCardBig, RewardCardRegular, RewardCardStack } from '@/components/rewards'
import { LinkIcon } from '@/components/icons/icons'
import { getIndexMyWinsQueryKey, useIndexMyWins } from '@/lib/api/generated/restApi'
import type { Win } from '@/lib/api/generated/restApi.schemas'
import { useQueryClient } from '@tanstack/react-query'
import { DashboardHeader } from '@/components/main'

// const SUBSCRIBE_URL = 'https://tramplin.com/notifications'

function RewardsHeader() {
  // const handleSubscribe = useCallback(() => {
  //   void Linking.openURL(SUBSCRIBE_URL)
  // }, [])

  return (
    <View className="flex-row items-center justify-between mb-6">
      <Text variant="h3">Congratulations!</Text>
      <Pressable
        // onPress={handleSubscribe}
        className="flex-row items-center gap-1.5 py-2"
      >
        <Text variant="body" className="text-content-tertiary">
          Subscribe
        </Text>
        <LinkIcon size={18} className="text-content-tertiary" />
      </Pressable>
    </View>
  )
}

export default function RewardsTab() {
  const queryClient = useQueryClient()
  const [isRegularStackExpanded, setIsRegularStackExpanded] = useState(false)
  const { data: wins = [], isLoading } = useIndexMyWins({ isClaimed: 'false' })

  // const wins = [
  //   {
  //     walletAddress: '3VB9HxpR7LTsdRoQHpc3gqedRiG6P99iRoV1cN9WSWga',
  //     stakeId: 38,
  //     winnerId: '38',
  //     stake: 1,
  //     prizeLamports: '3451547',
  //     epochOrSlot: '395952000',
  //     drawType: 'regular',
  //     merkleProofs: [
  //       'AxHSotRMCu9pJZgBydM9wLXPmj848CPQairW2kD5V5q5',
  //       'CgwWw8QABBDyvBtQpodybpHea3fhWynzm9mymhVeCG4j',
  //       'Bs6GQQRaKWvRSH22HB9Hgw2VrbHiaUVzP377ekhAynSP',
  //       '5kiRQUTMDRZvPnUM2xFHGWvewUAsJSsNyYgKW5Gf7mwZ',
  //       'BjM2C2vsGTKDWsQP7ECYvFvkZoFd1wXNRxepAPxGSBKu',
  //       '8ckS7ddGHqAKUNnQ23ci5E88djsv7WmmybxkGo8qfuRE',
  //       '8h1QxheoBDNQ125GSSroczDdpFPkTnnQhXiDrFeWjCAT',
  //     ],
  //     revealedAtSlot: '395952144',
  //     revealedAt: '2026-01-26T01:31:23.000Z',
  //     claimPda: 'BNL8jWQWhMnxbSxiLX5WSDDChB5rvLmbC1KXDoc84Tsn',
  //     isClaimed: false,
  //     claimedAt: null,
  //     prizeUSDInCents: 28,
  //     prizeSol: 0.003452,
  //     id: '69950069737d13642683a070',
  //     createdAt: '2026-02-17T23:57:29.694Z',
  //     updatedAt: '2026-02-17T23:57:29.694Z',
  //   },
  //   {
  //     walletAddress: '3VB9HxpR7LTsdRoQHpc3gqedRiG6P99iRoV1cN9WSWga',
  //     stakeId: 38,
  //     winnerId: '38',
  //     stake: 1,
  //     prizeLamports: '3451547',
  //     epochOrSlot: '395952000',
  //     drawType: 'regular',
  //     merkleProofs: [
  //       'AxHSotRMCu9pJZgBydM9wLXPmj848CPQairW2kD5V5q5',
  //       'CgwWw8QABBDyvBtQpodybpHea3fhWynzm9mymhVeCG4j',
  //       'Bs6GQQRaKWvRSH22HB9Hgw2VrbHiaUVzP377ekhAynSP',
  //       '5kiRQUTMDRZvPnUM2xFHGWvewUAsJSsNyYgKW5Gf7mwZ',
  //       'BjM2C2vsGTKDWsQP7ECYvFvkZoFd1wXNRxepAPxGSBKu',
  //       '8ckS7ddGHqAKUNnQ23ci5E88djsv7WmmybxkGo8qfuRE',
  //       '8h1QxheoBDNQ125GSSroczDdpFPkTnnQhXiDrFeWjCAT',
  //     ],
  //     revealedAtSlot: '395952144',
  //     revealedAt: '2026-01-26T01:31:23.000Z',
  //     claimPda: 'BNL8jWQWhMnxbSxiLX5WSDDChB5rvLmbC1KXDoc84Tsn',
  //     isClaimed: false,
  //     claimedAt: null,
  //     prizeUSDInCents: 28,
  //     prizeSol: 0.003452,
  //     id: '69950069737d13642683a070',
  //     createdAt: '2026-02-17T23:57:29.694Z',
  //     updatedAt: '2026-02-17T23:57:29.694Z',
  //   },
  //   {
  //     walletAddress: '3VB9HxpR7LTsdRoQHpc3gqedRiG6P99iRoV1cN9WSWga',
  //     stakeId: 38,
  //     winnerId: '38',
  //     stake: 1,
  //     prizeLamports: '3451547',
  //     epochOrSlot: '395952000',
  //     drawType: 'regular',
  //     merkleProofs: [
  //       'AxHSotRMCu9pJZgBydM9wLXPmj848CPQairW2kD5V5q5',
  //       'CgwWw8QABBDyvBtQpodybpHea3fhWynzm9mymhVeCG4j',
  //       'Bs6GQQRaKWvRSH22HB9Hgw2VrbHiaUVzP377ekhAynSP',
  //       '5kiRQUTMDRZvPnUM2xFHGWvewUAsJSsNyYgKW5Gf7mwZ',
  //       'BjM2C2vsGTKDWsQP7ECYvFvkZoFd1wXNRxepAPxGSBKu',
  //       '8ckS7ddGHqAKUNnQ23ci5E88djsv7WmmybxkGo8qfuRE',
  //       '8h1QxheoBDNQ125GSSroczDdpFPkTnnQhXiDrFeWjCAT',
  //     ],
  //     revealedAtSlot: '395952144',
  //     revealedAt: '2026-01-26T01:31:23.000Z',
  //     claimPda: 'BNL8jWQWhMnxbSxiLX5WSDDChB5rvLmbC1KXDoc84Tsn',
  //     isClaimed: false,
  //     claimedAt: null,
  //     prizeUSDInCents: 28,
  //     prizeSol: 0.003452,
  //     id: '69950069737d13642683a070',
  //     createdAt: '2026-02-17T23:57:29.694Z',
  //     updatedAt: '2026-02-17T23:57:29.694Z',
  //   },
  //   {
  //     walletAddress: '3VB9HxpR7LTsdRoQHpc3gqedRiG6P99iRoV1cN9WSWga',
  //     stakeId: 1597717122,
  //     winnerId: '2597501887',
  //     stake: 1358009840,
  //     prizeLamports: '468852320',
  //     epochOrSlot: '886',
  //     drawType: 'big',
  //     merkleProofs: [
  //       '696qtEBSHZUTsietX9nb6q7TpC5RfNRagSRByGWopHji',
  //       'EtF7jSE8P5REyKVVyvsHhQCHe8SbLFiX8D6VdAfxa4pv',
  //       '33VrpYHjvbgwhfhtHJBNcsCqyDqDRfE2Pkdn9WRHU4NT',
  //       'gwYJYHYiEKyLsNU6HnjtG7dJBSFg3hVY8EUPMswbF8S',
  //     ],
  //     revealedAtSlot: '382838400',
  //     revealedAt: '2025-11-27T09:41:50.000Z',
  //     claimPda: 'J1QHh41Tx3evZiBiM4FSr4bB3dkNFAePB5GtFRarMcDM',
  //     isClaimed: false,
  //     claimedAt: null,
  //     prizeUSDInCents: 3755,
  //     prizeSol: 0.468852,
  //     id: '69950935737d13642683ba6a',
  //     createdAt: '2026-02-18T00:35:01.946Z',
  //     updatedAt: '2026-02-18T00:35:01.946Z',
  //   },
  // ]

  const handleClaim = useCallback(
    async (_win: Win) => {
      // TODO: replace with real claim API; on throw, cards show red error state
      await new Promise((resolve) => setTimeout(resolve, 600))
      queryClient.invalidateQueries({ queryKey: getIndexMyWinsQueryKey({ isClaimed: 'false' }) })
    },
    [queryClient],
  )

  const bigWins = wins.filter((w) => w.drawType === 'big')
  const regularWins = wins.filter((w) => w.drawType === 'regular')
  const showAsStack = regularWins.length > 1

  return (
    <Container safe={false}>
      <ScrollView
        contentContainerClassName="px-6 pb-40 py-8 bg-fill-secondary flex-grow"
        showsVerticalScrollIndicator={false}
      >
        {/* <RewardsHeader /> */}

        <DashboardHeader title="Congratulations!" className="mb-6" />

        {isLoading && <Text className="text-content-secondary py-4">Loading rewards…</Text>}

        {!isLoading && wins.length === 0 && <Text className="text-content-secondary py-4">No unclaimed rewards.</Text>}

        {!isLoading && bigWins.length > 0 && (
          <View className="gap-4 mb-4">
            {bigWins.map((win) => (
              <RewardCardBig key={win.id ?? `${win.winnerId}-${win.epochOrSlot}`} win={win} onClaim={handleClaim} />
            ))}
          </View>
        )}

        {!isLoading && regularWins.length > 0 && (
          <View className="gap-3">
            {showAsStack && !isRegularStackExpanded ? (
              <RewardCardStack wins={regularWins} onPress={() => setIsRegularStackExpanded(true)} />
            ) : (
              <>
                {showAsStack && (
                  <Pressable onPress={() => setIsRegularStackExpanded(false)} className="self-start py-2">
                    <Text className="text-content-tertiary text-small">Collapse</Text>
                  </Pressable>
                )}
                {regularWins.map((win) => (
                  <RewardCardRegular
                    key={win.id ?? `${win.winnerId}-${win.epochOrSlot}`}
                    win={win}
                    onClaim={handleClaim}
                  />
                ))}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </Container>
  )
}
