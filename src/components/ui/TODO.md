# UI Components — Implementation Guide

Components to create in `src/components/ui/`. Each should follow existing patterns:
- Tailwind classes via `className` prop (Uniwind)
- Light + dark theme support (`dark:` variants)
- TypeScript with exported interface for props
- JSDoc with `@example`

---

## Layout Components

### Header.tsx
- **Props:** `title`, `showBack?`, `rightAction?` (ReactNode), `onBack?`
- **Layout:** Row with optional back arrow, centered title, optional right slot
- **Behavior:** Back button calls `router.back()` from expo-router
- **Usage:** Top of every screen in `(screens)/` group, optional in tabs

### Divider.tsx
- **Props:** `className?`
- **Layout:** Thin horizontal line
- **Classes:** `h-px bg-border dark:bg-dark-border my-4`

---

## Data Display Components

### Avatar.tsx
- **Props:** `source?` (image URI), `name?` (for initials fallback), `size?: 'sm' | 'md' | 'lg'`
- **Layout:** Circular image or colored circle with initials
- **Sizes:** sm=32, md=48, lg=72
- **Fallback:** Generate initials from name, random bg color based on name hash

### StatCard.tsx
- **Props:** `label`, `value` (string | number), `icon?`, `trend?` (up/down/neutral)
- **Layout:** Card with large value on top, label below, optional icon/trend indicator
- **Usage:** Community stats grid (2 columns), dashboard summary

### ListItem.tsx
- **Props:** `title`, `subtitle?`, `icon?` (ReactNode), `rightElement?`, `onPress?`, `showChevron?`
- **Layout:** Row: [icon] [title + subtitle] [rightElement | chevron]
- **Usage:** Profile settings menu, notification items, leaderboard rows
- **Classes:** `py-3 flex-row items-center` + Pressable with active state

### EmptyState.tsx
- **Props:** `icon?` (string emoji or ReactNode), `title`, `description?`, `actionLabel?`, `onAction?`
- **Layout:** Centered: icon, title, description, optional CTA button
- **Usage:** Empty notifications, empty community, search with no results

### NotificationItem.tsx
- **Props:** `title`, `description`, `timestamp` (Date), `read?` (boolean), `icon?`, `onPress?`
- **Layout:** Row: [icon/dot] [title + description + time] — unread has accent indicator
- **Usage:** Notifications tab FlatList items

---

## Form Components

### Input.tsx
- **Props:** `label?`, `placeholder?`, `value`, `onChangeText`, `error?`, `secureTextEntry?`, `multiline?`, `disabled?`
- **Layout:** Label above, themed TextInput, error text below (red)
- **Classes:** Input: `border border-border dark:border-dark-border rounded-md px-3 py-2 bg-surface dark:bg-dark-surface text-text-primary dark:text-dark-text-primary`
- **Error state:** `border-error` ring, red error text below

### Switch.tsx
- **Props:** `label`, `value` (boolean), `onValueChange`, `disabled?`
- **Layout:** Row: [label text] [RN Switch component]
- **Colors:** trackColor matches theme, thumbColor = white
- **Usage:** Notification settings toggles

### Checkbox.tsx
- **Props:** `label`, `checked` (boolean), `onToggle`, `disabled?`
- **Layout:** Row: [checkbox icon] [label text]
- **Usage:** Terms agreement, multi-select options

---

## Feedback Components

### Modal.tsx
- **Props:** `visible`, `onClose`, `title?`, `children`
- **Layout:** Overlay backdrop + centered card with content
- **Behavior:** Dismiss on backdrop press or close button
- **Animation:** Fade in/out (react-native Modal or custom with reanimated)

### Skeleton.tsx
- **Props:** `width?`, `height?`, `rounded?` (boolean), `className?`
- **Layout:** Animated pulsing rectangle (loading placeholder)
- **Animation:** Opacity pulse 0.3 → 1.0 loop
- **Usage:** Replace content while loading (balance, stats, list items)

---

## Navigation Components

### Stepper.tsx
- **Props:** `steps` (number), `currentStep` (number), `className?`
- **Layout:** Row of dots: filled for completed/current, outline for future
- **Colors:** Active = primary, inactive = text-tertiary
- **Usage:** Onboarding greeting screen step indicator

### Accordion.tsx
- **Props:** `title`, `children` (content), `defaultOpen?`
- **Layout:** Pressable header row → expandable content area
- **Animation:** Animated height change (react-native-reanimated)
- **Icon:** Chevron rotates on expand/collapse
- **Usage:** Q&A screen FAQ items

---

## Implementation Order

1. **Header, Divider, ListItem** — needed by Profile tab and all (screens)/ pages
2. **Input, Switch** — needed by forms (edit-profile, contact-us, notification-settings)
3. **Avatar** — needed by Profile tab, welcome screen, community
4. **StatCard, EmptyState** — needed by Home tab, Community tab, Notifications tab
5. **Stepper** — needed by onboarding greeting
6. **Modal, Accordion** — needed by delete-account, Q&A
7. **Skeleton, NotificationItem, Checkbox** — polish and refinement
