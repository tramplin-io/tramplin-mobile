// import { useState } from 'react';
// import { isSolanaError, lamports } from '@solana/kit';
// import { type Winner, lamportsToSol } from '@/solana.ts';
// import { BellIcon, ExpandIcon } from '@/components/icons';
// import { CollapsibleStack } from '@/components/ui/collapsible-stack';
// import { useDrawWins } from '@/hooks/useDrawWins.ts';
// import { useClaimPrize } from '@/hooks/useClaimPrize.ts';
// import { NotificationsDialog } from './NotificationsDialog.tsx';
// import { BigRewardCard, RegularRewardCard } from './RewardCard.tsx';
// import { trackEvent, AnalyticsEvent } from '@/analytics';
// import { logError } from '@/errorLog';
// import { isFlagEnabled } from '@/utils.ts';
// import { useUserPoints } from '@/hooks/useUserPoints.ts';
// import { useWalletSession } from '@solana/react-hooks';

// const REWARDS_NOTIFICAITONS_LIMIT = 4;

// export function Notifications({ onSubscribe }: { onSubscribe: () => void }) {
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const session = useWalletSession();

//   const { data: points, fetching: isFetchingPoints } = useUserPoints();
//   const hasActivity = (points ?? 0) > 0;

//   const { regularWins, bigWins, isLoading } = useDrawWins({ enabled: hasActivity });
//   const { claim, error, claimingWinners } = useClaimPrize();

//   const handleClaim = async (winners: Winner[]) => {
//     const amountSol = lamportsToSol(lamports(winners.reduce((acc, w) => (acc += w.prize), 0n)));
//     trackEvent(AnalyticsEvent.CLAIM_REWARD_CLICK, {
//       amount_sol: amountSol,
//       wallet_address: session?.account.address,
//     });

//     try {
//       await claim(winners);
//     } catch (err: unknown) {
//       logError(err, {
//         component: 'Notifications',
//         action: 'claim',
//         address: winners[0]!.withdrawer,
//         stakeId: winners.map((w) => w.stakeId.toString()).join(','),
//         winnerId: winners.map((w) => w.winnerId.toString()).join(','),
//         stake: winners.map((w) => w.stake.toString()).join(','),
//         proof: winners.map((w) => w.proof.join(', ')).join('|'),
//         epochOrSlot: winners.map((w) => w.epochOrSlot.toString()).join(','),
//       });
//     }
//   };

//   const isClaiming = claimingWinners.length > 0;

//   const smallRewards = regularWins ?? [];
//   const bigRewards = bigWins ?? [];
//   const showSkeleton = isFetchingPoints || (isLoading && !regularWins && !bigWins);

//   const totalPrize = lamports(smallRewards.reduce((acc, r) => acc + r.prize, 0n));

//   const cover =
//     smallRewards.length > 1 ? (
//       <RegularRewardCard reward={totalPrize} rewardsCount={smallRewards.length} variant="summary" />
//     ) : undefined;

//   const hasMoreRewards = smallRewards.length > REWARDS_NOTIFICAITONS_LIMIT || bigRewards.length > 1;

//   return (
//     <div>
//       <div className="grid grid-cols-1 md:grid-cols-[1fr_36xpx] md:">
//         <div className="flex md:flex-col md:justify-start items-baseline justify-between mb-2.5">
//           <h4 className="text-[22px]/[24px] tracking-[-0.44px]">Welcome to Tramplin!</h4>
//           <div
//             className="flex items-center text-(--content-tetriary) opacity-40 hover:opacity-60 text-[16px]/[18px] cursor-pointer"
//             onClick={onSubscribe}
//           >
//             Subscribe <span className="hidden md:inline">&nbsp;to notifications</span>
//             <ExpandIcon />
//           </div>
//         </div>
//         {bigRewards.length > 0 ? (
//           <div className="md:col-span-2">
//             <BigRewardCard
//               reward={bigRewards[0]!.prize}
//               revealedAt={bigRewards[0]!.revealedAtDate!}
//               disabled={isClaiming}
//               onClaim={() => handleClaim([bigRewards[0]!])}
//             />
//           </div>
//         ) : null}

//         {showSkeleton ? (
//           <div className="md:col-start-2 md:row-start-1 mb-4 md:w-[354px]">
//             <div className="relative h-[65px]">
//               {[0, 1, 2].map((i) => (
//                 <div
//                   key={i}
//                   className="absolute left-0 right-0"
//                   style={{ transform: `translateY(${i * 5}px)`, zIndex: 3 - i }}
//                 >
//                   <RegularRewardCard variant="loading" />
//                 </div>
//               ))}
//             </div>
//           </div>
//         ) : smallRewards.length > 0 ? (
//           <div className="md:col-start-2 md:row-start-1 mt-2 md:mt-0">
//             <CollapsibleStack
//               collapsedCount={3}
//               gap={5}
//               expandedGap={3}
//               className="mb-4 w-full md:w-[354px]"
//               cover={cover}
//             >
//               {isFlagEnabled('CLAIM_ALL') && smallRewards.length > 1 && (
//                 <RegularRewardCard
//                   reward={lamports(smallRewards.reduce((acc, r) => acc + r.prize, 0n))}
//                   variant="claim"
//                   rewardsCount={smallRewards.length}
//                   disabled={isClaiming}
//                   onClaim={() => handleClaim(smallRewards)}
//                 />
//               )}
//               {smallRewards.slice(0, REWARDS_NOTIFICAITONS_LIMIT).map((winner) => (
//                 <RegularRewardCard
//                   key={winner.epochOrSlot}
//                   reward={winner.prize}
//                   revealedAt={winner.revealedAtDate!}
//                   disabled={isClaiming}
//                   onClaim={() => handleClaim([winner])}
//                 />
//               ))}
//               {hasMoreRewards ? (
//                 <NotificationCard onClick={() => setDialogOpen(!dialogOpen)}>
//                   <BellIcon /> Past notifications & awards
//                 </NotificationCard>
//               ) : null}
//             </CollapsibleStack>
//           </div>
//         ) : null}
//         {error && process.env.DEV ? (
//           <div className="text-(--critical-primary) p-2">
//             {isSolanaError(error)
//               ? isSolanaError(error.cause)
//                 ? `${error.cause.message}. Ctx: ${JSON.stringify(error.cause.context)}`
//                 : `${error.message} Ctx: ${JSON.stringify(error.context)}`
//               : error.toString()}
//           </div>
//         ) : null}
//       </div>
//       <NotificationsDialog
//         open={dialogOpen}
//         onOpenChange={(open) => setDialogOpen(open)}
//         smallRewards={smallRewards}
//         bigRewards={bigRewards}
//         claimingWinners={claimingWinners}
//         handleClaim={handleClaim}
//       />
//     </div>
//   );
// }

// function NotificationCard({ children, onClick }: { children?: React.ReactNode; onClick?: () => void }) {
//   return (
//     <div
//       className="flex items-center justify-center h-[52px] max-w-[354px] rounded-[10px] overflow-hidden border border-(--border-quaternary) bg-(--fill-secondary)"
//       onClick={onClick}
//     >
//       {children}
//     </div>
//   );
// }
