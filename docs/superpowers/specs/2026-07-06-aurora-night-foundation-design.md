# Aurora Night — Foundation v2 Design Spec

## Overview

This spec supersedes the color, typography, and mascot decisions made in the
[2026-07-05 Foundation redesign](./2026-07-05-foundation-redesign-design.md).
That phase shipped a light-palette, Fraunces/DM Sans, crescent-SVG-mascot
system to `main`. A new developer handoff document
(`DEVELOPER_HANDOFF.md` + `Dialuna.html` interactive prototype, provided by
the user) specifies a different, more fully-realized visual language:
**Aurora Night** — a dark-mode-first, glass-surfaces-over-animated-aurora
design with a glowing gradient orb mascot, serif display type, and a
runtime dark/light + accent-color theme system.

The handoff doc is treated as the literal source of truth for colors, type
scale, spacing, radius, shadows, and named component behaviors. Where this
spec references an exact value, it is copied from that document, not
reinterpreted.

**Source documents:** `~/Downloads/DEVELOPER_HANDOFF.md`,
`~/Downloads/Dialuna.html` (extracted interactive prototype at
`/tmp/dialuna_extracted.html` during design — values inlined below).

## Scope of this phase (Foundation v2)

This is Phase A of a 5-phase redesign (B–E cover Home, Calendar+Insights,
Log+Chat, and Premium+Onboarding in later specs). Foundation v2 delivers
the layer every later phase depends on:

1. Color tokens (dark + light values, 3 selectable accents)
2. Typography tokens (Cormorant Garamond + Plus Jakarta Sans)
3. A runtime theme system (dark/light, accent choice, reduced motion) that
   actually re-renders the app when changed
4. Luna mascot v2 (glowing gradient orb, replacing the crescent SVG)
5. Aurora animated background field
6. Glass surface primitive
7. Floating tab bar v2, including an information-architecture change
8. Minimal Settings additions to control the new theme system
9. Migrating every existing color/typography consumer to the new access
   pattern (see "Theme Access Migration" below) — mechanical, not visual,
   for screens not yet redesigned

Screens are **not** visually redesigned in this phase beyond what's needed
to keep them rendering correctly on the new tokens (same discipline as
Foundation v1: mechanical adaptation, not new layouts). Home, Calendar,
Log, Chat, Insights, and Premium get their actual new layouts in Phases
B–E.

## Color System

### Dark mode (default)

| Token | Hex/Value | Usage |
|-------|-----------|-------|
| `night` | `#0E0B1A` | Screen background |
| `nightElevated` | `#181230` | Secondary background (phone chrome, sheets) |
| `lavender` | `#8B6FE8` | Primary accent, Luna glow |
| `lavenderLight` | `#B9A6F2` | Secondary accent, borders, rings |
| `auroraBlue` | `#5AA9E6` | Secondary accent, gradient pairs |
| `rose` | `#F5B8C4` | Menstrual phase |
| `roseDeep` | `#E87A97` | Aurora particle / phase accent |
| `peach` | `#F6C89A` | Follicular phase, energy |
| `peachDeep` | `#F7A08B` | Aurora particle / phase accent |
| `ovulationBlue` | `#8FD2F2` | Ovulation phase primary |
| `surface` | `rgba(255,255,255,0.055)` | Card backgrounds |
| `surfaceElevated` | `rgba(255,255,255,0.08)` | Buttons, inputs |
| `glass` | `rgba(20,15,38,0.62)` | Tab bar, headers (with blur) |
| `border` | `rgba(255,255,255,0.11)` | Card dividers, outlines |
| `textPrimary` | `#F4F1FB` | Body copy |
| `textSecondary` | `rgba(244,241,251,0.60)` | Labels, captions |
| `textDisabled` | `rgba(244,241,251,0.35)` | Inactive states |

### Light mode

| Token | Hex/Value | Usage |
|-------|-----------|-------|
| `night` (background) | `#F4F1FB` | Screen background |
| `nightElevated` | `#FFFFFF` | Secondary background |
| `surface` | `rgba(255,255,255,0.72)` | Cards |
| `glass` | `rgba(255,255,255,0.68)` | Tab bar, headers |
| `border` | `rgba(40,30,72,0.10)` | Dividers |
| `textPrimary` | `#241E38` | Body |
| `textSecondary` | `rgba(36,30,56,0.55)` | Labels |

Phase/accent hues (`lavender`, `rose`, `peach`, `auroraBlue`, etc.) are the
same values in both modes — only surface/border/text/glass shift.

### Phase colors (unchanged across modes)

| Phase | Primary | Secondary |
|-------|---------|-----------|
| Menstrual (1–5) | `#F5B8C4` | `#E87A97` |
| Follicular (6–12) | `#F6C89A` | `#F7A08B` |
| Ovulation (13–16) | `#8FD2F2` | `#5AA9E6` |
| Luteal (17–28) | `#B9A6F2` | `#8B6FE8` |

### Accent picker

Three selectable accent pairs (`[secondary, primary]` per the prototype):

| Accent | Pair |
|--------|------|
| Lavender (default) | `#8B6FE8` / `#B9A6F2` |
| Rose | `#E87A97` / `#F5B8C4` |
| Aurora Blue | `#5AA9E6` / `#8FD2F2` |

The active accent replaces `lavender`/`lavenderLight` as "the" accent used
for Luna's glow, active tab state, primary buttons, and the day-progress
ring. Phase colors are unaffected by the accent choice — phase color always
reflects cycle phase, not user preference.

### Token shape (preserves existing call-site API)

To keep the "one API, different values per theme" property from Foundation
v1, the exported shape stays the same as today's `colors` object
(`colors.primary`, `colors.card`, `colors.phase.menstrual`,
`colors.text.primary`, `colors.surface.card`, `colors.border`, etc.) — only
the *values* change per mode/accent, and the *access pattern* changes from
a static import to a hook (see Theme Access Migration). Concretely:

```ts
// src/theme/tokens/dark.ts and src/theme/tokens/light.ts
// each exports a ThemeTokens object matching the same key shape

interface ThemeTokens {
  primary: string; // resolved from active accent
  card: string;
  background: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  glass: string;
  glassStrong: string;
  overlay: string;
  phase: { menstrual: string; follicular: string; ovulation: string; luteal: string };
  phaseSoft: { menstrual: string; follicular: string; ovulation: string; luteal: string };
  surface: { background: string; card: string; elevated: string; glass: string; glassStrong: string; overlay: string };
  text: { primary: string; secondary: string; tertiary: string; onDark: string };
  semantic: { success: string; warning: string; danger: string; info: string };
  // ... remaining existing base keys (mint, peach, error, etc.) kept for
  // call-site compatibility, resolved to Aurora Night equivalents
}
```

`phaseSoft` values in dark mode use a low-opacity tint of the phase color
over `surface` rather than the pastel light-mode hex values (since flat
pastel hex would look wrong on a near-black background) — e.g.
`rgba(245,184,196,0.16)` for menstrual. Exact tints are an implementation
judgment call within the existing pattern, not specified by the handoff
doc (which is dark-first and didn't define soft variants).

## Typography

### Fonts

- **Display** (greetings, phase names, screen titles): `Cormorant Garamond`,
  weights 400/500/600, italic available for brand moments
  (`@expo-google-fonts/cormorant-garamond`)
- **UI** (everything else — body, numerals, labels, buttons): `Plus Jakarta
  Sans`, weights 400/500/600/700, no italics
  (`@expo-google-fonts/plus-jakarta-sans`)

`Fraunces` and `DM Sans` (Foundation v1) are removed entirely — no
consumer may reference them after this phase.

### Type scale

| Token | Size | Weight | Line height | Letter spacing | Font |
|-------|------|--------|-------------|-----------------|------|
| `displayXl` | 32 | 400 | 1.08 | -0.02em | Cormorant Garamond |
| `displayL` | 28 | 400 | 1.1 | 0 | Cormorant Garamond |
| `headline` | 22 | 600 | 1.3 | 0 | Plus Jakarta Sans |
| `title` | 18 | 600 | 1.4 | 0 | Plus Jakarta Sans |
| `subtitle` | 16 | 500 | 1.5 | 0 | Plus Jakarta Sans |
| `bodyLarge` | 15 | 400 | 1.55 | 0 | Plus Jakarta Sans |
| `body` | 14 | 400 | 1.55 | 0 | Plus Jakarta Sans |
| `caption` | 12 | 500 | 1.5 | 0.06em | Plus Jakarta Sans |
| `micro` | 10 | 600 | 1.4 | 0.08em | Plus Jakarta Sans |
| `button` | 14 | 600 | 1.2 | 0 | Plus Jakarta Sans (kept for buttons; not in handoff's named scale but needed for call sites) |

This is a rename+resize, not a like-for-like scale. Exact migration
mapping, by size proximity (old → new):

| Old token (v1) | Old size | New token | New size |
|-----------------|----------|-----------|----------|
| `display` (context: greeting) | 36 | `displayXl` | 32 |
| `display` (context: screen title) | 36 | `displayL` | 28 |
| `headline` | 26 | `headline` | 22 |
| `title` | 20 | `title` | 18 |
| `subtitle` | 17 | `subtitle` | 16 |
| `body` | 16 | `bodyLarge` | 15 |
| `bodySmall` | 14 | `body` | 14 |
| `caption` | 12 | `caption` | 12 |
| `micro` | 11 | `micro` | 10 |
| `button` | 16 | `button` | 14 |

`display` had two distinct uses in v1 (page greetings and screen titles,
both the same token); the migration task picks `displayXl` for greetings
and `displayL` for screen titles, matching the handoff's split. Every
other row is an unconditional rename. This rename is part of the
mechanical migration task.

## Theme System

### Store

New file `src/store/themeStore.ts` (Zustand + AsyncStorage persist,
following the exact pattern of the existing `usePremiumStore`/
`useUserStore`, exported from the `src/store` barrel):

```ts
interface ThemeState {
  mode: 'dark' | 'light';
  accent: 'lavender' | 'rose' | 'auroraBlue';
  reduceMotion: boolean;
  setMode: (mode: 'dark' | 'light') => void;
  setAccent: (accent: ThemeState['accent']) => void;
  setReduceMotion: (value: boolean) => void;
}
```

Default: `mode: 'dark'`, `accent: 'lavender'`, `reduceMotion: false`.

This is a new file, not a modification of an existing domain store — it
does not violate the "don't touch `src/store/*`" instinct from v1, because
that constraint was about not touching existing domain logic, not about
prohibiting new UI-preference state.

### Access hook

New file `src/theme/useTheme.ts`:

```ts
function useTheme(): { colors: ThemeTokens; typography: TypographyTokens; mode: 'dark' | 'light'; reduceMotion: boolean } {
  const mode = useThemeStore((s) => s.mode);
  const accent = useThemeStore((s) => s.accent);
  const reduceMotion = useThemeStore((s) => s.reduceMotion);
  // resolves dark/light token set + accent substitution, memoized on [mode, accent]
}
```

`typography` values don't change with mode/accent, but are returned from
the same hook so call sites only need one import for both.

### Theme Access Migration

Every existing file that does `import { colors, typography, ... } from
'@/theme'` and reads `colors.x` / `typography.x` at module scope or via
direct property access must change to call `useTheme()` inside the
component body and read `colors`/`typography` from its return value. This
is required for the mode/accent toggle to actually affect rendering — a
static import can never react to a runtime store change.

Tokens that are NOT theme-reactive (`spacing`, `radius`, `shadows` shapes,
`duration`, `easing`, `sizes`) keep their existing static-import pattern —
only `colors` and `typography` move to the hook. `shadows.shadowColor`
values that reference `colors.deepPlum` become a function of the resolved
color instead (dark and light modes want different shadow tints — dark
shadows stay near-black, light-mode shadows can stay as-is per the
handoff's unchanged light-elevation spec).

Files inside `StyleSheet.create()` at module scope that currently bake in
`colors.x` cannot do this (module-scope styles can't call hooks) — those
move the color-dependent properties out of `StyleSheet.create` and into an
inline `style={[styles.base, { backgroundColor: colors.card }]}` array,
keeping non-color properties (`padding`, `borderRadius`, etc.) in the
static stylesheet. This is the same pattern `Card.tsx` already uses for
`variant`-conditional styles.

## Component Specs

### 1. Luna Orb (`src/components/mascot/LunaOrb.tsx`, replaces `Luna.tsx`)

Replaces the Foundation v1 crescent SVG entirely. `EmptyState` and any
other v1 consumer of `Luna`/`LunaExpression` migrate to `LunaOrb` in this
phase (mechanical prop swap, per the mapping below) — this is the only
"content" change to already-shipped v1 work, and it's required since the
old mascot shape has no place in Aurora Night.

**Visual (per handoff + prototype):**
- Base: radial gradient at 30% 25%, `#FBF7FF` → `#D9C9F7` (42%) →
  accent-primary (100%) — accent-primary substitutes for the hardcoded
  `#8B6FE8` so the orb's color follows the user's accent choice
- Inset shadow: `-6px -8px 16px rgba(70,45,130,0.55)`
- Outer glow: blurred circle behind the orb, `radial-gradient(circle,
  accent-secondary, transparent 62%)`, blur ~10-14px, opacity ~0.7,
  animated per state
- Eyes: two small circles `#3a2b6e`, offset downward

**Props:**
```ts
interface LunaOrbProps {
  state?: 'idle' | 'listening' | 'thinking' | 'celebrating';
  size?: number; // default 96, used at 150/140/130/110/104/58/40/22 across screens per prototype
}
```

**States** (each has a `reduceMotion` variant that holds the end-state
pose statically instead of looping):
- `idle` — gentle float (translateY, 6s loop) + glow pulse (4s loop),
  eyes open (two small circles)
- `listening` — glow pulse tightens to a faster pulse, eyes brighter (no
  extra geometry needed beyond faster glow cadence)
- `thinking` — orb rotates a hint (±20°) on a slow loop, eyes rendered
  as horizontal half-closed lines instead of circles
- `celebrating` — pop/bounce (scale 0.6→1.12→1 over ~0.4s, non-looping,
  triggered once), eyes rendered with a small sparkle mark

Animation implementation: `react-native-reanimated` `withRepeat` +
`withTiming`/`withSpring` for float/glow/rotate; the celebration pop is a
one-shot `withSequence`. `reduceMotion` short-circuits all repeating
animations to their midpoint static value; the one-shot celebration pop
still plays but at `duration.fast` instead of a longer curve.

### 2. Aurora Background (`src/components/ui/AuroraBackground.tsx`)

Three absolutely-positioned, blurred, radial-gradient circles behind
content, each drifting on an independent loop:

| Layer | Color | Position | Blur | Loop |
|-------|-------|----------|------|------|
| 1 (primary) | `lavender` (`#8B6FE8`) | top-left, off-canvas | ~36px | 14–15s |
| 2 (secondary) | `auroraBlue` (`#5AA9E6`) | top-right, off-canvas | ~40px | 11–12s |
| 3 (accent) | `roseDeep` (`#E87A97`) | bottom-left, off-canvas | ~34-40px | 16–18s |

Opacity table (from the prototype's `renderVals`, reused verbatim):

| | Dark, animated | Dark, reduced motion | Light, animated | Light, reduced motion |
|-|----------------|----------------------|------------------|------------------------|
| Layer 1 | 0.62 | 0.4 | 0.30 | 0.18 |
| Layer 2 | 0.50 | 0.35 | 0.26 | 0.16 |
| Layer 3 | 0.42 | 0.30 | 0.20 | 0.12 |

Implementation: since RN has no CSS `filter: blur()`, each layer is a
`View` with a radial-gradient-like fill (`expo-linear-gradient` doesn't do
true radial gradients on all platforms reliably at this size — use a
plain solid-color circle with heavy `opacity` falloff via nested
decreasing-opacity circles, OR accept `expo-blur`'s `BlurView` wrapping a
solid circle as the blur approximation). Reanimated worklets drive
`translateX/Y`, `rotate`, `scale` per the prototype's keyframe percentages
(33%/66%/100% for layer 1/3 pattern, 50%/100% for layer 2's simpler
pattern). Rendered once behind screen content, not re-created per screen —
each screen wraps its content in `<AuroraBackground>{children}</AuroraBackground>`.

### 3. Glass Surface (`src/components/ui/GlassSurface.tsx`)

New primitive, used where the handoff specifies backdrop blur (tab bar,
headers, cards sitting directly over the aurora field):

```ts
interface GlassSurfaceProps {
  children: ReactNode;
  radius?: number; // default radius.lg (24, per handoff's card range)
  style?: ViewStyle;
}
```

Renders `expo-blur`'s `<BlurView intensity={...} tint={mode === 'dark' ? 'dark' : 'light'}>` 
with a semi-transparent color overlay on top (`colors.surface.glass`) and
a 1px border (`colors.border`), approximating `blur(12-20px) saturate(1.3)`.
`Card.tsx` is unchanged in this phase (still the plain, non-blurred
surface for ordinary cards) — `GlassSurface` is additive, used only where
a screen explicitly needs the blur-over-aurora look (tab bar in this
phase; screen content in Phases B–E).

New dependency: `expo-blur`.

### 4. Floating Tab Bar v2 (`src/app/(tabs)/_layout.tsx`, rebuilt)

**IA change** (per user decision): tabs become **Home, Calendar,
[Luna orb → Chat], Insights, Premium**. `Log` is removed as a persistent
tab; it becomes a CTA button on the Home screen (wired in Phase B). For
this phase, a plain unstyled `Pressable`/`Link` reading "Log" is added to
the existing Home screen's current content (no visual redesign, just a
functional entry point) so the Log screen stays reachable from the UI
until Phase B replaces it with the real spec'd CTA. `Premium`/paywall
becomes a tab instead of a screen reached only via a banner.

Since `expo-router`'s `Tabs` component lays out all items in one row with
uniform styling, the off-center floating orb (58×58, `marginTop: -28`)
requires a custom tab bar via `tabBar={(props) => <CustomTabBar {...props} />}`
rather than `screenOptions` styling — this is the "rebuilt" part.

**Structure:**
- `GlassSurface`-based container, `padding: 12 22`, `radius: 30`,
  positioned `absolute`, `left/right: 20`, `bottom: 26`
- 4 regular buttons (Home, Calendar, Insights, Premium): 24px icon + 4px
  active-color dot indicator (transparent when inactive), `scale: 1.05`
  when active
- Center button: `LunaOrb` at `size=58`, `marginTop: -28` to float above
  the bar, `onPress` navigates directly to the Chat screen (not a normal
  tab — it does not need an "active" visual state since Chat has no tab
  icon of its own)

### 5. Progress Ring (`src/components/ui/ProgressRing.tsx`)

Reusable SVG ring (day-of-cycle indicator on Home, reused wherever a
circular progress indicator is needed later):

```ts
interface ProgressRingProps {
  progress: number; // 0-1
  size?: number; // default 104
  strokeWidth?: number; // default 6
  color?: string; // default accent primary
  trackColor?: string; // default colors.border
}
```

Two concentric `Circle`s (track + progress), progress circle uses
`strokeDasharray`/`strokeDashoffset` animated via reanimated on mount
(1.4s ease, 0.3s delay, matching `dlRing`), skipped (renders at final
value immediately) when `reduceMotion` is true.

## Settings Additions

Minimal additions to the existing `SettingsScreen.tsx` (not a full
redesign — that's Phase E): a new section with three controls bound to
`themeStore`:
- Dark/Light mode switch
- Accent picker (3 swatches: Lavender/Rose/Aurora Blue)
- Reduce motion switch

These reuse existing `Switch`/`Chip`/`SectionTitle` primitives already in
the file; no new Settings-specific components.

## Global Constraints

- No hardcoded hex/rgba outside `src/theme/tokens/{dark,light}.ts` and
  `src/theme/accents.ts`.
- `tsc --noEmit` clean after every task.
- `expo lint` clean after every task (or noted if the environment blocks
  it, per existing project practice).
- `src/services/*`, `src/types/*` untouched. `src/store/*` may gain the
  new `themeStore.ts` file but no existing store file's domain logic
  changes.
- No screen redesigns beyond mechanical token/hook migration and the tab
  bar IA change explicitly specified above.
- `Fraunces`/`DM Sans` font packages and all v1 typography names not
  listed in the new scale are fully removed — no dual-support period.
- `Luna.tsx`/`LunaExpression` (v1 crescent mascot) are deleted and fully
  replaced by `LunaOrb` — no dual-support period.

## Out of Scope (this phase)

- Home/Calendar/Log/Chat/Insights/Premium visual redesigns (Phases B–E)
- Log screen's CTA-based entry point from Home (Phase B, once Home is
  redesigned) — until then Log is reachable only via a direct, unstyled
  route link
- Onboarding 3-screen flow redesign (Phase E)
- True CSS-style `saturate()` filter on glass surfaces (RN has no
  equivalent; `GlassSurface` approximates with blur + overlay tint only)
- Skia-based rendering (no `@shopify/react-native-skia` dependency added
  this phase; gradients/blur use `expo-linear-gradient` + `expo-blur` +
  plain Views)
- Per-screen aurora parallax-on-scroll (handoff marks this "optional")

## Open Follow-ups (tracked, not blocking)

- `AuroraBackground`'s blur approximation (opacity-falloff circles vs.
  true blur) should be visually verified against the prototype on-device;
  if `expo-blur`'s `BlurView` over a solid circle looks better than the
  falloff-circle approach, prefer it — implementer's call, verified via
  simulator screenshot during the task, not a re-planning gate.
- `phaseSoft` dark-mode tint values are an implementation judgment call
  (see Color System) — worth a design pass once real screens (Phase B+)
  show them in context.
