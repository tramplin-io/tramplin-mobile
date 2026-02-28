import { useQuery } from '@tanstack/react-query'
import { address, getProgramDerivedAddress } from '@solana/kit'
import {
  PROGRAM_ID,
  CONFIG_SEED,
  StateDiscriminators,
  ConfigCodec,
  base64Codec,
  type DrawConfig,
  base58Codec,
  AccountHeaderSize,
  rpc,
  assert,
} from '@/utils/solana'

export function useDrawConfig() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['draw-config'],
    queryFn: async (): Promise<DrawConfig | null> => {
      try {
        const [pda] = await getProgramDerivedAddress({
          programAddress: PROGRAM_ID,
          seeds: [CONFIG_SEED],
        })

        const accountInfo = await rpc.getAccountInfo(pda, { encoding: 'base64' }).send()
        assert(accountInfo.value, 'Config account not found')
        const dataBytes = base64Codec.encode(accountInfo.value.data[0] as string)
        assert(dataBytes[0] === StateDiscriminators.Config, 'Wrong config account discriminator')

        const configData = ConfigCodec.decode(dataBytes.slice(AccountHeaderSize))

        return {
          regularDrawInterval: configData.regularDrawInterval,
          nextBigDrawEpoch: configData.nextBigDrawEpoch,
          bigDrawDurationEpoch: configData.bigDrawDurationEpoch,
          isEnabled: configData.isEnabled === 1,
          admin: address(base58Codec.decode(configData.admin)),
          operator: address(base58Codec.decode(configData.operator)),
          dealer: address(base58Codec.decode(configData.dealer)),
          drawDeadline: configData.drawDeadline,
        }
      } catch (err) {
        console.error('Error fetching draw config:', err)
        return null
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  })

  let normalizedError: Error | null = null
  if (error instanceof Error) {
    normalizedError = error
  } else if (error) {
    normalizedError = new Error(String(error))
  }

  return {
    data: data ?? null,
    fetching: isLoading,
    error: normalizedError,
  }
}
