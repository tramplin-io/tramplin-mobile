// import { StyleSheet, View } from 'react-native'
// import { LinearGradient } from 'expo-linear-gradient'
// import { useVideoPlayer, VideoView } from 'expo-video'

// import { cn } from '@/lib/utils'

// const emptyStateCardMobileMp4 = require('@/assets/videos/empty_state.mp4')

// export function VideoCard({ bgColor, children }: Readonly<{ bgColor: string; children: React.ReactNode }>) {
//   const player = useVideoPlayer(emptyStateCardMobileMp4, (p) => {
//     p.loop = true
//     p.muted = true
//     p.play()
//   })

//   return (
//     <View
//       className={cn(
//         'px-3 py-3 flex-row items-center gap-1 h-40 w-full',
//         'rounded-lg overflow-hidden border border-border-quaternary',
//         'bg-reward-large-secondary',
//       )}
//     >
//       <View style={StyleSheet.absoluteFillObject} className={cn('rounded-lg', bgColor)}>
//         <VideoView
//           player={player}
//           //   style={[StyleSheet.absoluteFillObject, { opacity: 0.35 }]}
//           style={[
//             StyleSheet.absoluteFillObject,
//             {
//               filter: [
//                 { grayscale: 1 },
//                 { sepia: 1 },
//                 { hueRotate: '180deg' }, // adjust to match bgColor hue
//                 { saturate: 3 },
//               ],
//             },
//           ]}
//           contentFit="fill"
//           nativeControls={false}
//           pointerEvents="none"
//         />
//         <LinearGradient
//           colors={[
//             'rgba(139, 139, 139, 0.20)',
//             'rgba(139, 139, 139, 0.85)',
//             'rgba(139, 139, 139, 1)',
//             'rgba(139, 139, 139, 1)',
//             'rgba(139, 139, 139, 0.85)',
//             'rgba(139, 139, 139, 0.20)',
//           ]}
//           locations={[0, 0.25, 0.4, 0.6, 0.75, 1]}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 0, y: 1 }}
//           style={StyleSheet.absoluteFillObject}
//         />
//       </View>
//       {children}
//     </View>
//   )
// }
