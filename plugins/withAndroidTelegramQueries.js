const { withAndroidManifest } = require('expo/config-plugins')

const TELEGRAM_PACKAGES = [
  { $: { 'android:name': 'org.telegram.messenger' } },
  { $: { 'android:name': 'org.telegram.messenger.web' } },
]

/**
 * Expo config plugin: adds Telegram app package queries to AndroidManifest.xml
 * so Linking.canOpenURL('tg://...') works on Android 11+.
 *
 * Adds:
 *   <package android:name="org.telegram.messenger" />
 *   <package android:name="org.telegram.messenger.web" />
 * inside the existing <queries> block.
 */
function withAndroidTelegramQueries(config) {
  return withAndroidManifest(config, (c) => {
    const root = Array.isArray(c.modResults.manifest)
      ? c.modResults.manifest[0]
      : c.modResults.manifest

    if (!root) return c

    if (!root.queries) {
      root.queries = [{ intent: [], package: [] }]
    }

    const queriesEl = Array.isArray(root.queries) ? root.queries[0] : root.queries
    if (!queriesEl.package) {
      queriesEl.package = []
    }
    const packages = Array.isArray(queriesEl.package) ? queriesEl.package : [queriesEl.package]

    const existingNames = new Set(
      packages.filter((p) => p?.$?.['android:name']).map((p) => p.$['android:name']),
    )
    for (const pkg of TELEGRAM_PACKAGES) {
      const name = pkg.$['android:name']
      if (!existingNames.has(name)) {
        packages.push(pkg)
        existingNames.add(name)
      }
    }
    queriesEl.package = packages

    return c
  })
}

module.exports = withAndroidTelegramQueries
