import { View } from 'react-native'

const IDENTICON_COLORS = ['#8682F7', '#FF9494', '#CCCFD2', '#DABC58', '#AAB292', '#4F5101']

/**
 * Deterministic 5x5 grid identicon from wallet address.
 * Used in app header to represent the connected wallet.
 */
export function WalletIdenticon({
  address,
  size = 20,
}: Readonly<{
  address: string
  size?: number
}>) {
  const cellSize = size / 5
  const codes = address.split('').map((c) => c.codePointAt(0) ?? 0)
  const seed = Math.trunc(codes.reduce((a, b) => a + b, 0))

  return (
    <View
      className="overflow-hidden rounded-full border border-content-primary"
      style={{
        width: size,
        height: size,
        backgroundColor: IDENTICON_COLORS[seed % IDENTICON_COLORS.length],
      }}
    >
      <View className="absolute left-0 top-0 flex-row flex-wrap" style={{ width: size, height: size }}>
        {Array.from({ length: 25 }).map((_, i) => {
          const row = Math.floor(i / 5)
          const col = i % 5
          const colorIndex = (seed + i * 7) % IDENTICON_COLORS.length
          return (
            <View
              key={`${address}-${row}-${col}`}
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: IDENTICON_COLORS[colorIndex],
              }}
            />
          )
        })}
      </View>
    </View>
  )
}
