# Living Lunar Intelligence — Phase 2: Navigation Shell + Home Rebuild

Date: 2026-07-15
Status: Approved by user (Crescent Dock chosen over Split Navigation/Dynamic Bottom Canvas; Luna
mascot retired app-wide, not just Home/nav, after confirming her actual footprint is tiny —
confirmed via source research, not assumed)

## 1. Context

This is Phase 2 of the "Living Lunar Intelligence" redesign, following Phase 0+1 (foundation —
see `2026-07-14-living-lunar-intelligence-foundation-design.md`), which built the full v2 token
set (`colors`, `semanticColors`, `gradients`, `typographyV2`, `radiusV2`, `shadowsV2`, `springV2`,
`duration`) additively, without touching any real screen. This phase is the first to actually
consume those tokens in shipped screens: the tab bar and Home. Per the roadmap, every other
screen (Log, Calendar, Insights, AI Coach, Onboarding, Paywall, Settings) remains on the legacy
theme until its own future phase.

Business logic, the cycle/hormone-twin engines, the Zustand store contracts, navigation route
names, and localization architecture are all preserved exactly — this phase is presentation and
composition only, consuming the same `useCycleToday()` data Home already reads today.

## 2. Confirmed Decisions

- **Tab bar concept:** Crescent Dock — a gently curved dock; the active destination expands to
  show its label, the rest stay icon-only. Log is not a separate floating element outside the
  dock; it's a visually distinct capture-styled item *within* the same dock (filled accent
  treatment vs. the other 4 items' outline treatment), so the existing 5-route navigation
  contract (`home`, `log`, `calendar`, `insights`, `ai`) is unchanged — no routes added, removed,
  or renamed.
- **Luna mascot:** retired app-wide in this phase, not deferred. Source research found her actual
  footprint is tiny: `src/components/mascot/Luna.tsx` has exactly one consumer
  (`src/components/ui/EmptyState.tsx`), which itself has exactly one call site
  (`src/features/insights/InsightsScreen.tsx`'s empty state). No onboarding screen, AI chat
  screen, or "LoadingLuna" wrapper references her — those were never built. Retiring her is a
  small, mechanical addition to this phase, not a scope expansion into Insights' or AI Coach's
  own future redesign phases.
- **AI naming:** the brief's "Luna Intelligence" branding for the AI Coach (§11 of the brief) is
  explicitly a Phase 4 (AI Coach redesign) decision, not this phase's. Home's secondary action
  keeps the existing `home.askAi` copy ("Ask AI") unchanged.
- **Zero new i18n keys required.** Every string the new Home composition needs already exists in
  `en.json`/`vi.json` (`home.insightTitle`, `home.twinScoreCaption`, `home.askAi`,
  `home.forecast.*`, `home.upcoming`, `home.logNow`, `home.plan.*`, `home.periodIn`/
  `periodToday`, `common.cycleDay`, `tabs.*`) — confirmed by reading both files. No copy work, no
  Vietnamese-fit review needed for this phase.

## 3. What's Explicitly Kept, Unchanged

- `useCycleToday()` and every engine it calls (`cycleEngine`, `hormoneTwinEngine`) — same shape,
  same fields, zero changes.
- `PhaseBadge` (`src/components/cycle/PhaseBadge.tsx`) — untouched; it's shared with
  `DayDetailSheet.tsx` (Calendar), which isn't part of this phase. Home simply stops importing it
  (the Orb absorbs phase display), not deleting or modifying it.
- `Card`, `Button`/`AppButton`, `Pressable` — untouched; used by 7+ other screens each. Home's new
  composition doesn't import `Card` at all (per the brief's "when a section can drop its card,
  drop it" rule) but doesn't change the component itself.
- `PremiumBanner` — kept visually as-is. It already renders on its own always-dark
  `paywallColors` surface, distinct from the main theme by design; its full "membership
  experience" treatment is Phase 5 (Paywall)'s job. Home still conditionally renders it for
  non-premium users, same logic (`isPremium` from `usePremiumStore`), same placement (foot of the
  screen).
- `GlassSurface` — kept as the Crescent Dock's background renderer. The brief's §17 surface model
  explicitly sanctions blur for "navigation, contextual menu or transient overlay" — the dock is
  exactly that. Only its *tint* changes (from legacy warm rgba to v2 semantic tokens).
- Android back-button behavior — confirmed no custom handling exists today (no `BackHandler`
  usage anywhere in Home or the tab layout); nothing to preserve beyond not introducing any.
- Navigation route contract — `(tabs)/home`, `log`, `calendar`, `insights`, `ai` unchanged.

## 4. New Shared Primitive: `useSemanticTheme`

Every future phase will need a hook to read the current v2 semantic theme, mirroring the existing
`useTheme()` pattern exactly (confirmed `useSettingsStore`'s `theme` field is typed exactly
`'light' | 'dark'`, matching `semanticColors`'s keys). New file `src/theme/useSemanticTheme.ts`:

```ts
import { useSettingsStore } from '@/store/useSettingsStore';

import { SemanticColorSet, semanticColors } from './semanticColors';

export function useSemanticTheme(): SemanticColorSet {
  const theme = useSettingsStore((s) => s.theme);
  return semanticColors[theme];
}
```

Exported from the `@/theme` barrel alongside the existing `useTheme`. This is the first new
"foundation" addition since Phase 0+1 wrapped — small, justified (every subsequent phase reuses
it), not overbuilding.

## 5. Home — "Today Orbit"

Replaces the current hero-panel-plus-card-stack (`heroWrap` + 5 `Animated.View` sections wrapped
in `Card`s) with five zones, edge-to-edge, no section wrapped in its own card.

### Zone 1 — Context strip
Slim top row: greeting (`t(greetingKey(), { name })`) + today's phase name + a settings icon
button (`router.push('/settings')`, unchanged). Replaces the current large hero header
(`heroTop`/`heroMain`/gradient panel) entirely. No large title treatment — `typographyV2.bodyM`
for the greeting, `typographyV2.labelM` for the phase name.

### Zone 2 — Cycle Orb (new component: `src/components/ui/CycleOrb.tsx`)
The visual centerpiece. Built from:
- An SVG ring (`react-native-svg`, already a dependency) showing cycle-day progress as an arc
  around a circle (`prediction.cycleDay / profile.averageCycleLength`), stroked with
  `gradients.irisDepth`/`lunarSheen` depending on phase, animated with Reanimated
  (`useAnimatedProps` on the SVG `strokeDashoffset`) so phase changes shift the ring continuously
  rather than hard-cutting — this is the "Cycle transition" signature motion the brief asks for.
- Center: cycle day number in `typographyV2.displayXL`, tabular figures
  (`tabularNums` from `typographyV2.ts`).
- A small ring-color state shift when `prediction.isPmsWindow` is true (toward
  `semanticColors.signal.warning`) — phase/PMS state communicated by ring color AND a text label
  together, never color alone (accessibility requirement).
- Orbiting labels (absolutely positioned via simple trig, not a physics library): days-until-period
  (`periodText`, already computed) and the Hormone Twin score (`twin.hormoneTwinScore`).
- Tap or horizontal swipe on the orb cycles the center sub-label between energy/mood/focus
  (`twin.energyScore/moodScore/focusScore`, reusing existing data, new presentation — crossfades
  via Reanimated `withTiming(duration.quick)`, no new store state, purely local component state).

`CycleOrb` props: `{ cycleDay: number; cycleLength: number; phase: CyclePhase; isPmsWindow:
boolean; daysUntilPeriod: number; twinScore: number; energyScore: number; moodScore: number;
focusScore: number; theme: SemanticColorSet }` — a pure presentational component, all data passed
in, no store/engine access inside it (keeps business logic out of components per architecture
rules).

### Zone 3 — Daily intelligence stream
Editorial block, no card:
- Kicker: `t('home.insightTitle')` ("Today's insight").
- Body: `t(twin.coachMessageKey)` (same message Home already shows).
- One recommendation: the first tip from whichever of `twin.foodTipKeys`/`workoutTipKeys`/
  `selfCareTipKeys` is non-empty, with its section label (`t('home.plan.food')` etc.) — a lighter
  version of the current premium-only "Today's plan" card, now shown to everyone as a single
  pulled tip (the full 3-category breakdown stays premium-gated exactly as today, unchanged
  `isPremium` branch).
- Secondary action: `t('home.askAi')` → `router.push('/(tabs)/ai')`, unchanged destination.
- Below it: a single inline text action, `t('home.logNow')` → `router.push('/(tabs)/log')` —
  replaces the current 2×2 `quickGrid` (4 tiles) with one line, since Log now also has its own
  dock entry point; duplicating a full quick-action grid on Home would fight the new Crescent
  Dock rather than complement it.

### Zone 4 — Upcoming rhythm
`week` (existing `HormoneTwinDailyProfile[]`, unchanged data) rendered as a horizontal wave/pulse
strip — new component `src/components/ui/RhythmStrip.tsx`, edge-to-edge, replacing `WeekStrip`'s
current card-wrapped bar-chart-in-a-box. Label: `t('home.upcoming')` ("Upcoming").

`RhythmStrip` props: `{ days: HormoneTwinDailyProfile[]; theme: SemanticColorSet }` — same input
shape `WeekStrip` took, new visual (a continuous wave path via SVG, day markers as pulse dots
sized by score, period days marked with `semanticColors.signal.period`).

### Retired from Home (components, not deleted from the codebase unless noted)
- `heroWrap`/`hero`/`scoreBadge` gradient-panel markup — replaced by the Context strip + Orb.
- `SignalBar` (inline component in `HomeScreen.tsx`) — folded into the Orb's tap-to-cycle display.
- `quickGrid`/`QuickAction` (inline) — replaced by the single inline log action.
- `timelineCard`/`TimelineRow` (inline) — folded into the Orb's orbiting labels + the intelligence
  stream (period/PMS/ovulation dates were the timeline's content; period date is now the orb's
  days-until label, PMS is the ring-color state, ovulation isn't currently surfaced elsewhere on
  Home and is dropped from Home specifically — it remains fully available on Calendar, which
  already shows it via `DayDetailSheet`/`CalendarDayCell`, so no data or feature is lost
  app-wide).
- `WeekStrip` (`src/components/cycle/WeekStrip.tsx`) — **deleted**, not just unused. Confirmed
  its only consumer anywhere in the app is `HomeScreen.tsx`; once Home stops using it, it's dead
  code exactly like `GlassCard`/`ScoreRing` were in Phase 0+1.
- `ProgressBar` (`src/components/ui/ProgressBar.tsx`) — **deleted** for the same reason (confirmed
  single consumer, `HomeScreen.tsx`, being replaced by the Orb's own SVG rendering).

## 6. Tab Bar — Crescent Dock

Rewrite `src/app/(tabs)/_layout.tsx`'s `FloatingDock` function (keep the file, replace the
function body and its styles):
- Same `Tabs`/`tabBar` render-prop wiring, same 5 `Tabs.Screen` entries, same route names —
  navigation contract unchanged.
- Dock shape: gently curved via `radiusV2.organic`-scale corner treatment on the container
  instead of the current uniform `radius.dock` pill.
- Active item: expands to show its label (as today) but restyled with `typographyV2.labelM` and
  `semanticColors.brand.primary` (iris) instead of the legacy `accentInk` (gold).
- Inactive items: icon-only, `semanticColors.content.tertiary`.
- Log's dock item: visually distinct — filled circular accent treatment (using
  `semanticColors.brand.primary` as a solid fill behind the icon) rather than the outline
  treatment the other 4 items get, signaling "capture action" per the Crescent Dock concept,
  while remaining the exact same `Tabs.Screen` route as today (no navigation-model change, purely
  visual differentiation).
- Sliding indicator: keeps the existing `withSpring`/`springs.soft` mechanism (still a live
  consumer from Phase 0+1 — unchanged), just re-skinned with v2 colors instead of legacy warm
  rgba.
- `GlassSurface` tint updates from the legacy `rgba(43,39,46,0.55)`/`rgba(255,251,247,0.55)` pair
  to v2 `semanticColors.surface.floating`-derived values.

## 7. Luna Retirement

- Delete `src/components/mascot/Luna.tsx`.
- `src/components/ui/EmptyState.tsx`: replace the `lunaExpression?: LunaExpression` prop with an
  `icon?: keyof typeof Ionicons.glyphMap` prop (default `'sparkles-outline'`), rendering the icon
  in place of `<Luna />`, sized and colored via the screen's existing (legacy) `useTheme()` palette
  — `EmptyState` stays on the legacy theme since its one consumer, `InsightsScreen.tsx`, hasn't
  migrated yet. This keeps Insights rendering unchanged in every way except swapping the mascot
  illustration for an icon.
- `src/features/insights/InsightsScreen.tsx`: its one `<EmptyState lunaExpression="thinking" ...
  />` call site updates to `<EmptyState icon="bulb-outline" ... />` (or an equally fitting
  "thinking/discovering" icon) — the only line touched in a file otherwise outside this phase's
  scope.
- Also remove the dead, unused `lunaFrame` style key from `HomeScreen.tsx`'s current
  `StyleSheet.create` block (confirmed zero JSX references it) — moot once the whole file is
  rewritten, but noted so the implementer doesn't accidentally carry it forward.

## 8. Explicitly Out of Scope (this phase)

- Log, Calendar, Insights, AI Coach, Onboarding, Paywall, Settings screens' own visual
  composition — untouched except the one `EmptyState` call-site line in Insights.
- `PhaseBadge`, `Card`, `Button`/`AppButton` components themselves — untouched.
- `PremiumBanner`'s visual redesign — deferred to Phase 5.
- Any RevenueCat/purchase integration — still out of scope per the original brief.
- Legacy token removal (`palettes.ts`, legacy `radius`/`shadows`/`typography`) — still live for
  every screen this phase doesn't touch; deleted only once every screen has migrated (Phase 7).

## 9. Testing & Verification

- No existing automated test covers `HomeScreen.tsx` or the tab bar today (`vitest.config.ts`
  only includes `services/`, `utils/`, `store/`, `theme/` — confirmed, no component test harness
  exists for screens). `CycleOrb` and `RhythmStrip` are pure presentational components with props
  derived from already-tested engine output; no new test infrastructure is introduced for them,
  consistent with how every other screen in this codebase is verified (typecheck + lint + manual
  check, not component tests).
- `npm run typecheck && npm run lint && npm test` must pass throughout — existing test suite
  (engines, stores, theme) must stay green with zero changes, since no business logic is touched.
- Manual verification: Home and the tab bar in both light and dark mode, on whatever
  platform/simulator is available; confirm the Orb's tap/swipe toggle works, the dock's active
  indicator still animates, Log's dock item is visually distinct, and Insights' empty state still
  renders sensibly without Luna.

## 10. Component/File Summary

**New:**
- `src/theme/useSemanticTheme.ts`
- `src/components/ui/CycleOrb.tsx`
- `src/components/ui/RhythmStrip.tsx`

**Rewritten:**
- `src/features/home/HomeScreen.tsx` (full rewrite)
- `src/app/(tabs)/_layout.tsx` (`FloatingDock` → Crescent Dock styling, same wiring)
- `src/components/ui/EmptyState.tsx` (Luna prop → icon prop)
- `src/theme/index.ts` (add `useSemanticTheme` export)

**Deleted:**
- `src/components/mascot/Luna.tsx`
- `src/components/cycle/WeekStrip.tsx`
- `src/components/ui/ProgressBar.tsx`

**One-line change:**
- `src/features/insights/InsightsScreen.tsx` (its `EmptyState` call site's prop)
