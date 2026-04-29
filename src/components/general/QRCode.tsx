import { View } from 'react-native'
import QRCodeSvg from 'react-native-qrcode-svg'
import { useCSSVariable } from 'uniwind'

import Logo from '@/assets/svg/Logo_sm.svg'
import { cn } from '@/lib/utils'

type QRCodeProps = Readonly<{
  data: string
  size?: number
  className?: string
}>

export function QRCode({ data, size = 140, className }: QRCodeProps) {
  const fg = useCSSVariable('--color-content-primary') as string | undefined
  const bg = useCSSVariable('--color-fill-primary') as string | undefined

  const logoSize = Math.round(size * 0.15)

  return (
    <View className={cn('items-center justify-center', className)}>
      <QRCodeSvg
        value={data}
        size={size}
        color={fg ?? '#000'}
        backgroundColor={bg ?? '#E7E7E7'}
        logoSize={logoSize}
        logoBackgroundColor={bg ?? '#E7E7E7'}
        logoMargin={5}
        ecl="H"
        quietZone={0}
        logoSVG={Logo}
      />
    </View>
  )
}
