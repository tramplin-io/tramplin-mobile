// import { assert } from './utils'

// // Support both EXPO_PUBLIC_* (mobile) and plain env vars (web/CI)
// const SOLANA_NETWORK =
//   process.env.EXPO_PUBLIC_SOLANA_NETWORK ?? process.env.SOLANA_NETWORK
// const SOLANA_RPC_URL =
//   process.env.EXPO_PUBLIC_SOLANA_RPC_URL ?? process.env.SOLANA_RPC_URL ?? 'https://api.devnet.solana.com'
// const SOLANA_RPC_WS_URL = process.env.SOLANA_RPC_WS_URL ?? undefined
// const SOLANA_VALIDATOR_VOTE_KEY =
//   process.env.EXPO_PUBLIC_SOLANA_VALIDATOR_VOTE_KEY ?? process.env.SOLANA_VALIDATOR_VOTE_KEY
// const SOLANA_PROGRAM_ID =
//   process.env.EXPO_PUBLIC_SOLANA_PROGRAM_ID ?? process.env.SOLANA_PROGRAM_ID
// const SNAPSHOTS_CDN_URL = process.env.TRAMPLIN_SNAPSHOTS_CDN_URL
// const STATS_CDN_URL = process.env.TRAMPLIN_STATS_CDN_URL
// const ASSETS_CDN_URL = process.env.TRAMPLIN_ASSETS_CDN_URL
// const USDSOL_API_URL = process.env.TRAMPLIN_USDSOL_API_URL
// const BIG_DRAW_TIME_HOUR_UTC = Number.parseInt(process.env.TRAMPLIN_BIG_DRAW_TIME_HOUR_UTC ?? '12', 10)
// const REFERRAL_API_URL = process.env.TRAMPLIN_REFERRAL_API_URL
// const FEATURE_CLAIM_ALL = process.env.FEATURE_CLAIM_ALL === '1' || process.env.FEATURE_CLAIM_ALL === 'true'
// const FEATURE_REFERRAL_LOGIN =
//   process.env.FEATURE_REFERRAL_LOGIN === '1' || process.env.FEATURE_REFERRAL_LOGIN === 'true'
// const API_URL = process.env.EXPO_PUBLIC_API_URL ?? process.env.TRAMPLIN_API_URL

// assert<string>(SOLANA_NETWORK)
// assert<string>(SOLANA_RPC_URL)
// assert<string>(SOLANA_VALIDATOR_VOTE_KEY)
// assert<string>(SOLANA_PROGRAM_ID)
// assert<string>(API_URL)

// export const config = {
//   DEV: process.env.DEV ?? (typeof __DEV__ === 'undefined' ? undefined : String(__DEV__)),
//   SOLANA_NETWORK,
//   SOLANA_RPC_URL,
//   SOLANA_RPC_WS_URL,
//   SOLANA_VALIDATOR_VOTE_KEY,
//   SOLANA_PROGRAM_ID,
//   SNAPSHOTS_CDN_URL,
//   ASSETS_CDN_URL,
//   USDSOL_API_URL,
//   API_URL,

//   USD_SOL_FALLBACK: 139,
//   MIN_INITIAL_STAKE_SOL: 1,
//   MIN_SUBSEQUENT_STAKE_SOL: 0.1,
//   FIRST_REGULAR_DRAW_EPOCH: 879n,
//   BIG_DRAW_EPOCHS: [897n, 899n, 900n, 906n, 907n, 908n, 909n, 910n, 912n, 914n, 916n, 918n, 920n, 922n, 924n],

//   BIG_DRAW_TIME_HOUR_UTC: Number.isNaN(BIG_DRAW_TIME_HOUR_UTC) ? 12 : BIG_DRAW_TIME_HOUR_UTC,
//   BIG_DRAW_COUNTDOWN_HOURS: 6,

//   SOCIAL_TG_LINK: 'https://t.me/Tramplin_io',
//   SOCIAL_X_LINK: 'https://x.com/Tramplin_io',
//   SOCIAL_DISCORD_LINK: 'https://discord.gg/tramplin',
//   SOCIAL_TIK_TOK_LINK: 'https://www.tiktok.com/@tramplin_io',
//   SOCIAL_BLOG_LINK: 'https://blog.tramplin.io',
//   VALIDATOR_LINK: 'https://solanabeach.io/validator/TRAMp1Z9EXyWQQNwNjjoNvVksMUHKioVU7ky61yNsEq',
//   AUDIT_LINK: 'https://github.com/mixbytes/audits_public/tree/master/Tramplin/Tramplin',
//   REFERRAL_API_URL,
//   REFERRAL_AUTH_ISSUER: 'tramplin-referrals-api',
//   REFERRAL_LOGIN_PAYLOAD: 'Log in to TramplinReferrals',
//   STATS_CDN_URL,
//   FEATURE_CLAIM_ALL,
//   FEATURE_REFERRAL_LOGIN,
// }

// if (config.DEV) {
//   ;(globalThis as Record<string, unknown>).config = config
// }

// export default config
