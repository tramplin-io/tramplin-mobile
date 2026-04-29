# Dashboard Rewards Components — React Native Conversion

**Date:** 2026-04-29  
**Scope:** Convert `Countdown.tsx`, `DashboardCard.tsx`, and `DashboardCards.tsx` from web React (react-router-dom, HTML elements) to React Native (expo-router, RN primitives). Reference pattern: `RewardCardBig.tsx` / `RewardCardStack.tsx`.

---

## Approach

Minimal 1-for-1 translation (Option A). No new abstractions. Props API stays identical where possible; `aboutLink: string` is removed from `DashboardCard` (replaced by a fixed `/tabs/faq` navigation). Video always plays (no `shouldPlayVideo` flag).

---

## Countdown.tsx

**Changes:**
- Replace outer `<span className="flex items-end">` → `<View className="flex-row items-end">`
- All `<span>` → `<Text>` from `@/components/ui/text`
- `&nbsp;` HTML entities → `{' '}` plain space inside Text
- Remove `react-native` is not currently imported — add `View` import
- All timer/state logic (useEffect, useState, useRef) is unchanged

---

## DashboardCard.tsx

**Removed imports:**
- `Link` from `react-router-dom`
- `VideoBackground`, `VideoSource` from `./VideoBackground` (web-only)
- `ForwardArrowIcon`, `InfoCircleIcon` from `@/components/icons` (don't exist in RN icons file)

**Added imports:**
- `View`, `Pressable`, `StyleSheet` from `react-native`
- `useVideoPlayer`, `VideoView` from `expo-video`
- `useRouter` from `expo-router`
- `ForwardIcon` (replaces `ForwardArrowIcon`), `ImportantIcon` (replaces `InfoCircleIcon`) from `@/components/icons/icons`

**Kept imports:**
- `Tooltip`, `TooltipContent`, `TooltipTrigger` from `@/components/ui/tooltip` — already RN-compatible via `@rn-primitives`
- `Countdown` (converted separately)
- `DrawType` type, `cn`

**Structural changes:**

| Web | React Native |
|-----|-------------|
| `<div className="relative w-[220px] h-[263px] ...">` | `<View style={styles.card}>` |
| `<div className="absolute inset-0 ...">` | `<View style={StyleSheet.absoluteFillObject} className="rounded-[10px] overflow-hidden ...">` |
| `VideoBackground` | Private `DashboardCardVideo` component using `useVideoPlayer` + `VideoView` (same pattern as `RewardCardBig`) |
| `<div className="absolute top-2.5 ...">` | `<View className="absolute top-2.5 ...">` |
| `<Link to={aboutLink}>About...</Link>` | `<Pressable onPress={() => router.push('/tabs/faq')}>` + `<Text>` |
| `<ForwardArrowIcon>` | `<ForwardIcon>` |
| `<InfoCircleIcon>` | `<ImportantIcon>` |
| `md:` / `lg:` responsive prefixes | Removed (mobile only) |

**Props change:** `aboutLink: string` prop is removed. Navigation is hardcoded to `router.push('/tabs/faq')`.

**Card dimensions:** `StyleSheet.create({ card: { width: 220, height: 263 } })` — matches web mobile baseline.

**Private component:**
```
function DashboardCardVideo({ source }: { source: number }) {
  const player = useVideoPlayer(source, (p) => { p.loop = true; p.muted = true; p.play() })
  return <VideoView player={player} style={StyleSheet.absoluteFillObject} contentFit="cover" nativeControls={false} />
}
```

---

## DashboardCards.tsx

**Removed imports:**
- `Carousel`, `CarouselContent`, `CarouselItem` from `@/components/ui/carousel`

**Added imports:**
- `ScrollView`, `View` from `react-native`

**Structural changes:**

| Web | React Native |
|-----|-------------|
| `<Carousel opts={{ align: 'start' }}>` | `<ScrollView horizontal showsHorizontalScrollIndicator={false}>` |
| `<CarouselContent>` | `<View className="flex-row gap-2.5 px-4 py-1">` (inside ScrollView) |
| `<CarouselItem className="basis-[230px]">` | `<View style={{ width: 230 }}>` |

**Props change:** `DashboardCard` no longer receives `aboutLink` prop (removed above).

**Logic unchanged:** `useReadMyStats`, `useMemo`, `formatUsd`, all prize calculations.

---

## Files Not Touched

- `RewardCardBig.tsx`, `RewardCardStack.tsx`, `RewardCardRegular.tsx` — reference only
- `src/app/tabs/rewards.tsx` — no changes needed
- `src/components/rewards/index.ts` — no changes needed (exports remain the same)

---

## Out of Scope

- Hash-anchor deep-linking into the FAQ screen (not feasible in Expo Router without custom logic)
- Static image fallback / `shouldPlayVideo` flag — always-on video is the chosen approach
- Sharing the `DashboardCardVideo` helper across other card components (YAGNI)
