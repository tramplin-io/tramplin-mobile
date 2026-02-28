import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { View, ScrollView, Pressable, Linking, RefreshControl } from 'react-native'
import { router } from 'expo-router'
import { Pagination } from '@/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useListPublicWinLeaders, useListPublicStakeLeaders } from '@/lib/api/generated/restApi'
import type { Win, DrawType } from '@/lib/api/generated/restApi.schemas'
import { ellipsify } from '@/utils/format'
import { getSolscanAccountUrl } from '@/utils/wallet'
import { ExpandIcon, LeaveIcon, SolanaIcon } from '@/components/icons/icons'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import { useCSSVariable } from 'uniwind'
import { DashboardHeader } from '@/components/main'
import { ScreenWrapper } from '@/components/general'

const CLUSTER = (process.env.EXPO_PUBLIC_SOLANA_NETWORK as 'devnet' | 'mainnet-beta' | 'testnet') ?? 'devnet'

const PAGE_SIZE = 5

type TabId = 'winners' | 'stakers'

const drawTypeTextClass = (drawType?: DrawType) =>
  drawType === 'big' ? 'text-reward-large-secondary' : 'text-content-primary'

function TokenRewardIcon({ drawType }: Readonly<{ drawType?: DrawType }>) {
  const rewardLargeColor = useCSSVariable('--color-reward-large-secondary') as string | undefined
  const contentPrimaryColor = useCSSVariable('--color-content-primary') as string | undefined
  const iconColor = drawType === 'big' ? rewardLargeColor : contentPrimaryColor
  return (
    <View
      className={cn(
        'bg-gradient-to-b from-reward-small-primary to-fill-fade/0 rounded-[31px] outline outline-[0.50px] outline-content-primary inline-flex justify-start items-center gap-2.5 mx-1',
        'size-4',
        drawType === 'big' && 'from-fill-fade/0 to-reward-large-primary outline-reward-large-secondary',
      )}
    >
      <SolanaIcon
        size={16}
        className={drawTypeTextClass(drawType)}
        {...(iconColor && { style: { color: iconColor } as React.ComponentProps<typeof SolanaIcon>['style'] })}
      />
    </View>
  )
}

function TokenStakeIcon({ drawType }: Readonly<{ drawType?: DrawType }>) {
  const rewardLargeColor = useCSSVariable('--color-reward-large-secondary') as string | undefined
  const contentPrimaryColor = useCSSVariable('--color-content-primary') as string | undefined
  const iconColor = drawType === 'big' ? rewardLargeColor : contentPrimaryColor
  return (
    <View
      className={cn(
        'rounded-[31px] outline outline-[0.50px] outline-content-primary inline-flex justify-start items-center gap-2.5 mx-1',
        drawType === 'big' && 'outline-reward-large-secondary',
      )}
    >
      <SolanaIcon
        size={16}
        className={drawTypeTextClass(drawType)}
        {...(iconColor && { style: { color: iconColor } as React.ComponentProps<typeof SolanaIcon>['style'] })}
      />
    </View>
  )
}

function ExpandIconComponent({ drawType }: Readonly<{ drawType?: DrawType }>) {
  const rewardLargeColor = useCSSVariable('--color-reward-large-secondary') as string | undefined
  const contentPrimaryColor = useCSSVariable('--color-content-primary') as string | undefined
  const iconColor = drawType === 'big' ? rewardLargeColor : contentPrimaryColor
  return (
    <ExpandIcon
      size={20}
      className={drawTypeTextClass(drawType)}
      {...(iconColor && { style: { color: iconColor } as React.ComponentProps<typeof SolanaIcon>['style'] })}
    />
  )
}

function LeaderboardRow({
  walletAddress,
  reward,
  stake,
  showReward,
  drawType,
  epochOrSlot,
  isStakers,
}: Readonly<{
  walletAddress: string
  reward?: string
  stake: number
  showReward: boolean
  drawType?: DrawType
  epochOrSlot?: string
  isStakers?: boolean
}>) {
  const handleOpenDetail = useCallback(() => {
    router.push({
      pathname: '/screens/leaderboard-detail',
      params: {
        walletAddress,
        epochOrSlot: epochOrSlot ?? '',
        drawType: drawType ?? '',
        isWinner: showReward ? 'true' : 'false',
      },
    })
  }, [walletAddress, epochOrSlot, drawType, showReward])

  const handleOpenSolscan = useCallback(() => {
    void Linking.openURL(getSolscanAccountUrl(walletAddress, CLUSTER))
  }, [walletAddress])

  const rewardStakeTextClass = drawTypeTextClass(drawType)

  return (
    <View className="flex-row items-center border-b border-border-quaternary py-4">
      <View className="flex-1">
        <Text variant="body" className={cn(`${rewardStakeTextClass} font-medium`)} numberOfLines={1}>
          {ellipsify(walletAddress, 4)}
        </Text>
      </View>
      {showReward && (
        <View className="flex-row items-center gap-1 min-w-[56px] justify-end">
          <Text variant="body" className={`${rewardStakeTextClass}`}>
            {reward ?? '—'}
          </Text>
          <TokenRewardIcon drawType={drawType} />
        </View>
      )}
      <View className="flex-row items-center gap-1 min-w-[56px] justify-end">
        <Text variant="body" className={`${rewardStakeTextClass}`}>
          {stake}
        </Text>
        <TokenStakeIcon drawType={drawType} />
      </View>
      <Pressable
        onPress={isStakers ? handleOpenSolscan : handleOpenDetail}
        className="ml-0 p-2 -m-2"
        hitSlop={8}
        accessibilityLabel={isStakers ? 'Open in Solscan' : 'View details'}
      >
        {isStakers ? (
          <LeaveIcon size={20} className="text-content-primary" />
        ) : (
          <ExpandIconComponent drawType={drawType} />
        )}
      </Pressable>
    </View>
  )
}

function LeaderboardTable({
  isWinners,
  list,
  isLoading,
  page,
  setPage,
}: Readonly<{
  isWinners: boolean
  list: Win[] | { walletAddress: string; stake: number; points?: number }[]
  isLoading: boolean
  page: number
  setPage: Dispatch<SetStateAction<number>>
}>) {
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages - 1)
  const pageItems = useMemo(
    () => list.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE),
    [list, currentPage],
  )
  return (
    <>
      {isWinners ? (
        <View className="flex-row items-center pb-4 mb-0">
          <Text variant="small" className="flex-1 uppercase tracking-wide">
            Wallet
          </Text>
          <Text variant="small" className="uppercase tracking-wide min-w-[56px] text-right mr-6">
            Reward
          </Text>
          <Text variant="small" className="uppercase tracking-wide min-w-[56px] text-right">
            Stake
          </Text>
          <View className="w-8" />
        </View>
      ) : (
        <View className="flex-row items-center pb-4 mb-0">
          <Text variant="small" className="flex-1  uppercase tracking-wide">
            Wallet
          </Text>
          <Text variant="small" className=" uppercase tracking-wide min-w-[56px] text-right">
            Stake
          </Text>
          <View className="w-8" />
        </View>
      )}

      {isLoading && <Text className="text-content-secondary py-8">Loading…</Text>}
      {!isLoading && pageItems.length === 0 && <Text className="text-content-secondary py-8">No entries yet.</Text>}
      {!isLoading &&
        pageItems.length > 0 &&
        pageItems.map((item) => {
          if (isWinners) {
            const win = item as Win
            const rewardSol = win.prizeSol ? String(win.prizeSol) : '—'
            return (
              <LeaderboardRow
                key={win.id ?? `${win.walletAddress}-${win.winnerId}`}
                walletAddress={win.walletAddress}
                reward={rewardSol}
                stake={win.stake}
                showReward
                drawType={win.drawType}
                epochOrSlot={win.epochOrSlot}
              />
            )
          }
          const staker = item as { walletAddress: string; stake: number; points?: number }
          return (
            <LeaderboardRow
              key={staker.walletAddress}
              walletAddress={staker.walletAddress}
              stake={staker.stake}
              showReward={false}
              isStakers
            />
          )
        })}

      {list.length > PAGE_SIZE && (
        <Pagination className="mt-6" currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
      )}
    </>
  )
}

export default function LeaderboardTab() {
  const [tab, setTab] = useState<TabId>('winners')
  const [winnersPage, setWinnersPage] = useState(0)
  const [stakersPage, setStakersPage] = useState(0)

  const colorBrandPrimary = useCSSVariable('--color-brand-primary') as string
  
  const { data: winsData, isLoading: isLoadingWins, refetch: refetchWins } = useListPublicWinLeaders()
  const { data: stakersData, isLoading: isLoadingStakers, refetch: refetchStakers } = useListPublicStakeLeaders()

  const winsList = useMemo(() => (Array.isArray(winsData) ? winsData : []), [winsData])
  const stakersList = useMemo(() => {
    if (!stakersData) return []
    return Array.isArray(stakersData) ? stakersData : [stakersData]
  }, [stakersData])


  const handleTabChange = useCallback((value: string) => {
    setTab(value as TabId)
  }, [])

  const [refreshing, setRefreshing] = useState(false)
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([refetchWins(), refetchStakers()])
    setRefreshing(false)
  }, [refetchWins, refetchStakers])

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerClassName="px-6 pb-30 py-8 bg-fill-secondary flex-grow"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl 
          refreshing={refreshing} 
          onRefresh={handleRefresh} 
          progressViewOffset={40}
          colors={[colorBrandPrimary]}
          />}
      >
        <DashboardHeader title="Community Stats" className="mb-6" />

        <Tabs value={tab} onValueChange={handleTabChange} className="mb-4">
          <TabsList className="h-auto p-0 bg-transparent gap-2">
            <TabsTrigger value="winners" className="data-[state=active]:bg-transparent px-0 pb-2">
              Winners
            </TabsTrigger>
            <TabsTrigger value="stakers" className="data-[state=active]:bg-transparent px-0 pb-2">
              Stakers
            </TabsTrigger>
          </TabsList>
          <TabsContent value="winners" className="mt-4">
            <LeaderboardTable
              isWinners
              list={winsList}
              isLoading={isLoadingWins}
              page={winnersPage}
              setPage={setWinnersPage}
            />
          </TabsContent>
          <TabsContent value="stakers" className="mt-4">
            <LeaderboardTable
              isWinners={false}
              list={stakersList}
              isLoading={isLoadingStakers}
              page={stakersPage}
              setPage={setStakersPage}
            />
          </TabsContent>
        </Tabs>
      </ScrollView>
    </ScreenWrapper>
  )
}
