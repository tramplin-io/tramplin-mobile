import { Text } from 'react-native'

interface IconProps {
  size?: number
}

/**
 * Send icon using emoji (replace with SVG icon library when needed).
 */
export function SendIcon({ size = 24 }: IconProps) {
  return <Text style={{ fontSize: size }}>📤</Text>
}
