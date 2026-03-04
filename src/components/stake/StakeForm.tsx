import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Keyboard, Linking, Pressable, TextInput, View } from 'react-native'
import type { Rpc, SolanaRpcApi } from '@solana/kit'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { useCSSVariable } from 'uniwind'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { AppConfig } from '@/constants/app-config'
import { LAMPORTS_PER_SOL, MIN_STAKE_SOL, MIN_SUBSEQUENT_STAKE_SOL } from '@/constants/solana'
import { useStake } from '@/hooks/useStake'
import { useWalletBalance } from '@/hooks/useWalletBalance'
import { useReadMyStats } from '@/lib/api/generated/restApi'
import { cn } from '@/lib/utils'
import type { BalanceInfo } from '@/types/wallet'
import { ellipsify, lamportsToSol } from '@/utils/format'
import { STAKE_TX_PRECALCULATED_COST } from '@/utils/solana'
import { getSolscanTxUrl } from '@/utils/wallet'

import { SolscanIcon } from '../icons'
import { CheckIcon, LeaveIcon, SolanaIcon } from '../icons/icons'
import { SolInput } from './SolInput'

const QUICK_AMOUNTS = [5, 10, 20] as const

export type StakeFormStatus = 'idle' | 'processing' | 'success' | 'failed' | 'network_failed'

/** Result of executeStake (matches StakeFormStakeResult shape) */
export type StakeFormStakeResult = {
  success: boolean
  signature?: string
  error?: string
  networkError?: boolean
}

export type StakeFormStakeProps = Readonly<{
  balance: BalanceInfo | null
  executeStake: (amountSol: number) => Promise<StakeFormStakeResult>
  loading: boolean
  error: string | null
  clearError: () => void
  lastSignature: string | null
  resetState: () => void
}>

type Props = Readonly<{
  onClose?: () => void
}>

export function StakeForm({ onClose }: Props) {
  const { balance } = useWalletBalance()
  const { client } = useMobileWallet()
  const { data: myStats, isLoading: isLoadingMyStats, refetch: refetchMyStats } = useReadMyStats()

  const { stake, isLoading } = useStake({
    rpc: (client?.rpc ?? undefined) as Rpc<SolanaRpcApi> | undefined,
  })

  const inputRef = useRef<TextInput>(null)
  const [lastSignature, setLastSignature] = useState<string | null>(null)

  const contentTertiaryColor = useCSSVariable('--color-content-tertiary') as string | undefined
  const contentPrimaryColor = useCSSVariable('--color-content-primary') as string | undefined

  const executeStake = useCallback(
    async (amountSol: number): Promise<StakeFormStakeResult> => {
      try {
        const lamports = BigInt(Math.round(amountSol * Number(LAMPORTS_PER_SOL)))
        const result = await stake({ amountInLamports: lamports })
        refetchMyStats()
        return { success: true, signature: result.signature }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        const networkError = /network|timeout|fetch|connection|not connected|not ready/i.test(msg)
        return { success: false, error: msg, networkError }
      }
    },
    [stake, refetchMyStats],
  )

  const loading = isLoading || isLoadingMyStats
  const resetState = useCallback(() => {
    setLastSignature(null)
  }, [])

  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState<StakeFormStatus>('idle')
  const [displayError, setDisplayError] = useState<string | null>(null)
  const [retryCountdown, setRetryCountdown] = useState(0)

  const [isValid, setIsValid] = useState(false)
  const [validationError, setValidationError] = useState<'min' | 'max' | null>(null)

  const minSol = myStats?.totalStakeAmount && myStats?.totalStakeAmount >= 1 ? MIN_SUBSEQUENT_STAKE_SOL : MIN_STAKE_SOL
  const costLamports = BigInt(STAKE_TX_PRECALCULATED_COST)
  const maxSol = balance && balance.lamports > costLamports ? Number(lamportsToSol(balance.lamports - costLamports)) : 0
  const amountNum = Number.parseFloat(amount) || 0

  let validationMessage: string | null = null
  if (validationError === 'min') validationMessage = `Minimum amount is ${minSol} SOL`
  else if (validationError === 'max') validationMessage = 'Balance is too low.'
  const canSubmit = status === 'idle' && isValid && !loading
  const isAboveMax = validationError === 'max'

  const handleQuickAmount = useCallback((value: number) => {
    setAmount(String(value))
    setDisplayError(null)
  }, [])

  const handleMax = useCallback(() => {
    if (balance && balance.lamports > costLamports) {
      setAmount(lamportsToSol(balance.lamports - costLamports))
    } else if (balance) {
      setAmount('0')
    }
    setDisplayError(null)
  }, [balance, costLamports])

  const handleConfirmStake = useCallback(async () => {
    if (!canSubmit) return
    setStatus('processing')
    setDisplayError(null)

    const result = await executeStake(amountNum)

    if (result?.success && result.signature) {
      setLastSignature(result.signature)
      setStatus('success')
    } else if (result?.networkError) {
      setStatus('network_failed')
      setDisplayError(result.error ?? 'Network request failed')
    } else {
      setStatus('failed')
      setDisplayError(result?.error ?? 'Transaction failed')
      setRetryCountdown(3)
    }
  }, [canSubmit, amountNum, executeStake])

  const handleTryAgain = useCallback(() => {
    setDisplayError(null)
    resetState()
    setStatus('idle')
    setRetryCountdown(0)
  }, [resetState])

  const handleViewSolscan = useCallback(() => {
    if (lastSignature) {
      Linking.openURL(getSolscanTxUrl(lastSignature, AppConfig.networkCluster))
    }
  }, [lastSignature])

  // Retry countdown for failed state
  useEffect(() => {
    if (status !== 'failed' || retryCountdown <= 0) return
    const t = setTimeout(() => setRetryCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [status, retryCountdown])

  useEffect(() => {
    if (loading && status === 'idle') setStatus('processing')
  }, [loading, status])

  useEffect(() => {
    if (status !== 'idle') Keyboard.dismiss()
  }, [status])

  const handleValidationChange = useCallback((valid: boolean, err: 'min' | 'max' | null) => {
    setIsValid(valid)
    setValidationError(err)
  }, [])

  if (status === 'success') {
    return (
      <View className="gap-10 px-4 pb-8">
        <Text variant="h4" className="text-content-primary">
          Stake
        </Text>
        <View className="items-center gap-2 pb-4">
          <View className="items-center gap-2 border-b border-content-tertiary pb-0">
            <View className="flex-row items-end gap-1">
              <Text variant="body" className="pb-2">
                ↑
              </Text>
              <Text variant="h2Digits">{amount}</Text>
              <View className="flex-row items-center pb-1">
                <Text variant="body">SOL</Text>
                <SolanaIcon size={24} />
                <Text variant="body">staked</Text>
              </View>
            </View>
          </View>
          <View className="items-center ">
            {lastSignature && (
              <Pressable onPress={handleViewSolscan} className="mt-2 flex-row items-center">
                <Text variant="smallBold" className="text-content-tertiary ">
                  View transaction on{' '}
                </Text>
                <SolscanIcon color={contentTertiaryColor} />
                <Text variant="smallBold" className="text-content-tertiary ">
                  Solscan
                </Text>
                <LeaveIcon size={24} color={contentTertiaryColor} />
              </Pressable>
            )}
          </View>
        </View>

        {onClose && (
          <Button variant="gray" size="xl" onPress={onClose}>
            <CheckIcon />
            <Text className="text-content-primary">Successful Stake</Text>
          </Button>
        )}
      </View>
    )
  }

  const isNetworkFailed = status === 'network_failed'
  const isFailed = status === 'failed'
  const isProcessing = status === 'processing' && loading

  return (
    <View className="gap-4 px-4 pb-8">
      <Text variant="h4" className="text-content-primary">
        Stake
      </Text>

      <SolInput
        ref={inputRef}
        value={amount}
        onChange={setAmount}
        min={minSol}
        max={maxSol}
        disabled={isProcessing}
        onValidationChange={handleValidationChange}
      />

      {/* <View
        className={cn(
          'flex-row items-end gap-2 border-b border-border-tertiary pb-2.5',
          isProcessing && 'opacity-50',
          validationMessage && 'border-critical-secondary',
        )}
      >
        <Input
          value={amount}
          onChangeText={(t) => {
            setAmount(t)
            setDisplayError(null)
          }}
          placeholder="0.00"
          keyboardType="number-pad"
          className="flex-1 border-0 bg-transparent text-content-primary text-h2Digits shadow-none"
          hasError={!!validationMessage}
        />

        <View className="flex-row items-center">
          <Text variant="body">SOL</Text>
          <SolanaIcon size={24} />
        </View>
      </View> */}

      <View className="flex-row justify-between gap-0.5 mb-10">
        <View className="flex-row gap-0.5">
          {QUICK_AMOUNTS.map((n) => (
            <Pressable
              key={n}
              onPress={() => handleQuickAmount(n)}
              disabled={isProcessing}
              className={cn(
                'rounded-full px-2 py-1 border border-border-quaternary flex-row items-center',
                isProcessing && 'opacity-50',
              )}
            >
              <Text variant="smallBold">{n}</Text>
              <SolanaIcon size={24} />
            </Pressable>
          ))}
        </View>

        <Button
          variant={'preset'}
          size="sm"
          onPress={handleMax}
          disabled={isProcessing}
          className={cn(
            'px-2 py-1',
            isProcessing && 'opacity-50',
            isAboveMax && 'border-critical-secondary [background-image:linear-gradient(to_bottom,#E7E7E7,#FF9494)]',
          )}
        >
          <Text variant="smallBold" className="truncate ellipsis text-content-primary">
            MAX {balance ? ellipsify(balance.sol, 4) : '0'}
          </Text>
          <SolanaIcon size={24} />
        </Button>
      </View>

      {/* {validationMessage && (
        <View className="rounded-lg bg-fill-secondary px-4 py-3">
          <Text variant="body" className="text-content-tertiary">
            {validationMessage}
          </Text>
        </View>
      )} */}

      {displayError && (
        <View className="rounded-lg bg-fill-secondary px-4 py-3">
          <Text variant="small" className="text-content-tertiary mb-1">
            {isNetworkFailed ? 'NETWORK ERROR MESSAGE' : 'ERROR'}
          </Text>
          <Text variant="body" className="text-content-primary">
            {displayError}
          </Text>
          {lastSignature && (
            <Pressable onPress={handleViewSolscan} className="mt-2">
              <Text variant="smallBold" className="text-content-tertiary ">
                View transaction on{' '}
              </Text>
              <SolscanIcon color={contentTertiaryColor} />
              <Text variant="smallBold" className="text-content-tertiary ">
                Solscan
              </Text>
              <LeaveIcon size={24} color={contentTertiaryColor} />
            </Pressable>
          )}
        </View>
      )}

      {isProcessing && (
        <Button variant="gray" size="xl" className="w-full rounded-full py-4">
          <ActivityIndicator size="small" color={contentPrimaryColor} />
          <Text variant="body" className="text-content-primary ml-2">
            Processing Transaction
          </Text>
        </Button>
      )}

      {validationMessage && (
        <Button variant="gray" size="xl" disabled={true}>
          <Text variant="body">{validationMessage}</Text>
        </Button>
      )}

      {status === 'idle' && !validationMessage && (
        <Button
          variant="default"
          size="xl"
          onPress={handleConfirmStake}
          disabled={!canSubmit}
          className="w-full rounded-full py-4 disabled:opacity-60"
        >
          <Text variant="body">Confirm Stake</Text>
        </Button>
      )}

      {isFailed && (
        <Button variant="destructive" size="xl" onPress={handleTryAgain} className="w-full rounded-full py-4">
          <Text variant="body">
            {retryCountdown > 0 ? `Transaction Failed! Try in ${retryCountdown}s...` : 'Transaction Failed! Try again'}
          </Text>
        </Button>
      )}

      {isNetworkFailed && (
        <Button variant="destructive" size="xl" onPress={handleTryAgain} className="w-full rounded-full py-4">
          <Text variant="body">Network Failed! Try again</Text>
        </Button>
      )}
    </View>
  )
}
