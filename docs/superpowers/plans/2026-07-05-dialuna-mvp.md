# Dialuna MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Dialuna MVP — an offline-first menstrual-cycle wellness app with a simulated "AI Hormone Twin", deterministic mock AI coach, and mock subscription gating, in Expo + TypeScript.

**Architecture:** Expo Router app with pure-function service layer (`cycleEngine`, `hormoneTwinEngine`, `aiCoachEngine`) feeding Zustand persisted stores; screens compose reusable themed components. All logic local, no network.

**Tech Stack:** Expo (latest stable), TypeScript strict, Expo Router, Zustand + AsyncStorage persist, react-hook-form + zod, date-fns, i18next/react-i18next + expo-localization, react-native-reanimated, expo-haptics, vitest (pure-TS engine tests).

## Global Constraints

- All UI copy through i18n keys — EN (`src/i18n/en.json`) and VI (`src/i18n/vi.json`); no hardcoded user-facing strings in components.
- All colors/spacing/radius/typography from `src/theme/*` tokens — no hardcoded hex values in components.
- Palette (verbatim from spec): Primary Rose `#FF6B8A`, Soft Rose `#FFE4EA`, Lavender `#B99CFF`, Deep Plum `#2A1438`, Cream `#FFF8F2`, Card White `#FFFFFF`, Text Primary `#221326`, Text Secondary `#7A667F`, Success Mint `#6ED6B5`, Warning Peach `#FFB86B`, Error Rose `#F45B69`.
- Wellness positioning: copy never diagnostic ("may be related to your cycle", "not medical advice"); disclaimers at onboarding, AI chat, insights, settings.
- No network calls, no API keys, all data local.
- Dates stored as ISO `yyyy-MM-dd` strings; all date math via date-fns.
- 8pt spacing grid; free tier = 3 AI questions/day.
- Verification each task: `npx tsc --noEmit` clean; engine tasks additionally `npx vitest run` green.

---

### Task 1: Project Scaffold

**Files:**
- Create: Expo app in `/Users/tony/dialuna` (create-expo-app default template, then move router dir to `src/app`)
- Create: `vitest.config.ts`, `.gitignore` (from template), update `package.json` scripts
- Modify: `tsconfig.json` (strict + `@/*` path alias to `src/*`)

**Interfaces:**
- Produces: running Expo project where `src/app/` is the router root and `@/` resolves to `src/`.

- [ ] Step 1: Run `npx create-expo-app@latest . --template default` (in existing repo dir; template tolerates existing git/docs). If it refuses non-empty dir, scaffold in temp dir and move files in.
- [ ] Step 2: Delete example screens/components from template (`app/`, `components/`, `constants/`, `hooks/`, `scripts/reset-project.js` as applicable). Create `src/app/` with minimal `_layout.tsx` (Stack) and `index.tsx` ("Dialuna" placeholder text).
- [ ] Step 3: Install deps: `npx expo install expo-localization expo-haptics @react-native-async-storage/async-storage react-native-reanimated` and `npm i zustand react-hook-form zod @hookform/resolvers date-fns i18next react-i18next` and `npm i -D vitest`.
- [ ] Step 4: Set `tsconfig.json` strict true, paths `{"@/*": ["./src/*"]}`. Add `vitest.config.ts` including only `src/services/**/*.test.ts` and `src/utils/**/*.test.ts`, with `@` alias.
- [ ] Step 5: Verify `npx tsc --noEmit` passes and `npx expo export --platform ios` OR `npx expo start` boots (use `expo export` for non-interactive check if possible; otherwise rely on tsc).
- [ ] Step 6: Commit `chore: scaffold Expo app with core dependencies`.

### Task 2: Theme Tokens + Types + i18n Foundation

**Files:**
- Create: `src/theme/colors.ts`, `src/theme/spacing.ts`, `src/theme/typography.ts`, `src/theme/radius.ts`, `src/theme/shadows.ts`, `src/theme/index.ts`
- Create: `src/types/user.ts`, `src/types/log.ts`, `src/types/cycle.ts`, `src/types/premium.ts`, `src/types/index.ts`
- Create: `src/i18n/index.ts`, `src/i18n/en.json`, `src/i18n/vi.json`

**Interfaces:**
- Produces:
  - `colors` object with keys: `primary, softRose, lavender, deepPlum, cream, card, textPrimary, textSecondary, mint, peach, error` (values = palette in Global Constraints) plus semantic aliases `background` (=cream), `phase: {menstrual, follicular, ovulation, luteal}` (rose/mint/peach/lavender).
  - `spacing(n: number): number` → `n * 8`; `radius = {sm: 12, md: 16, lg: 24, pill: 999}`; `typography` presets `{display, h1, h2, body, bodySmall, caption, button}` (fontSize/weight/lineHeight objects usable in StyleSheet).
  - Types (exact):
    ```ts
    export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
    export type FlowLevel = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';
    export type Symptom = 'cramps' | 'headache' | 'bloating' | 'acne' | 'breastTenderness' | 'backPain' | 'nausea' | 'fatigue';
    export type Mood = 'happy' | 'calm' | 'anxious' | 'sad' | 'angry' | 'sensitive';
    export type WorkoutType = 'none' | 'walking' | 'yoga' | 'strength' | 'cardio' | 'hiit';
    export type Goal = 'understandCycle' | 'reducePms' | 'improveMood' | 'planWorkouts' | 'skinInsights' | 'pregnancyPlanning' | 'betterSleep';
    export type AgeRange = '18-24' | '25-30' | '31-35' | '36-45' | '46+';
    export interface UserProfile { id: string; nickname: string; ageRange: AgeRange; averageCycleLength: number; averagePeriodLength: number; lastPeriodStartDate: string; lastPeriodEndDate: string | null; goals: Goal[]; createdAt: string; }
    export interface DailyLog { date: string; flow: FlowLevel; symptoms: Symptom[]; moods: Mood[]; energyLevel: number; sleepQuality: number; stressLevel: number; workoutType: WorkoutType; note: string; createdAt: string; updatedAt: string; }
    export interface CyclePrediction { cycleDay: number; phase: CyclePhase; isPmsWindow: boolean; nextPeriodStart: string; daysUntilPeriod: number; fertileWindowStart: string; fertileWindowEnd: string; ovulationEstimate: string; pmsWindowStart: string; pmsWindowEnd: string; confidenceScore: number; }
    export interface HormoneTwinDailyProfile { date: string; cycleDay: number; phase: CyclePhase; hormoneTwinScore: number; energyScore: number; moodScore: number; focusScore: number; painRisk: number; pmsProbability: number; coachMessageKey: string; foodTipKeys: string[]; workoutTipKeys: string[]; selfCareTipKeys: string[]; }
    export type PremiumPlan = 'monthly' | 'yearly' | 'lifetime' | null;
    export interface PremiumState { isPremium: boolean; plan: PremiumPlan; aiQuestionsUsedToday: number; lastResetDate: string; }
    ```
  - i18n: `initI18n()` sets device locale (vi → vi, else en); namespace-less flat JSON with dot keys grouped: `common.*, onboarding.*, home.*, calendar.*, log.*, ai.*, insights.*, paywall.*, settings.*, phases.*, symptoms.*, moods.*, workouts.*, goals.*, tips.*, coach.*, disclaimer.*`. Both files must have identical key sets.
- [ ] Steps: write tokens → write types → write i18n init + seed keys for phases/symptoms/moods/workouts/goals/common → `npx tsc --noEmit` → commit `feat: add theme tokens, domain types, i18n foundation`.

### Task 3: Cycle Engine (TDD)

**Files:**
- Create: `src/utils/date.ts`, `src/services/cycleEngine.ts`
- Test: `src/services/cycleEngine.test.ts`

**Interfaces:**
- Consumes: types from Task 2.
- Produces:
  ```ts
  export interface CycleEngineInput { lastPeriodStartDate: string; averageCycleLength: number; averagePeriodLength: number; today: string; }
  export function getCyclePrediction(input: CycleEngineInput): CyclePrediction;
  export function getPhaseForCycleDay(cycleDay: number, periodLength: number, cycleLength: number): CyclePhase;
  export function getDayInfo(date: string, profile: Pick<UserProfile,'lastPeriodStartDate'|'averageCycleLength'|'averagePeriodLength'>): { cycleDay: number; phase: CyclePhase; isPredictedPeriod: boolean; isFertile: boolean; isPms: boolean; isOvulation: boolean };
  ```
- Logic: cycleDay = (daysSince lastStart) mod cycleLength + 1 (works for past & future dates ≥ lastStart). nextPeriodStart = lastStart + ceil((daysSince+1)/cycleLength)*cycleLength (i.e., next multiple strictly after today). Phase: day ≤ periodLength → menstrual; ≤ 12 → follicular; 13–16 → ovulation; else luteal. Clamp for short cycles (if periodLength ≥ 12 treat follicular as empty). PMS window = last 5 days before nextPeriodStart. Ovulation estimate = lastStart-of-current-cycle + (cycleLength − 14); fertile = ovulation ± 3 days. confidenceScore = 0.8 baseline, −0.1 if cycleLength <24 or >35.
- [ ] Steps: write failing tests (cycle day 1 on start date; day 22 → luteal with 28-day cycle; PMS window boundaries; next period countdown; fertile window; wrap to next cycle) → run `npx vitest run` FAIL → implement → PASS → `npx tsc --noEmit` → commit `feat: cycle engine with phase and window predictions`.

### Task 4: Hormone Twin Engine (TDD)

**Files:**
- Create: `src/services/hormoneTwinEngine.ts`
- Test: `src/services/hormoneTwinEngine.test.ts`

**Interfaces:**
- Consumes: `getCyclePrediction`, types.
- Produces:
  ```ts
  export function getHormoneTwinProfile(args: { date: string; profile: UserProfile; logs: Record<string, DailyLog> }): HormoneTwinDailyProfile;
  export function getWeekForecast(args: { startDate: string; profile: UserProfile; logs: Record<string, DailyLog> }): HormoneTwinDailyProfile[]; // 7 entries
  ```
- Logic: base score table per phase (0–100): menstrual `{energy 35, mood 50, focus 45, pain 70, pms 10}`, follicular `{75, 70, 80, 15, 5}`, ovulation `{85, 80, 70, 20, 5}`, luteal `{55, 55, 55, 35, 30}`; if in PMS window override `{40, 40, 45, 65, 85}`. Adjustment: average of last 3 logs' energyLevel/sleepQuality (1–10) shifts energyScore by `(avg−5.5)*4` clamped ±15; stress avg shifts moodScore by `-(avg−5.5)*4` clamped ±15. All scores clamped 0–100. hormoneTwinScore = round(0.4*energy + 0.3*mood + 0.3*focus). `coachMessageKey` = `coach.<phase>` (or `coach.pms`); tip keys = `tips.food.<phase>.[0..2]`, `tips.workout.<phase>.[0..2]`, `tips.selfcare.<phase>.[0..2]` (pms variants when in PMS window).
- [ ] Steps: failing tests (phase base scores; PMS override; log adjustment shifts energy; clamping; 7-day forecast length & dates) → FAIL → implement → PASS → commit `feat: hormone twin daily profile engine`.

### Task 5: AI Coach Engine (TDD)

**Files:**
- Create: `src/services/aiCoachEngine.ts`
- Test: `src/services/aiCoachEngine.test.ts`

**Interfaces:**
- Consumes: Task 3–4 outputs.
- Produces:
  ```ts
  export type AiIntent = 'tired' | 'workout' | 'cravings' | 'mood' | 'food' | 'cramps' | 'week' | 'sleep' | 'general';
  export function detectIntent(question: string): AiIntent;
  export function generateAIResponse(args: { question: string; profile: UserProfile; prediction: CyclePrediction; twin: HormoneTwinDailyProfile; recentLogs: DailyLog[]; t: (key: string, opts?: object) => string }): { text: string; includesDisclaimer: boolean };
  export function generateLogReflection(args: { log: DailyLog; prediction: CyclePrediction; t: (key: string, opts?: object) => string }): string;
  ```
- Logic: `detectIntent` keyword match on EN+VI keywords (tired/mệt, hiit/workout/tập, craving/thèm, mood/tâm trạng, eat/food/ăn, cramp/đau bụng, week/tuần, sleep/ngủ). Response assembled from i18n templates `ai.answer.<intent>.<phaseGroup>` (phaseGroup = phase or 'pms'), + `ai.why.<...>` + `ai.try.<...>`, with interpolation of nickname/cycleDay/daysUntilPeriod/scores. Health-related intents (tired, cramps, mood, cravings, sleep) append `disclaimer.short`. `generateLogReflection`: acknowledges logged symptoms/energy vs phase using `log.reflection.<phaseGroup>` + symptom mention.
- [ ] Steps: failing tests (intent detection EN+VI; response contains phase-contextual text; disclaimer included for cramps, not for week; reflection mentions phase) → FAIL → implement (templates added to en.json/vi.json) → PASS → commit `feat: deterministic AI coach engine`.

### Task 6: Zustand Stores

**Files:**
- Create: `src/store/useUserStore.ts`, `src/store/useLogStore.ts`, `src/store/usePremiumStore.ts`, `src/store/index.ts`

**Interfaces:**
- Produces (all persisted via zustand/middleware `persist` + AsyncStorage `createJSONStorage`):
  ```ts
  // useUserStore
  { profile: UserProfile | null; hasOnboarded: boolean; setProfile(p: UserProfile): void; updateProfile(patch: Partial<UserProfile>): void; completeOnboarding(): void; reset(): void; }
  // useLogStore
  { logs: Record<string, DailyLog>; saveLog(log: DailyLog): void; getLog(date: string): DailyLog | undefined; reset(): void; }
  // usePremiumStore
  { isPremium: boolean; plan: PremiumPlan; aiQuestionsUsedToday: number; lastResetDate: string; canAskAi(): boolean; consumeAiQuestion(): void; purchase(plan: Exclude<PremiumPlan, null>): void; restore(): void; togglePremiumDev(): void; reset(): void; }
  ```
- `canAskAi`/`consumeAiQuestion` reset counter when `lastResetDate !== today`. Free limit 3/day; premium always true. A global `resetAllData()` in `src/store/index.ts` calls all three `reset()`.
- [ ] Steps: implement stores → `npx tsc --noEmit` → commit `feat: persisted user, log, premium stores`.

### Task 7: UI Component Library

**Files:**
- Create in `src/components/ui/`: `Button.tsx` (primary/secondary/ghost, loading state, haptic on press), `Card.tsx` (white rounded-lg card + soft shadow; `variant="glass"` = translucent white), `Chip.tsx` (selectable pill with icon/emoji, selected = softRose bg + primary border), `ScoreRing.tsx` (SVG-free: two nested Views or reanimated arc via `react-native-svg` — install `npx expo install react-native-svg`; animated progress ring, size/score props), `LevelSlider.tsx` (1–10 tap-dots row, label + value), `DisclaimerBox.tsx` (peach-tinted info box, `textKey` prop), `EmptyState.tsx` (emoji, titleKey, bodyKey), `Screen.tsx` (SafeArea + cream bg + optional scroll + gradient header slot; install `npx expo install expo-linear-gradient`), `SectionTitle.tsx`, `GradientHeader.tsx`.
- Create in `src/components/cycle/`: `PhaseBadge.tsx` (phase → color + i18n label pill), `ForecastCard.tsx` (icon, labelKey, score → level word low/steady/high via thresholds <45/<65/else), `WeekStrip.tsx` (7 mini day columns: weekday, phase dot, energy bar).
- Create in `src/components/ai/`: `MessageBubble.tsx` (user right/rose vs coach left/white), `SuggestedPrompts.tsx` (horizontal chip list from `ai.prompts.*`).
- Create in `src/components/paywall/`: `PlanCard.tsx` (planKey, price, badge, selected state), `PremiumBanner.tsx` (lavender gradient CTA card).

**Interfaces:**
- Produces exact props:
  ```ts
  Button: { labelKey?: string; label?: string; onPress(): void; variant?: 'primary'|'secondary'|'ghost'; disabled?: boolean; loading?: boolean }
  Chip: { label: string; emoji?: string; selected: boolean; onPress(): void }
  ScoreRing: { score: number; size?: number; label?: string }
  LevelSlider: { label: string; value: number; onChange(v: number): void }
  ForecastCard: { emoji: string; labelKey: string; score: number }
  PhaseBadge: { phase: CyclePhase; pms?: boolean }
  ```
- [ ] Steps: install svg + linear-gradient → implement components (tokens only, accessibility labels, 44pt min targets) → tsc → commit `feat: themed UI component library`.

### Task 8: Navigation Shell + Root Gate

**Files:**
- Create: `src/app/_layout.tsx` (i18n init, reanimated import, Stack with `(tabs)`, `onboarding`, `paywall` modal, `settings`), `src/app/index.tsx` (Redirect → `/onboarding` if `!hasOnboarded` else `/(tabs)/home`), `src/app/(tabs)/_layout.tsx` (5 tabs: home 🌙, calendar 📅, log ➕, ai ✨, insights 📊 — emoji or vector icons from `@expo/vector-icons`, active tint primary, cream bar).

**Interfaces:**
- Consumes: `useUserStore.hasOnboarded`.
- Produces: routes `/(tabs)/home|calendar|log|ai|insights`, `/onboarding`, `/paywall` (presentation modal), `/settings`. Placeholder screens for all tabs (SectionTitle only) so navigation is testable before screens land.
- [ ] Steps: implement layouts + placeholder tab screens → tsc → boot check → commit `feat: navigation shell with onboarding gate`.

### Task 9: Onboarding Flow

**Files:**
- Create: `src/app/onboarding/_layout.tsx` (Stack, no header), `welcome.tsx`, `disclaimer.tsx`, `profile.tsx`, `last-period.tsx`, `goals.tsx`, `notifications.tsx`, `paywall-preview.tsx`, plus `src/app/onboarding/index.tsx` (redirect → welcome), and `src/features/onboarding/useOnboardingDraft.ts` (non-persisted zustand draft store holding partial profile between steps).
- Create: `src/utils/validation.ts` (zod schemas: nickname 1–30 chars; cycleLength 20–45; periodLength 2–10; lastPeriodStartDate valid past date within 60 days).

**Interfaces:**
- Consumes: Button, Screen, Chip, DisclaimerBox, LevelSlider, stores, validation.
- Produces: on final step "Continue free" (or mock purchase) → builds `UserProfile` (id = `Date.now().toString(36)`), `setProfile`, `completeOnboarding`, `router.replace('/(tabs)/home')`.
- Screen specifics: welcome = gradient hero (moon emoji art), title `onboarding.welcome.title`, CTA; disclaimer = DisclaimerBox with full wellness text + "I understand" gate; profile = RHF+zod form (nickname text, ageRange chips, two steppers for cycle/period length defaults 28/5); last-period = date selection via simple in-app calendar grid (reuse date utils; no external picker) for start date + optional duration stepper; goals = multi-select chip grid (7 goals); notifications = soft-ask UI with 3 toggle rows (visual only) + Continue (no real permission call in MVP); paywall-preview = benefits list + plans preview + "Continue free" prominent.
- [ ] Steps: draft store → validation → screens in order → manual flow check (fresh install → complete onboarding → lands on home; hasOnboarded persists) → tsc → commit `feat: onboarding flow`.

### Task 10: Home Dashboard

**Files:**
- Create: `src/app/(tabs)/home.tsx`, `src/features/home/HomeScreen.tsx`

**Interfaces:**
- Consumes: `getCyclePrediction`, `getHormoneTwinProfile`, `getWeekForecast`, stores, ScoreRing, ForecastCard, PhaseBadge, WeekStrip, PremiumBanner, DisclaimerBox.
- Produces: sections in order — greeting (`home.greeting.morning|afternoon|evening` + nickname, settings gear → `/settings`), cycle summary card (Cycle Day N + PhaseBadge + period countdown `home.periodIn`), Hormone Twin ScoreRing card (score/100 + `home.twinScore`), 4 ForecastCards grid (energy ⚡, mood 🌸, pain 🩹 (inverted: level from 100−painRisk), focus 🎯), AI coach card (twin.coachMessageKey text + `Ask AI` button → `/(tabs)/ai`), Log CTA card (→ `/(tabs)/log`), WeekStrip 7-day preview (premium: full; free: first 2 days + lock overlay CTA → `/paywall`), PremiumBanner (hidden when premium).
- [ ] Steps: implement → verify with seeded profile (visual) → tsc → commit `feat: home dashboard`.

### Task 11: Calendar Screen

**Files:**
- Create: `src/app/(tabs)/calendar.tsx`, `src/features/calendar/CalendarScreen.tsx`, `src/features/calendar/MonthGrid.tsx`, `src/features/calendar/DayDetailSheet.tsx`, `src/components/cycle/CalendarDayCell.tsx`

**Interfaces:**
- Consumes: `getDayInfo`, logs store.
- Produces: month header with ‹ › navigation; 7-col grid from date-fns (`startOfMonth`, `startOfWeek(weekStartsOn:1)`); `CalendarDayCell` props `{ date: string; state: { isPeriodLogged: boolean; isPredictedPeriod: boolean; isFertile: boolean; isPms: boolean; isOvulation: boolean; isToday: boolean; hasLog: boolean; isHighEnergy: boolean } ; onPress(date: string): void }` — period = primary fill, predicted period = primary outline dashed, fertile = mint tint, ovulation = mint dot, PMS = peach tint, high-energy (follicular/ovulation) = tiny ⚡, log dot underneath; legend row below grid; tapping a date opens DayDetailSheet (modal) with that date's twin profile summary + log shortcut.
- [ ] Steps: MonthGrid + cell → legend → detail sheet → tsc → commit `feat: cycle calendar`.

### Task 12: Daily Log Screen

**Files:**
- Create: `src/app/(tabs)/log.tsx`, `src/features/log/LogScreen.tsx`

**Interfaces:**
- Consumes: Chip, LevelSlider, Button, log store, `generateLogReflection`, haptics.
- Produces: form state seeded from existing log for today (edit-in-place); sections — flow (5 single-select chips), symptoms (8 multi chips w/ emoji), mood (6 multi chips), energy/sleep/stress LevelSliders, workout (6 single chips), note (multiline TextInput, keyboard-safe via KeyboardAvoidingView), Save button → `saveLog` → success haptic + inline AI reflection card (from `generateLogReflection`) with fade-in.
- [ ] Steps: implement → manual check (save → reflection shows; reopen → values persist) → tsc → commit `feat: daily log with AI reflection`.

### Task 13: AI Coach Chat

**Files:**
- Create: `src/app/(tabs)/ai.tsx`, `src/features/ai/AiChatScreen.tsx`, `src/features/ai/useChat.ts`

**Interfaces:**
- Consumes: `generateAIResponse`, premium store (`canAskAi`, `consumeAiQuestion`), MessageBubble, SuggestedPrompts, DisclaimerBox.
- Produces: `useChat` keeps in-memory message list `{id, role: 'user'|'coach', text}[]`; sending: if `!canAskAi()` → `router.push('/paywall')`; else consume, append user msg, 600ms delayed coach reply (typing indicator). Header shows remaining questions for free users (`ai.remaining`, count). Suggested prompts (7 from spec) fill input. Persistent DisclaimerBox footer `disclaimer.ai`.
- [ ] Steps: implement → manual check (3 questions then paywall; premium toggle → unlimited) → tsc → commit `feat: AI coach chat with free-tier gating`.

### Task 14: Insights Screen

**Files:**
- Create: `src/app/(tabs)/insights.tsx`, `src/features/insights/InsightsScreen.tsx`, `src/services/insightsEngine.ts`
- Test: `src/services/insightsEngine.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export function computeInsights(args: { profile: UserProfile; logs: Record<string, DailyLog> }): { logCount: number; avgCycleLength: number; topSymptoms: {symptom: Symptom; count: number}[]; avgEnergyByPhase: Partial<Record<CyclePhase, number>>; avgSleepByPhase: Partial<Record<CyclePhase, number>>; pmsSummaryKey: string; aiSummaryKey: string };
  ```
- Screen: if `logCount < 3` → EmptyState (`insights.empty.*`); else cards — cycle overview (avg length, regularity label from confidence), top symptoms (chips + counts), energy pattern (per-phase mini bars), sleep correlation line (`insights.sleep.text` with interpolated values), PMS window prediction card, AI summary card (peach) + DisclaimerBox. Premium: full detail; free: show first 2 cards + locked overlay CTA → `/paywall`.
- [ ] Steps: failing tests for computeInsights (top symptoms count, per-phase averages) → implement → PASS → screen → tsc → commit `feat: insights with computed patterns`.

### Task 15: Paywall + Settings

**Files:**
- Create: `src/app/paywall.tsx`, `src/features/paywall/PaywallScreen.tsx`
- Create: `src/app/settings.tsx`, `src/features/settings/SettingsScreen.tsx`, plus `src/app/settings/privacy.tsx`? — no: single settings screen with sub-sections + `src/features/settings/rows.tsx` helpers. Privacy & disclaimer shown as expandable sections inline.

**Interfaces:**
- Paywall: lavender→plum gradient hero, benefits list (6 items `paywall.benefit.*`), 3 PlanCards (monthly $6.99, yearly $39.99 + `paywall.saveBadge`, lifetime $99 — mock prices with `paywall.mockNote`), select → `purchase(plan)` → success haptic + dismiss; `restore` link (mock: no-op toast); fine print + close X.
- Settings sections: Profile (nickname/ageRange edit inline form), Cycle (cycle/period length steppers, last period date re-entry), Notifications (3 visual toggles persisted in user store? — keep local component state + note `settings.notifDeferred`), Language (EN/VI segmented → `i18n.changeLanguage` + persist choice in AsyncStorage key `dialuna.lang`), Privacy (expandable text `settings.privacy.body`), Medical disclaimer (expandable `disclaimer.full`), Export data (disabled row `settings.export.soon`), Premium (status + dev toggle `togglePremiumDev` + manage → `/paywall`), Delete all data (destructive confirm Alert → `resetAllData()` → router.replace('/onboarding')).
- [ ] Steps: paywall → settings → manual checks (purchase unlocks WeekStrip/AI; delete data returns to onboarding; language switch flips copy) → tsc → commit `feat: paywall and settings`.

### Task 16: Polish + Final Verification

**Files:**
- Modify: screens/components as needed; Create: `README.md`

**Interfaces:** none new.

- [ ] Step 1: Animations — reanimated FadeInDown entrance on home cards, ScoreRing sweep, log save success, paywall slide-up. Haptics on save/purchase/chip select (light).
- [ ] Step 2: Sweep for hardcoded colors/strings (`grep -rn '#[0-9A-Fa-f]\{6\}' src --include='*.tsx' | grep -v theme` must be empty; grep for quoted English literals in JSX). Verify en.json/vi.json key parity with a small node script.
- [ ] Step 3: Accessibility pass — `accessibilityRole`/`accessibilityLabel` on all touchables; check tap targets.
- [ ] Step 4: README — product summary, setup (`npm install`, `npx expo start`), project structure, testing (`npx vitest run`), disclaimer, roadmap (RevenueCat, backend AI proxy, Apple Health, dark mode, notifications).
- [ ] Step 5: Full verification — `npx tsc --noEmit` ✅, `npx vitest run` ✅, `npx expo export` (or boot) ✅, acceptance checklist from spec §19 walked through.
- [ ] Step 6: Commit `chore: polish, accessibility, README`.
