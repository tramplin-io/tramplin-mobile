import { Text } from 'react-native'

interface IconProps {
  size?: number
}

/**
 * Wallet icon using emoji (replace with SVG icon library when needed).
 */
export function WalletIcon({ size = 24 }: IconProps) {
  return <Text style={{ fontSize: size }}>👛</Text>
}
