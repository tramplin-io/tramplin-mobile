# Tramplin Mobile — Implementation Plan

**Last recheck:** Structure aligned with current codebase: `splash/`, `greeting/` (with slides), `tabs` (Stake, Leader, Q&A), `profile/`, `terms/`, `screens/`, `lib/network/`, `components/general/` and `components/profile/`. UI checklist synced with `src/components/ui/TODO.md`; hooks/stores and auth-guard wiring still pending.

## Architecture Overview

```
src/
  app/                          # Expo Router (file-based routing)
    auth/                       # Auth flow (wallet sign-in)
    splash/                     # Splash screen (index)
    greeting/                   # First-time user flow
      slides/                   # Slide1–Slide8 + index
      index.tsx                 # Greeting entry
    tabs/                       # Main app with bottom tabs
      index.tsx                 # Stake tab
      leaderboard.tsx           # Leader tab
      questions.tsx             # Q&A tab
      profile.tsx               # Profile tab
      _layout.tsx               # Tab bar (Stake, Leader, Q&A)
    profile/                    # Profile stack/screen (index)
    screens/                    # Stack screens (edit-profile, settings, etc.)
    terms/                      # Legal: terms.tsx, privacy.tsx
    no-internet/                # Offline screen (index)
    index.tsx                   # Entry — redirects based on auth/onboarding state
    _layout.tsx                 # Root layout (providers, splash, toast)
  components/
    ui/                         # Reusable themed UI (see ui/TODO.md)
    wallet/                     # Wallet-specific components
    icons/                      # Icon components
    general/                    # Header, HeaderGrating, WalletIdenticon, UserIcon
    profile/                    # LogDisplay, ContactUs, DeveloperPanel
    app-providers.tsx           # Provider tree wrapper
    app-theme.tsx               # Theme provider
    error-boundary.tsx          # Error boundary
    auth-guard.tsx              # Auth redirect logic (exists; wire in index)
  hooks/                        # Custom hooks + Zustand stores
  constants/                    # App config, theme, Solana constants
  types/                        # TypeScript types
  utils/                        # Helpers (format, storage)
  lib/
    api/                        # API layer (Orval, Axios, token store)
    network/                    # Network status (e.g. useNetworkStatus)
    utils.ts                    # Shared utils (e.g. cn)
  assets/                       # Static files (images, svg, videos, fonts)
```

---

## Implementation Priority

### P0 — Foundation (do first)

| Task                                                      | Files                                      | Depends On                        |
| --------------------------------------------------------- | ------------------------------------------ | --------------------------------- |
| Core UI: Header, Input, ListItem, Avatar, Switch, Divider | `src/components/ui/`, `general/Header.tsx` | See `ui/TODO.md`                  |
| Auth store (useAuthStore)                                 | `src/hooks/useAuthStore.ts`                | Zustand, AsyncStorage, tokenStore |
| Onboarding store (useOnboardingStore)                     | `src/hooks/useOnboardingStore.ts`          | Zustand, AsyncStorage             |
| Profile store (useProfileStore)                           | `src/hooks/useProfileStore.ts`             | Zustand, AsyncStorage             |
| Network status hook                                       | `src/hooks/useNetworkStatus.ts`            | expo-network, lib/network         |
| Auth guard component                                      | `src/components/auth-guard.tsx`            | useAuthStore, useOnboardingStore  |
| Wire up entry redirect                                    | `src/app/index.tsx`                        | Auth guard, stores                |

### P1 — Auth & Onboarding

| Task                            | Files                                    | Depends On                    |
| ------------------------------- | ---------------------------------------- | ----------------------------- |
| Sign-in screen (wallet connect) | `src/app/auth/sign-in.tsx`               | ConnectButton, useAuthStore   |
| Splash screen                   | `src/app/splash/index.tsx`               | Brand assets, optional Lottie |
| Greeting flow (slides)          | `src/app/greeting/index.tsx` + `slides/` | Stepper, illustrations        |
| Manifesto / final onboarding    | In greeting or dedicated screen          | Static content                |

### P2 — Main Tabs

| Task                                    | Files                          | Depends On                                  |
| --------------------------------------- | ------------------------------ | ------------------------------------------- |
| Stake tab                               | `src/app/tabs/index.tsx`       | AccountInfo, Header                         |
| Leaderboard tab                         | `src/app/tabs/leaderboard.tsx` | StatCard, ListItem, API data                |
| Q&A tab                                 | `src/app/tabs/questions.tsx`   | Accordion, EmptyState                       |
| Profile tab                             | `src/app/tabs/profile.tsx`     | Avatar, ListItem, Divider                   |
| Tab bar icons                           | `src/app/tabs/_layout.tsx`     | icons (BigCupIcon, LogoSmall, QuestionIcon) |
| Extra UI: StatCard, EmptyState, Stepper | `src/components/ui/`           | See `ui/TODO.md`                            |

### P3 — Profile & Screens

| Task                  | Files                                       | Depends On                    |
| --------------------- | ------------------------------------------- | ----------------------------- |
| Profile screen        | `src/app/profile/index.tsx`                 | Avatar, ListItem              |
| Edit profile form     | `src/app/screens/edit-profile.tsx`          | Input, Avatar, API mutation   |
| Notification settings | `src/app/screens/notification-settings.tsx` | Switch, ListItem              |
| Contact us form       | `src/app/screens/contact-us.tsx`            | Input, Button                 |
| Q&A / FAQ             | `src/app/screens/qna.tsx`                   | Accordion                     |
| Terms of use          | `src/app/terms/terms.tsx`                   | Static or API content         |
| Privacy policy        | `src/app/terms/privacy.tsx`                 | Static or API content         |
| Delete account flow   | `src/app/screens/delete-account.tsx`        | [To create] Modal, Input, API |
| No internet screen    | `src/app/no-internet/index.tsx`             | EmptyState, useNetworkStatus  |

### P4 — Polish & Extras

| Task                    | Files                             | Depends On         |
| ----------------------- | --------------------------------- | ------------------ |
| Skeleton loading states | `src/components/ui/skeleton.tsx`  | (done)             |
| Modal / Dialog          | `src/components/ui/dialog.tsx`    | (done)             |
| Accordion animation     | `src/components/ui/accordion.tsx` | (done)             |
| Push notifications      | `src/hooks/useNotifications.ts`   | expo-notifications |
| Custom fonts            | `src/hooks/useFonts.ts`           | expo-font          |

---

## Dependencies to Install (per phase)

### P0 — Foundation

```bash
npx expo install expo-network
```

(As of recheck, `expo-network` may need to be added if not in package.json.)

### P1 — Onboarding

```bash
# Optional for animated splash:
npx expo install lottie-react-native
```

### P4 — Polish

```bash
npx expo install expo-notifications expo-font
```

---

## Key Patterns to Follow

1. **Every page file has a TODO block** — read it before implementing.
2. **UI components** — see `src/components/ui/TODO.md` for specs. Header lives in `src/components/general/Header.tsx`.
3. **Stores** — see TODO block in `src/hooks/index.ts` for specs.
4. **Auth flow** — see TODO blocks in `src/app/_layout.tsx` and `src/app/index.tsx`.
5. **API calls** — use Orval-generated hooks (see `.cursor/rules/api-and-orval.mdc`).
6. **Styling** — use Uniwind classes with design tokens from `global.css`; theme switches via `@variant light` / `@variant dark` — **do not** use `dark:` variants for theme tokens (see `.cursor/rules/ui-and-styling.mdc`).
7. **Commits** — use conventional commits (see `.cursor/rules/git-usage.mdc`).

---

## File Checklist

### Route Files (current structure)

- [x] `src/app/index.tsx` — entry redirect
- [x] `src/app/_layout.tsx` — root layout
- [x] `src/app/no-internet/index.tsx`
- [x] `src/app/auth/_layout.tsx`
- [x] `src/app/auth/sign-in.tsx`
- [x] `src/app/splash/index.tsx`
- [x] `src/app/greeting/index.tsx`
- [x] `src/app/greeting/slides/` (Slide1–Slide8, index)
- [x] `src/app/tabs/_layout.tsx`
- [x] `src/app/tabs/index.tsx` — Stake
- [x] `src/app/tabs/leaderboard.tsx`
- [x] `src/app/tabs/questions.tsx`
- [x] `src/app/tabs/profile.tsx`
- [x] `src/app/profile/index.tsx`
- [x] `src/app/screens/edit-profile.tsx`
- [x] `src/app/screens/notification-settings.tsx`
- [x] `src/app/screens/contact-us.tsx`
- [x] `src/app/screens/qna.tsx`
- [x] `src/app/terms/terms.tsx`
- [x] `src/app/terms/privacy.tsx`
- [ ] `src/app/screens/delete-account.tsx` — to create

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
- [x] **Header** — `src/components/general/Header.tsx`, `HeaderGrating.tsx`

Still to implement (UI):

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

- [x] auth-guard.tsx — component exists; wire in `src/app/index.tsx`
- [ ] Custom fonts setup (P4)
