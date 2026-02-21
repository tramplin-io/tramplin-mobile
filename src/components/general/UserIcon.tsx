import Svg, { Defs, G, Rect, ClipPath, LinearGradient, Stop } from 'react-native-svg'

const CLIP_ID = 'userIconClip'
const GRADIENT_ID = 'userIconGradient'

/** Grid colors matching src/assets/svg/userIcon.svg */
const GRID_COLORS = [
  ['#8682F7', '#FF9494', '#8682F7', '#CCCFD2', '#8682F7'],
  ['#CCCFD2', '#8682F7', '#CCCFD2', '#8682F7', '#FF9494'],
  ['#8682F7', '#CCCFD2', '#DABC58', '#FF9494', '#DABC58'],
  ['#FF9494', '#DABC58', '#FF9494', '#DABC58', '#CCCFD2'],
  ['#8682F7', '#8682F7', '#DABC58', '#FF9494', '#8682F7'],
]

export interface UserIconProps {
  size?: number
}

/**
 * User icon matching src/assets/svg/userIcon.svg.
 * Rounded square with gradient background and 5×5 colored grid.
 */
export function UserIcon({ size = 21 }: Readonly<UserIconProps>) {
  const scale = size / 21
  const cell = 4 * scale
  const pad = 0.5 * scale
  const rx = 2 * scale
  const w = 20 * scale
  const strokeW = 0.5 * scale

  return (
    <Svg width={size} height={size} viewBox="0 0 21 21" fill="none">
      <Defs>
        <LinearGradient
          id={GRADIENT_ID}
          x1="10.5"
          y1="0.5"
          x2="10.5"
          y2="20.5"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#AAB292" />
          <Stop offset="1" stopColor="#4F5101" />
        </LinearGradient>
        <ClipPath id={CLIP_ID}>
          <Rect x={pad} y={pad} width={w} height={w} rx={10 * scale} />
        </ClipPath>
      </Defs>
      <G clipPath={`url(#${CLIP_ID})`}>
        <Rect x={pad} y={pad} width={w} height={w} rx={10 * scale} fill={`url(#${GRADIENT_ID})`} />
        {GRID_COLORS.map((row, ri) =>
          row.map((fill, ci) => (
            <Rect
              key={`cell-${String(ri)}-${String(ci)}`}
              x={pad + ci * cell}
              y={pad + ri * cell}
              width={cell}
              height={cell}
              rx={rx}
              fill={fill}
              stroke="black"
              strokeWidth={strokeW}
            />
          ))
        )}
      </G>
      <Rect
        x={0.25 * scale}
        y={0.25 * scale}
        width={20.5 * scale}
        height={20.5 * scale}
        rx={10.25 * scale}
        stroke="black"
        strokeWidth={strokeW}
        fill="none"
      />
    </Svg>
  )
}
