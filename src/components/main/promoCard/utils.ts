const promoMobileMp4 = require('@/assets/videos/rewards/tramplin_card_promo_5x6(mobile).mp4')
const bigMobileMp4 = require('@/assets/videos/rewards/tramplin_card_big_5x6(mobile).mp4')

export const LAMPORTS_PER_SOL = 1_000_000_000
export const TAB_BAR_HEIGHT = 0

export const videoSources: Record<'active' | 'completed' | 'upcoming', number> = {
  active: promoMobileMp4,
  completed: bigMobileMp4,
  upcoming: promoMobileMp4,
}

export const peekBg: Record<'active' | 'completed' | 'upcoming', string> = {
  active: 'bg-white',
  completed: 'bg-reward-large-secondary',
  upcoming: 'bg-white',
}

export function formatWithCommas(n: number): string {
  return Math.round(n).toLocaleString('en-US')
}

export function formatResultsDate(dateStr: string | undefined): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const day = date.getDate()
  const month = date.toLocaleString('en-US', { month: 'short' })
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${day} ${month}, ${hours}:${minutes}`
}
