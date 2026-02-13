import { useCallback, useState } from 'react'
import { Share } from 'react-native'

/**
 * Tries to load expo-clipboard if available (requires native rebuild).
 * Falls back to React Native Share API otherwise.
 */
async function copyToClipboard(text: string): Promise<boolean> {
  // Try expo-clipboard first (only works if native module is installed)
  try {
    const Clipboard = require('expo-clipboard') as typeof import('expo-clipboard')
    await Clipboard.setStringAsync(text)
    return true
  } catch {
    // Native module not available — fall back to Share sheet
  }

  // Fallback: open the share sheet so the user can copy manually
  try {
    await Share.share({ message: text })
    return true
  } catch {
    return false
  }
}

/**
 * Hook to copy text to clipboard with a temporary "copied" state.
 *
 * Uses expo-clipboard when available (requires dev client rebuild),
 * otherwise falls back to React Native's Share sheet.
 *
 * @param resetDelay - How long to show "copied" state in ms (default: 2000)
 *
 * @example
 * const { copy, copied } = useCopyToClipboard()
 * <Pressable onPress={() => copy('some text')}>
 *   <Text>{copied ? 'Copied!' : 'Copy'}</Text>
 * </Pressable>
 */
export function useCopyToClipboard(resetDelay = 2000) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(
    async (text: string) => {
      const success = await copyToClipboard(text)
      if (success) {
        setCopied(true)
        setTimeout(() => setCopied(false), resetDelay)
      }
    },
    [resetDelay],
  )

  return { copy, copied } as const
}
