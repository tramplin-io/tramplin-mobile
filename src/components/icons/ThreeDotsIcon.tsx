import Svg, { Circle } from 'react-native-svg'

interface ThreeDotsIconProps {
  size?: number
  color?: string
}

/**
 * Three horizontal dots icon (matches design from @/assets/icons).
 * RN-compatible implementation using react-native-svg.
 */
export function ThreeDotsIcon({ size = 24, color = 'currentColor' }: Readonly<ThreeDotsIconProps>) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="8.5" cy="12.292" r="1" fill={color} />
      <Circle cx="12.5" cy="12.292" r="1" fill={color} />
      <Circle cx="16.5" cy="12.292" r="1" fill={color} />
    </Svg>
  )
}
