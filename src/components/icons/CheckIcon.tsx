import { Text } from 'react-native'

interface IconProps {
  size?: number
}

/**
 * Check/success icon using emoji (replace with SVG icon library when needed).
 */
export function CheckIcon({ size = 24 }: IconProps) {
  return <Text style={{ fontSize: size }}>✓</Text>
}
