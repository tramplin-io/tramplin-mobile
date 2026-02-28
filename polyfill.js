// polyfill.js
import { install } from 'react-native-quick-crypto'

install()

// Suppress known Expo dev-time unhandled rejection (Android: keep-awake fails when
// screen locks during bundling or app backgrounds). Does not affect production behavior.
function handleUnhandledRejection(event) {
  const msg = event?.reason?.message ?? String(event?.reason)
  if (typeof msg === 'string' && msg.includes('Unable to activate keep awake')) {
    event.preventDefault?.()
    return
  }
}
if (typeof globalThis.addEventListener === 'function') {
  globalThis.addEventListener('unhandledrejection', handleUnhandledRejection)
}
