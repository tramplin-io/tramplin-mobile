const fs = require('node:fs/promises')
const path = require('node:path')
const { AndroidConfig, withAndroidManifest, withDangerousMod } = require('expo/config-plugins')

const BACKUP_RULES_XML = `<?xml version="1.0" encoding="utf-8"?>
<full-backup-content>
  <exclude domain="root" path="." />
  <exclude domain="file" path="." />
  <exclude domain="database" path="." />
  <exclude domain="sharedpref" path="." />
  <exclude domain="external" path="." />
</full-backup-content>
`

const DATA_EXTRACTION_RULES_XML = `<?xml version="1.0" encoding="utf-8"?>
<data-extraction-rules>
  <cloud-backup>
    <exclude domain="root" path="." />
    <exclude domain="file" path="." />
    <exclude domain="database" path="." />
    <exclude domain="sharedpref" path="." />
    <exclude domain="external" path="." />
  </cloud-backup>
  <device-transfer>
    <exclude domain="root" path="." />
    <exclude domain="file" path="." />
    <exclude domain="database" path="." />
    <exclude domain="sharedpref" path="." />
    <exclude domain="external" path="." />
  </device-transfer>
</data-extraction-rules>
`

/**
 * Expo config plugin:
 * - disables Android backups for selected build profiles
 * - configures explicit backup/data extraction rules to exclude all app data
 */
function withAndroidBackupConfig(config, { enabled = true } = {}) {
  if (!enabled) {
    return config
  }

  config = withDangerousMod(config, [
    'android',
    async (c) => {
      const projectRoot = c.modRequest.platformProjectRoot
      const xmlDir = path.join(projectRoot, 'app', 'src', 'main', 'res', 'xml')
      await fs.mkdir(xmlDir, { recursive: true })
      await fs.writeFile(path.join(xmlDir, 'backup_rules.xml'), BACKUP_RULES_XML)
      await fs.writeFile(path.join(xmlDir, 'data_extraction_rules.xml'), DATA_EXTRACTION_RULES_XML)
      return c
    },
  ])

  config = withAndroidManifest(config, (c) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplication(c.modResults)
    if (mainApplication?.$) {
      mainApplication.$['android:allowBackup'] = 'false'
      mainApplication.$['android:fullBackupContent'] = '@xml/backup_rules'
      mainApplication.$['android:dataExtractionRules'] = '@xml/data_extraction_rules'
    }
    return c
  })

  return config
}

module.exports = withAndroidBackupConfig
