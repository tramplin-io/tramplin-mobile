// polyfill.js
import { install } from 'react-native-quick-crypto'

install()

const KEEP_AWAKE_MSG = 'Unable to activate keep awake'
const KEEP_AWAKE_DEACTIVATE_MSG = 'Unable to deactivate keep awake'

function isKeepAwakeRejection(reason) {
  const msg = reason?.message ?? String(reason ?? '')
  return typeof msg === 'string' && (msg.includes(KEEP_AWAKE_MSG) || msg.includes(KEEP_AWAKE_DEACTIVATE_MSG))
}

// Suppress known Expo dev-time unhandled rejection (Android: keep-awake fails when
// screen locks during bundling or app backgrounds). Does not affect production behavior.
function handleUnhandledRejection(event) {
  if (isKeepAwakeRejection(event?.reason)) {
    event.preventDefault?.()
  }
}
if (typeof globalThis.addEventListener === 'function') {
  globalThis.addEventListener('unhandledrejection', handleUnhandledRejection)
}

// React Native/Hermes: unhandledrejection may not fire for native-module rejections.
// Install a promise rejection tracker that suppresses only keep-awake errors.
const HermesInternal = globalThis.HermesInternal
if (HermesInternal?.enablePromiseRejectionTracker) {
  HermesInternal.enablePromiseRejectionTracker({
    allRejections: true,
    onUnhandled(id, rejection) {
      if (isKeepAwakeRejection(rejection)) return
      const msg = rejection?.message ?? String(rejection)
      console.error(`Unhandled promise rejection (id: ${id}):`, msg)
    },
  })
}
