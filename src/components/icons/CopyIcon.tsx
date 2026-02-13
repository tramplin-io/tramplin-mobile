import { Text } from 'react-native'

interface IconProps {
  size?: number
}

/**
 * Copy icon using emoji (replace with SVG icon library when needed).
 */
export function CopyIcon({ size = 24 }: IconProps) {
  return <Text style={{ fontSize: size }}>📋</Text>
}
