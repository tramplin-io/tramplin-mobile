# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev              # Start Expo with dev-client and reset-cache
npm run ios              # Run on iOS simulator
npm run android          # Run on Android emulator/device

# Type checking & linting
npm run ts:check         # TypeScript strict mode check (noEmit)
npm run lint             # ESLint with auto-fix
npm run lint:check       # ESLint without auto-fix (CI mode)
npm run fmt              # Prettier format
npm run fmt:check        # Prettier check (CI mode)

# CI pipeline
npm run ci               # tsc + lint:check + fmt:check + android:build

# API code generation (run after backend OpenAPI spec changes)
npm run generate-api     # Orval: regenerates src/lib/api/generated/ — do not manually edit generated files

# Builds
npm run android:build:preview            # EAS remote build (preview profile)
npm run android:build:local:preview      # Local EAS build (preview profile)
npm run android:build:local:production   # Local EAS build (production profile)
```

Pre-commit hooks run `biome check --write` and `biome format --write` automatically via lint-staged.

## Architecture Overview

### Routing (Expo Router — file-based)

`src/app/` is the route tree:
- `_layout.tsx` — Root layout: initializes API/auth, wraps with `AppProviders`, mounts `AuthGuard`
- `tabs/_layout.tsx` — Bottom tabs (Home/Stake, Leaderboard, Rewards, FAQ, Settings) + `StakeModal`
- `greeting/` — Onboarding flow
- `screens/` — Modal/stack screens (subscription, contact-us, notification-settings, etc.)
- `no-internet/` — Offline fallback

`AuthGuard` in `src/components/auth-guard.tsx` controls redirects based on auth and onboarding state.

### State Management (three layers)

1. **React Query** — All server/async state. Generated Orval hooks are the primary data-fetching interface. Queries are prefetched during splash screen in `_layout.tsx` via `initializeApi()`.
2. **Zustand** (`src/lib/stores/`) — Global client state, persisted to AsyncStorage:
   - `useAuthStore` — token, session, login/logout
   - `useProfileStore` — user profile, `fetchUserProfile()`
   - `useThemeStore` — theme mode
   - `useDeveloperStore` — debug overlays and dev flags
3. **Local `useState`** — Component-level UI state only

### API Layer (`src/lib/api/`)

- **Generated code** (`generated/`, `generated-referrals/`) — Output of Orval from OpenAPI spec. **Never edit manually.** Regenerate with `npm run generate-api`.
- **Axios instances** (`mutator/`) — Two instances: `customInstance` (main API) and `referralsInstance` (referrals API). Auth token is injected via interceptor from `token-store.ts`.
- **Token store** (`token-store.ts`) — Non-React module that holds the in-memory token, breaking circular dependency between `useAuthStore` and Axios.
- Import generated hooks from `@/lib/api/generated/restApi`, not from the generated files directly.

### Solana / Blockchain (`src/lib/solana/`, `src/hooks/useStake.ts`, `src/hooks/useUnstake.ts`)

Uses `@solana/kit` v5 and `@wallet-ui/react-native-kit` for wallet connection. Key constants (RPC URL, program ID, validator vote key) come from `EXPO_PUBLIC_SOLANA_*` env vars.

### Styling

- **Uniwind** (Tailwind CSS for React Native) — use `className` prop on all components, not `StyleSheet`.
- Design tokens defined in `src/global.css`. Access dynamic values via `useCSSVariable()` hook, not hardcoded colors.
- Do **not** use the `dark:` Tailwind prefix — theme switching is handled by CSS variable swapping.
- `cn()` utility from `src/lib/utils.ts` for conditional class merging (clsx + tailwind-merge).

### Code Conventions

- **TypeScript strict mode** — always use `interface` for object shapes, `type` for unions/intersections. Use `import type` for type-only imports.
- **Naming** — PascalCase components, camelCase hooks (prefix `use`), `UPPER_SNAKE_CASE` constants, kebab-case route files.
- **One component per file**, barrel exports via `index.ts` in each folder. Keep files under ~200 lines.
- **No semicolons**, single quotes, trailing commas, 120 char print width (Prettier).
- **Git commits** follow Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`. Branches: `feat/`, `fix/`, `chore/`.

## Environment Variables

```
EXPO_PUBLIC_API_URL                    # Main backend API
EXPO_PUBLIC_REFERRALS_API_URL          # Referrals API
EXPO_PUBLIC_SOLANA_NETWORK             # "mainnet-beta" or "devnet"
EXPO_PUBLIC_SOLANA_RPC_URL             # Helius or other RPC
EXPO_PUBLIC_SOLANA_VALIDATOR_VOTE_KEY
EXPO_PUBLIC_SOLANA_PROGRAM_ID
EXPO_PUBLIC_SENTRY_DSN
EXPO_PUBLIC_TELEGRAM_BOT_NAME
EXPO_PUBLIC_ENABLE_CHARLES_PROXY       # Dev HTTP proxy
EXPO_PUBLIC_USE_DEV                    # Dev-mode flag
```

`.env` is auto-created from `.env.example` on `postinstall` if missing.

## EAS Build Profiles

- **development** — dev API, Charles proxy enabled, dev-client
- **preview** — staging API, internal distribution
- **production** — prod API, auto-increment version
