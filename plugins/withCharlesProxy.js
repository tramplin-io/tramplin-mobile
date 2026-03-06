const fs = require('node:fs/promises')
const path = require('node:path')
const { AndroidConfig, withAndroidManifest, withDangerousMod, withInfoPlist } = require('expo/config-plugins')

const NETWORK_SECURITY_CONFIG = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <base-config cleartextTrafficPermitted="true">
    <trust-anchors>
      <certificates src="system" />
      <certificates src="user" />
    </trust-anchors>
  </base-config>
</network-security-config>
`

/**
 * Expo config plugin: trust user-installed CA certificates (e.g. Charles Proxy)
 * so HTTPS traffic can be inspected during development.
 *
 * - Android: adds network_security_config.xml and references it in the manifest.
 * - iOS: sets NSAppTransportSecurity.NSAllowsArbitraryLoads = true.
 *
 * Enable via EXPO_PUBLIC_ENABLE_CHARLES_PROXY=true or ENABLE_CHARLES_PROXY=true in .env.
 */
function withCharlesProxy(config, { enabled = false } = {}) {
  if (!enabled) {
    return config
  }

  config = withDangerousMod(config, [
    'android',
    async (c) => {
      const projectRoot = c.modRequest.platformProjectRoot
      const xmlDir = path.join(projectRoot, 'app', 'src', 'main', 'res', 'xml')
      await fs.mkdir(xmlDir, { recursive: true })
      await fs.writeFile(path.join(xmlDir, 'network_security_config.xml'), NETWORK_SECURITY_CONFIG)
      return c
    },
  ])

  config = withAndroidManifest(config, (c) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplication(c.modResults)
    if (!mainApplication?.$) {
      return c
    }
    mainApplication.$['android:networkSecurityConfig'] = '@xml/network_security_config'
    return c
  })

  config = withInfoPlist(config, (c) => {
    const existing = c.modResults.NSAppTransportSecurity
    const base = typeof existing === 'object' && existing !== null ? existing : {}
    c.modResults.NSAppTransportSecurity = { ...base, NSAllowsArbitraryLoads: true }
    return c
  })

  return config
}

module.exports = withCharlesProxy
