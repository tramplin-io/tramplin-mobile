import { View } from 'react-native'
// import LottieView from 'lottie-react-native'

import { useCSSVariable } from 'uniwind'

import { SolanaIcon, TramplinCircleIcon, TramplinIcon } from '@/components/icons/icons'
import { cn } from '@/lib/utils'

export function SolanaCircleBgIcon() {
  const contentPrimaryColor = useCSSVariable('--color-content-primary') as string | undefined

  return (
    <View
      className={cn(
        'rounded-[31px] outline-[0.50px] bg-silver-dark outline-content-primary inline-flex justify-start items-center gap-2.5 mx-1',
      )}
    >
      <SolanaIcon
        size={22}
        className={'text-content-primary'}
        {...{
          style: { color: contentPrimaryColor } as React.ComponentProps<typeof SolanaIcon>['style'],
        }}
      />
    </View>
  )
}

export function TramplinCircleBgIcon() {
  const contentPrimaryColor = useCSSVariable('--color-content-primary') as string | undefined

  return (
    <View
      className={cn(
        'rounded-[31px] outline-[0.50px] bg-silver-dark outline-content-primary inline-flex justify-start items-center gap-2.5 mx-1',
      )}
    >
      <TramplinIcon
        size={22}
        className={'text-content-primary'}
        {...{
          style: { color: contentPrimaryColor } as React.ComponentProps<typeof SolanaIcon>['style'],
        }}
      />
    </View>
  )
}
