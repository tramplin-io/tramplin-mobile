import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { Linking, Pressable, RefreshControl, ScrollView, View } from 'react-native'
import { router } from 'expo-router'
import { useCSSVariable } from 'uniwind'

import { ScreenWrapper } from '@/components/general'
import { ExpandIcon, LeaveIcon, SolanaIcon } from '@/components/icons/icons'
import { DashboardHeader } from '@/components/main'
import { Card, Pagination } from '@/components/ui'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Text } from '@/components/ui/text'
import { useListPublicStakeLeaders, useListPublicWinLeaders } from '@/lib/api/generated/restApi'
import type { DrawType, Win } from '@/lib/api/generated/restApi.schemas'
import { cn } from '@/lib/utils'
import { ellipsify, formatAbbreviatedNumber } from '@/utils/format'
import { getSolscanAccountUrl } from '@/utils/wallet'

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
  points,
  showReward,
  drawType,
  epochOrSlot,
  isStakers,
}: Readonly<{
  walletAddress: string
  reward?: string
  stake: number
  points?: number
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
  const formattedStake = stake != null ? formatAbbreviatedNumber(stake) : '-'
  const formattedPoints = points != null ? formatAbbreviatedNumber(points) : '-'

  return (
    <View className="flex-row items-center border-b border-border-quaternary py-4">
      <View className={cn('min-w-[116px]', isStakers && 'min-w-[116px]')}>
        <Text variant="body" className={cn(`${rewardStakeTextClass} font-medium`)} numberOfLines={1}>
          {ellipsify(walletAddress, 4)}
        </Text>
      </View>
      {showReward && (
        <View className="flex-row items-center gap-1 min-w-[120px] justify-start">
          <Text variant="body" className={`${rewardStakeTextClass}`}>
            {reward ?? '—'}
          </Text>
          <TokenRewardIcon drawType={drawType} />
        </View>
      )}

      <View
        className={cn('flex-row items-center gap-1 min-w-[120px] justify-start', !isStakers && 'flex-1 min-w-[56px]')}
      >
        <Text variant="body" className={`${rewardStakeTextClass}`}>
          {formattedStake}
        </Text>
        <TokenStakeIcon drawType={drawType} />
      </View>

      {!showReward && (
        <View className="flex-1 flex-row items-center gap-1 min-w-[56px] justify-start">
          <Text variant="body" className={`${rewardStakeTextClass}`}>
            {formattedPoints}
          </Text>
        </View>
      )}
      <Pressable
        onPress={isStakers ? handleOpenSolscan : handleOpenDetail}
        className="ml-0 p-2 -m-2"
        hitSlop={8}
        accessibilityLabel={isStakers ? 'Open in Solscan' : 'View details'}
      >
        {isStakers ? <LeaveIcon size={20} /> : <ExpandIconComponent drawType={drawType} />}
      </Pressable>
    </View>
  )
}

function LeaderboardTable({
  isWinners,
  list,
  isLoading,
  // page,
  // setPage,
}: Readonly<{
  isWinners: boolean
  list: Win[] | { walletAddress: string; stake: number; points?: number }[]
  isLoading: boolean
  // page: number
  // setPage: Dispatch<SetStateAction<number>>
}>) {
  // const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE))
  // const currentPage = Math.min(page, totalPages - 1)
  // const pageItems = useMemo(
  //   () => list.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE),
  //   [list, currentPage],
  // )
  // console.log('list', list)
  const pageItems = list
  return (
    <>
      {isWinners ? (
        <View className="flex-row items-center pb-4 mb-0">
          <Text variant="small" className="uppercase tracking-wide min-w-[116px]">
            Wallet
          </Text>
          <Text variant="small" className="uppercase tracking-wide min-w-[120px] text-left">
            Reward
          </Text>
          <Text variant="small" className="uppercase tracking-wide min-w-[76px] text-left">
            Stake
          </Text>
          <View className="w-8" />
        </View>
      ) : (
        <View className="flex-row items-center pb-4 mb-0">
          <Text variant="small" className="uppercase tracking-wide min-w-[116px]">
            Wallet
          </Text>
          <Text variant="small" className=" uppercase tracking-wide min-w-[120px] text-left">
            Stake
          </Text>
          <Text variant="small" className=" uppercase tracking-wide min-w-[56px] text-left">
            Points
          </Text>
          <View className="w-8" />
        </View>
      )}

      {isLoading && (
        <View className="gap-0">
          {Array.from({ length: PAGE_SIZE }, (_, i) => `skeleton-${i}`).map((id) => (
            <View key={id} className="flex-row items-center border-b border-border-quaternary py-4 gap-2">
              <Skeleton className="h-5 flex-1 rounded" />
              {isWinners && <Skeleton className="h-5 w-14 rounded" />}
              <Skeleton className="h-5 w-14 rounded" />
              <Skeleton className="h-5 w-8 rounded" />
            </View>
          ))}
        </View>
      )}
      {!isLoading && pageItems.length === 0 && (
        <Card className="py-8">
          <Text className="text-content-secondary text-center">No entries yet.</Text>
        </Card>
      )}
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
              points={staker?.points}
              showReward={false}
              isStakers
            />
          )
        })}

      {/* {list.length > PAGE_SIZE && (
        <Pagination className="mt-6" currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
      )} */}
    </>
  )
}

export default function LeaderboardTab() {
  const [tab, setTab] = useState<TabId>('winners')
  // const [winnersPage, setWinnersPage] = useState(0)
  // const [stakersPage, setStakersPage] = useState(0)

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
        contentContainerClassName="px-4 pb-30 py-8 flex-grow"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            progressViewOffset={40}
            colors={[colorBrandPrimary]}
          />
        }
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
              // page={winnersPage}
              // setPage={setWinnersPage}
            />
          </TabsContent>
          <TabsContent value="stakers" className="mt-4">
            <LeaderboardTable
              isWinners={false}
              list={stakersList}
              isLoading={isLoadingStakers}
              // page={stakersPage}
              // setPage={setStakersPage}
            />
          </TabsContent>
        </Tabs>
      </ScrollView>
    </ScreenWrapper>
  )
}
