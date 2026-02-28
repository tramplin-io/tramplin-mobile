import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Linking, Pressable, View, type TextInput } from 'react-native'
import { useCSSVariable } from 'uniwind'

import { SolscanIcon } from '@/components/icons'
import { CheckIcon, LeaveIcon, SolanaIcon } from '@/components/icons/icons'
import { SolInput } from '@/components/stake/SolInput'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { LAMPORTS_PER_SOL } from '@/constants/solana'
import { useUnstake } from '@/hooks/useUnstake'
import { useUserStakeAccounts } from '@/hooks/useUserStakeAccounts'
import { useReadMyStats } from '@/lib/api/generated/restApi'
import { cn } from '@/lib/utils'
import { lamportsToSol } from '@/utils/format'
import { getSolscanTxUrl } from '@/utils/wallet'

const QUICK_AMOUNTS = [5, 10, 20] as const

export type UnstakeFormStatus = 'idle' | 'processing' | 'success' | 'failed' | 'network_failed'

type Props = Readonly<{
  onClose?: () => void
}>

export function UnstakeForm({ onClose }: Props) {
  const { data: stakeAccounts } = useUserStakeAccounts()
  const { unstake, isLoading } = useUnstake()
  const { refetch: refetchMyStats } = useReadMyStats()

  const inputRef = useRef<TextInput>(null)
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState<UnstakeFormStatus>('idle')
  const [displayError, setDisplayError] = useState<string | null>(null)
  const [retryCountdown, setRetryCountdown] = useState(0)
  const [lastSignature, setLastSignature] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(false)
  const [validationError, setValidationError] = useState<'min' | 'max' | null>(null)

  const contentPrimaryColor = useCSSVariable('--color-content-primary') as string | undefined
  const contentTertiaryColor = useCSSVariable('--color-content-tertiary') as string | undefined

  const totalLamports =
    stakeAccounts?.reduce((sum, acc) => {
      if (acc.state === 'active' || acc.state === 'activating') {
        return sum + acc.delegatedStake
      }
      return sum
    }, 0) ?? 0

  const maxSol = totalLamports > 0 ? Number(lamportsToSol(BigInt(totalLamports))) : 0
  const amountNum = Number.parseFloat(amount) || 0

  const validationMessage = validationError === 'max' ? 'Amount exceeds staked balance.' : null
  const canSubmit = status === 'idle' && isValid && !isLoading
  const isAboveMax = validationError === 'max'

  const handleQuickAmount = useCallback((value: number) => {
    setAmount(String(value))
    setDisplayError(null)
  }, [])

  const handleMax = useCallback(() => {
    if (maxSol > 0) {
      setAmount(lamportsToSol(BigInt(totalLamports)))
    }
    setDisplayError(null)
  }, [maxSol, totalLamports])

  const executeUnstake = useCallback(
    async (amountSol: number) => {
      try {
        const amountLamports = BigInt(Math.round(amountSol * Number(LAMPORTS_PER_SOL)))
        const result = await unstake({ amountLamports, stakeAccounts: stakeAccounts ?? [] })
        refetchMyStats()
        return { success: true, signature: result.signature }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        const networkError = /network|timeout|fetch|connection|not connected|not ready/i.test(msg)
        return { success: false, error: msg, networkError }
      }
    },
    [unstake, stakeAccounts, refetchMyStats],
  )

  const handleConfirmUnstake = useCallback(async () => {
    if (!canSubmit) return
    setStatus('processing')
    setDisplayError(null)

    const result = await executeUnstake(amountNum)

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
  }, [canSubmit, amountNum, executeUnstake])

  const handleTryAgain = useCallback(() => {
    setDisplayError(null)
    setLastSignature(null)
    setStatus('idle')
    setRetryCountdown(0)
  }, [])

  const handleViewSolscan = useCallback(() => {
    if (lastSignature) {
      Linking.openURL(getSolscanTxUrl(lastSignature, 'devnet'))
    }
  }, [lastSignature])

  useEffect(() => {
    if (status !== 'failed' || retryCountdown <= 0) return
    const t = setTimeout(() => setRetryCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [status, retryCountdown])

  const handleValidationChange = useCallback((valid: boolean, err: 'min' | 'max' | null) => {
    setIsValid(valid)
    setValidationError(err)
  }, [])

  const isNetworkFailed = status === 'network_failed'
  const isFailed = status === 'failed'
  const isProcessing = status === 'processing' && isLoading

  if (status === 'success') {
    return (
      <View className="gap-10 px-4 pb-8">
        <Text variant="h4" className="text-content-primary">
          Unstake
        </Text>
        <View className="items-center gap-2 pb-4">
          <View className="items-center gap-2 border-b border-content-tertiary pb-0">
            <View className="flex-row items-end gap-1">
              <Text variant="body" className="pb-2">
                ↓
              </Text>
              <Text variant="h2Digits">{amount}</Text>
              <View className="flex-row items-center pb-1">
                <Text variant="body">SOL</Text>
                <SolanaIcon size={24} />
                <Text variant="body">unstaked</Text>
              </View>
            </View>
          </View>
          {lastSignature && (
            <Pressable onPress={handleViewSolscan} className="mt-2 flex-row items-center">
              <Text variant="smallBold" className="text-content-tertiary">
                View transaction on{' '}
              </Text>
              <SolscanIcon color={contentTertiaryColor} />
              <Text variant="smallBold" className="text-content-tertiary">
                Solscan
              </Text>
              <LeaveIcon size={24} color={contentTertiaryColor} />
            </Pressable>
          )}
        </View>

        {onClose && (
          <Button variant="gray" size="xl" onPress={onClose}>
            <CheckIcon />
            <Text className="text-content-primary">Successful Unstake</Text>
          </Button>
        )}
      </View>
    )
  }

  return (
    <View className="gap-4 px-4 pb-8">
      <Text variant="h4" className="text-content-primary">
        Unstake
      </Text>

      <SolInput
        ref={inputRef}
        value={amount}
        onChange={setAmount}
        max={maxSol}
        disabled={isProcessing}
        onValidationChange={handleValidationChange}
      />

      <View className="flex-row flex-wrap justify-between gap-1 mb-10">
        <View className="flex-row flex-wrap gap-1">
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
            isAboveMax && 'border-critical-secondary bg-[linear-gradient(to_bottom,#E7E7E7,#FF9494)]',
          )}
        >
          <Text variant="smallBold" className="truncate text-content-primary">
            MAX {maxSol > 0 ? lamportsToSol(BigInt(totalLamports)) : '0'}
          </Text>
          <SolanaIcon size={24} />
        </Button>
      </View>

      {displayError && (
        <View className="rounded-lg bg-fill-secondary px-4 py-3">
          <Text variant="small" className="text-content-tertiary mb-1">
            {isNetworkFailed ? 'NETWORK ERROR' : 'ERROR'}
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
          onPress={handleConfirmUnstake}
          disabled={!canSubmit}
          className="w-full rounded-full py-4 disabled:opacity-60"
        >
          <Text variant="body">Confirm Unstake</Text>
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
