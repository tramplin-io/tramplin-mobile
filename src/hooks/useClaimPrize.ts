import { useCallback, useState } from 'react'
import {
  appendTransactionMessageInstructions,
  compileTransaction,
  createTransactionMessage,
  pipe,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  type Signature,
  type Transaction,
  type TransactionSigner,
} from '@solana/kit'
import { useMobileWallet } from '@wallet-ui/react-native-kit'

import { signatureToBase58 } from '@/utils/format'
import { batchInstructions, prepareClaimInstruction, rpc, type Winner } from '@/utils/solana'
import { isCancellationError } from '@/utils/wallet'

import { useDrawWins } from './useDrawWins'

type UseClaimPrizeReturn = {
  claim: (winners: Winner[]) => Promise<Signature[]>
  signatures: Signature[] | null
  status: 'idle' | 'pending' | 'success' | 'error'
  error: Error | null
  isClaiming: boolean
  claimingWinners: Winner[]
  reset: () => void
}

export function useClaimPrize(): UseClaimPrizeReturn {
  const { account, signAndSendTransaction } = useMobileWallet()
  const { removeWins } = useDrawWins()

  const [signatures, setSignatures] = useState<Signature[] | null>(null)
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [error, setError] = useState<Error | null>(null)
  const [claimingWinners, setClaimingWinners] = useState<Winner[]>([])

  const claim = useCallback(
    async (winners: Winner[]): Promise<Signature[]> => {
      if (!account) throw new Error('Wallet not connected')

      setClaimingWinners(winners)
      setError(null)
      setStatus('pending')

      const instructions = await Promise.all(winners.map((w) => prepareClaimInstruction(w, account.address)))

      // Use address-only mock signer for batch size calculation — signing happens via signAndSendTransaction
      const mockSigner = { address: account.address } as TransactionSigner
      const batches = batchInstructions(instructions, mockSigner)
      const collectedSignatures: Signature[] = []

      try {
        for (const batch of batches) {
          const latest = await rpc.getLatestBlockhash().send()
          const latestBlockhash = latest.value
          const minContextSlot = BigInt(latest.context.slot)

          const txMessage = pipe(
            createTransactionMessage({ version: 0 }),
            (msg) => setTransactionMessageFeePayer(account.address, msg),
            (msg) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, msg),
            (msg) => appendTransactionMessageInstructions(batch.instructions, msg),
          )

          const compiledTx = compileTransaction(txMessage) as unknown as Transaction
          const sigs = await signAndSendTransaction(compiledTx, minContextSlot)

          if (!sigs?.length) throw new Error('Transaction was not sent (rejected or empty response)')

          const sigBytes = sigs[0] as Uint8Array
          const signature = signatureToBase58(sigBytes) as Signature
          collectedSignatures.push(signature)

          // Optimistically remove current batch from cache
          const batchWinners = batch.indices.flatMap((i) => (winners[i] ? [winners[i]] : []))
          removeWins(batchWinners)

          const batchWinnerIds = new Set(batchWinners.map((bw) => `${bw.epochOrSlot}-${bw.winnerId}`))
          setClaimingWinners((prev) => prev.filter((w) => !batchWinnerIds.has(`${w.epochOrSlot}-${w.winnerId}`)))
        }

        setSignatures(collectedSignatures)
        setStatus('success')
        setClaimingWinners([])
        return collectedSignatures
      } catch (err) {
        setClaimingWinners([])

        if (isCancellationError(err)) {
          const cancelError = new Error('Transaction cancelled')
          setError(cancelError)
          setStatus('error')
          throw cancelError
        }

        const finalError = err instanceof Error ? err : new Error(String(err))
        console.error('Claim failed:', finalError)
        setError(finalError)
        setStatus('error')
        throw finalError
      }
    },
    [account, signAndSendTransaction, removeWins],
  )

  const reset = useCallback(() => {
    setError(null)
    setSignatures(null)
    setStatus('idle')
    setClaimingWinners([])
  }, [])

  return {
    claim,
    signatures,
    status,
    error,
    isClaiming: status === 'pending',
    claimingWinners,
    reset,
  }
}
