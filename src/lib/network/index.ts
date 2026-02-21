import * as Network from 'expo-network'
import { useCallback, useEffect, useState } from 'react'

type UseNetworkStatusResult = {
  isConnected: boolean
  type: Network.NetworkStateType | null
  isLoading: boolean
  recheck: () => Promise<void>
}

export function useNetworkStatus(): UseNetworkStatusResult {
  const [isConnected, setIsConnected] = useState<boolean>(true)
  const [type, setType] = useState<Network.NetworkStateType | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Manual recheck function
  const recheck = useCallback(async () => {
    setIsLoading(true)
    const networkState = await Network.getNetworkStateAsync()

    setIsConnected(
      !!networkState.isConnected && networkState.isInternetReachable !== false,
    )
    setType(networkState.type ?? null)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    let isMounted = true

    const checkNetwork = async () => {
      setIsLoading(true)
      const networkState = await Network.getNetworkStateAsync()
      if (isMounted) {
        setIsConnected(
          !!networkState.isConnected &&
            networkState.isInternetReachable !== false,
        )
        setType(networkState.type ?? null)
        setIsLoading(false)
      }
    }

    checkNetwork()

    const subscription = Network.addNetworkStateListener(networkState => {
      setIsConnected(
        !!networkState.isConnected &&
          networkState.isInternetReachable !== false,
      )
      setType(networkState.type ?? null)
    })

    return () => {
      isMounted = false
      subscription && subscription.remove()
    }
  }, [])

  return { isConnected, type, isLoading, recheck }
}
