# Prototype Fidelity & Motion Pass

**Date:** 2026-07-13
**Source:** `design_handoff_dialuna/Dialuna.dc.html` (unchanged since the original handoff — verified identical to the linked claude.ai design project)
**Status:** Approved

## Goal

The prior redesign shipped the right colors, fonts, and screen structure, but reads as flat,
boxy, and assembled from separate components rather than matching the prototype's softness,
layering, and motion. This pass raises visual and motion fidelity to the prototype as high as
reasonably achievable, without changing business logic, navigation structure, state
management, or data. JSX/component-hierarchy changes are in scope where needed to match the
prototype's layout, not just its colors.

## Audit Findings (baseline, verified against current code)

- `expo-glass-effect` is an installed dependency with zero usages anywhere in `src/`.
- `src/theme/motion.ts` (`duration`, `easing.standard`, `easing.spring`) is never imported
  anywhere — dead code. Every animated component hand-rolls its own duration/easing.
- `withSpring` appears zero times in the codebase. All "press feedback" is a static
  conditional style swap (`pressed && { transform: [{ scale: 0.94 }] }`), which snaps instead
  of springing — a primary cause of the "stiff" feel.
- No sliding tab-bar indicator: the tab bar uses default `<Tabs>` styling only
  (`tabBarActiveTintColor`/label swap), no analogue to the prototype's animated pill.
- Home hero: radius (32/32/32/12) is correct, but there is no blurred blob glow layer, and the
  Hormone Twin score is laid out inline in a stat row rather than floating/overlapping the
  hero panel's bottom edge as in the prototype. The 7-day forecast + Energy/Mood/Focus bars
  are replaced by a 2×2 metric-tile grid and a buried `WeekStrip`.
- Calendar: zero `Animated`/`entering` usage anywhere in the screen; the month grid is wrapped
  in a `Card` the prototype doesn't use (only the nav header and day-detail summary are cards
  in the prototype); `DayDetailSheet`'s modal backdrop has no blur.
- Insights: zero animation; all cards use one uniform radius instead of the prototype's
  deliberate three varied radii (`26/26/26/10`, `14`, `26/10/26/26`); premium lock is
  all-or-nothing (one teaser card replaces the whole section) instead of per-card blur+unlock.
- AI Coach: closest to the prototype already — message bubbles animate individually, but the
  screen root has no entrance wrapper, and `TypingDots`' easing is a symmetric bounce rather
  than the prototype's asymmetric snap-up/hold/fade.
- Paywall: per-slide `ZoomIn` and a plans-step `FadeIn` exist in code but are **not** in the
  prototype (which does instant conditional swaps) — these read as an inconsistent, unplanned
  effect. Plan-row selection changes color/border with no transition (snaps).
- Settings: uses the router's generic `slide_from_bottom`, not the prototype's `sheetIn` curve
  (fade + translateY(28→0), `cubic-bezier(.2,.9,.3,1)`); no entrance exists inside the
  component itself; six section cards appear simultaneously.
- Onboarding: welcome screen's blob glow is two static `View`s (prototype drifts continuously
  via `blobFloat 10s`); step-to-step transitions inherit the root's generic 220ms fade.

## Decisions Requiring Product Sign-off (both confirmed)

1. **Insights lock UI** — restore the prototype's per-card blur+unlock (each premium card
   renders in place, blurred, with its own unlock CTA), replacing the current single teaser
   card. Same `isPremium` flag drives both; this changes how much content silhouette free
   users see, not the gating logic.
2. **Home hero layout** — full recompose to the prototype's slim inline Energy/Mood/Focus bars
   + forecast strip immediately below, replacing the 2×2 metric-tile grid. Same underlying
   data (`useCycleToday`'s prediction/twin/forecast), different presentation.

## Architecture

### Foundation (built once, used everywhere — this is what stops screens feeling disconnected)

- **`src/components/ui/Pressable.tsx`** — Reanimated-backed pressable wrapping RN's
  `Pressable`, driving scale via `withSpring` on `onPressIn`/`onPressOut` instead of a static
  style swap. Props: `scaleTo` (default 0.96), `springConfig` (default `springs.snappy`),
  otherwise passes through all `Pressable` props. Replaces the manual press-scale pattern in
  `AppButton`, `Chip`, `CircleButton`, `CalendarDayCell`, tab bar items, and paywall plan rows.
- **`src/theme/motion.ts`** — filled in for real:
  - `springs.soft` (damping ~16, stiffness ~120) — sheets, cards, layout settles.
  - `springs.snappy` (damping ~14, stiffness ~180) — press feedback, small UI.
  - `staggerDelay(index, base = 40)` — shared helper for index-based entrance delays.
  - Existing `duration`/`easing` constants kept, consolidated as the single source every
    screen references instead of inlining its own numbers.
- **`src/components/ui/GlassSurface.tsx`** — the only place real native blur is used, and only
  for the two surfaces that warrant it: the floating tab dock (prototype: `backdrop-filter`)
  and `DayDetailSheet`'s modal backdrop (no prototype equivalent — this modal is app
  functionality beyond the static reference; extending the same glass treatment here for
  consistency is a judgment call, not a prototype requirement). Renders `expo-glass-effect`'s
  `GlassView` when `isGlassEffectAPIAvailable()` (iOS 26+ Liquid Glass); otherwise renders
  `expo-blur`'s `BlurView` (new dependency — the standard cross-platform Expo blur module,
  needed because `GlassView` silently degrades to a plain `View` with zero visual effect on
  Android/older iOS/web). No other cards, sheets, or screens gain blur — the prototype itself
  only specifies `backdrop-filter` on the dock; applying it more broadly would be
  over-building and a needless perf/legibility risk.
- **Radial blob glow** — `react-native-svg`'s `RadialGradient` (already a dependency, unused
  for this purpose) replaces flat static circles for every blurred blob-glow accent (Home hero,
  Welcome screen), giving a real soft radial falloff instead of a flat-edged circle.
  Continuous drift via `withRepeat(withTiming(...), -1, true)` on translateX/Y + scale,
  matching the prototype's `blobFloat` keyframe (~9-10s, ease-in-out, small excursion).

### Screen-by-screen

**Tab bar (`src/app/(tabs)/_layout.tsx`)** — replaced with a custom `tabBar` render function
(via `Tabs` `screenOptions.tabBar`), not default styling. Adds: a sliding gradient pill behind
the active icon, position driven by `withSpring` tracking the focused route's measured
x-offset/width; `GlassSurface` background instead of flat rgba; gold drop-shadow + slight
lift on the active icon; the new `Pressable` for tap feedback. Height/radius/insets (62px,
`radius.dock`, existing spacing insets) are unchanged — the audit found no size gap, only a
missing indicator/blur/icon-lift.

**Home (`src/features/home/HomeScreen.tsx`)** — hero panel gains an absolutely-positioned
`RadialGradient` blob (top-left, blurred, drifting). The Hormone Twin score badge is pulled out
of the inline stat row and rebuilt as a sibling of the hero panel inside a wrapper with
`overflow: visible`: absolutely positioned near the bottom-right, translated so it visually
overlaps the panel's bottom edge, opaque fill + `shadows.hero`, above both the panel and the
content below in z-order. The 2×2 metric-tile grid and buried `WeekStrip` are replaced by three
slim inline Energy/Mood/Focus bars directly under the hero blurb, with the forecast strip moved
immediately below them — same data from `useCycleToday`, new composition. Entrance stagger
applied consistently via `staggerDelay`.

**Log (`src/features/log/LogScreen.tsx`)** — chip rows and slider cards get staggered entrance
(currently none). Save action gets a real "Saved" pill transition (spring-in) next to the
title, in addition to the existing reflection card.

**Calendar (`src/features/calendar/CalendarScreen.tsx`, `DayDetailSheet.tsx`,
`CalendarDayCell.tsx`)** — screen-level stagger entrance added (currently zero animation in
this file). The month grid is unwrapped from its `Card` (prototype floats it directly on the
background); the nav header bar and day-detail summary remain cards, matching the prototype.
`DayDetailSheet`'s modal backdrop uses `GlassSurface`. Day cells get spring press feedback via
the new `Pressable`.

**Insights (`src/features/insights/InsightsScreen.tsx`)** — the three insight cards get their
prototype-specified varied radii instead of one uniform value. Premium-locked cards render in
place (real content shape visible), blurred, with a per-card unlock CTA overlay, replacing the
current single teaser card — same `isPremium` gate. Stagger entrance added.

**AI Coach (`src/features/ai/AiChatScreen.tsx`, `TypingDots.tsx`)** — screen root gets a fade
entrance wrapper (message-level animation is already solid and unchanged).
`TypingDots`' bounce is retuned from a symmetric `Easing.inOut(quad)` to an asymmetric
sequence (fast rise, brief hold near peak, fast fall) to match the prototype's keyframe shape;
timing adjusted to the prototype's 1.2s cycle.

**Paywall (`src/features/paywall/PaywallScreen.tsx`)** — the existing per-slide `ZoomIn` and
plans-step `FadeIn` (not in the prototype, and inconsistent with the shared motion language
elsewhere) are replaced with the same shared crossfade used across the rest of the app.
Plan-row selection gets an animated color/border transition (`withTiming`, ~150ms) instead of
an instant snap.

**Settings (`src/features/settings/SettingsScreen.tsx`, `src/app/_layout.tsx`)** — the route's
`animation` option is changed to a fast fade so the navigator's own transition stops competing
with the component's motion; `SettingsScreen`'s root gains its own Reanimated entrance
(translateY(28→0) + fade, `springs.soft` or an equivalent cubic-bezier duration) matching the
prototype's `sheetIn` curve. The six section cards get a light index-based stagger.

**Onboarding (`src/app/onboarding/welcome.tsx`, `src/app/onboarding/_layout.tsx`,
`goals.tsx`, `symptoms.tsx`)** — welcome's blob glow becomes the shared animated
`RadialGradient` component with continuous drift. The onboarding stack's route transition is
quickened (light fade rather than the root's 220ms default) so step-to-step feels lighter.
Goal/symptom chip grids gain a stagger entrance — an enhancement beyond the static prototype,
consistent with the general motion requirements, not a fidelity requirement.

## Explicitly Out of Scope

Business logic, navigation route structure (no routes added/removed/renamed), Zustand stores,
service layer (`cycleEngine`, `hormoneTwinEngine`, `insightsEngine`, `aiCoachEngine`), i18n
content/keys, and the premium/free gating source of truth (`usePremiumStore.isPremium`) are
all unchanged. Every change in this pass is presentation and motion.

## Known Fidelity Gaps (won't reach 100%, and why)

- **Native "Liquid Glass" is iOS 26+ only.** Android, older iOS, and web fall back to
  `expo-blur`'s `BlurView` — a strong approximation, not the identical native effect.
- **React Native has no CSS `radial-gradient`.** The blob glow uses `react-native-svg`'s
  `RadialGradient`, which is close but not a pixel-identical reproduction of the CSS reference.
- **Some prototype values are percentage/viewport-relative CSS** that don't map 1:1 to RN's
  layout model (e.g., blob position as a percentage of a 402px-wide frame) — reproduced as the
  closest faithful equivalent, not a literal unit conversion.

## Testing & Verification

- `npm run typecheck && npm run lint && npm run test` must pass throughout (existing 36 tests
  are all presentation-adjacent and must stay green — no service/store logic changes).
- No new unit tests are expected for this pass (it's presentation/motion, not new business
  logic) beyond anything the `GlassSurface`/`Pressable` primitives warrant for prop contracts.
- Manual verification required (no simulator available in this environment) — the final task
  in the follow-up plan is an explicit screen-by-screen comparison against the prototype in
  both light and dark mode, plus at least one small-screen and one large-screen device size,
  covering all nine areas: tab bar, Home, Log, Calendar, Insights, AI Coach, Paywall, Settings,
  Onboarding.
