# Premium Redesign: Onboarding, AI Coach, Paywall, Settings

**Date:** 2026-07-12
**Source:** `design_handoff_dialuna/` (README.md + Dialuna.dc.html interactive prototype)
**Status:** Approved

## Goal

Rebuild the UI of Onboarding, AI Coach, Paywall, and Settings to the new design
language from the handoff package, re-theme the global token system so the whole
app reads as one language, and implement a real light/dark theme switch. Tab
screens (Today/Track/Calendar/Insights) get only a light pass: they inherit the
new tokens plus targeted cleanup of hardcoded old-palette references.

Existing logic and data flow stay: expo-router navigation, Zustand stores,
`cycleEngine`/`aiCoachEngine`/`hormoneTwinEngine` services, react-i18next (EN/VI),
StyleSheet styling.

## Design language (from handoff, final-intent)

- Ground: warm gradient `#fbf3ec → #f7ecee → #f1e9f0` (light);
  `#211d24 → #1c1a1f`, text `#f3f2f2` (dark).
- Accent: gold `#b68235` with tonal ramp 100–900 (see handoff README tokens).
  Neutral ramp 100 `#f8f4f4` … 900 `#2d2b2b`. Text `#201f1d` (light).
- Surfaces: translucent white fills `rgba(255,255,255,0.55–0.6)`, **no borders**,
  soft warm shadows (`rgba(90,60,20,0.08)` family). Asymmetric corner radii on
  hero/feature cards (e.g. `26/26/26/10`) to break uniformity.
- Type: Cormorant Garamond 600 for all display/headings (wordmark 42, screen
  titles 28, hero 34, section headers 26, card titles 16–19, scores 30–32);
  Manrope 400–700 for body/labels/buttons (body 13–14, kickers 10–11 uppercase
  tracked, buttons 13.5–14).
- Buttons: pill radius 18, primary = solid near-black (`#2d2b2b` neutral-900)
  with soft shadow; secondary = translucent white. Chips: pill, selected = soft
  gold gradient + shadow lift.
- Motion: screen entry fade+translate-up ~400–450ms; modals slide-up+fade
  ~380–400ms; press feedback scale ~0.94 / 120ms; chat messages fade+slide-up.

## Architecture

### Theme system (real dark mode)

- `src/theme/colors.ts` → exports `palettes = { light, dark }` built from the
  handoff tokens. Semantic shape (surface/text/accent ramp/phase colors/gradients)
  identical across both palettes.
- New persisted `useSettingsStore` (Zustand + AsyncStorage, `dialuna.settings`):
  `{ notifPeriod: boolean, notifOvulation: boolean, notifDaily: boolean,
  lutealLength: number (10–16, default 14), units: 'us' | 'metric',
  theme: 'light' | 'dark' }`.
- New `useTheme()` hook: selects `theme` from the settings store, returns the
  active palette (plus theme-dependent shadow set). No provider — Zustand
  subscription re-renders consumers on switch. Root layout drives `StatusBar`
  style and Stack `contentStyle` from it.
- Structural tokens (`spacing`, `radius`, `sizes`, `motion`) stay static.
  `typography` keeps static fontFamily/size/lineHeight but **drops baked-in
  colors**; text color comes from the theme at usage sites.
- All screens/components migrate from static `colors` imports to `useTheme()`.
  The static `colors` export is deleted at the end of the migration (no legacy
  alias left behind).
- Fonts: add `@expo-google-fonts/cormorant-garamond` + `@expo-google-fonts/manrope`;
  load `CormorantGaramond_600SemiBold`, `Manrope_400Regular/500Medium/600SemiBold/700Bold`
  in `src/app/_layout.tsx`; remove Fraunces/DM Sans deps and font loads.

### Data model changes (`src/types`)

- `UserProfile`: add `email?: string`, `symptomHistory: Symptom[]` (default `[]`);
  `ageRange` becomes optional and leaves all UI. `nickname` stays (rendered as
  "Name").
- `Goal` union += `avoidPregnancy | trackFertility | generalWellness`.
  Onboarding offers exactly the handoff's six:
  understandCycle, reducePms, pregnancyPlanning, avoidPregnancy, trackFertility,
  generalWellness. Old values remain valid for existing profiles.
- `Symptom` union += `moodSwings | insomnia` (appended to `ALL_SYMPTOMS`).
  Onboarding symptom step offers the handoff's eight: cramps, bloating, headache,
  fatigue, moodSwings, acne, breastTenderness, insomnia.
- Persisted profiles from before this change may lack the new fields — all reads
  treat `email`/`symptomHistory` as possibly undefined.

### Cycle engine

- Keep `cycleEngine` (tested) — do **not** port the prototype's `computePhase`.
- `LUTEAL_LENGTH` const becomes a `lutealLength` parameter defaulting to 14 on
  `CycleEngineInput` and the phase helpers that need it. Callers
  (`useCycleToday`, calendar, insights, coach context) thread the value from
  `useSettingsStore`. Existing tests updated; new cases cover luteal 10 and 16.

## Screens

### 1. Onboarding (`src/app/onboarding/*`)

Route flow: `welcome → disclaimer → cycle-basics → goals → symptoms → account`.
Removed routes: `notifications`, `paywall-preview`, old `profile`, `last-period`
(merged into `cycle-basics`). `useOnboardingDraft` extended for email + symptoms.

- **Welcome:** full-bleed gradient, static blurred gold blob (top-left radial),
  app mark (72×72 dark rounded-square tile, radius 28, offset 48px cream circle),
  serif wordmark 42, subhead "A quiet place to know your body, cycle by cycle.",
  pill CTA "Get started" (max-width 220).
- **Step chrome (steps 1–4):** circular white back button (38px) + four 6px
  progress dots (gold = active step, neutral-300 otherwise); disclaimer sits
  between Welcome and step 1, outside the dots.
- **Disclaimer:** existing content restyled to a soft card + primary pill
  "I understand".
- **Cycle basics:** serif title "Let's set your baseline"; two stepper soft
  cards (Average cycle length 21–40 d, Period length 2–10 d; circular −/+ white
  38px buttons, serif 20px readout) + last-period date in a soft card using the
  existing `DatePickerCalendar` restyled. Bottom-pinned "Continue".
- **Goals:** multi-select gold chips, 6 options above.
- **Symptoms:** multi-select gold chips, 8 options above; saves to
  `profile.symptomHistory`.
- **Account:** Name + Email fields in soft cards (email validated with zod,
  optional), primary "Create account" → completes onboarding into tabs;
  secondary "Continue with Apple" stub (alert "Coming soon", no auth backend).

### 2. AI Coach (`src/features/ai/AiChatScreen.tsx`)

- Header: serif "Coach" 28 with 56px top padding; free-question counter as a
  small caption under it. Luna mascot and dark header panel removed.
- Messages: coach = translucent white bubble left; user = accent-100 fill with
  accent-800 text, right; radius 16, max-width 78%, 13.5px Manrope. New messages
  enter with fade+slide-up (reanimated `FadeInDown`-style); list auto-scrolls.
- Typing indicator: three 6px gold dots, staggered opacity bounce (reanimated
  loop), shown while `typing`.
- Suggested prompts: horizontal scroll chip row above the input; handoff's four
  prompts via i18n; tap sends immediately (existing behavior).
- Input row: pill translucent field + 42px circular near-black send button with
  paper-plane icon (Ionicons `send`).
- Logic unchanged: `useChat`, `aiCoachEngine` (already phase-aware), free-tier
  limits, AI disclaimer box (restyled, compact, below input).

### 3. Paywall (`src/features/paywall/PaywallScreen.tsx` — rewrite)

- Full-screen modal (existing route), background `#1f1c18`, text `#f4ede1`,
  independent of app theme. Entry: slight scale/fade ~380ms.
- Top: 4-segment story progress (2.5px bars; filled `#f4ede1` up to current
  step) + circular translucent close (X).
- Slides 0–2: full-screen tap zones — left 35% back, right 65% forward
  (Pressables under centered content). Centered 40px line icon, serif 26
  headline, one-line copy (handoff's three slides, via i18n).
- Slide 3 — plan picker: "Choose your plan" + "7 days free, cancel anytime.";
  two rows: Monthly `$9.99/mo`, Annual `$59.99/yr · $5/mo` + `SAVE 40%` badge
  (accent-800 chip). Selected row: 1.5px gold border + `rgba(182,130,53,0.14)`
  fill (the paywall is the one place borders exist, per prototype). Annual
  preselected → maps to existing `'yearly'` plan; lifetime leaves the UI (type
  unchanged). 4-item gold-checkmark feature list. Bottom-pinned solid-gold pill
  "Start 7-day free trial" → `usePremiumStore.purchase` + success haptic +
  dismiss. Footer text row: Restore purchase (wired to `restore()`) · Terms ·
  Privacy (stub links).
- `PlanCard`/`PremiumBanner` components restyled or replaced to match; prices
  updated in i18n (old $6.99/$39.99/$99 copy removed).

### 4. Settings (`src/features/settings/SettingsScreen.tsx` — rewrite)

Full-screen sheet, slide-up + fade ~380ms (Stack options on the `settings`
route). Circular back chevron + serif "Settings" 24. Six sections, each an
uppercase tracked kicker + soft card (radius 22, no border):

1. **Profile & account** — Name, Email fields; "Sign out" (neutral fill pill)
   → clears `hasOnboarded` only (logs and profile kept), routes to Welcome.
2. **Cycle setup** — steppers for Average cycle length, Period length
   (→ `useUserStore`), Luteal phase length 10–16 (→ `useSettingsStore`);
   Last period start date via restyled date picker (→ `useUserStore`).
3. **Notifications** — Period / Ovulation / Daily log reminders as On/Off
   segmented toggles (→ `useSettingsStore`; preference-only, no scheduling —
   keep the existing "coming soon" caption).
4. **Appearance** — Units (US/Metric) and Theme (Light/Dark) segmented toggles
   (theme is the real switch); Language (EN/Tiếng Việt) segmented toggle kept
   from the current app.
5. **Privacy & data** — privacy/medical disclosure links kept; "Export my data"
   → inline flash line "Export ready — check your email." (stub); "Delete all
   data" → inline two-step confirm (first tap reveals confirm line + destructive
   confirm button; confirming runs `resetAllData` → onboarding). No `Alert`.
6. **Subscription** — serif plan label (Premium / Free plan) + status subline;
   "Upgrade" (near-black pill → paywall) when free, "Manage" (neutral pill →
   paywall) when premium; dev premium toggle row kept.

Removed from Settings: age-range chips (field deprecated). App-version footer kept.

### 5. Tabs light pass (not a rebuild)

- Everything inherits the new palette/typography via the token migration.
- Tab bar → floating dock styling: 62px tall, radius 31, 18px side insets,
  14px above safe area, translucent warm white, soft shadow, gold active tint,
  label shown only on the active tab (`tabBarShowLabel` per-screen or custom
  `tabBarLabel` returning null when inactive). Keep Ionicons; no sliding
  indicator (future tabs pass).
- Targeted cleanup of hardcoded old-palette values in tab screens and shared
  components (`PhaseBadge`, `ScoreRing`, `WeekStrip`, `ForecastCard`, gradients,
  `PremiumBanner`): map pink/plum/iris to the nearest new-palette equivalent
  (phase colors re-derived from the new palette: menstrual = accent-300 family,
  ovulation = accent, etc. per prototype calendar legend). No layout changes.

## i18n

All new/changed copy added to both `en.json` and `vi.json`: onboarding steps,
coach prompts, paywall slides/plans/footer, settings sections/toggles/confirm
lines. Obsolete keys (notifications step, paywall preview, old plan prices,
age-range labels in settings) removed if unreferenced.

## Error handling & edge cases

- Old persisted profiles: missing `email`/`symptomHistory` handled as
  undefined/[] everywhere; `ageRange` no longer required.
- Settings store hydrates alongside existing stores in `_layout.tsx`'s
  hydration gate.
- Luteal length is clamped 10–16 in UI and defaulted to 14 in the engine, so
  phase math never sees out-of-range values.
- Email field: zod-validated when non-empty; empty allowed (local-only account).
- Paywall tap zones must not swallow the close button or plan-row taps
  (zones only exist on story slides, behind content that has no interactive
  elements).

## Testing & verification

- `npm run typecheck`, `npm run lint`, `npm run test` all pass.
- `cycleEngine` tests updated for the `lutealLength` parameter (+ cases for 10
  and 16); existing behavior at default 14 unchanged.
- New unit tests for `useSettingsStore` defaults/clamping.
- Manual verification in Expo: onboarding end-to-end into tabs, coach chat
  send/typing/prompt-chips, paywall story navigation + purchase + restore,
  settings edits persisting across restart, dark mode switching the whole app
  live, EN/VI both rendering.
