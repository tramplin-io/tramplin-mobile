# UI Components — Implementation Guide

Components in `src/components/ui/`. Each should follow existing patterns:

- Tailwind classes via `className` prop (Uniwind)
- Light + dark theme support (`dark:` variants)
- TypeScript with exported interface for props
- JSDoc with `@example`

---

## Done (implemented)

| Component     | File            | Notes                                                                                                                                                                    |
| ------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Avatar**    | `avatar.tsx`    | Composable: `Avatar`, `AvatarImage`, `AvatarFallback`. Use with `AvatarImage` + `AvatarFallback` for image + initials. Sizes via `className` (e.g. `size-8`, `size-12`). |
| **Input**     | `input.tsx`     | Themed `TextInput` primitive. Compose with `Label` and error text for full form field (label/error not built-in).                                                        |
| **Switch**    | `switch.tsx`    | Themed switch; use with `Label` for "label + switch" row.                                                                                                                |
| **Checkbox**  | `checkbox.tsx`  | Themed checkbox; use with `Label` for "label + checkbox" row.                                                                                                            |
| **Skeleton**  | `skeleton.tsx`  | Pulsing opacity animation; supports `className`, width/height via style or className.                                                                                    |
| **Accordion** | `accordion.tsx` | Full API: `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`; chevron + animated height.                                                               |
| **Modal**     | `dialog.tsx`    | Use `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogClose` for overlay + centered content; backdrop dismiss.                                          |
| **Divider**   | `separator.tsx` | Use `<Separator />` (default horizontal) for thin line; `orientation="vertical"` for vertical.                                                                           |

**Form primitives also available:** `Label` (`label.tsx`), `Text` (`text.tsx`), `Textarea` (`textarea.tsx`).

---

## To do (not yet implemented)

### Layout

- **Header.tsx**
  - **Props:** `title`, `showBack?`, `rightAction?` (ReactNode), `onBack?`
  - **Layout:** Row with optional back arrow, centered title, optional right slot
  - **Behavior:** Back button calls `router.back()` from expo-router
  - **Usage:** Top of every screen in `(screens)/` group, optional in tabs

- **Divider.tsx** (optional)
  - **Status:** Use `Separator` from `separator.tsx` as the divider. Add a thin wrapper or alias only if you want a dedicated `Divider` export (e.g. default `className`: `my-4`).

---

### Data display

- **StatCard.tsx**
  - **Props:** `label`, `value` (string | number), `icon?`, `trend?` (up/down/neutral)
  - **Layout:** Card with large value on top, label below, optional icon/trend indicator
  - **Usage:** Community stats grid (2 columns), dashboard summary

- **ListItem.tsx**
  - **Props:** `title`, `subtitle?`, `icon?` (ReactNode), `rightElement?`, `onPress?`, `showChevron?`
  - **Layout:** Row: [icon] [title + subtitle] [rightElement | chevron]
  - **Usage:** Profile settings menu, notification items, leaderboard rows
  - **Classes:** `py-3 flex-row items-center` + Pressable with active state

- **EmptyState.tsx**
  - **Props:** `icon?` (string emoji or ReactNode), `title`, `description?`, `actionLabel?`, `onAction?`
  - **Layout:** Centered: icon, title, description, optional CTA button
  - **Usage:** Empty notifications, empty community, search with no results

- **NotificationItem.tsx**
  - **Props:** `title`, `description`, `timestamp` (Date), `read?` (boolean), `icon?`, `onPress?`
  - **Layout:** Row: [icon/dot] [title + description + time] — unread has accent indicator
  - **Usage:** Notifications tab FlatList items

---

### Navigation

- **Stepper.tsx**
  - **Props:** `steps` (number), `currentStep` (number), `className?`
  - **Layout:** Row of dots: filled for completed/current, outline for future
  - **Colors:** Active = primary, inactive = text-tertiary
  - **Usage:** Onboarding greeting screen step indicator

---

## Implementation order (recommended)

1. **Header, ListItem** — needed by Profile tab and all `(screens)/` pages (use `Separator` for dividers).
2. **Input + Label** — already exist; add a small **FormField** wrapper with `label`, `error`, and `Input` if you want a single component for forms.
3. **Avatar** — done; use in Profile, welcome, community.
4. **StatCard, EmptyState** — Home tab, Community tab, Notifications tab.
5. **Stepper** — onboarding greeting.
6. **Modal, Accordion** — done (use `Dialog` and `accordion.tsx`).
7. **NotificationItem** — Notifications tab polish.

---

## Other components in this folder (not in original spec)

Present and usable; add to barrel export (`index.ts`) as needed:

- **Layout / structure:** `Card.tsx`, `Container.tsx`, `separator.tsx`, `aspect-ratio.tsx`, `collapsible.tsx`
- **Form / display:** `Button.tsx`, `Badge.tsx`, `label.tsx`, `text.tsx`, `textarea.tsx`, `radio-group.tsx`, `select.tsx`, `progress.tsx`
- **Overlays / feedback:** `alert.tsx`, `alert-dialog.tsx`, `tooltip.tsx`, `popover.tsx`, `hover-card.tsx`, `dropdown-menu.tsx`, `context-menu.tsx`, `menubar.tsx`
- **Misc:** `ThemeSwitcher.tsx`, `tabs.tsx`, `toggle.tsx`, `toggle-group.tsx`, `icon.tsx`, `native-only-animated-view.tsx`
