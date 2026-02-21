# Tramplin Mobile — Implementation Plan

**Last recheck:** Routes and file structure verified; UI checklist synced with `src/components/ui/TODO.md`; hooks/stores and auth-guard still pending.

## Architecture Overview

```
src/
  app/                          # Expo Router (file-based routing)
    auth/                       # Auth flow (wallet sign-in)
    onboarding/                 # First-time user flow (splash, greeting, manifesto)
    tabs/                       # Main app with bottom tabs (home, community, notifications, profile)
    screens/                    # Stack screens pushed from tabs (edit-profile, settings, etc.)
    no-internet.tsx             # Standalone offline screen
    index.tsx                   # Entry point — redirects based on auth/onboarding state
    _layout.tsx                 # Root layout (providers, splash, toast)
  components/
    ui/                         # Reusable themed UI components (see ui/TODO.md)
    wallet/                     # Wallet-specific components
    icons/                      # Icon components
    app-providers.tsx           # Provider tree wrapper
    app-theme.tsx               # Theme provider
    error-boundary.tsx          # Error boundary
    auth-guard.tsx              # [TODO] Auth redirect logic
  hooks/                        # Custom hooks + Zustand stores
  constants/                    # App config, theme, Solana constants
  types/                        # TypeScript types
  utils/                        # Helpers (format, storage, wallet)
  lib/api/                      # API layer (Orval, Axios, token store)
  assets/                       # Static files (images, svg, videos, fonts)
```

---

## Implementation Priority

### P0 — Foundation (do first)

| Task                                                      | Files                             | Depends On                        |
| --------------------------------------------------------- | --------------------------------- | --------------------------------- |
| Core UI: Header, Input, ListItem, Avatar, Switch, Divider | `src/components/ui/`              | See `ui/TODO.md`                  |
| Auth store (useAuthStore)                                 | `src/hooks/useAuthStore.ts`       | Zustand, AsyncStorage, tokenStore |
| Onboarding store (useOnboardingStore)                     | `src/hooks/useOnboardingStore.ts` | Zustand, AsyncStorage             |
| Profile store (useProfileStore)                           | `src/hooks/useProfileStore.ts`    | Zustand, AsyncStorage             |
| Network status hook                                       | `src/hooks/useNetworkStatus.ts`   | expo-network                      |
| Auth guard component                                      | `src/components/auth-guard.tsx`   | useAuthStore, useOnboardingStore  |
| Wire up entry redirect                                    | `src/app/index.tsx`               | Auth guard, stores                |

### P1 — Auth & Onboarding

| Task                            | Files                                | Depends On                       |
| ------------------------------- | ------------------------------------ | -------------------------------- |
| Sign-in screen (wallet connect) | `src/app/auth/sign-in.tsx`         | ConnectButton, useAuthStore      |
| Animated splash                 | `src/app/onboarding/splash.tsx`    | Brand assets, optional Lottie    |
| Greeting stepper (3 steps)      | `src/app/onboarding/greeting.tsx`  | Stepper component, illustrations |
| Manifesto screen                | `src/app/onboarding/manifesto.tsx` | Static content                   |

### P2 — Main Tabs

| Task                                    | Files                              | Depends On                      |
| --------------------------------------- | ---------------------------------- | ------------------------------- |
| Home / Dashboard tab                    | `src/app/tabs/index.tsx`         | AccountInfo, StatCard, Header   |
| Community Stats tab                     | `src/app/tabs/community.tsx`     | StatCard, ListItem, API data    |
| Notifications tab                       | `src/app/tabs/notifications.tsx` | NotificationItem, EmptyState    |
| Profile tab                             | `src/app/tabs/profile.tsx`       | Avatar, ListItem, Divider       |
| Tab bar icons                           | `src/app/tabs/_layout.tsx`       | @expo/vector-icons or SVG icons |
| Extra UI: StatCard, EmptyState, Stepper | `src/components/ui/`               | See `ui/TODO.md`                |

### P3 — Profile Sub-screens

| Task                  | Files                                         | Depends On                   |
| --------------------- | --------------------------------------------- | ---------------------------- |
| Edit profile form     | `src/app/screens/edit-profile.tsx`          | Input, Avatar, API mutation  |
| Notification settings | `src/app/screens/notification-settings.tsx` | Switch, ListItem             |
| Contact us form       | `src/app/screens/contact-us.tsx`            | Input, Button                |
| Terms of use          | `src/app/screens/terms.tsx`                 | Static or API content        |
| Privacy policy        | `src/app/screens/privacy.tsx`               | Static or API content        |
| Delete account flow   | `src/app/screens/delete-account.tsx`        | Modal, Input, API mutation   |
| Q&A / FAQ             | `src/app/screens/qna.tsx`                   | Accordion                    |
| No internet screen    | `src/app/no-internet.tsx`                     | EmptyState, useNetworkStatus |

### P4 — Polish & Extras

| Task                    | Files                             | Depends On              |
| ----------------------- | --------------------------------- | ----------------------- |
| Skeleton loading states | `src/components/ui/skeleton.tsx`  | react-native-reanimated |
| Modal / Dialog          | `src/components/ui/dialog.tsx`    | (done)                  |
| Accordion animation     | `src/components/ui/accordion.tsx` | react-native-reanimated |
| Push notifications      | `src/hooks/useNotifications.ts`   | expo-notifications      |
| Custom fonts            | `src/hooks/useFonts.ts`           | expo-font               |
| Tab bar icon SVGs       | `src/components/icons/`           | react-native-svg        |

---

## Dependencies to Install (per phase)

### P0 — Already installed

All current deps are sufficient for P0. `react-native-reanimated` is used by UI (e.g. `skeleton.tsx`, `accordion.tsx`) and is typically provided by `@rn-primitives/*`.

### P1 — Onboarding

```bash
npx expo install expo-network
# Optional for animated splash:
npx expo install lottie-react-native react-native-reanimated
```

(As of recheck, `expo-network` is not yet in package.json.)

### P2 — Main tabs

```bash
npx expo install @expo/vector-icons
# Already included with Expo, but verify
```

### P4 — Polish

```bash
npx expo install expo-notifications expo-font
# react-native-reanimated: from P1 or via @rn-primitives
```

(As of recheck, `expo-notifications` and `expo-font` are not yet in package.json.)

---

## Key Patterns to Follow

1. **Every page file has a TODO block** — read it before implementing
2. **UI components** — see `src/components/ui/TODO.md` for specs
3. **Stores** — see TODO block in `src/hooks/index.ts` for specs
4. **Auth flow** — see TODO blocks in `src/app/_layout.tsx` and `src/app/index.tsx`
5. **API calls** — use Orval-generated hooks (see `.cursor/rules/api-and-orval.mdc`)
6. **Styling** — always use Uniwind classes with `dark:` variants (see `.cursor/rules/ui-and-styling.mdc`)
7. **Commits** — use conventional commits (see `.cursor/rules/git-usage.mdc`)

---

## File Checklist

### Route Files (all created with TODO instructions)

- [x] `src/app/index.tsx` — entry redirect
- [x] `src/app/_layout.tsx` — root layout
- [x] `src/app/no-internet.tsx`
- [x] `src/app/auth/_layout.tsx`
- [x] `src/app/auth/sign-in.tsx`
- [x] `src/app/onboarding/_layout.tsx`
- [x] `src/app/onboarding/splash.tsx`
- [x] `src/app/onboarding/greeting.tsx`
- [x] `src/app/onboarding/manifesto.tsx`
- [x] `src/app/tabs/_layout.tsx`
- [x] `src/app/tabs/index.tsx`
- [x] `src/app/tabs/community.tsx`
- [x] `src/app/tabs/notifications.tsx`
- [x] `src/app/tabs/profile.tsx`
- [x] `src/app/screens/_layout.tsx`
- [x] `src/app/screens/edit-profile.tsx`
- [x] `src/app/screens/notification-settings.tsx`
- [x] `src/app/screens/contact-us.tsx`
- [x] `src/app/screens/qna.tsx`
- [x] `src/app/screens/terms.tsx`
- [x] `src/app/screens/privacy.tsx`
- [x] `src/app/screens/delete-account.tsx`

### Components (see `src/components/ui/TODO.md`)

Implemented (use from `@/components/ui` or primitives):

- [x] **Avatar** — `avatar.tsx`
- [x] **Divider** — use `Separator` from `separator.tsx`
- [x] **Input** — `input.tsx`
- [x] **Switch** — `switch.tsx`
- [x] **Checkbox** — `checkbox.tsx`
- [x] **Modal** — use `Dialog` from `dialog.tsx`
- [x] **Skeleton** — `skeleton.tsx`
- [x] **Accordion** — `accordion.tsx`

Still to implement:

- [ ] Header
- [ ] StatCard
- [ ] ListItem
- [ ] EmptyState
- [ ] NotificationItem
- [ ] Stepper

### Hooks/Stores (see `src/hooks/index.ts` TODO)

Existing: `useTheme`, `useThemeStore`, `useWalletBalance`, `useWalletActions`, `useCopyToClipboard`.

To create:

- [ ] useAuthStore
- [ ] useProfileStore
- [ ] useOnboardingStore
- [ ] useNetworkStatus
- [ ] useNotifications (P4)

### Other

- [ ] auth-guard.tsx — redirect logic (auth/onboarding); not yet created
- [ ] Custom fonts setup (P4)
- [ ] Tab bar SVG icons (P4)
