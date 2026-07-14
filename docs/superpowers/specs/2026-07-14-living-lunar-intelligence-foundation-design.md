# Living Lunar Intelligence — Phase 0+1: Stabilize & Design System Foundation

Date: 2026-07-14
Status: Approved by user (pacing = phased one-at-a-time; typography = full sans, drop serif entirely — both confirmed via brainstorm)

## 1. Context

The user supplied a 28-section redesign brief ("Living Lunar Intelligence") calling for a full
UI/UX overhaul of Dialuna: a new color system (iris/aqua/coral replacing the current gold/amber),
sans-only typography, a new shape/motion language, and ground-up recomposition of every screen
(Home, Log, Calendar, Insights, AI Coach, Onboarding, Paywall, Settings, tab bar) away from the
current card-stack pattern. Business logic, navigation contract, persisted data, localization
architecture, and existing tests must be preserved.

This is **not** a small polish pass — it's explicitly the opposite of the app's last three
redesign passes (2026-07-05 foundation/mascot, 2026-07-12 premium four-screen pass, 2026-07-13
motion-fidelity pass), which built and refined the *current* gold/amber, Cormorant-Garamond,
Luna-mascot aesthetic that this brief now asks to replace.

Given the scope (9 phases in the source brief, touching every screen in the app), this cannot be
one spec or one implementation pass. This spec covers only **Phase 0 (stabilize) + Phase 1
(design token foundation)** — the brief's own recommended starting point ("Bắt đầu bằng việc đọc
toàn bộ docs/app-audit, sau đó tạo Design Vision V2 và token foundation"). Every subsequent
phase (nav/Home, Log/Calendar, Insights/AI, Onboarding/Paywall, Settings, final polish) gets its
own brainstorm → spec → plan cycle after this one ships and is reviewed.

## 2. Confirmed Decisions

- **Pacing:** phased, one sub-project at a time, with review checkpoints between phases — not a
  single continuous push through all 9 phases.
- **Typography:** full sans, no serif. Cormorant Garamond is retired; Manrope (already loaded,
  proven Android rendering) carries every role including display, using weight/size instead of a
  second typeface for the "editorial" register the brief asks for.
- **Open, deferred to the Phase 2 (Home/nav) spec:** whether Luna the mascot survives. The brief
  says avoid "cute mascot-heavy" styling; Luna is a real, wired-in brand element from the prior
  redesign (5 expressions, used in empty states, onboarding, AI chat avatar). Not decided here —
  Luna is untouched in this phase regardless.

## 3. Phase 0 — Stabilize (no visual changes)

- Confirm baseline is green: `npm run typecheck`, `npm run lint`, `npm test`.
- Fix the real bug the tech-debt audit flagged as relevant here: the dev premium-override toggle
  in `src/features/settings/SettingsScreen.tsx` (around lines 346-350) renders unconditionally
  with no `__DEV__` guard. Wrap it so it's dev-only, matching the brief's Phase 0 instruction
  ("Loại bỏ hoặc guard dev premium override").
- No other source files change in this phase.

## 4. Phase 1 — Design Token Foundation

### 4.1 Principle: additive, not destructive

No real screen (Home, Log, Calendar, Insights, AI, Onboarding, Paywall, Settings, tab bar) is
touched or re-themed in this phase. Every current screen keeps importing today's `@/theme`
exports (`palettes`, `useTheme`, `spacing`, `typography`, `radius`, `shadows`, `sizes`) completely
unchanged and keeps rendering byte-identical to production. The new v2 tokens are added
alongside, exercised only by a new dev-only showcase screen, and get wired into real screens
incrementally starting in Phase 2. This avoids a big-bang re-theme that could strand
half-migrated screens if a later phase runs out of room mid-flight.

The one exception is `motion.ts`: the current `duration`/`easing` constants have **zero
consumers anywhere in the app** (confirmed by source audit), so replacing their values is not a
breaking change to any existing screen — it's finishing work that was already dead. `springs`
and `staggerDelay` *are* consumed today (shared `Pressable`, tab indicator, 7 screens' stagger)
and are extended, not replaced, so current call sites keep compiling and behaving the same.

### 4.2 New/changed files in `src/theme/`

- **`colors.ts`** (new) — raw palette primitives, verbatim from the brief:
  - `midnight950/900/850/800` (dark canvas), `porcelain50/100/200` (light canvas)
  - `iris300/400/500/600`, `aqua300/400/500`, `coral300/400/500` (brand spectrum)
  - `moonWhite`, `silverMist`, `slateText`, `deepInk`, `success`, `warning`, `danger`
    (supporting tones)
  - This module is the only place raw hex values live going forward for v2 work.

- **`semanticColors.ts`** (new) — light/dark semantic token sets built from `colors.ts`:
  `background.canvas/elevated/inverse`, `content.primary/secondary/tertiary/inverse`,
  `brand.primary/secondary/accent`, `signal.period/fertile/ovulation/recovery/warning`,
  `border.subtle/strong`, `surface.default/raised/floating/selected`. Iris is `brand.primary`;
  aqua maps to recovery/balance-positive signals; coral is reserved for `signal.period` and soft
  warnings only, never a full-screen background, matching the brief's explicit color-role rules.

- **`gradients.ts`** (new) — `nightField`, `irisDepth`, `aquaMist`, `coralHalo`, `lunarSheen`,
  each with a one-line comment on its intended semantic use (hierarchy/phase/depth/state/focus)
  per the brief's "every gradient must have a function" rule.

- **`typography.ts`** (rewritten) — Manrope-only scale: `displayXL 52/54`, `displayL 42/46`,
  `titleXL 32/37`, `titleL 26/32`, `titleM 21/27`, `bodyL 17/25`, `bodyM 15/22`, `labelL 14/18`,
  `labelM 12/16`, `micro 11/14`. Numbers get a tabular-figure treatment where the OS/font
  supports it. Cormorant Garamond's `useFonts` entry is removed from `src/app/_layout.tsx` in
  this same change — the implementation plan must grep for any remaining `CormorantGaramond`
  reference first and confirm zero hits before removing the font load.

- **`radius.ts`** (rewritten) — `xs:8, sm:12, md:18, lg:24, xl:32, organic:40, capsule:999`,
  replacing the current `sm/md/lg/xl/xxl/card/sheet/button/dock/pill` scale. Named per-surface
  guidance (data surface 18-24, overlay 28-32, chips capsule, full-bleed none) is documented as
  comments, applied to real components starting Phase 2.

- **`shadows.ts`** (rewritten) — three-tier model per the brief's §17 (base canvas = no shadow;
  elevated surface = short/soft shadow with a neutral-ink color instead of today's warm-tinted
  `#5a3c14` family; floating context = reserved for nav/overlay only). Fixes the existing
  inconsistency where `shadows.button` was pure black while everything else was warm-tinted.

- **`motion.ts`** (rewritten) — `duration.instant/quick/standard/expressive/ambient`
  (100/180/320/520/2400ms) and `spring.responsive/fluid/gentle` per the brief's exact values,
  plus the existing `staggerDelay()` helper kept and extended. `motion.test.ts` updated to match
  the new shape (existing tests for `springs`/`staggerDelay` keep passing under the new names).

- **`index.ts`** (updated barrel) — exports the new modules alongside the untouched legacy
  exports (`palettes`, `useTheme`, `paywallColors`, old `radius`/`shadows` renamed to avoid
  collision — see §4.3) so nothing downstream breaks.

- **`components.ts`** (new, minimal) — not a full component library in this phase; just shared
  style-fragment helpers (e.g. `surfaceElevated()`, `surfaceFloating()`) that Phase 2 primitives
  will consume, so the "don't hardcode a new color in a screen" rule has a home before any screen
  needs it.

### 4.3 Avoiding a naming collision during the transition

Because `radius.ts` and `shadows.ts` are being rewritten with new shapes but old screens still
import the current `radius`/`shadows` from `@/theme`, the legacy scale is renamed on export to
`legacyRadius`/`legacyShadows` internally and re-exported under the original names `radius`/
`shadows` so existing screen imports keep resolving to the *old* values unchanged. The new v2
scale is exported under new names `radiusV2`/`shadowsV2`. Phase 2+ migrates each screen from
`radius`/`shadows` to `radiusV2`/`shadowsV2` one screen at a time; once every screen is migrated
(end of Phase 7), the legacy names are deleted and `radiusV2`/`shadowsV2` are renamed to the
plain `radius`/`shadows` names as final cleanup (tracked in Phase 8 per the brief).

### 4.4 Dev-only showcase screen

New route `src/app/dev/design-showcase.tsx` (not linked from any real navigation, not part of
the typed route contract used by real screens) rendering: the full color ramp (light + dark, via
a manual toggle since it doesn't need to read `useSettingsStore`), all 5 gradients as swatches
with their intended-use label, the radius scale on sample shapes, the shadow tiers on sample
surfaces, the typography scale, and one live demo per motion token (a pressable that animates
using each `spring` config, and a toggle demonstrating `duration.expressive`). This is the
artifact the user reviews before Phase 2 begins — described in the brief as the "visual
playground" deliverable for this phase.

### 4.5 Dead code cleanup (bundled here since Phase 1 is introducing their replacements)

- Delete `src/components/ui/GlassCard.tsx` and `src/components/ui/ScoreRing.tsx` — confirmed 0
  imports anywhere in `src/` by the research pass.

## 5. Explicitly Out of Scope (this spec)

- Any change to Home, Log, Calendar, Insights, AI Coach, Onboarding, Paywall, Settings, or the
  tab bar's visuals or composition.
- Luna mascot — kept exactly as-is; its fate is a Phase 2 decision.
- `palettes.ts` (gold/amber theme) and `paywallColors` — untouched, still the live theme for
  every real screen until migrated phase-by-phase.
- Business logic, Zustand store contracts, persisted data shape, navigation routes, i18n keys —
  none of these are touched.
- RevenueCat/real purchase integration — out of scope per the brief itself (still mock).

## 6. Testing & Verification

- `npm run typecheck && npm run lint && npm test` must pass after this change, with the existing
  test suite unmodified in behavior except `motion.test.ts`'s update to match the new token
  shape.
- Manual verification: launch the app (`npm run start`), confirm every existing screen (Home,
  Log, Calendar, Insights, AI, Onboarding, Paywall, Settings, tab bar) is visually unchanged from
  before this change, in both light and dark mode. Then open `/dev/design-showcase` and confirm
  every new token renders correctly, including at least one check in dark mode and one on a
  small-device simulator size.
- Confirm the Settings dev-override toggle is no longer visible/active in a non-`__DEV__` build
  (or that it's now gated the same way other dev-only affordances in the codebase are, if such a
  pattern already exists — check before inventing a new one).

## 7. Roadmap (for context — each gets its own future spec)

1. **Phase 0+1 (this spec)** — stabilize, token foundation, showcase screen.
2. **Phase 2** — tab bar redesign (Crescent Dock / Split Navigation / Dynamic Bottom Canvas —
   concept choice deferred to that spec) + full Home rebuild ("Today Orbit").
3. **Phase 3** — Log rebuild ("Body Check-In" progressive flow) + Calendar rebuild ("Cycle
   Landscape").
4. **Phase 4** — Insights rebuild ("Personal Signals") + AI Coach rebuild ("Luna Intelligence"
   conversational canvas).
5. **Phase 5** — Onboarding rebuild (calibration journey) + Paywall rebuild (membership reveal).
6. **Phase 6** — Settings rebuild (system screens, non-card composition).
7. **Phase 7** — cross-cutting motion/accessibility/performance polish, legacy token removal
   (delete `legacyRadius`/`legacyShadows`/old `palettes.ts` once every screen is migrated).
