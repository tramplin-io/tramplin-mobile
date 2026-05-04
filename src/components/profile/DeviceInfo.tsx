import { useEffect, useState } from 'react'
import { Dimensions, Platform } from 'react-native'
import Constants from 'expo-constants'
import * as Device from 'expo-device'
import * as Network from 'expo-network'

import { Text } from '@/components/ui/text'

interface NetworkState {
  type: string
  isConnected: boolean | null
}

const row = (label: string, value: string | number | boolean | null | undefined) => `${label}: ${value ?? 'unknown'}`

export const DeviceInfo = () => {
  const [network, setNetwork] = useState<NetworkState | null>(null)
  const { width, height, scale } = Dimensions.get('screen')

  useEffect(() => {
    Network.getNetworkStateAsync().then((state) => {
      setNetwork({
        type: state.type ?? 'unknown',
        isConnected: state.isConnected ?? null,
      })
    })
  }, [])

  const deviceTypeLabel: Record<number, string> = {
    [Device.DeviceType.PHONE]: 'Phone',
    [Device.DeviceType.TABLET]: 'Tablet',
    [Device.DeviceType.DESKTOP]: 'Desktop',
    [Device.DeviceType.TV]: 'TV',
    [Device.DeviceType.UNKNOWN]: 'Unknown',
  }

  const lines = [
    row('Model', Device.modelName),
    row('Manufacturer', Device.manufacturer),
    row('Brand', Device.brand),
    row('Model ID', Device.modelId),
    row('OS name', `${Device.osName}`),
    row('OS version', `${Device.osVersion}`),
    row('OS Build', Device.osBuildId),
    row('Type', deviceTypeLabel[Device.deviceType ?? Device.DeviceType.UNKNOWN]),
    row('Simulator', !Device.isDevice),
    row('Memory', Device.totalMemory ? `${Math.round(Device.totalMemory / 1024 / 1024)} MB` : null),
    row('Year Class', Device.deviceYearClass),
    row('Platform', Platform.OS),
    row('Platform Version', Platform.Version),
    row('Screen', `${width}×${height} @${scale}x`),
    row('Network Type', network?.type),
    row('Connected', network?.isConnected),

    row('deviceName', Constants.deviceName),
    row('expoVersion', Constants.expoVersion),
  ]

  return (
    <Text variant="body" className="text-textSecondary font-mono text-xs leading-relaxed">
      {lines.join('\n')}
    </Text>
  )
}
