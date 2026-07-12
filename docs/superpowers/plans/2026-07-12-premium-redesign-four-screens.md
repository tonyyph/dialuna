# Premium Redesign (Onboarding, Coach, Paywall, Settings) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Onboarding, AI Coach, Paywall, and Settings to the handoff design language, re-theme the global token system, and ship a real light/dark theme switch.

**Architecture:** A new persisted `useSettingsStore` holds the theme (plus notifications/luteal/units); a `useTheme()` hook returns the active palette and components read colors from it at render time (layout stays in `StyleSheet.create`, theme-dependent colors are applied inline via style arrays). The old static `colors` export stays alive during migration and is deleted in the final cleanup task.

**Tech Stack:** Expo 57 / RN 0.86, expo-router, Zustand 5 (persist + AsyncStorage), react-native-reanimated 4, expo-linear-gradient, react-i18next (EN/VI), vitest, zod.

**Spec:** `docs/superpowers/specs/2026-07-12-premium-redesign-four-screens-design.md`
**Design reference:** `design_handoff_dialuna/README.md` + `design_handoff_dialuna/Dialuna.dc.html`

## Global Constraints

- Only new dependencies allowed: `@expo-google-fonts/cormorant-garamond`, `@expo-google-fonts/manrope` (install via `npx expo install`).
- Every user-facing string goes through i18n with keys in BOTH `src/i18n/en.json` and `src/i18n/vi.json`.
- No visible borders on cards/buttons/chips/inputs in the new design (`borderWidth` only on paywall plan rows, 1.5px).
- Styling pattern: layout/spacing/radius in `StyleSheet.create`; theme-dependent colors inline: `<View style={[styles.card, { backgroundColor: p.surface }]}>` where `const p = useTheme()`.
- Preserve existing accessibility props (`accessibilityRole`, `accessibilityLabel`, `accessibilityState`) and haptics patterns (`Haptics.selectionAsync()` on select-type taps, `impactAsync(Light)` on buttons).
- Paths use the `@/` alias = `src/`.
- Commits end with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Verification trio (run at the end of every task): `npm run typecheck && npm run lint && npm run test` — all must pass.
- Transitional states are allowed to look mixed (old pink screens alongside new gold ones) but must always compile and pass the trio.

## Token reference (used by every UI task)

Palette fields (defined in Task 3, exact object below): `bgGradient`, `heroGradient`, `goldChipGradient`, `premiumBannerGradient`, `text`, `textMuted`, `textFaint`, `surface`, `surfaceStrong`, `surfaceSolid`, `fillSubtle`, `track`, `overlay`, `accent`, `accent100`–`accent900`, `primaryBtn`, `onPrimaryBtn`, `danger`, `success`, `phase.{menstrual,follicular,ovulation,luteal}`, `phaseSoft.{...}`, `shadowColor`.

**Old→new mapping table** (apply wherever old tokens appear; `p` = `useTheme()` result):

| Old token | New |
|---|---|
| `colors.primary` | `p.accent` |
| `colors.primaryPressed` | `p.accent600` |
| `colors.textPrimary` / `colors.text.primary` | `p.text` |
| `colors.textSecondary` / `colors.text.secondary` | `p.textMuted` |
| `colors.text.tertiary` | `p.textFaint` |
| `colors.card` as a background | `p.surfaceSolid` |
| `colors.card` as text-on-dark/on-primary | `p.onPrimaryBtn` |
| `colors.softRose` / `colors.blush` | `p.accent100` |
| `colors.cream` / `colors.pearl` | `p.surfaceSolid` |
| `colors.background` / `colors.surface.background` | first stop of `p.bgGradient` (only where a flat color is required) |
| `colors.border` / `colors.glassBorder` / `colors.divider` | delete the border (`borderWidth: 0` / remove the style keys) |
| `colors.glass` / `colors.surface.glass` | `p.surface` |
| `colors.glassStrong` / `colors.surface.glassStrong` | `p.surfaceStrong` |
| `colors.deepPlum` as fill | `p.primaryBtn` |
| `colors.deepPlum` as shadowColor | `p.shadowColor` (or keep static `shadows.*` token) |
| `colors.error` / `colors.semantic.danger` | `p.danger` |
| `colors.mint` / `colors.semantic.success` | `p.success` |
| `colors.gold` / `colors.peach` | `p.accent400` |
| `colors.iris` / `colors.lavender` / `colors.aqua` / `colors.coral` / `colors.berry` | nearest of `p.accent` / `p.accent600` / `p.accent800` (judgement: keep tonal-gold monochrome) |
| `colors.overlay` | `p.overlay` |
| `colors.phase.X` | `p.phase.X` |
| `colors.phaseSoft.X` | `p.phaseSoft.X` |
| `colors.gradients.app` | `p.bgGradient` |
| `colors.gradients.gold` | `p.goldChipGradient` |
| `colors.gradients.hero` / `colors.gradients.night` | `p.heroGradient` |
| `colors.gradients.glass` | delete the gradient overlay (plain `p.surface` fill) |
| `shadows.xs` | `shadows.tiny` |
| `shadows.sm` | `shadows.soft` |
| `shadows.md` | `shadows.float` |
| `shadows.lg` | `shadows.hero` |
| `shadows.glow` / `legacyShadowAliases.card` | `shadows.button` / `shadows.soft` |

---

### Task 1: Settings store

**Files:**
- Create: `src/store/useSettingsStore.ts`
- Create: `src/store/useSettingsStore.test.ts`
- Modify: `src/store/index.ts`
- Modify: `src/app/_layout.tsx` (hydration gate)

**Interfaces:**
- Produces: `useSettingsStore` — Zustand store with state `{ notifPeriod: boolean; notifOvulation: boolean; notifDaily: boolean; lutealLength: number; units: 'us' | 'metric'; theme: 'light' | 'dark' }` and actions `set(patch)`, `reset()`. `set` clamps `lutealLength` to 10–16. Exported from `@/store`. `resetAllData()` now also resets settings.

- [ ] **Step 1: Write the failing test**

`src/store/useSettingsStore.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest';

import { useSettingsStore } from './useSettingsStore';

describe('useSettingsStore', () => {
  beforeEach(() => useSettingsStore.getState().reset());

  it('has the documented defaults', () => {
    const s = useSettingsStore.getState();
    expect(s.notifPeriod).toBe(true);
    expect(s.notifOvulation).toBe(true);
    expect(s.notifDaily).toBe(false);
    expect(s.lutealLength).toBe(14);
    expect(s.units).toBe('us');
    expect(s.theme).toBe('light');
  });

  it('sets fields via patch', () => {
    useSettingsStore.getState().set({ theme: 'dark', units: 'metric', notifDaily: true });
    const s = useSettingsStore.getState();
    expect(s.theme).toBe('dark');
    expect(s.units).toBe('metric');
    expect(s.notifDaily).toBe(true);
  });

  it('clamps lutealLength to 10-16', () => {
    useSettingsStore.getState().set({ lutealLength: 3 });
    expect(useSettingsStore.getState().lutealLength).toBe(10);
    useSettingsStore.getState().set({ lutealLength: 99 });
    expect(useSettingsStore.getState().lutealLength).toBe(16);
    useSettingsStore.getState().set({ lutealLength: 12 });
    expect(useSettingsStore.getState().lutealLength).toBe(12);
  });

  it('reset restores defaults', () => {
    useSettingsStore.getState().set({ theme: 'dark', lutealLength: 12 });
    useSettingsStore.getState().reset();
    expect(useSettingsStore.getState().theme).toBe('light');
    expect(useSettingsStore.getState().lutealLength).toBe(14);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/store/useSettingsStore.test.ts`
Expected: FAIL — cannot resolve `./useSettingsStore`.

- [ ] **Step 3: Implement the store**

`src/store/useSettingsStore.ts` (mirror the persist pattern of `useUserStore.ts`):

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AppTheme = 'light' | 'dark';
export type Units = 'us' | 'metric';

interface SettingsState {
  notifPeriod: boolean;
  notifOvulation: boolean;
  notifDaily: boolean;
  /** Days, clamped 10-16. Feeds the cycle engine's ovulation estimate. */
  lutealLength: number;
  units: Units;
  theme: AppTheme;
}

interface SettingsStore extends SettingsState {
  set: (patch: Partial<SettingsState>) => void;
  reset: () => void;
}

const DEFAULTS: SettingsState = {
  notifPeriod: true,
  notifOvulation: true,
  notifDaily: false,
  lutealLength: 14,
  units: 'us',
  theme: 'light',
};

const clampLuteal = (n: number) => Math.min(16, Math.max(10, Math.round(n)));

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      set: (patch) =>
        set(
          patch.lutealLength === undefined
            ? patch
            : { ...patch, lutealLength: clampLuteal(patch.lutealLength) }
        ),
      reset: () => set(DEFAULTS),
    }),
    {
      name: 'dialuna.settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/store/useSettingsStore.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Export from the store barrel and wire resetAllData + hydration**

`src/store/index.ts` — full new content:

```ts
import { useLogStore } from './useLogStore';
import { usePremiumStore } from './usePremiumStore';
import { useSettingsStore } from './useSettingsStore';
import { useUserStore } from './useUserStore';

export { useLogStore, usePremiumStore, useSettingsStore, useUserStore };
export type { AppTheme, Units } from './useSettingsStore';

/** Wipes every persisted store — used by Settings "Delete all data". */
export function resetAllData(): void {
  useUserStore.getState().reset();
  useLogStore.getState().reset();
  usePremiumStore.getState().reset();
  useSettingsStore.getState().reset();
}
```

In `src/app/_layout.tsx`, add `useSettingsStore` to the hydration gate: import it from `@/store`, and in `useStoresHydrated` add `useSettingsStore.persist.hasHydrated()` to both the initial check and `check()`, and `useSettingsStore.persist.onFinishHydration(check)` to `subs`.

- [ ] **Step 6: Verify and commit**

Run: `npm run typecheck && npm run lint && npm run test` — all pass.

```bash
git add src/store/ src/app/_layout.tsx
git commit -m "feat: add persisted settings store (theme, notifications, luteal, units)"
```

---

### Task 2: Parameterize luteal length in the cycle engine

**Files:**
- Modify: `src/services/cycleEngine.ts`
- Modify: `src/services/cycleEngine.test.ts`
- Modify: `src/services/hormoneTwinEngine.ts`, `src/services/insightsEngine.ts` (accept + forward optional `lutealLength`)
- Modify: `src/features/cycle/useCycleToday.ts`, `src/features/calendar/CalendarScreen.tsx`, `src/features/insights/InsightsScreen.tsx` (thread from settings store)

**Interfaces:**
- Consumes: `useSettingsStore` from Task 1.
- Produces: `CycleEngineInput` gains optional `lutealLength?: number` (default 14). `getPhaseForCycleDay(cycleDay, periodLength, cycleLength, lutealLength = 14)`. `getDayInfo(date, profile, lutealLength = 14)`. `getHormoneTwinProfile`/`getWeekForecast`/`computeInsights` arg objects gain optional `lutealLength?: number` forwarded to their internal `getCyclePrediction` calls. **Behavior at the default (14) must be byte-identical to today for 28-day cycles.**

- [ ] **Step 1: Add failing tests**

Append to `src/services/cycleEngine.test.ts`:

```ts
describe('lutealLength parameter', () => {
  it('defaults to 14 (existing behavior unchanged)', () => {
    const a = getCyclePrediction({ ...profile, today: '2026-06-20' });
    const b = getCyclePrediction({ ...profile, today: '2026-06-20', lutealLength: 14 });
    expect(b).toEqual(a);
  });

  it('shifts ovulation estimate with a short luteal phase (10)', () => {
    const p = getCyclePrediction({ ...profile, today: '2026-06-20', lutealLength: 10 });
    // next period 2026-07-12, minus 10 days luteal
    expect(p.ovulationEstimate).toBe('2026-07-02');
    expect(p.fertileWindowStart).toBe('2026-06-29');
    expect(p.fertileWindowEnd).toBe('2026-07-05');
  });

  it('shifts phase boundaries with a long luteal phase (16)', () => {
    // 28-day cycle, luteal 16 → ovulation cycle day 13, luteal from day 15
    expect(getPhaseForCycleDay(10, 5, 28, 16)).toBe('follicular');
    expect(getPhaseForCycleDay(12, 5, 28, 16)).toBe('ovulation');
    expect(getPhaseForCycleDay(15, 5, 28, 16)).toBe('luteal');
  });

  it('keeps default phase boundaries for a 28/5 cycle', () => {
    expect(getPhaseForCycleDay(12, 5, 28)).toBe('follicular');
    expect(getPhaseForCycleDay(13, 5, 28)).toBe('ovulation');
    expect(getPhaseForCycleDay(16, 5, 28)).toBe('ovulation');
    expect(getPhaseForCycleDay(17, 5, 28)).toBe('luteal');
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/services/cycleEngine.test.ts`
Expected: FAIL (extra-arg tests; `lutealLength` not in input type at typecheck).

- [ ] **Step 3: Implement**

In `src/services/cycleEngine.ts`:

```ts
export const LUTEAL_LENGTH_DEFAULT = 14;
```

- `CycleEngineInput` gains `lutealLength?: number;`.
- Delete `const LUTEAL_LENGTH = 14;`.
- Rewrite `getPhaseForCycleDay`:

```ts
export function getPhaseForCycleDay(
  cycleDay: number,
  periodLength: number,
  cycleLength: number,
  lutealLength: number = LUTEAL_LENGTH_DEFAULT
): CyclePhase {
  // Ovulation lands lutealLength days before the next period (cycle day
  // cycleLength - lutealLength + 1); window is O-2..O+1, follicular ends O-3.
  const ovulationDay = cycleLength - lutealLength + 1;
  const follicularEnd = Math.max(periodLength, ovulationDay - 3);
  const ovulationEnd = Math.min(cycleLength - 1, ovulationDay + 1);
  if (cycleDay <= periodLength) return 'menstrual';
  if (cycleDay <= follicularEnd) return 'follicular';
  if (cycleDay <= ovulationEnd) return 'ovulation';
  return 'luteal';
}
```

(Check: 28/5/14 → ovulationDay 15, follicularEnd 12, ovulationEnd 16 — identical to the old `min(12, 26)` / `min(16, 27)` behavior.)

- In `getCyclePrediction`: `const lutealLength = input.lutealLength ?? LUTEAL_LENGTH_DEFAULT;`, use it in `ovulationEstimate = addDaysISO(cycleStart, input.averageCycleLength - lutealLength)` and pass it as 4th arg to `getPhaseForCycleDay`.
- `getDayInfo(date, profile, lutealLength: number = LUTEAL_LENGTH_DEFAULT)`: forward into its internal `getCyclePrediction` call and both `getPhaseForCycleDay` calls.

In `hormoneTwinEngine.ts` and `insightsEngine.ts`: add `lutealLength?: number` to the args objects of `getHormoneTwinProfile`, `getWeekForecast`, `computeInsights` (and `insightsEngine.ts`'s local phase helper at line ~24 if it takes explicit args) and forward to every internal `getCyclePrediction`/`getPhaseForCycleDay` call.

Thread from UI:
- `useCycleToday.ts`: `const lutealLength = useSettingsStore((s) => s.lutealLength);` include in the `getCyclePrediction`/`getHormoneTwinProfile`/`getWeekForecast` calls and the `useMemo` dep array.
- `CalendarScreen.tsx`: same store read; pass as 3rd arg to `getDayInfo(iso, profile, lutealLength)` and into its `getCyclePrediction` call.
- `InsightsScreen.tsx`: pass into `computeInsights`.

- [ ] **Step 4: Run tests to verify pass**

Run: `npx vitest run` — all suites pass (existing cycle tests unchanged and green).

- [ ] **Step 5: Verify and commit**

Run: `npm run typecheck && npm run lint && npm run test`

```bash
git add src/services/ src/features/cycle/ src/features/calendar/CalendarScreen.tsx src/features/insights/InsightsScreen.tsx
git commit -m "feat: parameterize luteal phase length in cycle engine, wired to settings"
```

---

### Task 3: Theme foundation — palettes, useTheme, fonts, typography, shadows

**Files:**
- Create: `src/theme/palettes.ts`
- Create: `src/theme/useTheme.ts`
- Modify: `src/theme/typography.ts`, `src/theme/shadows.ts`, `src/theme/radius.ts`, `src/theme/index.ts`
- Modify: `src/app/_layout.tsx` (fonts, status bar, stack background)
- Modify: `package.json` (font deps)

**Interfaces:**
- Consumes: `useSettingsStore` (Task 1).
- Produces:
  - `useTheme(): Palette` from `@/theme` — components call it inside render.
  - `palettes: { light: Palette; dark: Palette }`, `paywallColors` (static).
  - `typography` tokens (NO color field): `display, hero, headline, headlineSm, title, score, serifValue, subtitle, body, bodySmall, caption, kicker, micro, button`.
  - `shadows` tokens: `tiny, soft, float, hero, button, chip` (+ old names `xs/sm/md/lg/glow` kept as aliases until Task 11).
  - `radius.button = 18`, `radius.dock = 31` added.
  - Old `colors` export untouched (removed in Task 11).

- [ ] **Step 1: Install fonts**

Run: `npx expo install @expo-google-fonts/cormorant-garamond @expo-google-fonts/manrope`
Expected: both added to `package.json` dependencies.

- [ ] **Step 2: Create palettes**

`src/theme/palettes.ts`:

```ts
import type { CyclePhase } from '@/types';

export type ThemeName = 'light' | 'dark';

export interface Palette {
  name: ThemeName;
  /** Full-screen warm background gradient (top → bottom). */
  bgGradient: readonly [string, string, string];
  /** Today hero panel gradient. */
  heroGradient: readonly [string, string, string];
  /** Selected chip fill gradient (gold). */
  goldChipGradient: readonly [string, string];
  /** Premium banner dark gradient. */
  premiumBannerGradient: readonly [string, string];
  text: string;
  textMuted: string;
  textFaint: string;
  /** Soft translucent card fill. */
  surface: string;
  /** Stronger translucent fill: inputs, circular buttons, dock. */
  surfaceStrong: string;
  /** Opaque light surface: floating badge, stepper buttons. */
  surfaceSolid: string;
  /** Subtle contrast fill: segmented controls, tertiary buttons. */
  fillSubtle: string;
  /** Progress/track background. */
  track: string;
  overlay: string;
  accent: string;
  accent100: string;
  accent200: string;
  accent300: string;
  accent400: string;
  accent500: string;
  accent600: string;
  accent700: string;
  accent800: string;
  accent900: string;
  /** Primary button fill + label color on it. */
  primaryBtn: string;
  onPrimaryBtn: string;
  danger: string;
  success: string;
  phase: Record<CyclePhase, string>;
  phaseSoft: Record<CyclePhase, string>;
  shadowColor: string;
}

const ramp = {
  accent100: '#fff3e4',
  accent200: '#ffe3bf',
  accent300: '#facb8d',
  accent400: '#e1ad66',
  accent500: '#c28d41',
  accent600: '#a06f24',
  accent700: '#7d5411',
  accent800: '#5a3b0a',
  accent900: '#3a270d',
} as const;

const light: Palette = {
  name: 'light',
  bgGradient: ['#fbf3ec', '#f7ecee', '#f1e9f0'],
  heroGradient: ['#fff3e4', '#fbf3ec', '#f6ecf1'],
  goldChipGradient: ['#facb8d', '#ffe3bf'],
  premiumBannerGradient: ['#2c2620', '#3a2f22'],
  text: '#201f1d',
  textMuted: 'rgba(32,31,29,0.65)',
  textFaint: 'rgba(32,31,29,0.5)',
  surface: 'rgba(255,255,255,0.55)',
  surfaceStrong: 'rgba(255,255,255,0.7)',
  surfaceSolid: '#fffdfb',
  fillSubtle: 'rgba(0,0,0,0.05)',
  track: 'rgba(0,0,0,0.06)',
  overlay: 'rgba(32,24,16,0.45)',
  accent: '#b68235',
  ...ramp,
  primaryBtn: '#2d2b2b',
  onPrimaryBtn: '#fbf3ec',
  danger: '#b3453c',
  success: '#7d5411',
  phase: {
    menstrual: '#e1ad66',
    follicular: '#c28d41',
    ovulation: '#b68235',
    luteal: '#7d5411',
  },
  phaseSoft: {
    menstrual: '#fff3e4',
    follicular: '#ffe3bf',
    ovulation: '#facb8d',
    luteal: '#f0e4d3',
  },
  shadowColor: '#5a3c14',
};

const dark: Palette = {
  name: 'dark',
  bgGradient: ['#211d24', '#1f1b21', '#1c1a1f'],
  heroGradient: ['#2c2530', '#241f27', '#221d24'],
  goldChipGradient: ['#c28d41', '#a06f24'],
  premiumBannerGradient: ['#2c2620', '#3a2f22'],
  text: '#f3f2f2',
  textMuted: 'rgba(243,242,242,0.65)',
  textFaint: 'rgba(243,242,242,0.5)',
  surface: 'rgba(255,255,255,0.07)',
  surfaceStrong: 'rgba(255,255,255,0.12)',
  surfaceSolid: '#2b272e',
  fillSubtle: 'rgba(255,255,255,0.08)',
  track: 'rgba(255,255,255,0.1)',
  overlay: 'rgba(0,0,0,0.6)',
  accent: '#e1ad66',
  ...ramp,
  primaryBtn: '#f3f2f2',
  onPrimaryBtn: '#201f1d',
  danger: '#e08079',
  success: '#facb8d',
  phase: {
    menstrual: '#e1ad66',
    follicular: '#c28d41',
    ovulation: '#facb8d',
    luteal: '#a06f24',
  },
  phaseSoft: {
    menstrual: 'rgba(225,173,102,0.2)',
    follicular: 'rgba(194,141,65,0.2)',
    ovulation: 'rgba(250,203,141,0.22)',
    luteal: 'rgba(160,111,36,0.2)',
  },
  shadowColor: '#000000',
};

export const palettes: Record<ThemeName, Palette> = { light, dark };

/** The paywall is always dark, independent of app theme. */
export const paywallColors = {
  bg: '#1f1c18',
  text: '#f4ede1',
  textDim: 'rgba(244,237,225,0.65)',
  textFaint: 'rgba(244,237,225,0.55)',
  segment: 'rgba(244,237,225,0.25)',
  border: 'rgba(244,237,225,0.2)',
  closeFill: 'rgba(255,255,255,0.1)',
  accent: '#b68235',
  accentTint: 'rgba(182,130,53,0.14)',
  badge: '#5a3b0a',
  ctaText: '#1a1712',
} as const;
```

- [ ] **Step 3: Create useTheme**

`src/theme/useTheme.ts`:

```ts
import { useSettingsStore } from '@/store/useSettingsStore';

import { Palette, palettes } from './palettes';

export function useTheme(): Palette {
  const theme = useSettingsStore((s) => s.theme);
  return palettes[theme];
}
```

(Import from `@/store/useSettingsStore` directly, not the barrel, to avoid a `theme ↔ store` barrel cycle.)

- [ ] **Step 4: Rewrite typography (new fonts, no baked colors)**

`src/theme/typography.ts` — full new content:

```ts
import { TextStyle } from 'react-native';

/**
 * Type scale per the 2026-07 design handoff. No colors here — text color
 * always comes from useTheme() at the usage site.
 */
export const typography = {
  display: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 42, lineHeight: 46 },
  hero: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 34, lineHeight: 38 },
  headline: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 28, lineHeight: 33 },
  headlineSm: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 24, lineHeight: 28 },
  title: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 19, lineHeight: 24 },
  score: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 32, lineHeight: 34 },
  serifValue: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 20, lineHeight: 24 },
  subtitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 15, lineHeight: 20 },
  body: { fontFamily: 'Manrope_400Regular', fontSize: 14, lineHeight: 21 },
  bodySmall: { fontFamily: 'Manrope_400Regular', fontSize: 13, lineHeight: 19 },
  caption: { fontFamily: 'Manrope_500Medium', fontSize: 12, lineHeight: 16 },
  kicker: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  micro: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  button: { fontFamily: 'Manrope_600SemiBold', fontSize: 14, lineHeight: 18 },
} satisfies Record<string, TextStyle>;
```

- [ ] **Step 5: Rewrite shadows (warm), extend radius**

`src/theme/shadows.ts` — full new content:

```ts
import { ViewStyle } from 'react-native';

const warm = '#5a3c14';

const tiny: ViewStyle = {
  shadowColor: warm, shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08, shadowRadius: 8, elevation: 1,
};
const soft: ViewStyle = {
  shadowColor: warm, shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.08, shadowRadius: 24, elevation: 3,
};
const float: ViewStyle = {
  shadowColor: '#3c2814', shadowOffset: { width: 0, height: 14 },
  shadowOpacity: 0.16, shadowRadius: 34, elevation: 8,
};
const hero: ViewStyle = {
  shadowColor: '#785411', shadowOffset: { width: 0, height: 18 },
  shadowOpacity: 0.14, shadowRadius: 40, elevation: 6,
};
const button: ViewStyle = {
  shadowColor: '#000000', shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.16, shadowRadius: 22, elevation: 4,
};
const chip: ViewStyle = {
  shadowColor: '#785411', shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.22, shadowRadius: 14, elevation: 3,
};

export const shadows = {
  none: {},
  tiny, soft, float, hero, button, chip,
  // Legacy aliases — deleted in the cleanup task once no consumer remains.
  xs: tiny, sm: soft, md: float, lg: hero, glow: button,
} satisfies Record<string, ViewStyle>;

// Deprecated; Card.tsx migrates off this in the redesign, then it's deleted.
export const legacyShadowAliases = { card: soft } satisfies Record<string, ViewStyle>;
```

`src/theme/radius.ts` — add two keys to the object: `button: 18,` and `dock: 31,`.

- [ ] **Step 6: Export from theme barrel and load fonts**

`src/theme/index.ts` — full new content:

```ts
export { colors } from './colors'; // legacy — removed in cleanup task
export { palettes, paywallColors } from './palettes';
export type { Palette, ThemeName } from './palettes';
export { useTheme } from './useTheme';
export { spacing } from './spacing';
export { typography } from './typography';
export { radius } from './radius';
export { shadows, legacyShadowAliases } from './shadows';
export { duration, easing } from './motion';
export { sizes } from './sizes';
```

`src/app/_layout.tsx`:
- Replace the font imports/loads: remove `@expo-google-fonts/dm-sans` and `@expo-google-fonts/fraunces` imports; add

```ts
import { CormorantGaramond_600SemiBold } from '@expo-google-fonts/cormorant-garamond';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
```

and load exactly those five in `useFonts`.
- Theme-drive the shell: `const theme = useSettingsStore((s) => s.theme);` then
  `<StatusBar style={theme === 'dark' ? 'light' : 'dark'} />` and
  `contentStyle: { backgroundColor: palettes[theme].bgGradient[0] }` in `screenOptions` (import `palettes` from `@/theme`; drop the `colors` import).
- While here, set the redesign route options (used by Tasks 8–9):

```tsx
<Stack.Screen name="settings" options={{ animation: 'slide_from_bottom', animationDuration: 380 }} />
<Stack.Screen name="paywall" options={{ presentation: 'modal', animation: 'fade_from_bottom', animationDuration: 380 }} />
```

- [ ] **Step 7: Verify and commit**

Run: `npm run typecheck && npm run lint && npm run test` — all pass. (Old screens still compile: `colors` untouched, typography keys `display/headline/title/subtitle/body/bodySmall/caption/micro/button` all still exist.)

```bash
git add package.json package-lock.json src/theme/ src/app/_layout.tsx
git commit -m "feat: theme foundation — light/dark palettes, useTheme, handoff fonts and shadows"
```

---

### Task 4: Core UI primitives in the new language

**Files:**
- Modify: `src/components/ui/Screen.tsx`, `AppButton.tsx`, `Chip.tsx`, `Card.tsx`, `GlassCard.tsx`, `BottomAction.tsx`, `SectionTitle.tsx`, `DisclaimerBox.tsx`, `ProgressBar.tsx`, `EmptyState.tsx`, `LevelSlider.tsx`
- Create: `src/components/ui/CircleButton.tsx`, `src/components/ui/SegmentedToggle.tsx`
- Modify: `src/features/onboarding/Stepper.tsx`, `src/features/onboarding/DatePickerCalendar.tsx`

**Interfaces:**
- Consumes: `useTheme`, `typography`, `shadows`, `radius` from Task 3.
- Produces (later tasks import these exactly):
  - `CircleButton`: `{ icon: keyof typeof Ionicons.glyphMap; onPress: () => void; label: string; size?: number; style?: StyleProp<ViewStyle> }` — circular translucent icon button (default 38px).
  - `SegmentedToggle<T extends string>`: `{ options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; label?: string }` — pill segmented control, selected segment = solid surface + soft shadow.
  - `AppButton` keeps `{ label, onPress, variant?, disabled?, loading?, style? }` with variants `primary | secondary | ghost`.
  - `Chip` keeps `{ label, emoji?, selected, onPress }`.

- [ ] **Step 1: Rewrite the pressable primitives**

`src/components/ui/AppButton.tsx` — keep structure/haptics/accessibility; restyle:
- Component body starts with `const p = useTheme();`.
- `base`: `minHeight: 52, borderRadius: radius.button, paddingHorizontal: spacing(3), alignItems/justifyContent center, overflow hidden` (drop all borders).
- Variant colors inline: primary `{ backgroundColor: p.primaryBtn }` + static `shadows.button`; secondary `{ backgroundColor: p.surfaceStrong }` + `shadows.tiny`; ghost transparent.
- Label: `...typography.button`, color inline: primary → `p.onPrimaryBtn`, secondary/ghost → `p.text`.
- `ActivityIndicator` color: primary → `p.onPrimaryBtn`, else `p.accent`.
- Pressed: `{ transform: [{ scale: 0.96 }], opacity: 0.95 }`.

`src/components/ui/Chip.tsx` — keep API/haptics; restyle to the handoff chip:

```tsx
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text } from 'react-native';

import { radius, shadows, spacing, typography, useTheme } from '@/theme';

interface Props {
  label: string;
  emoji?: string;
  selected: boolean;
  onPress: () => void;
}

export function Chip({ label, emoji, selected, onPress }: Props) {
  const p = useTheme();
  const handlePress = () => {
    Haptics.selectionAsync();
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: selected ? 'transparent' : p.surface },
        selected && shadows.chip,
        pressed && styles.pressed,
      ]}
    >
      {selected ? (
        <LinearGradient
          pointerEvents="none"
          colors={p.goldChipGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <Text
        style={[
          styles.label,
          { color: selected ? p.accent800 : p.text },
          selected && styles.labelSelected,
        ]}
      >
        {emoji ? `${emoji} ${label}` : label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    borderRadius: radius.button,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1.25),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadows.tiny,
  },
  pressed: { transform: [{ scale: 0.94 }], opacity: 0.92 },
  label: { ...typography.bodySmall, fontFamily: 'Manrope_600SemiBold' },
  labelSelected: { fontFamily: 'Manrope_700Bold' },
});
```

`src/components/ui/CircleButton.tsx` — new:

```tsx
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { shadows, useTheme } from '@/theme';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  /** Accessibility label — required, icon-only button. */
  label: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function CircleButton({ icon, onPress, label, size = 38, style }: Props) {
  const p = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={({ pressed }) => [
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: p.surfaceStrong,
        },
        pressed && styles.pressed,
        style,
      ]}
    >
      <Ionicons name={icon} size={Math.round(size * 0.42)} color={p.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', ...shadows.tiny },
  pressed: { transform: [{ scale: 0.94 }], opacity: 0.92 },
});
```

`src/components/ui/SegmentedToggle.tsx` — new:

```tsx
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, shadows, spacing, typography, useTheme } from '@/theme';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessibility label for the group. */
  label?: string;
}

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  label,
}: Props<T>) {
  const p = useTheme();
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      style={[styles.track, { backgroundColor: p.fillSubtle }]}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="radio"
            accessibilityLabel={opt.label}
            accessibilityState={{ selected }}
            onPress={() => {
              if (selected) return;
              Haptics.selectionAsync();
              onChange(opt.value);
            }}
            style={[
              styles.segment,
              selected && { backgroundColor: p.surfaceSolid, ...shadows.tiny },
            ]}
          >
            <Text
              style={[
                styles.segLabel,
                { color: selected ? p.text : p.textMuted },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: radius.md,
    padding: 3,
    alignSelf: 'flex-start',
  },
  segment: {
    paddingHorizontal: spacing(1.75),
    paddingVertical: spacing(0.75),
    borderRadius: radius.md - 3,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
  },
  segLabel: { ...typography.caption, fontFamily: 'Manrope_600SemiBold' },
});
```

- [ ] **Step 2: Rewrite the surface primitives**

`src/components/ui/Card.tsx` — both variants become the same soft card (GlassCard kept as a thin alias for compatibility):

```tsx
// Card.tsx
import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { radius, shadows, sizes, useTheme } from '@/theme';

interface Props {
  /** Kept for compatibility; both variants render the same soft card. */
  variant?: 'solid' | 'glass';
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, style }: PropsWithChildren<Props>) {
  const p = useTheme();
  return (
    <View style={[styles.base, { backgroundColor: p.surface }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.xl - 2, // 22 — handoff soft card
    padding: sizes.cardPadding,
    ...shadows.soft,
  },
});
```

`src/components/ui/GlassCard.tsx` — replace body with a re-export wrapper so existing imports keep working:

```tsx
import { PropsWithChildren } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import { Card } from './Card';

interface GlassCardProps {
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  gradient?: boolean;
}

/** Legacy wrapper — the redesign has a single soft-card surface. */
export function GlassCard({ children, style }: PropsWithChildren<GlassCardProps>) {
  return <Card style={style}>{children}</Card>;
}
```

`src/components/ui/Screen.tsx`:
- `const p = useTheme();` in the component; gradient becomes `colors={p.bgGradient}` with `locations={[0, 0.45, 1]}`; `styles.safe` loses `backgroundColor` (apply inline `{ backgroundColor: p.bgGradient[0] }` on the outer View); drop the `colors` import.

`src/components/ui/BottomAction.tsx`:
- Remove the glass bar look: `wrap` keeps padding but `backgroundColor: 'transparent'` and no top border; delete `surface` shadow wrapper styling (children render directly). Keep `FadeInUp` entrance.

`src/components/ui/SectionTitle.tsx`:
- Style becomes the handoff kicker: `const p = useTheme();` and `<Text style={[styles.title, { color: p.textFaint }]}>` with `title: { ...typography.kicker, marginTop: spacing(3), marginBottom: spacing(1) }`.

`src/components/ui/DisclaimerBox.tsx`:
- `const p = useTheme();` fill `{ backgroundColor: p.surface }`, radius `radius.md`, text color `p.textMuted`. Remove `colors` import.

`src/components/ui/ProgressBar.tsx`:
- Make `color`/`trackColor` optional with theme fallbacks: `const p = useTheme(); const fill = color ?? p.accent; const track = trackColor ?? p.track;` (remove `colors` import; keep prop API).

`src/components/ui/EmptyState.tsx` and `src/components/ui/LevelSlider.tsx`:
- Apply the Token reference mapping table: add `const p = useTheme();`, move every `colors.*` value inline per the table, delete borders, keep layout untouched.

- [ ] **Step 3: Restyle onboarding widgets**

`src/features/onboarding/Stepper.tsx` — keep API `{ label, unit, value, min, max, onChange }`; new look (handoff: circular −/+ buttons flanking serif readout, sitting inside a parent soft card — the Stepper itself gets no card fill):

```tsx
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { shadows, spacing, typography, useTheme } from '@/theme';

interface Props {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

export function Stepper({ label, unit, value, min, max, onChange }: Props) {
  const p = useTheme();
  const step = (delta: number) => {
    const next = Math.min(max, Math.max(min, value + delta));
    if (next !== value) {
      Haptics.selectionAsync();
      onChange(next);
    }
  };

  const circle = { backgroundColor: p.surfaceSolid };

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: p.textMuted }]}>{label}</Text>
      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label} -`}
          onPress={() => step(-1)}
          style={({ pressed }) => [styles.btn, circle, pressed && styles.pressed]}
        >
          <Text style={[styles.btnText, { color: p.text }]}>−</Text>
        </Pressable>
        <Text style={[styles.value, { color: p.text }]}>
          {value} {unit}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label} +`}
          onPress={() => step(1)}
          style={({ pressed }) => [styles.btn, circle, pressed && styles.pressed]}
        >
          <Text style={[styles.btnText, { color: p.text }]}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing(1) },
  label: { ...typography.caption },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.tiny,
  },
  pressed: { transform: [{ scale: 0.94 }], opacity: 0.9 },
  btnText: { fontSize: 18, lineHeight: 22, fontFamily: 'Manrope_600SemiBold' },
  value: { ...typography.serifValue, minWidth: 80, textAlign: 'center' },
});
```

`src/features/onboarding/DatePickerCalendar.tsx`:
- `const p = useTheme();`; container: `{ backgroundColor: 'transparent' }`, no border, padding 0 (it now lives inside a parent `Card`); month label → `typography.serifValue` + `p.text`; nav chevron text color `p.accent700`; selected cell `{ backgroundColor: p.accent }` with selected text color `p.accent100`; muted cells `p.textFaint`; regular cell text `p.text` via inline color. Remove `colors` import.

- [ ] **Step 4: Verify and commit**

Run: `npm run typecheck && npm run lint && npm run test` — pass.

```bash
git add src/components/ui/ src/features/onboarding/Stepper.tsx src/features/onboarding/DatePickerCalendar.tsx
git commit -m "feat: restyle core UI primitives to soft-card gold design language"
```

---

### Task 5: Types, onboarding draft, validation, i18n additions

**Files:**
- Modify: `src/types/user.ts`, `src/types/log.ts`
- Modify: `src/features/onboarding/useOnboardingDraft.ts`
- Modify: `src/utils/validation.ts`
- Modify: `src/i18n/en.json`, `src/i18n/vi.json`

**Interfaces:**
- Produces:
  - `UserProfile`: `ageRange?: AgeRange`, plus `email?: string` and `symptomHistory?: Symptom[]`.
  - `Goal` union += `'avoidPregnancy' | 'trackFertility' | 'generalWellness'`; new export `ONBOARDING_GOALS: Goal[]` (the handoff's six, in order).
  - `Symptom` union += `'moodSwings' | 'insomnia'`; new export `ONBOARDING_SYMPTOMS: Symptom[]` (the handoff's eight, in order).
  - Draft store state: `{ nickname, email, averageCycleLength, averagePeriodLength, lastPeriodStartDate, goals, symptoms }` with `toggleGoal`, `toggleSymptom`, `set`, `reset`.
  - `emailSchema` in `@/utils/validation`: optional-empty-or-valid email.

- [ ] **Step 1: Update types**

`src/types/user.ts`:
- `Goal` union: append `| 'avoidPregnancy' | 'trackFertility' | 'generalWellness'`.
- `UserProfile`: `ageRange?: AgeRange;` (optional now), add `email?: string;` and `symptomHistory?: Symptom[];` (import `Symptom` from `./log`).
- Append `...new goals` to `ALL_GOALS` and add:

```ts
/** The six goals offered during onboarding (handoff order). */
export const ONBOARDING_GOALS: Goal[] = [
  'understandCycle',
  'reducePms',
  'pregnancyPlanning',
  'avoidPregnancy',
  'trackFertility',
  'generalWellness',
];
```

`src/types/log.ts`:
- `Symptom` union: append `| 'moodSwings' | 'insomnia'`; append both to `ALL_SYMPTOMS`; add:

```ts
/** The eight symptoms offered during onboarding (handoff order). */
export const ONBOARDING_SYMPTOMS: Symptom[] = [
  'cramps',
  'bloating',
  'headache',
  'fatigue',
  'moodSwings',
  'acne',
  'breastTenderness',
  'insomnia',
];
```

- [ ] **Step 2: Update draft store and validation**

`src/features/onboarding/useOnboardingDraft.ts` — full new content:

```ts
import { create } from 'zustand';

import { Goal, Symptom } from '@/types';

/** In-memory draft of the profile being built during onboarding (not persisted). */
interface OnboardingDraft {
  nickname: string;
  email: string;
  averageCycleLength: number;
  averagePeriodLength: number;
  lastPeriodStartDate: string | null;
  goals: Goal[];
  symptoms: Symptom[];
  set: (
    patch: Partial<
      Omit<OnboardingDraft, 'set' | 'toggleGoal' | 'toggleSymptom' | 'reset'>
    >
  ) => void;
  toggleGoal: (goal: Goal) => void;
  toggleSymptom: (symptom: Symptom) => void;
  reset: () => void;
}

const initial = {
  nickname: '',
  email: '',
  averageCycleLength: 28,
  averagePeriodLength: 5,
  lastPeriodStartDate: null,
  goals: [] as Goal[],
  symptoms: [] as Symptom[],
};

const toggle = <T,>(arr: T[], v: T) =>
  arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

export const useOnboardingDraft = create<OnboardingDraft>()((set) => ({
  ...initial,
  set: (patch) => set(patch),
  toggleGoal: (goal) => set((s) => ({ goals: toggle(s.goals, goal) })),
  toggleSymptom: (symptom) => set((s) => ({ symptoms: toggle(s.symptoms, symptom) })),
  reset: () => set(initial),
}));
```

`src/utils/validation.ts` — add:

```ts
/** Empty string allowed (account is local-only); otherwise must be a valid email. */
export const emailSchema = z
  .string()
  .trim()
  .max(120)
  .refine((v) => v === '' || z.string().email().safeParse(v).success, {
    message: 'invalid email',
  });
```

- [ ] **Step 3: Add i18n keys (EN + VI)**

In `src/i18n/en.json`:
- `goals`: add `"avoidPregnancy": "Avoid pregnancy"`, `"trackFertility": "Track fertility"`, `"generalWellness": "General wellness"`.
- `symptoms`: add `"moodSwings": "Mood swings"`, `"insomnia": "Insomnia"`.
- Replace the `onboarding` object's `profile`, `lastPeriod`, `notifications`, `paywallPreview` sub-objects with (keep `welcome`/`disclaimerScreen`, updating welcome copy):

```json
"welcome": {
  "title": "Dialuna",
  "subtitle": "A quiet place to know your body, cycle by cycle.",
  "cta": "Get started"
},
"disclaimerScreen": { ...keep existing... },
"cycleBasics": {
  "title": "Let's set your baseline",
  "subtitle": "You can always adjust these later in Settings.",
  "cycleLength": "Average cycle length",
  "periodLength": "Period length",
  "lastPeriod": "First day of last period",
  "daysUnit": "days"
},
"goals": {
  "title": "What brings you to Dialuna?",
  "subtitle": "Choose all that apply."
},
"symptoms": {
  "title": "Symptoms you often notice",
  "subtitle": "This helps Insights find patterns sooner."
},
"account": {
  "title": "Create your account",
  "subtitle": "Your logs stay private, synced to this account only.",
  "name": "Name",
  "namePlaceholder": "Your name",
  "email": "Email",
  "emailPlaceholder": "you@email.com",
  "cta": "Create account",
  "apple": "Continue with Apple",
  "appleSoon": "Apple sign-in is coming soon.",
  "emailInvalid": "That email doesn't look right."
}
```

Keep `onboarding.profile.daysUnit` consumers in mind: Settings currently uses `t('onboarding.profile.daysUnit')` — it will switch to `onboarding.cycleBasics.daysUnit` in Task 9; until then keep a top-level `"profile": { "daysUnit": "days" }` stub inside `onboarding` (removed in Task 11 if unreferenced).

In `src/i18n/vi.json`, same structure:

```json
"goals-additions": { "avoidPregnancy": "Tránh thai", "trackFertility": "Theo dõi khả năng thụ thai", "generalWellness": "Sức khỏe tổng quát" },
"symptoms-additions": { "moodSwings": "Tâm trạng thất thường", "insomnia": "Mất ngủ" },
"onboarding": {
  "welcome": { "title": "Dialuna", "subtitle": "Một nơi yên tĩnh để hiểu cơ thể bạn, qua từng chu kỳ.", "cta": "Bắt đầu" },
  "cycleBasics": {
    "title": "Thiết lập chu kỳ của bạn",
    "subtitle": "Bạn luôn có thể điều chỉnh sau trong Cài đặt.",
    "cycleLength": "Độ dài chu kỳ trung bình",
    "periodLength": "Số ngày hành kinh",
    "lastPeriod": "Ngày đầu của kỳ kinh gần nhất",
    "daysUnit": "ngày"
  },
  "goals": { "title": "Điều gì đưa bạn đến Dialuna?", "subtitle": "Chọn tất cả mục phù hợp." },
  "symptoms": { "title": "Triệu chứng bạn thường gặp", "subtitle": "Giúp Insights tìm ra quy luật sớm hơn." },
  "account": {
    "title": "Tạo tài khoản",
    "subtitle": "Nhật ký của bạn được giữ riêng tư, chỉ đồng bộ với tài khoản này.",
    "name": "Tên",
    "namePlaceholder": "Tên của bạn",
    "email": "Email",
    "emailPlaceholder": "ban@email.com",
    "cta": "Tạo tài khoản",
    "apple": "Tiếp tục với Apple",
    "appleSoon": "Đăng nhập Apple sắp ra mắt.",
    "emailInvalid": "Email này có vẻ chưa đúng."
  }
}
```

(The `-additions` labels above mean: merge those keys into the existing `goals`/`symptoms` objects.)

- [ ] **Step 4: Verify and commit**

Run: `npm run typecheck && npm run lint && npm run test` — pass. (Old onboarding screens still compile: `ALL_AGE_RANGES` still exported; `draft.ageRange`/`lastPeriodDuration` usages are in files deleted next task — if typecheck breaks on `profile.tsx`/`last-period.tsx`/`paywall-preview.tsx` referencing removed draft fields, that confirms Task 6 must land in the same PR; to keep this task green, keep `ageRange` and `lastPeriodDuration` in the draft store for now and delete them in Task 6.)

```bash
git add src/types/ src/features/onboarding/useOnboardingDraft.ts src/utils/validation.ts src/i18n/
git commit -m "feat: extend profile/goal/symptom types and onboarding draft for redesign"
```

---

### Task 6: Onboarding flow rewrite

**Files:**
- Create: `src/app/onboarding/cycle-basics.tsx`, `src/app/onboarding/symptoms.tsx`, `src/app/onboarding/account.tsx`, `src/features/onboarding/OnboardingStepHeader.tsx`
- Modify: `src/app/onboarding/welcome.tsx`, `disclaimer.tsx`, `goals.tsx`, `_layout.tsx`
- Delete: `src/app/onboarding/profile.tsx`, `last-period.tsx`, `notifications.tsx`, `paywall-preview.tsx`
- Modify: `src/features/onboarding/useOnboardingDraft.ts` (drop transitional `ageRange`/`lastPeriodDuration` if kept in Task 5)

**Interfaces:**
- Consumes: `Card`, `Chip`, `ChipGroup`, `Screen`, `Button`, `CircleButton`, `Stepper`, `DatePickerCalendar`, `useTheme`, draft store, `ONBOARDING_GOALS`, `ONBOARDING_SYMPTOMS`, `emailSchema`, `nicknameSchema`.
- Produces: `OnboardingStepHeader`: `{ step: 1 | 2 | 3 | 4 }` — back CircleButton + 4 progress dots. Route flow `welcome → disclaimer → cycle-basics → goals → symptoms → account`; `account` builds the `UserProfile` and enters `/(tabs)/home`.

- [ ] **Step 1: Step header component**

`src/features/onboarding/OnboardingStepHeader.tsx`:

```tsx
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CircleButton } from '@/components/ui/CircleButton';
import { spacing, useTheme } from '@/theme';

interface Props {
  /** 1-based index into the four dotted steps. */
  step: 1 | 2 | 3 | 4;
}

export function OnboardingStepHeader({ step }: Props) {
  const { t } = useTranslation();
  const p = useTheme();
  return (
    <View style={styles.row}>
      <CircleButton icon="chevron-back" label={t('common.back')} onPress={() => router.back()} />
      <View style={styles.dots}>
        {[1, 2, 3, 4].map((n) => (
          <View
            key={n}
            style={[
              styles.dot,
              { backgroundColor: n === step ? p.accent : p.fillSubtle },
            ]}
          />
        ))}
      </View>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing(1),
    paddingBottom: spacing(1),
  },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  spacer: { width: 38 },
});
```

- [ ] **Step 2: Welcome screen**

`src/app/onboarding/welcome.tsx` — full new content:

```tsx
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { spacing, typography, useTheme } from '@/theme';

export default function Welcome() {
  const { t } = useTranslation();
  const p = useTheme();
  return (
    <LinearGradient colors={p.bgGradient} style={styles.fill}>
      <View pointerEvents="none" style={styles.blobOuter} />
      <View pointerEvents="none" style={styles.blobInner} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.hero}>
          <View style={[styles.mark, { backgroundColor: p.primaryBtn }]}>
            <View style={[styles.markMoon, { backgroundColor: p.bgGradient[0] }]} />
          </View>
          <Text style={[styles.wordmark, { color: p.text }]}>
            {t('onboarding.welcome.title')}
          </Text>
          <Text style={[styles.subtitle, { color: p.textMuted }]}>
            {t('onboarding.welcome.subtitle')}
          </Text>
        </View>
        <Button
          label={t('onboarding.welcome.cta')}
          onPress={() => router.push('/onboarding/disclaimer')}
          style={styles.cta}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  blobOuter: {
    position: 'absolute',
    top: '6%',
    left: '-18%',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(182,130,53,0.10)',
  },
  blobInner: {
    position: 'absolute',
    top: '10%',
    left: '-10%',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(182,130,53,0.14)',
  },
  safe: { flex: 1, paddingHorizontal: spacing(4), paddingBottom: spacing(3) },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mark: {
    width: 72,
    height: 72,
    borderRadius: 28,
    marginBottom: spacing(3.75),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 8,
  },
  markMoon: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  wordmark: { ...typography.display, marginBottom: spacing(1.25) },
  subtitle: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 260,
  },
  cta: { alignSelf: 'center', width: '100%', maxWidth: 220 },
});
```

- [ ] **Step 3: Disclaimer restyle**

`src/app/onboarding/disclaimer.tsx` — same structure as today, restyled: remove emoji, title uses `typography.headline` + `useTheme().text` inline, body inside `Card` with `typography.body` + `p.textMuted`. CTA route changes to `/onboarding/cycle-basics`. (`Screen`/`Card`/`Button` already restyled in Task 4 — only colors/route change here.)

- [ ] **Step 4: Cycle basics screen**

`src/app/onboarding/cycle-basics.tsx`:

```tsx
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { DatePickerCalendar } from '@/features/onboarding/DatePickerCalendar';
import { OnboardingStepHeader } from '@/features/onboarding/OnboardingStepHeader';
import { Stepper } from '@/features/onboarding/Stepper';
import { useOnboardingDraft } from '@/features/onboarding/useOnboardingDraft';
import { spacing, typography, useTheme } from '@/theme';

export default function CycleBasics() {
  const { t } = useTranslation();
  const p = useTheme();
  const draft = useOnboardingDraft();

  return (
    <Screen
      bottomAction={
        <Button
          label={t('common.continue')}
          disabled={!draft.lastPeriodStartDate}
          onPress={() => router.push('/onboarding/goals')}
        />
      }
    >
      <OnboardingStepHeader step={1} />
      <Text style={[styles.title, { color: p.text }]}>
        {t('onboarding.cycleBasics.title')}
      </Text>
      <Text style={[styles.subtitle, { color: p.textMuted }]}>
        {t('onboarding.cycleBasics.subtitle')}
      </Text>

      <Card style={styles.card}>
        <Stepper
          label={t('onboarding.cycleBasics.cycleLength')}
          unit={t('onboarding.cycleBasics.daysUnit')}
          value={draft.averageCycleLength}
          min={21}
          max={40}
          onChange={(averageCycleLength) => draft.set({ averageCycleLength })}
        />
      </Card>
      <Card style={styles.card}>
        <Stepper
          label={t('onboarding.cycleBasics.periodLength')}
          unit={t('onboarding.cycleBasics.daysUnit')}
          value={draft.averagePeriodLength}
          min={2}
          max={10}
          onChange={(averagePeriodLength) => draft.set({ averagePeriodLength })}
        />
      </Card>
      <Card style={styles.card}>
        <Text style={[styles.cardLabel, { color: p.textMuted }]}>
          {t('onboarding.cycleBasics.lastPeriod')}
        </Text>
        <DatePickerCalendar
          selected={draft.lastPeriodStartDate}
          onSelect={(lastPeriodStartDate) => draft.set({ lastPeriodStartDate })}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.headline, marginTop: spacing(1) },
  subtitle: { ...typography.bodySmall, marginTop: spacing(0.5), marginBottom: spacing(2.5) },
  card: { marginBottom: spacing(1.75) },
  cardLabel: { ...typography.caption, marginBottom: spacing(1) },
});
```

Also: draft store min for cycle length changes (21–40 per handoff) — update `validation.ts` `cycleLengthSchema` bounds only if they conflict (current 20–45 is a superset; leave as-is).

- [ ] **Step 5: Goals and Symptoms screens**

`src/app/onboarding/goals.tsx` — full new content:

```tsx
import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { Screen } from '@/components/ui/Screen';
import { OnboardingStepHeader } from '@/features/onboarding/OnboardingStepHeader';
import { useOnboardingDraft } from '@/features/onboarding/useOnboardingDraft';
import { spacing, typography, useTheme } from '@/theme';
import { ONBOARDING_GOALS } from '@/types';

export default function Goals() {
  const { t } = useTranslation();
  const p = useTheme();
  const draft = useOnboardingDraft();

  return (
    <Screen
      bottomAction={
        <Button
          label={t('common.continue')}
          disabled={draft.goals.length === 0}
          onPress={() => router.push('/onboarding/symptoms')}
        />
      }
    >
      <OnboardingStepHeader step={2} />
      <Text style={[styles.title, { color: p.text }]}>{t('onboarding.goals.title')}</Text>
      <Text style={[styles.subtitle, { color: p.textMuted }]}>
        {t('onboarding.goals.subtitle')}
      </Text>
      <ChipGroup>
        {ONBOARDING_GOALS.map((goal) => (
          <Chip
            key={goal}
            label={t(`goals.${goal}`)}
            selected={draft.goals.includes(goal)}
            onPress={() => draft.toggleGoal(goal)}
          />
        ))}
      </ChipGroup>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.headline, marginTop: spacing(1) },
  subtitle: { ...typography.bodySmall, marginTop: spacing(0.5), marginBottom: spacing(2.5) },
});
```

`src/app/onboarding/symptoms.tsx` — identical shape with: `step={3}`, keys `onboarding.symptoms.*`, list `ONBOARDING_SYMPTOMS`, labels `t(\`symptoms.${s}\`)`, toggle `draft.toggleSymptom(s)`, no disabled condition (empty selection allowed), CTA routes to `/onboarding/account`.

- [ ] **Step 6: Account screen**

`src/app/onboarding/account.tsx`:

```tsx
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { OnboardingStepHeader } from '@/features/onboarding/OnboardingStepHeader';
import { useOnboardingDraft } from '@/features/onboarding/useOnboardingDraft';
import { useUserStore } from '@/store';
import { spacing, typography, useTheme } from '@/theme';
import { UserProfile } from '@/types';
import { addDaysISO, todayISO } from '@/utils/date';
import { emailSchema, nicknameSchema } from '@/utils/validation';

export default function Account() {
  const { t } = useTranslation();
  const p = useTheme();
  const draft = useOnboardingDraft();
  const setProfile = useUserStore((s) => s.setProfile);
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);
  const [touched, setTouched] = useState(false);

  const nameValid = nicknameSchema.safeParse(draft.nickname).success;
  const emailValid = emailSchema.safeParse(draft.email).success;

  const finish = () => {
    setTouched(true);
    if (!nameValid || !emailValid) return;
    const start = draft.lastPeriodStartDate ?? todayISO();
    const profile: UserProfile = {
      id: Date.now().toString(36),
      nickname: draft.nickname.trim(),
      email: draft.email.trim() || undefined,
      averageCycleLength: draft.averageCycleLength,
      averagePeriodLength: draft.averagePeriodLength,
      lastPeriodStartDate: start,
      lastPeriodEndDate: addDaysISO(start, draft.averagePeriodLength - 1),
      goals: draft.goals,
      symptomHistory: draft.symptoms,
      createdAt: new Date().toISOString(),
    };
    setProfile(profile);
    completeOnboarding();
    draft.reset();
    router.replace('/(tabs)/home');
  };

  return (
    <Screen keyboardAvoiding>
      <OnboardingStepHeader step={4} />
      <Text style={[styles.title, { color: p.text }]}>
        {t('onboarding.account.title')}
      </Text>
      <Text style={[styles.subtitle, { color: p.textMuted }]}>
        {t('onboarding.account.subtitle')}
      </Text>

      <Card style={styles.card}>
        <Text style={[styles.label, { color: p.textMuted }]}>
          {t('onboarding.account.name')}
        </Text>
        <TextInput
          style={[styles.input, { color: p.text }]}
          value={draft.nickname}
          onChangeText={(nickname) => draft.set({ nickname })}
          placeholder={t('onboarding.account.namePlaceholder')}
          placeholderTextColor={p.textFaint}
          accessibilityLabel={t('onboarding.account.name')}
          maxLength={30}
        />
      </Card>
      <Card style={styles.card}>
        <Text style={[styles.label, { color: p.textMuted }]}>
          {t('onboarding.account.email')}
        </Text>
        <TextInput
          style={[styles.input, { color: p.text }]}
          value={draft.email}
          onChangeText={(email) => draft.set({ email })}
          placeholder={t('onboarding.account.emailPlaceholder')}
          placeholderTextColor={p.textFaint}
          accessibilityLabel={t('onboarding.account.email')}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
        />
      </Card>
      {touched && !emailValid ? (
        <Text style={[styles.error, { color: p.danger }]}>
          {t('onboarding.account.emailInvalid')}
        </Text>
      ) : null}

      <Button
        label={t('onboarding.account.cta')}
        disabled={touched ? !(nameValid && emailValid) : false}
        onPress={finish}
        style={styles.cta}
      />
      <Button
        label={t('onboarding.account.apple')}
        variant="secondary"
        onPress={() => Alert.alert(t('onboarding.account.appleSoon'))}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.headline, marginTop: spacing(1) },
  subtitle: { ...typography.bodySmall, marginTop: spacing(0.5), marginBottom: spacing(2.75) },
  card: { marginBottom: spacing(1.75) },
  label: { ...typography.caption, marginBottom: spacing(0.75) },
  input: { ...typography.body, fontSize: 15, minHeight: 24, padding: 0 },
  error: { ...typography.caption, marginBottom: spacing(1) },
  cta: { marginTop: spacing(1.5), marginBottom: spacing(1.25) },
});
```

- [ ] **Step 7: Delete removed routes, fix layout + draft**

```bash
git rm src/app/onboarding/profile.tsx src/app/onboarding/last-period.tsx src/app/onboarding/notifications.tsx src/app/onboarding/paywall-preview.tsx
```

- `src/app/onboarding/_layout.tsx`: replace `contentStyle` color with `palettes.light.bgGradient[0]`? No — use the hook: make the component call `useTheme()` and set `contentStyle: { backgroundColor: p.bgGradient[0] }`; drop the `colors` import.
- If Task 5 kept transitional `ageRange`/`lastPeriodDuration` in the draft store, remove them now.

- [ ] **Step 8: Verify and commit**

Run: `npm run typecheck && npm run lint && npm run test` — pass. Manual: `npx expo start`, run onboarding end-to-end into tabs.

```bash
git add -A src/app/onboarding/ src/features/onboarding/
git commit -m "feat: rebuild onboarding flow to handoff design (5 steps + disclaimer)"
```

---

### Task 7: AI Coach restyle

**Files:**
- Modify: `src/features/ai/AiChatScreen.tsx`, `src/components/ai/MessageBubble.tsx`, `src/components/ai/SuggestedPrompts.tsx`
- Create: `src/components/ai/TypingDots.tsx`
- Modify: `src/i18n/en.json`, `src/i18n/vi.json` (prompts)

**Interfaces:**
- Consumes: `useChat` (unchanged), `useTheme`, `CircleButton` not needed here.
- Produces: `TypingDots` — no props, self-animating 3-dot indicator.

- [ ] **Step 1: TypingDots**

`src/components/ai/TypingDots.tsx`:

```tsx
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { spacing, useTheme } from '@/theme';

function Dot({ delay }: { delay: number }) {
  const p = useTheme();
  const opacity = useSharedValue(0.25);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.25, { duration: 700, easing: Easing.inOut(Easing.quad) })
        ),
        -1
      )
    );
  }, [delay, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[styles.dot, { backgroundColor: p.accent }, style]} />;
}

export function TypingDots() {
  return (
    <View style={styles.row} accessibilityLabel="typing">
      <Dot delay={0} />
      <Dot delay={200} />
      <Dot delay={400} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
    paddingVertical: spacing(1.25),
    paddingHorizontal: spacing(0.5),
    alignSelf: 'flex-start',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
```

- [ ] **Step 2: MessageBubble restyle**

`src/components/ai/MessageBubble.tsx` — full new content (drop avatar emoji; handoff bubbles):

```tsx
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { radius, spacing, typography, useTheme } from '@/theme';

interface Props {
  role: 'user' | 'coach';
  text: string;
}

export function MessageBubble({ role, text }: Props) {
  const p = useTheme();
  const isUser = role === 'user';
  return (
    <Animated.View
      entering={FadeInDown.duration(260)}
      style={[styles.row, isUser && styles.rowUser]}
    >
      <View
        style={[
          styles.bubble,
          { backgroundColor: isUser ? p.accent100 : p.surfaceStrong },
        ]}
      >
        <Text style={[styles.text, { color: isUser ? p.accent800 : p.text }]}>
          {text}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginBottom: spacing(1.25) },
  rowUser: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '78%',
    borderRadius: radius.md,
    paddingHorizontal: spacing(1.75),
    paddingVertical: spacing(1.4),
  },
  text: { ...typography.bodySmall, fontSize: 13.5, lineHeight: 20 },
});
```

(Dark-mode note: `accent100` is a light cream — with `p.text` unreadable on it, which is why user text uses `p.accent800`; in dark mode swap handled automatically since both come from the palette; verify contrast manually.)

- [ ] **Step 3: Prompts + screen**

i18n: replace `ai.prompts` p1–p7 with exactly four keys in both languages:

```json
"prompts": {
  "p1": "Why am I so tired today?",
  "p2": "When's my next period?",
  "p3": "Tips for PMS bloating",
  "p4": "What does my Hormone Twin score mean?"
}
```

```json
"prompts": {
  "p1": "Sao hôm nay mình mệt thế?",
  "p2": "Kỳ kinh tiếp theo của mình khi nào?",
  "p3": "Mẹo giảm đầy hơi tiền kinh nguyệt",
  "p4": "Điểm Hormone Twin của mình nghĩa là gì?"
}
```

`SuggestedPrompts.tsx`: `PROMPT_KEYS = ['p1', 'p2', 'p3', 'p4'] as const;` — keep the horizontal ScrollView + Chip mapping (Chip already restyled).

`AiChatScreen.tsx` — restructure the render (logic hooks untouched):
- Header block becomes: `<View style={styles.header}><Text style={[styles.title, { color: p.text }]}>{t('ai.title')}</Text><Text style={[styles.counter, { color: p.textFaint }]}>{isPremium ? t('ai.unlimited') : t('ai.remaining', { count: remaining() })}</Text></View>` with `header: { paddingHorizontal: spacing(2.25), paddingTop: spacing(1), paddingBottom: spacing(1.5) }`, `title: { ...typography.headline }`, `counter: { ...typography.caption, marginTop: 2 }`. Remove `Luna` import/avatar and the deep-plum panel styles.
- `ListFooterComponent`: replace the `Animated.Text` typing caption with `<TypingDots />`.
- Empty state panel: keep but restyle — fill `p.surface`, no border, title `typography.title` + `p.text`, body `p.textMuted`.
- Input row: input `{ backgroundColor: p.surfaceStrong, borderRadius: radius.md, borderWidth: 0, color: p.text, paddingHorizontal: spacing(1.75), minHeight: 44, flex: 1, ...typography.body }`, placeholder color `p.textFaint`; send button 42×42 circle `{ backgroundColor: p.primaryBtn }` with `<Ionicons name="paper-plane" size={15} color={p.onPrimaryBtn} />`, pressed scale 0.94.
- DisclaimerBox stays below the input (already restyled).
- Add `const p = useTheme();` and remove the `colors` import; migrate every remaining `colors.*` per the mapping table.

- [ ] **Step 4: Verify and commit**

Run: `npm run typecheck && npm run lint && npm run test` — pass. Manual: chat send, chip send, typing dots, auto-scroll.

```bash
git add src/features/ai/ src/components/ai/ src/i18n/
git commit -m "feat: restyle AI Coach to handoff design with animated typing dots"
```

---

### Task 8: Paywall story rewrite

**Files:**
- Rewrite: `src/features/paywall/PaywallScreen.tsx`
- Rewrite: `src/components/paywall/PremiumBanner.tsx`
- Delete: `src/components/paywall/PlanCard.tsx` (verify no other importer first: `grep -rn "PlanCard" src/`)
- Modify: `src/i18n/en.json`, `src/i18n/vi.json` (paywall section)

**Interfaces:**
- Consumes: `usePremiumStore.purchase('monthly' | 'yearly')`, `restore()`, `paywallColors` from `@/theme`.
- Produces: `PaywallScreen` (default flow unchanged: route `/paywall`, modal). `PremiumBanner` keeps `{ onPress: () => void }`.

- [ ] **Step 1: Replace paywall i18n (both languages)**

`en.json` `paywall` object — full replacement:

```json
"paywall": {
  "slides": {
    "s1": { "title": "Know your patterns", "body": "Premium reveals how your energy, mood and focus move together across the full cycle — not just today." },
    "s2": { "title": "Your Hormone Twin, deeper", "body": "See your score trend against women with cycles like yours, not just a single number." },
    "s3": { "title": "Never guess your PMS window", "body": "Premium forecasts symptom-likely days two cycles out, so you can plan around them." }
  },
  "choosePlan": "Choose your plan",
  "trialNote": "7 days free, cancel anytime.",
  "plans": {
    "monthly": "Monthly",
    "annual": "Annual",
    "monthlyPrice": "$9.99/mo",
    "annualPrice": "$59.99/yr · $5/mo"
  },
  "saveBadge": "SAVE 40%",
  "features": {
    "f1": "Full Hormone Twin trend & history",
    "f2": "Deep symptom pattern analysis",
    "f3": "Unlimited AI Coach conversations",
    "f4": "Two-cycle PMS forecast"
  },
  "cta": "Start 7-day free trial",
  "success": "You're Premium!",
  "restore": "Restore purchase",
  "terms": "Terms",
  "privacy": "Privacy",
  "mockNote": "Purchases are mocked in this build."
}
```

`vi.json` equivalent:

```json
"paywall": {
  "slides": {
    "s1": { "title": "Hiểu quy luật của bạn", "body": "Premium cho thấy năng lượng, tâm trạng và sự tập trung của bạn thay đổi cùng nhau ra sao trong cả chu kỳ — không chỉ hôm nay." },
    "s2": { "title": "Hormone Twin, sâu hơn", "body": "Xem xu hướng điểm số của bạn so với những phụ nữ có chu kỳ tương tự, không chỉ một con số." },
    "s3": { "title": "Không còn đoán mò kỳ PMS", "body": "Premium dự báo những ngày dễ có triệu chứng trước hai chu kỳ, để bạn chủ động sắp xếp." }
  },
  "choosePlan": "Chọn gói của bạn",
  "trialNote": "Miễn phí 7 ngày, hủy bất cứ lúc nào.",
  "plans": { "monthly": "Hàng tháng", "annual": "Hàng năm", "monthlyPrice": "9,99 US$/tháng", "annualPrice": "59,99 US$/năm · 5 US$/tháng" },
  "saveBadge": "TIẾT KIỆM 40%",
  "features": {
    "f1": "Toàn bộ xu hướng & lịch sử Hormone Twin",
    "f2": "Phân tích chuyên sâu quy luật triệu chứng",
    "f3": "Trò chuyện không giới hạn với AI Coach",
    "f4": "Dự báo PMS trước hai chu kỳ"
  },
  "cta": "Dùng thử 7 ngày miễn phí",
  "success": "Bạn đã là Premium!",
  "restore": "Khôi phục giao dịch",
  "terms": "Điều khoản",
  "privacy": "Quyền riêng tư",
  "mockNote": "Giao dịch được mô phỏng trong bản dựng này."
}
```

Then fix the two survivors that referenced removed keys: `InsightsScreen`/anything using `paywall.benefit.*` or `paywall.plans.lifetime` etc. — run `grep -rn "paywall\." src/ --include="*.tsx"` and update every reference to the new keys (the old onboarding paywall-preview was already deleted in Task 6; Settings is rewritten in Task 9 — for any interim reference, point it at an existing new key such as `paywall.cta`).

- [ ] **Step 2: Rewrite PaywallScreen**

`src/features/paywall/PaywallScreen.tsx` — full new content:

```tsx
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { usePremiumStore } from '@/store';
import { paywallColors as pw, radius, spacing, typography } from '@/theme';

type Plan = 'monthly' | 'yearly';

const SLIDE_ICONS = ['moon-outline', 'trending-up-outline', 'calendar-outline'] as const;
const SLIDE_KEYS = ['s1', 's2', 's3'] as const;
const FEATURE_KEYS = ['f1', 'f2', 'f3', 'f4'] as const;

export function PaywallScreen() {
  const { t } = useTranslation();
  const purchase = usePremiumStore((s) => s.purchase);
  const restore = usePremiumStore((s) => s.restore);
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<Plan>('yearly');

  const next = () => setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const subscribe = () => {
    purchase(plan);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.progressRow}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.segment,
                { backgroundColor: i <= step ? pw.text : pw.segment },
              ]}
            />
          ))}
        </View>
        <View style={styles.closeRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            hitSlop={8}
            onPress={() => router.back()}
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={16} color={pw.text} />
          </Pressable>
        </View>

        {step < 3 ? (
          <View style={styles.storyArea}>
            <View style={StyleSheet.absoluteFill}>
              <View style={styles.tapRow}>
                <Pressable
                  accessibilityLabel={t('common.back')}
                  style={styles.tapBack}
                  onPress={back}
                />
                <Pressable
                  accessibilityLabel={t('common.next')}
                  style={styles.tapNext}
                  onPress={next}
                />
              </View>
            </View>
            <Animated.View
              key={step}
              entering={ZoomIn.duration(300)}
              pointerEvents="none"
              style={styles.slide}
            >
              <Ionicons name={SLIDE_ICONS[step]} size={40} color={pw.text} />
              <Text style={styles.slideTitle}>
                {t(`paywall.slides.${SLIDE_KEYS[step]}.title`)}
              </Text>
              <Text style={styles.slideBody}>
                {t(`paywall.slides.${SLIDE_KEYS[step]}.body`)}
              </Text>
            </Animated.View>
          </View>
        ) : (
          <Animated.View entering={FadeIn.duration(300)} style={styles.plansArea}>
            <Text style={styles.plansTitle}>{t('paywall.choosePlan')}</Text>
            <Text style={styles.trialNote}>{t('paywall.trialNote')}</Text>

            <PlanRow
              label={t('paywall.plans.monthly')}
              price={t('paywall.plans.monthlyPrice')}
              selected={plan === 'monthly'}
              onPress={() => setPlan('monthly')}
            />
            <PlanRow
              label={t('paywall.plans.annual')}
              price={t('paywall.plans.annualPrice')}
              badge={t('paywall.saveBadge')}
              selected={plan === 'yearly'}
              onPress={() => setPlan('yearly')}
            />

            <View style={styles.features}>
              {FEATURE_KEYS.map((k) => (
                <View key={k} style={styles.featureRow}>
                  <Ionicons name="checkmark" size={14} color={pw.accent} />
                  <Text style={styles.featureText}>{t(`paywall.features.${k}`)}</Text>
                </View>
              ))}
            </View>

            <View style={styles.flex} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('paywall.cta')}
              onPress={subscribe}
              style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
            >
              <Text style={styles.ctaText}>{t('paywall.cta')}</Text>
            </Pressable>
            <View style={styles.footerRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('paywall.restore')}
                onPress={restore}
              >
                <Text style={styles.footerText}>{t('paywall.restore')}</Text>
              </Pressable>
              <Text style={styles.footerText}>{t('paywall.terms')}</Text>
              <Text style={styles.footerText}>{t('paywall.privacy')}</Text>
            </View>
          </Animated.View>
        )}
      </SafeAreaView>
    </View>
  );
}

function PlanRow({
  label,
  price,
  badge,
  selected,
  onPress,
}: {
  label: string;
  price: string;
  badge?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label} ${price}`}
      accessibilityState={{ selected }}
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={[
        styles.planRow,
        {
          borderColor: selected ? pw.accent : pw.border,
          backgroundColor: selected ? pw.accentTint : 'transparent',
        },
      ]}
    >
      <View>
        <Text style={styles.planLabel}>{label}</Text>
        <Text style={styles.planPrice}>{price}</Text>
      </View>
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: pw.bg },
  safe: { flex: 1 },
  flex: { flex: 1 },
  progressRow: {
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: spacing(2),
    paddingTop: spacing(1),
  },
  segment: { flex: 1, height: 2.5, borderRadius: 2 },
  closeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing(2),
    paddingTop: spacing(1.25),
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: pw.closeFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyArea: { flex: 1 },
  tapRow: { flex: 1, flexDirection: 'row' },
  tapBack: { width: '35%' },
  tapNext: { flex: 1 },
  slide: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing(4.5),
  },
  slideTitle: {
    ...typography.headlineSm,
    fontSize: 26,
    color: pw.text,
    marginTop: spacing(2.75),
    marginBottom: spacing(1.25),
    textAlign: 'center',
  },
  slideBody: {
    ...typography.body,
    color: pw.textDim,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
  plansArea: { flex: 1, paddingHorizontal: spacing(3), paddingTop: spacing(2.5) },
  plansTitle: { ...typography.headlineSm, fontSize: 26, color: pw.text, textAlign: 'center' },
  trialNote: {
    ...typography.bodySmall,
    color: pw.textDim,
    textAlign: 'center',
    marginTop: spacing(0.5),
    marginBottom: spacing(2.5),
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing(2),
    borderRadius: radius.md,
    borderWidth: 1.5,
    marginBottom: spacing(1.25),
  },
  planLabel: { ...typography.title, fontSize: 16, color: pw.text },
  planPrice: { ...typography.caption, color: pw.textDim, marginTop: 2 },
  badge: {
    backgroundColor: pw.badge,
    borderRadius: 10,
    paddingHorizontal: spacing(1.25),
    paddingVertical: spacing(0.6),
  },
  badgeText: { ...typography.micro, color: pw.text },
  features: { gap: spacing(1.25), marginTop: spacing(1.5) },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(1.25) },
  featureText: { ...typography.bodySmall, color: pw.text },
  cta: {
    backgroundColor: pw.accent,
    borderRadius: radius.button,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { transform: [{ scale: 0.97 }], opacity: 0.95 },
  ctaText: { ...typography.button, fontFamily: 'Manrope_700Bold', color: pw.ctaText },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing(2),
    marginTop: spacing(1.75),
    marginBottom: spacing(1),
  },
  footerText: { ...typography.caption, fontSize: 11, color: pw.textFaint },
});
```

Note: `purchase` is typed `Exclude<PremiumPlan, null>` which includes `'yearly'` — no store/type change needed.

- [ ] **Step 3: PremiumBanner restyle**

`src/components/paywall/PremiumBanner.tsx` — keep API; new render: `LinearGradient colors={p.premiumBannerGradient}` (`p = useTheme()`), radius 22, padding `spacing(2.25)`; inside: kicker `{ ...typography.kicker, color: p.accent400 }` text `t('home.premiumBanner.kicker')` (add key: EN "Dialuna Premium" / VI "Dialuna Premium"), serif title `{ ...typography.title, fontSize: 18, color: '#f4ede1' }` = existing `home.premiumBanner.title`, body caption `rgba(244,237,225,0.75)` = `home.premiumBanner.body`. Remove the white CTA pill (whole banner is pressable). Delete `PlanCard.tsx` after `grep -rn "PlanCard" src/` shows only the paywall (rewritten) used it.

- [ ] **Step 4: Verify and commit**

Run: `npm run typecheck && npm run lint && npm run test`; manual: open paywall from banner, tap through slides both directions, select plans, subscribe (haptic + dismiss + premium on), restore.

```bash
git add -A src/features/paywall/ src/components/paywall/ src/i18n/
git commit -m "feat: rebuild paywall as story-style modal with monthly/annual plans"
```

---

### Task 9: Settings rewrite

**Files:**
- Rewrite: `src/features/settings/SettingsScreen.tsx`
- Modify: `src/store/useUserStore.ts` (add `signOut`)
- Modify: `src/i18n/en.json`, `src/i18n/vi.json` (settings section)

**Interfaces:**
- Consumes: `useSettingsStore`, `useUserStore`, `usePremiumStore`, `SegmentedToggle`, `CircleButton`, `Card`, `Stepper`, `DatePickerCalendar`, `setAppLanguage`, `resetAllData`, `useTheme`.
- Produces: `useUserStore.signOut(): void` — sets `hasOnboarded: false`, keeps `profile`.

- [ ] **Step 1: Store + i18n**

`useUserStore.ts`: add to the interface `signOut: () => void;` and to the implementation `signOut: () => set({ hasOnboarded: false }),`.

`en.json` `settings` — full replacement:

```json
"settings": {
  "title": "Settings",
  "sections": {
    "account": "Profile & account",
    "cycle": "Cycle setup",
    "notifications": "Notifications",
    "appearance": "Appearance",
    "privacy": "Privacy & data",
    "subscription": "Subscription"
  },
  "name": "Name",
  "email": "Email",
  "signOut": "Sign out",
  "cycleLength": "Average cycle length",
  "periodLength": "Period length",
  "lutealLength": "Luteal phase length",
  "lastPeriodStart": "Last period start date",
  "notifPeriod": "Period reminder",
  "notifOvulation": "Ovulation reminder",
  "notifDaily": "Daily log reminder",
  "notifDeferred": "Reminders are saved but scheduling is coming soon.",
  "on": "On",
  "off": "Off",
  "units": "Units",
  "unitsUS": "US",
  "unitsMetric": "Metric",
  "themeLabel": "Theme",
  "themeLight": "Light",
  "themeDark": "Dark",
  "language": "Language",
  "languageEn": "English",
  "languageVi": "Tiếng Việt",
  "privacyTitle": "How your data is handled",
  "privacyBody": "All data lives on this device. Nothing is uploaded.",
  "medicalTitle": "Medical disclaimer",
  "exportData": "Export my data",
  "exportReady": "Export ready — check your email.",
  "deleteData": "Delete all data",
  "deleteConfirmBody": "This permanently deletes your profile and every log.",
  "deleteConfirmCta": "Yes, delete everything",
  "planFree": "Free plan",
  "planPremium": "Premium",
  "planFreeSub": "Upgrade for deeper insights",
  "planActiveSub": "{{plan}} · active",
  "upgrade": "Upgrade",
  "manage": "Manage",
  "devToggle": "Dev: premium override",
  "version": "Version"
}
```

(Keep `settings.privacyBody` from the current file if it already says this; otherwise use the line above. Preserve any existing `deleteConfirmTitle` only if still referenced — the inline confirm below doesn't use it.)

`vi.json` `settings` — full replacement:

```json
"settings": {
  "title": "Cài đặt",
  "sections": {
    "account": "Hồ sơ & tài khoản",
    "cycle": "Thiết lập chu kỳ",
    "notifications": "Thông báo",
    "appearance": "Giao diện",
    "privacy": "Quyền riêng tư & dữ liệu",
    "subscription": "Gói đăng ký"
  },
  "name": "Tên",
  "email": "Email",
  "signOut": "Đăng xuất",
  "cycleLength": "Độ dài chu kỳ trung bình",
  "periodLength": "Số ngày hành kinh",
  "lutealLength": "Độ dài pha hoàng thể",
  "lastPeriodStart": "Ngày bắt đầu kỳ kinh gần nhất",
  "notifPeriod": "Nhắc kỳ kinh",
  "notifOvulation": "Nhắc rụng trứng",
  "notifDaily": "Nhắc ghi nhật ký hằng ngày",
  "notifDeferred": "Cài đặt được lưu, tính năng lên lịch sắp ra mắt.",
  "on": "Bật",
  "off": "Tắt",
  "units": "Đơn vị",
  "unitsUS": "US",
  "unitsMetric": "Mét",
  "themeLabel": "Chủ đề",
  "themeLight": "Sáng",
  "themeDark": "Tối",
  "language": "Ngôn ngữ",
  "languageEn": "English",
  "languageVi": "Tiếng Việt",
  "privacyTitle": "Dữ liệu của bạn được xử lý thế nào",
  "privacyBody": "Mọi dữ liệu nằm trên thiết bị này. Không có gì được tải lên.",
  "medicalTitle": "Miễn trừ trách nhiệm y tế",
  "exportData": "Xuất dữ liệu của tôi",
  "exportReady": "Đã sẵn sàng — kiểm tra email của bạn.",
  "deleteData": "Xóa toàn bộ dữ liệu",
  "deleteConfirmBody": "Thao tác này xóa vĩnh viễn hồ sơ và toàn bộ nhật ký.",
  "deleteConfirmCta": "Có, xóa tất cả",
  "planFree": "Gói miễn phí",
  "planPremium": "Premium",
  "planFreeSub": "Nâng cấp để có phân tích sâu hơn",
  "planActiveSub": "{{plan}} · đang hoạt động",
  "upgrade": "Nâng cấp",
  "manage": "Quản lý",
  "devToggle": "Dev: bật premium",
  "version": "Phiên bản"
}
```

- [ ] **Step 2: Rewrite the screen**

`src/features/settings/SettingsScreen.tsx` — full new content:

```tsx
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Card } from '@/components/ui/Card';
import { CircleButton } from '@/components/ui/CircleButton';
import { DisclaimerBox } from '@/components/ui/DisclaimerBox';
import { Screen } from '@/components/ui/Screen';
import { SegmentedToggle } from '@/components/ui/SegmentedToggle';
import { DatePickerCalendar } from '@/features/onboarding/DatePickerCalendar';
import { Stepper } from '@/features/onboarding/Stepper';
import i18n, { setAppLanguage } from '@/i18n';
import {
  resetAllData,
  usePremiumStore,
  useSettingsStore,
  useUserStore,
} from '@/store';
import { radius, spacing, typography, useTheme } from '@/theme';
import { emailSchema, nicknameSchema } from '@/utils/validation';

export function SettingsScreen() {
  const { t } = useTranslation();
  const p = useTheme();
  const profile = useUserStore((s) => s.profile);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const signOut = useUserStore((s) => s.signOut);
  const settings = useSettingsStore();
  const isPremium = usePremiumStore((s) => s.isPremium);
  const plan = usePremiumStore((s) => s.plan);
  const togglePremiumDev = usePremiumStore((s) => s.togglePremiumDev);

  const [dateOpen, setDateOpen] = useState(false);
  const [exportedFlash, setExportedFlash] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [medicalOpen, setMedicalOpen] = useState(false);

  if (!profile) return null;

  const language = i18n.language === 'vi' ? 'vi' : 'en';
  const daysUnit = t('onboarding.cycleBasics.daysUnit');

  const onSignOut = () => {
    signOut();
    router.dismissAll();
    router.replace('/onboarding');
  };

  const onConfirmDelete = () => {
    resetAllData();
    router.dismissAll();
    router.replace('/onboarding');
  };

  const kicker = { ...styles.kicker, color: p.textFaint };
  const label = { ...styles.label, color: p.textMuted };

  return (
    <Screen>
      <View style={styles.header}>
        <CircleButton
          icon="chevron-back"
          label={t('common.back')}
          onPress={() => router.back()}
        />
        <Text style={[styles.title, { color: p.text }]}>{t('settings.title')}</Text>
      </View>

      <Text style={kicker}>{t('settings.sections.account')}</Text>
      <Card style={styles.card}>
        <Text style={label}>{t('settings.name')}</Text>
        <TextInput
          style={[styles.input, { color: p.text }]}
          defaultValue={profile.nickname}
          accessibilityLabel={t('settings.name')}
          maxLength={30}
          onEndEditing={(e) => {
            const nickname = e.nativeEvent.text.trim();
            if (nicknameSchema.safeParse(nickname).success) updateProfile({ nickname });
          }}
        />
        <Text style={label}>{t('settings.email')}</Text>
        <TextInput
          style={[styles.input, { color: p.text }]}
          defaultValue={profile.email ?? ''}
          accessibilityLabel={t('settings.email')}
          autoCapitalize="none"
          keyboardType="email-address"
          onEndEditing={(e) => {
            const email = e.nativeEvent.text.trim();
            if (emailSchema.safeParse(email).success) {
              updateProfile({ email: email || undefined });
            }
          }}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('settings.signOut')}
          onPress={onSignOut}
          style={[styles.pillBtn, { backgroundColor: p.fillSubtle }]}
        >
          <Text style={[styles.pillBtnText, { color: p.text }]}>
            {t('settings.signOut')}
          </Text>
        </Pressable>
      </Card>

      <Text style={kicker}>{t('settings.sections.cycle')}</Text>
      <Card style={[styles.card, styles.gapLg]}>
        <Stepper
          label={t('settings.cycleLength')}
          unit={daysUnit}
          value={profile.averageCycleLength}
          min={21}
          max={40}
          onChange={(averageCycleLength) => updateProfile({ averageCycleLength })}
        />
        <Stepper
          label={t('settings.periodLength')}
          unit={daysUnit}
          value={profile.averagePeriodLength}
          min={2}
          max={10}
          onChange={(averagePeriodLength) => updateProfile({ averagePeriodLength })}
        />
        <Stepper
          label={t('settings.lutealLength')}
          unit={daysUnit}
          value={settings.lutealLength}
          min={10}
          max={16}
          onChange={(lutealLength) => settings.set({ lutealLength })}
        />
        <View>
          <Text style={label}>{t('settings.lastPeriodStart')}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('settings.lastPeriodStart')}
            onPress={() => setDateOpen((v) => !v)}
            style={styles.dateRow}
          >
            <Text style={[styles.dateValue, { color: p.text }]}>
              {profile.lastPeriodStartDate}
            </Text>
          </Pressable>
          {dateOpen ? (
            <DatePickerCalendar
              selected={profile.lastPeriodStartDate}
              onSelect={(lastPeriodStartDate) => {
                updateProfile({ lastPeriodStartDate });
                setDateOpen(false);
              }}
            />
          ) : null}
        </View>
      </Card>

      <Text style={kicker}>{t('settings.sections.notifications')}</Text>
      <Card style={[styles.card, styles.gapMd]}>
        <NotifRow
          label={t('settings.notifPeriod')}
          value={settings.notifPeriod}
          onChange={(notifPeriod) => settings.set({ notifPeriod })}
        />
        <NotifRow
          label={t('settings.notifOvulation')}
          value={settings.notifOvulation}
          onChange={(notifOvulation) => settings.set({ notifOvulation })}
        />
        <NotifRow
          label={t('settings.notifDaily')}
          value={settings.notifDaily}
          onChange={(notifDaily) => settings.set({ notifDaily })}
        />
        <Text style={[styles.caption, { color: p.textFaint }]}>
          {t('settings.notifDeferred')}
        </Text>
      </Card>

      <Text style={kicker}>{t('settings.sections.appearance')}</Text>
      <Card style={[styles.card, styles.gapLg]}>
        <View>
          <Text style={label}>{t('settings.units')}</Text>
          <SegmentedToggle
            label={t('settings.units')}
            options={[
              { value: 'us', label: t('settings.unitsUS') },
              { value: 'metric', label: t('settings.unitsMetric') },
            ]}
            value={settings.units}
            onChange={(units) => settings.set({ units })}
          />
        </View>
        <View>
          <Text style={label}>{t('settings.themeLabel')}</Text>
          <SegmentedToggle
            label={t('settings.themeLabel')}
            options={[
              { value: 'light', label: t('settings.themeLight') },
              { value: 'dark', label: t('settings.themeDark') },
            ]}
            value={settings.theme}
            onChange={(theme) => settings.set({ theme })}
          />
        </View>
        <View>
          <Text style={label}>{t('settings.language')}</Text>
          <SegmentedToggle
            label={t('settings.language')}
            options={[
              { value: 'en', label: t('settings.languageEn') },
              { value: 'vi', label: t('settings.languageVi') },
            ]}
            value={language}
            onChange={(lng) => setAppLanguage(lng)}
          />
        </View>
      </Card>

      <Text style={kicker}>{t('settings.sections.privacy')}</Text>
      <Card style={[styles.card, styles.gapMd]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('settings.privacyTitle')}
          onPress={() => setPrivacyOpen((v) => !v)}
          style={[styles.pillBtn, { backgroundColor: p.fillSubtle }]}
        >
          <Text style={[styles.pillBtnText, { color: p.text }]}>
            {t('settings.privacyTitle')}
          </Text>
        </Pressable>
        {privacyOpen ? (
          <Text style={[styles.caption, { color: p.textMuted }]}>
            {t('settings.privacyBody')}
          </Text>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('settings.medicalTitle')}
          onPress={() => setMedicalOpen((v) => !v)}
          style={[styles.pillBtn, { backgroundColor: p.fillSubtle }]}
        >
          <Text style={[styles.pillBtnText, { color: p.text }]}>
            {t('settings.medicalTitle')}
          </Text>
        </Pressable>
        {medicalOpen ? <DisclaimerBox text={t('disclaimer.full')} /> : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('settings.exportData')}
          onPress={() => setExportedFlash(true)}
          style={[styles.pillBtn, { backgroundColor: p.fillSubtle }]}
        >
          <Text style={[styles.pillBtnText, { color: p.text }]}>
            {t('settings.exportData')}
          </Text>
        </Pressable>
        {exportedFlash ? (
          <Text style={[styles.caption, { color: p.accent700 }]}>
            {t('settings.exportReady')}
          </Text>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('settings.deleteData')}
          onPress={() => setConfirmingDelete((v) => !v)}
          style={[styles.pillBtn, { backgroundColor: p.fillSubtle }]}
        >
          <Text style={[styles.pillBtnText, { color: p.danger }]}>
            {t('settings.deleteData')}
          </Text>
        </Pressable>
        {confirmingDelete ? (
          <View style={styles.gapSm}>
            <Text style={[styles.caption, { color: p.textMuted }]}>
              {t('settings.deleteConfirmBody')}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('settings.deleteConfirmCta')}
              onPress={onConfirmDelete}
              style={[styles.pillBtn, { backgroundColor: p.danger }]}
            >
              <Text style={[styles.pillBtnText, { color: p.surfaceSolid }]}>
                {t('settings.deleteConfirmCta')}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </Card>

      <Text style={kicker}>{t('settings.sections.subscription')}</Text>
      <Card style={styles.card}>
        <View style={styles.subRow}>
          <View>
            <Text style={[styles.subLabel, { color: p.text }]}>
              {isPremium ? t('settings.planPremium') : t('settings.planFree')}
            </Text>
            <Text style={[styles.caption, { color: p.textMuted }]}>
              {isPremium
                ? t('settings.planActiveSub', {
                    plan: plan ? t(`paywall.plans.${plan === 'yearly' ? 'annual' : 'monthly'}`) : '',
                  })
                : t('settings.planFreeSub')}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isPremium ? t('settings.manage') : t('settings.upgrade')}
            onPress={() => router.push('/paywall')}
            style={[
              styles.subBtn,
              { backgroundColor: isPremium ? p.fillSubtle : p.primaryBtn },
            ]}
          >
            <Text
              style={[
                styles.pillBtnText,
                { color: isPremium ? p.text : p.onPrimaryBtn },
              ]}
            >
              {isPremium ? t('settings.manage') : t('settings.upgrade')}
            </Text>
          </Pressable>
        </View>
        <NotifRow
          label={t('settings.devToggle')}
          value={isPremium}
          onChange={togglePremiumDev}
        />
      </Card>

      <View style={styles.footer}>
        <Text style={[styles.caption, { color: p.textFaint }]}>
          {t('common.appName')} · {t('settings.version')}{' '}
          {Constants.expoConfig?.version ?? '0.1.0'}
        </Text>
      </View>
    </Screen>
  );
}

function NotifRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const { t } = useTranslation();
  const p = useTheme();
  return (
    <View style={styles.notifRow}>
      <Text style={[styles.notifLabel, { color: p.text }]}>{label}</Text>
      <SegmentedToggle
        label={label}
        options={[
          { value: 'off', label: t('settings.off') },
          { value: 'on', label: t('settings.on') },
        ]}
        value={value ? 'on' : 'off'}
        onChange={(v) => onChange(v === 'on')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1.5),
    paddingTop: spacing(1),
    paddingBottom: spacing(1),
  },
  title: { ...typography.headlineSm },
  kicker: { ...typography.kicker, marginTop: spacing(2.5), marginBottom: spacing(1) },
  card: { gap: spacing(1.25) },
  gapSm: { gap: spacing(1) },
  gapMd: { gap: spacing(1.75) },
  gapLg: { gap: spacing(2) },
  label: { ...typography.caption, marginBottom: spacing(0.5) },
  input: { ...typography.body, fontSize: 15, minHeight: 24, padding: 0 },
  caption: { ...typography.caption },
  pillBtn: {
    minHeight: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing(2),
  },
  pillBtnText: { ...typography.button, fontSize: 13 },
  dateRow: { minHeight: 36, justifyContent: 'center' },
  dateValue: { ...typography.serifValue },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing(1),
  },
  notifLabel: { ...typography.body, flexShrink: 1 },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing(1),
  },
  subLabel: { ...typography.title, fontSize: 16 },
  subBtn: {
    minHeight: 40,
    borderRadius: radius.md,
    paddingHorizontal: spacing(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { alignItems: 'center', marginTop: spacing(4) },
});
```

Notes: `Screen`'s old age-range chips, `SectionTitle`, `Chip`, `Switch` imports are gone; there is no `Alert` anywhere; `plan === 'lifetime'` renders via the ternary as 'monthly' label — acceptable for the dev-only legacy value.

- [ ] **Step 3: Verify and commit**

Run: `npm run typecheck && npm run lint && npm run test`; manual: every section edits + persists across reload; dark toggle flips the whole app live; sign out lands on Welcome with logs intact; delete requires the second tap.

```bash
git add src/features/settings/ src/store/useUserStore.ts src/i18n/
git commit -m "feat: rebuild settings with six handoff sections and live theme switch"
```

---

### Task 10: Tabs light pass (dock + token migration)

**Files:**
- Modify: `src/app/(tabs)/_layout.tsx`
- Modify (mapping-table migration, no layout changes): `src/features/home/HomeScreen.tsx`, `src/features/log/LogScreen.tsx`, `src/features/calendar/CalendarScreen.tsx`, `src/features/calendar/DayDetailSheet.tsx`, `src/features/insights/InsightsScreen.tsx`, `src/components/cycle/PhaseBadge.tsx`, `WeekStrip.tsx`, `ForecastCard.tsx`, `CalendarDayCell.tsx`, `src/components/ui/ScoreRing.tsx`, `src/components/mascot/Luna.tsx`

**Interfaces:**
- Consumes: `useTheme`, mapping table from the Token reference section.
- Produces: no new interfaces; zero remaining `colors.` references outside `src/theme/` when done (`grep -rn "colors\." src --include="*.tsx" | grep -v "src/theme"` returns empty).

- [ ] **Step 1: Floating dock tab bar**

`src/app/(tabs)/_layout.tsx` — full new content:

```tsx
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ColorValue, StyleSheet, Text } from 'react-native';

import { radius, shadows, spacing, typography, useTheme } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

function tabIcon(name: IconName) {
  function TabIcon({ color }: { color: ColorValue; size: number }) {
    return <Ionicons name={name} color={color} size={19} />;
  }
  return TabIcon;
}

export default function TabsLayout() {
  const { t } = useTranslation();
  const p = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: p.accent700,
        tabBarInactiveTintColor: p.textFaint,
        tabBarItemStyle: styles.item,
        tabBarStyle: [
          styles.tabBar,
          { backgroundColor: p.name === 'dark' ? 'rgba(43,39,46,0.92)' : 'rgba(255,251,247,0.92)' },
        ],
        tabBarLabel: ({ focused, color, children }) =>
          focused ? (
            <Text style={[styles.label, { color }]} numberOfLines={1}>
              {children}
            </Text>
          ) : null,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: t('tabs.home'), tabBarIcon: tabIcon('ellipse-outline') }}
      />
      <Tabs.Screen
        name="log"
        options={{ title: t('tabs.log'), tabBarIcon: tabIcon('add-circle-outline') }}
      />
      <Tabs.Screen
        name="calendar"
        options={{ title: t('tabs.calendar'), tabBarIcon: tabIcon('calendar-outline') }}
      />
      <Tabs.Screen
        name="insights"
        options={{ title: t('tabs.insights'), tabBarIcon: tabIcon('stats-chart-outline') }}
      />
      <Tabs.Screen
        name="ai"
        options={{ title: t('tabs.ai'), tabBarIcon: tabIcon('sparkles') }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: spacing(2.25),
    right: spacing(2.25),
    bottom: spacing(1.75),
    height: 62,
    paddingTop: spacing(0.75),
    paddingBottom: spacing(1),
    paddingHorizontal: spacing(0.75),
    borderTopWidth: 0,
    borderRadius: radius.dock,
    ...shadows.float,
  },
  item: { borderRadius: radius.dock - 8 },
  label: { ...typography.micro, fontSize: 9.5, letterSpacing: 0.2 },
});
```

- [ ] **Step 2: Migrate tab screens and cycle components**

For each file in the Modify list: add `const p = useTheme();` (components only — for style-only modules pass colors via props), delete the `colors` import, and convert every `colors.*` reference using the Token reference mapping table, moving theme-dependent values inline (`style={[styles.x, { color: p.text }]}`). Specific decisions:
- `HomeScreen` hero panel: gradient `p.heroGradient`, radius `32/32/32/12` via `borderTopLeftRadius: 32, borderTopRightRadius: 32, borderBottomRightRadius: 32, borderBottomLeftRadius: 12`, shadow `shadows.hero`; the Hormone Twin score number gets `typography.score` + `p.accent700`; kickers get `typography.kicker`.
- `ScoreRing`: default ring/track colors → `p.accent` / `p.track` (accept via props with theme fallback, same pattern as ProgressBar).
- `Luna`: only palette-constant swaps (its fills → `p.accent200`/`p.accent400`/`p.text` nearest-equivalents per the table).
- `PhaseBadge`/`WeekStrip`/`ForecastCard`/`CalendarDayCell`/`DayDetailSheet`: `colors.phase.X` → `p.phase.X`, `colors.phaseSoft.X` → `p.phaseSoft.X`, borders deleted, `shadows.*` renamed per table.
- `InsightsScreen` locked-card overlay: `backgroundColor: 'rgba(251,243,236,0.9)'` light / use `p.overlay` in dark — implement as `p.name === 'dark' ? p.overlay : 'rgba(251,243,236,0.9)'`.

- [ ] **Step 3: Sweep check**

Run: `grep -rn "colors\." src --include="*.tsx" --include="*.ts" | grep -v "src/theme" | grep -v "paywallColors" | grep -v "\.test\."`
Expected: empty output. Fix any stragglers (including `src/app/onboarding/_layout.tsx` and `src/app/_layout.tsx` if missed earlier).

- [ ] **Step 4: Verify and commit**

Run: `npm run typecheck && npm run lint && npm run test`; manual: all five tabs render in light AND dark, dock floats with gold active tint, only the active tab shows its label.

```bash
git add "src/app/(tabs)/" src/features/ src/components/
git commit -m "feat: floating dock tab bar and new-palette pass across tab screens"
```

---

### Task 11: Cleanup and final verification

**Files:**
- Delete: `src/theme/colors.ts`
- Modify: `src/theme/index.ts`, `src/theme/shadows.ts`, `package.json`, `src/app/_layout.tsx`, `src/i18n/en.json`, `src/i18n/vi.json`

- [ ] **Step 1: Delete the legacy color system**

- `grep -rn "from '@/theme'" src | xargs grep -l "colors"` must show nothing importing `colors` — then delete `src/theme/colors.ts` and its line in `src/theme/index.ts`.
- In `shadows.ts`: `grep -rn "shadows\.\(xs\|sm\|md\|lg\|glow\)\|legacyShadowAliases" src --include="*.tsx"` — migrate any remaining users to the new names, then delete the alias lines and `legacyShadowAliases` (also remove its export from `theme/index.ts` and any import in `Card.tsx`).

- [ ] **Step 2: Remove dead dependencies and i18n keys**

- `npm uninstall @expo-google-fonts/dm-sans @expo-google-fonts/fraunces` (verify `grep -rn "DMSans\|Fraunces" src` is empty first).
- i18n prune (verify each with `grep -rn "<key>" src` before deleting from BOTH json files): `onboarding.profile.*`, `onboarding.lastPeriod.*`, `onboarding.notifications.*`, `onboarding.paywallPreview.*`, `ageRanges.*`, `settings.nickname`, `settings.ageRange`, `settings.sections.preferences`, `settings.sections.about`, `settings.exportSoon`, `settings.premiumStatus`, `settings.premiumActive`, `settings.premiumInactive`, `settings.managePremium`, `settings.deleteConfirmTitle`, `paywall.benefit.*` (if InsightsScreen no longer uses them), `paywall.plans.lifetime/perMonth/perYear/once`, `paywall.popularBadge`, `paywall.finePrint`, `paywall.subtitle`, `paywall.title` (if unused), `ai.prompts.p5-p7`. Keep anything still referenced.

- [ ] **Step 3: Full verification**

Run: `npm run typecheck && npm run lint && npm run test`
Expected: all green.

Manual smoke list (Expo, iOS simulator):
1. Fresh install → Welcome → disclaimer → cycle basics → goals → symptoms → account → tabs.
2. Coach: prompt chip sends; typing dots; reply; free-question limit still routes to paywall.
3. Paywall: story taps both directions, plan select, subscribe, restore, close.
4. Settings: every section; theme dark flips app live including tabs; language VI renders everywhere; sign out → Welcome (logs intact); delete-all two-tap → onboarding.
5. Old-profile migration: with a pre-change persisted profile (no email/symptomHistory), Settings and Coach render without crash.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove legacy palette, fonts and unused i18n keys after redesign"
```
