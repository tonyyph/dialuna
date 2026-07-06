# Aurora Night — Foundation v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Foundation v1's light-palette/Fraunces-DM Sans/crescent-mascot
system with Aurora Night — a dark-mode-first (with light mode + 3-accent
runtime switching), Cormorant Garamond + Plus Jakarta Sans, glowing-orb-mascot
design system — reconciled with the unrelated `feat/mascot-handoff` polish
commit's reusable structural components.

**Architecture:** New token files (`dark.ts`/`light.ts`/`accents.ts`) resolved
through a `useTheme()` hook backed by a new Zustand+persist `themeStore`,
replacing static `colors`/`typography` imports across ~39 files. New visual
primitives (`LunaOrb`, `AuroraBackground`, `ProgressRing`) plug into existing
structural components (`Screen`, `GlassCard`) rather than duplicating them. A
custom floating tab bar replaces `expo-router`'s built-in tab styling.

**Tech Stack:** React Native / Expo Router, `react-native-reanimated` 4.5,
`react-native-svg`, `expo-linear-gradient`, Zustand 5 + AsyncStorage persist,
`@expo-google-fonts/cormorant-garamond`, `@expo-google-fonts/plus-jakarta-sans`.

## Global Constraints

- **Base branch is `feat/mascot-handoff`**, not `main`. Create the isolated
  worktree/branch from `feat/mascot-handoff`'s current tip.
- No hardcoded hex/rgba outside `src/theme/tokens/{dark,light}.ts`,
  `src/theme/accents.ts`, and the static `#000000` shadow color in
  `src/theme/shadows.ts`.
- `tsc --noEmit` clean after every task.
- `expo lint` clean after every task (or note explicitly if the sandbox
  blocks the command — do not skip silently).
- `src/services/*`, `src/types/*` untouched. `src/store/*` may gain the new
  `themeStore.ts` file; no existing store file's domain logic changes.
- No screen redesigns beyond the mechanical token/hook migration and the tab
  bar IA change specified in Task 10.
- `Fraunces`/`DM Sans` font packages and all v1 typography token names not in
  the new scale are fully removed — no dual-support period.
- `Luna.tsx`/`LunaExpression` (v1 crescent mascot) are deleted and fully
  replaced by `LunaOrb` — no dual-support period.
- `Screen.tsx`, `BottomAction.tsx`, `AppButton.tsx`, `GlassCard.tsx` (from
  `feat/mascot-handoff`) are reused and restyled, never duplicated.
- `radius`, `sizes`, `spacing`/`space` values (from `feat/mascot-handoff`) are
  untouched this phase.
- No new dependency on `expo-blur` or `@shopify/react-native-skia` unless a
  task explicitly says otherwise.
- Spec: `docs/superpowers/specs/2026-07-06-aurora-night-foundation-design.md`
  is the source of truth for anything this plan doesn't spell out verbatim.

---

## Task 1: Color tokens v3 (dark, light, accents)

**Files:**
- Create: `src/theme/tokens/types.ts`
- Create: `src/theme/tokens/dark.ts`
- Create: `src/theme/tokens/light.ts`
- Create: `src/theme/accents.ts`
- Create: `src/theme/accents.test.ts`
- Modify: `vitest.config.ts:9` (add `src/theme/**/*.test.ts` to `include`)

**Interfaces:**
- Produces: `ThemeTokens` type, `darkTokens: ThemeTokens`, `lightTokens:
  ThemeTokens`, `AccentKey = 'lavender' | 'rose' | 'auroraBlue'`,
  `accentPairs: Record<AccentKey, { secondary: string; primary: string }>`,
  `applyAccent(tokens: ThemeTokens, accent: AccentKey): ThemeTokens`.
- Consumed by: Task 2 (`useTheme` hook), every later migration task.

- [ ] **Step 1: Write `src/theme/tokens/types.ts`**

```ts
export interface PhaseColors {
  menstrual: string;
  follicular: string;
  ovulation: string;
  luteal: string;
}

export interface ThemeTokens {
  // Legacy flat keys — preserved 1:1 from Foundation v1 / feat/mascot-handoff
  // so every existing call site keeps compiling after the access-pattern
  // migration (Tasks 4-6).
  primary: string;
  primaryPressed: string;
  coral: string;
  iris: string;
  aqua: string;
  gold: string;
  berry: string;
  softRose: string;
  lavender: string;
  deepPlum: string;
  cream: string;
  blush: string;
  pearl: string;
  card: string;
  textPrimary: string;
  textSecondary: string;
  mint: string;
  peach: string;
  error: string;
  background: string;
  border: string;
  overlay: string;
  glass: string;
  glassStrong: string;
  glassBorder: string;
  divider: string;

  // New Aurora Night named keys — used by new components (LunaOrb,
  // AuroraBackground, ProgressRing, tab bar v2). Not accent-reactive
  // (except via `primary`/`lavender` above) — see accents.ts.
  night: string;
  nightElevated: string;
  lavenderLight: string;
  auroraBlue: string;
  roseDeep: string;
  peachDeep: string;
  ovulationBlue: string;
  textDisabled: string;
  /** Fixed Luna Orb illustration details — same value in both modes, never accent-reactive. */
  lunaEyeColor: string;
  lunaShadowColor: string;

  phase: PhaseColors;
  phaseSoft: PhaseColors;
  gradients: {
    app: readonly [string, string];
    hero: readonly [string, string];
    night: readonly [string, string];
    aqua: readonly [string, string];
    gold: readonly [string, string];
    glass: readonly [string, string];
  };
  surface: {
    background: string;
    card: string;
    elevated: string;
    glass: string;
    glassStrong: string;
    overlay: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    onDark: string;
  };
  semantic: {
    success: string;
    warning: string;
    danger: string;
    info: string;
  };
}
```

- [ ] **Step 2: Write `src/theme/tokens/dark.ts`**

```ts
import { ThemeTokens } from './types';

export const darkTokens: ThemeTokens = {
  primary: '#8B6FE8',
  primaryPressed: '#6F58C9',
  coral: '#F7A08B',
  iris: '#B9A6F2',
  aqua: '#5AA9E6',
  gold: '#8FD2F2',
  berry: '#E87A97',
  softRose: 'rgba(245,184,196,0.16)',
  lavender: '#8B6FE8',
  deepPlum: '#1A1330',
  cream: '#F4F1FB',
  blush: 'rgba(245,184,196,0.08)',
  pearl: '#181230',
  card: '#181230',
  textPrimary: '#F4F1FB',
  textSecondary: 'rgba(244,241,251,0.60)',
  mint: '#6EE7C4',
  peach: '#F6C89A',
  error: '#F2879B',
  background: '#0E0B1A',
  border: 'rgba(255,255,255,0.11)',
  overlay: 'rgba(14,11,26,0.72)',
  glass: 'rgba(20,15,38,0.62)',
  glassStrong: 'rgba(24,18,45,0.85)',
  glassBorder: 'rgba(255,255,255,0.14)',
  divider: 'rgba(255,255,255,0.08)',

  night: '#0E0B1A',
  nightElevated: '#181230',
  lavenderLight: '#B9A6F2',
  auroraBlue: '#5AA9E6',
  roseDeep: '#E87A97',
  peachDeep: '#F7A08B',
  ovulationBlue: '#8FD2F2',
  textDisabled: 'rgba(244,241,251,0.35)',
  lunaEyeColor: '#3A2B6E',
  lunaShadowColor: '#462D82',

  phase: {
    menstrual: '#F5B8C4',
    follicular: '#F6C89A',
    ovulation: '#8FD2F2',
    luteal: '#B9A6F2',
  },
  phaseSoft: {
    menstrual: 'rgba(245,184,196,0.16)',
    follicular: 'rgba(246,200,154,0.16)',
    ovulation: 'rgba(143,210,242,0.16)',
    luteal: 'rgba(185,166,242,0.16)',
  },
  gradients: {
    app: ['#0E0B1A', '#181230'],
    hero: ['#B9A6F2', '#8B6FE8'],
    night: ['#05030A', '#0E0B1A'],
    aqua: ['#5AA9E6', '#8FD2F2'],
    gold: ['#F6C89A', '#F7A08B'],
    glass: ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.02)'],
  },
  surface: {
    background: '#0E0B1A',
    card: '#181230',
    elevated: '#181230',
    glass: 'rgba(20,15,38,0.62)',
    glassStrong: 'rgba(24,18,45,0.85)',
    overlay: 'rgba(14,11,26,0.72)',
  },
  text: {
    primary: '#F4F1FB',
    secondary: 'rgba(244,241,251,0.60)',
    tertiary: 'rgba(244,241,251,0.35)',
    onDark: '#F4F1FB',
  },
  semantic: {
    success: '#6EE7C4',
    warning: '#F6C89A',
    danger: '#F2879B',
    info: '#5AA9E6',
  },
};
```

- [ ] **Step 3: Write `src/theme/tokens/light.ts`**

```ts
import { ThemeTokens } from './types';

export const lightTokens: ThemeTokens = {
  primary: '#B9A6F2',
  primaryPressed: '#8B6FE8',
  coral: '#F7A08B',
  iris: '#B9A6F2',
  aqua: '#5AA9E6',
  gold: '#8FD2F2',
  berry: '#E87A97',
  softRose: 'rgba(245,184,196,0.24)',
  lavender: '#8B6FE8',
  deepPlum: '#241E38',
  cream: '#FFFFFF',
  blush: 'rgba(245,184,196,0.12)',
  pearl: '#FFFFFF',
  card: '#FFFFFF',
  textPrimary: '#241E38',
  textSecondary: 'rgba(36,30,56,0.55)',
  mint: '#3FBE95',
  peach: '#F6C89A',
  error: '#E0607A',
  background: '#F4F1FB',
  border: 'rgba(40,30,72,0.10)',
  overlay: 'rgba(36,30,56,0.32)',
  glass: 'rgba(255,255,255,0.68)',
  glassStrong: 'rgba(255,255,255,0.88)',
  glassBorder: 'rgba(40,30,72,0.12)',
  divider: 'rgba(40,30,72,0.08)',

  night: '#F4F1FB',
  nightElevated: '#FFFFFF',
  lavenderLight: '#B9A6F2',
  auroraBlue: '#5AA9E6',
  roseDeep: '#E87A97',
  peachDeep: '#F7A08B',
  ovulationBlue: '#8FD2F2',
  textDisabled: 'rgba(36,30,56,0.35)',
  lunaEyeColor: '#3A2B6E',
  lunaShadowColor: '#462D82',

  phase: {
    menstrual: '#F5B8C4',
    follicular: '#F6C89A',
    ovulation: '#8FD2F2',
    luteal: '#B9A6F2',
  },
  phaseSoft: {
    menstrual: 'rgba(245,184,196,0.28)',
    follicular: 'rgba(246,200,154,0.28)',
    ovulation: 'rgba(143,210,242,0.28)',
    luteal: 'rgba(185,166,242,0.28)',
  },
  gradients: {
    app: ['#F4F1FB', '#FFFFFF'],
    hero: ['#B9A6F2', '#8B6FE8'],
    night: ['#F4F1FB', '#FFFFFF'],
    aqua: ['#5AA9E6', '#8FD2F2'],
    gold: ['#F6C89A', '#F7A08B'],
    glass: ['rgba(255,255,255,0.62)', 'rgba(255,255,255,0.22)'],
  },
  surface: {
    background: '#F4F1FB',
    card: '#FFFFFF',
    elevated: '#FFFFFF',
    glass: 'rgba(255,255,255,0.68)',
    glassStrong: 'rgba(255,255,255,0.88)',
    overlay: 'rgba(36,30,56,0.32)',
  },
  text: {
    primary: '#241E38',
    secondary: 'rgba(36,30,56,0.55)',
    tertiary: 'rgba(36,30,56,0.35)',
    onDark: '#F4F1FB',
  },
  semantic: {
    success: '#3FBE95',
    warning: '#F6C89A',
    danger: '#E0607A',
    info: '#5AA9E6',
  },
};
```

- [ ] **Step 4: Write `src/theme/accents.ts`**

```ts
import { ThemeTokens } from './tokens/types';

export type AccentKey = 'lavender' | 'rose' | 'auroraBlue';

export const accentPairs: Record<AccentKey, { secondary: string; primary: string }> = {
  lavender: { secondary: '#8B6FE8', primary: '#B9A6F2' },
  rose: { secondary: '#E87A97', primary: '#F5B8C4' },
  auroraBlue: { secondary: '#5AA9E6', primary: '#8FD2F2' },
};

/**
 * Overrides only the "current accent" slot (primary/primaryPressed/lavender/
 * gradients.hero). Phase colors and the new fixed named hues (auroraBlue,
 * roseDeep, etc.) are never touched — they represent specific hues, not the
 * user's accent choice.
 */
export function applyAccent(tokens: ThemeTokens, accent: AccentKey): ThemeTokens {
  const { secondary, primary } = accentPairs[accent];
  return {
    ...tokens,
    primary,
    primaryPressed: secondary,
    lavender: secondary,
    gradients: {
      ...tokens.gradients,
      hero: [primary, secondary],
    },
  };
}
```

- [ ] **Step 5: Write the failing test `src/theme/accents.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { accentPairs, applyAccent } from './accents';
import { darkTokens } from './tokens/dark';

describe('applyAccent', () => {
  it('overrides only the accent slot, leaving phase colors untouched', () => {
    const result = applyAccent(darkTokens, 'rose');
    expect(result.primary).toBe(accentPairs.rose.primary);
    expect(result.primaryPressed).toBe(accentPairs.rose.secondary);
    expect(result.lavender).toBe(accentPairs.rose.secondary);
    expect(result.gradients.hero).toEqual([accentPairs.rose.primary, accentPairs.rose.secondary]);
    expect(result.phase).toEqual(darkTokens.phase);
    expect(result.auroraBlue).toBe(darkTokens.auroraBlue);
    expect(result.roseDeep).toBe(darkTokens.roseDeep);
  });

  it('lavender accent is a no-op on the accent slot values', () => {
    const result = applyAccent(darkTokens, 'lavender');
    expect(result.primary).toBe(accentPairs.lavender.primary);
    expect(result.lavender).toBe(accentPairs.lavender.secondary);
  });
});
```

- [ ] **Step 6: Add `src/theme/**/*.test.ts` to vitest include**

In `vitest.config.ts`, change:

```ts
    include: ['src/services/**/*.test.ts', 'src/utils/**/*.test.ts'],
```

to:

```ts
    include: ['src/services/**/*.test.ts', 'src/utils/**/*.test.ts', 'src/theme/**/*.test.ts'],
```

- [ ] **Step 7: Run the test**

Run: `npx vitest run src/theme/accents.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 8: Verify types and commit**

Run: `npx tsc --noEmit`
Expected: no errors (these are new, unconsumed files)

```bash
git add src/theme/tokens vitest.config.ts src/theme/accents.ts src/theme/accents.test.ts
git commit -m "feat: add Aurora Night color tokens (dark, light, accents)"
```

---

## Task 2: Theme store + `useTheme` hook

**Why a temporary static fallback export:** Tasks 4-6 migrate ~39 files from
`import { colors, typography } from '@/theme'` to `useTheme()`, one batch at
a time. Task 10 (tab bar rebuild) is the *last* file still on the old static
import, and it runs after Tasks 4-9. If this task removed the static
`colors`/`typography` exports outright, every not-yet-migrated file would
fail `tsc --noEmit` from this task onward until Task 10 — violating "`tsc
--noEmit` clean after every task." So this task keeps `theme/index.ts`
exporting static `colors`/`typography`/`shadows` (computed once, at the
default dark+lavender resolution) *alongside* the new hook. Task 10 removes
the static fallback once it is the final migrated consumer.

**Files:**
- Create: `src/store/themeStore.ts`
- Modify: `src/store/index.ts`
- Create: `src/theme/typography.ts` (rewritten as a function, replacing the
  static object — see Task 3, which depends on this file existing first)
- Create: `src/theme/useTheme.ts`
- Create: `src/theme/useTheme.test.ts`
- Modify: `src/theme/index.ts` (add temporary static fallback + `shadows`
  factory)

**Interfaces:**
- Consumes: `ThemeTokens`, `darkTokens`, `lightTokens`, `applyAccent`,
  `AccentKey` (Task 1).
- Produces: `useThemeStore` (Zustand hook), `useTheme(): { colors:
  ThemeTokens; typography: TypographyTokens; shadows: ShadowTokens; mode:
  'dark'|'light'; reduceMotion: boolean }`. Every later task reads
  `colors`/`typography` from this hook; `shadows.glow` (the one
  accent-reactive shadow tier) is also read from the hook where used —
  `shadows.xs`/`sm`/`md`/`lg` keep using the plain static
  `import { shadows } from '@/theme'` since they're mode/accent-independent
  (fixed `#000000`, see spec's Shadow tiers table).

- [ ] **Step 1: Write `src/store/themeStore.ts`**

Mirrors the existing `usePremiumStore` pattern (Zustand + AsyncStorage
persist):

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { AccentKey } from '@/theme/accents';

interface ThemeState {
  mode: 'dark' | 'light';
  accent: AccentKey;
  reduceMotion: boolean;
  setMode: (mode: 'dark' | 'light') => void;
  setAccent: (accent: AccentKey) => void;
  setReduceMotion: (value: boolean) => void;
  reset: () => void;
}

const initialState = {
  mode: 'dark' as const,
  accent: 'lavender' as AccentKey,
  reduceMotion: false,
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      ...initialState,
      setMode: (mode) => set({ mode }),
      setAccent: (accent) => set({ accent }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      reset: () => set(initialState),
    }),
    {
      name: 'theme-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

- [ ] **Step 2: Wire into the store barrel and `resetAllData`**

In `src/store/index.ts`, add the import/export and include it in
`resetAllData`:

```ts
import { useLogStore } from './useLogStore';
import { usePremiumStore } from './usePremiumStore';
import { useThemeStore } from './themeStore';
import { useUserStore } from './useUserStore';

export { useLogStore, usePremiumStore, useThemeStore, useUserStore };

/** Wipes every persisted store — used by Settings "Delete all data". */
export function resetAllData(): void {
  useUserStore.getState().reset();
  useLogStore.getState().reset();
  usePremiumStore.getState().reset();
  useThemeStore.getState().reset();
}
```

- [ ] **Step 3: Write `src/theme/typography.ts` (function, not static object)**

Replaces the current static-object file entirely. Font family names are
placeholders here — Task 3 defines the real Cormorant Garamond / Plus Jakarta
Sans family constants and this file is edited again in that task to import
them. For this task, keep the existing v1 font family strings so the file
type-checks in isolation; Task 3 swaps them.

```ts
import { TextStyle } from 'react-native';
import { ThemeTokens } from './tokens/types';

export interface TypographyTokens {
  displayXl: TextStyle;
  displayL: TextStyle;
  headline: TextStyle;
  title: TextStyle;
  subtitle: TextStyle;
  bodyLarge: TextStyle;
  body: TextStyle;
  caption: TextStyle;
  micro: TextStyle;
  button: TextStyle;
}

export function buildTypography(colors: ThemeTokens): TypographyTokens {
  const base: TextStyle = { color: colors.textPrimary };
  return {
    displayXl: { ...base, fontFamily: 'Fraunces_600SemiBold', fontSize: 32, lineHeight: 34, letterSpacing: -0.4 },
    displayL: { ...base, fontFamily: 'Fraunces_600SemiBold', fontSize: 28, lineHeight: 31 },
    headline: { ...base, fontFamily: 'DMSans_700Bold', fontSize: 22, lineHeight: 29 },
    title: { ...base, fontFamily: 'DMSans_600SemiBold', fontSize: 18, lineHeight: 25 },
    subtitle: { ...base, fontFamily: 'DMSans_600SemiBold', fontSize: 16, lineHeight: 24 },
    bodyLarge: { ...base, fontFamily: 'DMSans_400Regular', fontSize: 15, lineHeight: 23 },
    body: { ...base, fontFamily: 'DMSans_400Regular', fontSize: 14, lineHeight: 22, color: colors.textSecondary },
    caption: { ...base, fontFamily: 'DMSans_500Medium', fontSize: 12, lineHeight: 18, letterSpacing: 0.7, color: colors.textSecondary },
    micro: { ...base, fontFamily: 'DMSans_600SemiBold', fontSize: 10, lineHeight: 14, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.textSecondary },
    button: { fontFamily: 'DMSans_600SemiBold', fontSize: 14, lineHeight: 17 },
  };
}
```

- [ ] **Step 4: Write `src/theme/useTheme.ts`**

```ts
import { useMemo } from 'react';

import { useThemeStore } from '@/store/themeStore';

import { applyAccent } from './accents';
import { shadows as shadowShapes, ShadowTokens } from './shadows';
import { darkTokens } from './tokens/dark';
import { lightTokens } from './tokens/light';
import { ThemeTokens } from './tokens/types';
import { buildTypography, TypographyTokens } from './typography';

interface UseThemeResult {
  colors: ThemeTokens;
  typography: TypographyTokens;
  shadows: ShadowTokens;
  mode: 'dark' | 'light';
  reduceMotion: boolean;
}

export function useTheme(): UseThemeResult {
  const mode = useThemeStore((s) => s.mode);
  const accent = useThemeStore((s) => s.accent);
  const reduceMotion = useThemeStore((s) => s.reduceMotion);

  return useMemo(() => {
    const base = mode === 'dark' ? darkTokens : lightTokens;
    const colors = applyAccent(base, accent);
    const typography = buildTypography(colors);
    const shadows = { ...shadowShapes, glow: { ...shadowShapes.glow, shadowColor: colors.primary } };
    return { colors, typography, shadows, mode, reduceMotion };
  }, [mode, accent, reduceMotion]);
}
```

`src/theme/shadows.ts` already exists (Foundation v1) and is unchanged by
this plan except for its exported type name — verify it exports
`ShadowTokens` (add `export type ShadowTokens = typeof shadows;` at the
bottom if it doesn't already export a type alias for the shape).

- [ ] **Step 5: Add the temporary static fallback to `src/theme/index.ts`**

Read the current file first — it's a small barrel
(`export { colors } from './colors'; export { typography } from
'./typography'; ...`). Replace the `colors`/`typography` re-exports (which
no longer exist as static objects after this task) with a computed fallback,
clearly marked temporary:

```ts
export { spacing } from './spacing';
export { radius } from './radius';
export { shadows, legacyShadowAliases } from './shadows';
export { duration, easing } from './motion';
export { sizes } from './sizes';

// --- TEMPORARY: remove once Task 10 (tab bar rebuild) lands ---
// Keeps not-yet-migrated files (still on `import { colors, typography }
// from '@/theme'`) compiling against the default dark+lavender resolution
// while Tasks 4-6 migrate consumers to `useTheme()` one batch at a time.
import { applyAccent } from './accents';
import { darkTokens } from './tokens/dark';
import { buildTypography } from './typography';

export const colors = applyAccent(darkTokens, 'lavender');
export const typography = buildTypography(colors);
// --- end temporary ---
```

- [ ] **Step 6: Write the failing test `src/theme/useTheme.test.ts`**

Tests the pure resolution logic without rendering a component (no RN
component-test infra exists in this project — see `vitest.config.ts`'s
`node` environment). We test `applyAccent`+`buildTypography` composition
directly instead of the hook itself, since hooks require a render context:

```ts
import { describe, expect, it } from 'vitest';
import { applyAccent } from './accents';
import { darkTokens } from './tokens/dark';
import { lightTokens } from './tokens/light';
import { buildTypography } from './typography';

describe('theme resolution', () => {
  it('dark mode + lavender accent resolves textPrimary/background correctly', () => {
    const colors = applyAccent(darkTokens, 'lavender');
    expect(colors.background).toBe('#0E0B1A');
    expect(colors.textPrimary).toBe('#F4F1FB');
  });

  it('light mode resolves a light background regardless of accent', () => {
    const colors = applyAccent(lightTokens, 'rose');
    expect(colors.background).toBe('#F4F1FB');
    expect(colors.primary).toBe('#F5B8C4');
  });

  it('typography.body color matches the resolved textSecondary', () => {
    const colors = applyAccent(darkTokens, 'lavender');
    const typography = buildTypography(colors);
    expect(typography.body.color).toBe(colors.textSecondary);
    expect(typography.headline.color).toBe(colors.textPrimary);
  });
});
```

- [ ] **Step 7: Run tests**

Run: `npx vitest run src/theme`
Expected: PASS (5 tests total including Task 1's)

- [ ] **Step 8: Verify types and commit**

Run: `npx tsc --noEmit`
Expected: no errors — the temporary static fallback (Step 5) is exactly
what keeps this clean; every unmigrated file still resolves `colors`/
`typography` from `@/theme` successfully.

```bash
git add src/store/themeStore.ts src/store/index.ts src/theme/typography.ts src/theme/useTheme.ts src/theme/useTheme.test.ts src/theme/shadows.ts
git commit -m "feat: add theme store and useTheme hook (with temporary static fallback)"
```

---

## Task 3: Typography v2 fonts + root layout migration

**Files:**
- Modify: `src/theme/typography.ts` (swap placeholder font families for real
  Cormorant Garamond / Plus Jakarta Sans constants)
- Modify: `src/app/_layout.tsx`
- Modify: `package.json` (new font packages, remove old ones)

**Interfaces:**
- Consumes: `useTheme` (Task 2).
- Produces: no new exports; this task finalizes the real font families used
  by `TypographyTokens`.

- [ ] **Step 1: Install new font packages, remove old ones**

```bash
npx expo install @expo-google-fonts/cormorant-garamond @expo-google-fonts/plus-jakarta-sans
npm uninstall @expo-google-fonts/fraunces @expo-google-fonts/dm-sans
```

- [ ] **Step 2: Verify the exact exported font weight constants**

Run: `node -e "console.log(Object.keys(require('@expo-google-fonts/cormorant-garamond')))"`
Run: `node -e "console.log(Object.keys(require('@expo-google-fonts/plus-jakarta-sans')))"`

Expected: constant names following the `{Family}_{weight}{Style}` convention
(e.g. `CormorantGaramond_400Regular`, `CormorantGaramond_400Regular_Italic`,
`CormorantGaramond_600SemiBold`, `PlusJakartaSans_400Regular`,
`PlusJakartaSans_700Bold`). If the actual exported names differ from this
plan's assumption, use the real names in Steps 3-4 instead.

- [ ] **Step 3: Update `src/theme/typography.ts` font families**

Replace every `fontFamily` value:

```ts
    displayXl: { ...base, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 32, lineHeight: 34, letterSpacing: -0.4 },
    displayL: { ...base, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 28, lineHeight: 31 },
    headline: { ...base, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 22, lineHeight: 29 },
    title: { ...base, fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 18, lineHeight: 25 },
    subtitle: { ...base, fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 16, lineHeight: 24 },
    bodyLarge: { ...base, fontFamily: 'PlusJakartaSans_400Regular', fontSize: 15, lineHeight: 23 },
    body: { ...base, fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, lineHeight: 22, color: colors.textSecondary },
    caption: { ...base, fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, lineHeight: 18, letterSpacing: 0.7, color: colors.textSecondary },
    micro: { ...base, fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 10, lineHeight: 14, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.textSecondary },
    button: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, lineHeight: 17 },
```

- [ ] **Step 4: Rewrite `src/app/_layout.tsx`**

Full file (font imports swapped, hydration check includes `themeStore`,
colors/StatusBar sourced from `useTheme()`):

```tsx
import {
  CormorantGaramond_400Regular_Italic,
  CormorantGaramond_600SemiBold,
} from '@expo-google-fonts/cormorant-garamond';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

import { initI18n } from '@/i18n';
import { useLogStore, usePremiumStore, useThemeStore, useUserStore } from '@/store';
import { useTheme } from '@/theme/useTheme';

SplashScreen.preventAutoHideAsync();

function useStoresHydrated(): boolean {
  const [hydrated, setHydrated] = useState(
    () =>
      useUserStore.persist.hasHydrated() &&
      useLogStore.persist.hasHydrated() &&
      usePremiumStore.persist.hasHydrated() &&
      useThemeStore.persist.hasHydrated()
  );

  useEffect(() => {
    if (hydrated) return;
    const check = () => {
      if (
        useUserStore.persist.hasHydrated() &&
        useLogStore.persist.hasHydrated() &&
        usePremiumStore.persist.hasHydrated() &&
        useThemeStore.persist.hasHydrated()
      ) {
        setHydrated(true);
      }
    };
    const subs = [
      useUserStore.persist.onFinishHydration(check),
      useLogStore.persist.onFinishHydration(check),
      usePremiumStore.persist.onFinishHydration(check),
      useThemeStore.persist.onFinishHydration(check),
    ];
    check();
    return () => subs.forEach((unsub) => unsub());
  }, [hydrated]);

  return hydrated;
}

export default function RootLayout() {
  const [i18nReady, setI18nReady] = useState(false);
  const [fontsLoaded] = useFonts({
    CormorantGaramond_600SemiBold,
    CormorantGaramond_400Regular_Italic,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });
  const storesReady = useStoresHydrated();
  const { colors, mode } = useTheme();

  useEffect(() => {
    initI18n().finally(() => setI18nReady(true));
  }, []);

  const ready = i18nReady && storesReady && fontsLoaded;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          animationDuration: 220,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}
```

- [ ] **Step 5: Verify types and run tests**

Run: `npx tsc --noEmit`
Expected: errors only in files still using old `Fraunces_*`/`DMSans_*` names
or old typography token names (`h1`/`h2`/etc. don't exist — expected errors
are in files not yet migrated; this is fixed across Tasks 4-6). If `_layout.tsx`
itself has no errors, this task is done.

Run: `npx vitest run`
Expected: all existing tests still pass (fonts/layout aren't covered by
vitest's `node` environment, so no new failures here)

- [ ] **Step 6: Commit**

```bash
git add src/theme/typography.ts src/app/_layout.tsx package.json package-lock.json
git commit -m "feat: switch fonts to Cormorant Garamond + Plus Jakarta Sans"
```

---

## Task 4: Theme access migration, Batch 1 — shared components

**Files (20 files, all in `src/components/**`):**
`ai/MessageBubble.tsx`, `ai/SuggestedPrompts.tsx`, `cycle/CalendarDayCell.tsx`,
`cycle/ForecastCard.tsx`, `cycle/PhaseBadge.tsx`, `cycle/WeekStrip.tsx`,
`paywall/PlanCard.tsx`, `paywall/PremiumBanner.tsx`, `ui/AppButton.tsx`,
`ui/BottomAction.tsx`, `ui/Card.tsx`, `ui/Chip.tsx`, `ui/ChipGroup.tsx`,
`ui/DisclaimerBox.tsx`, `ui/GlassCard.tsx`, `ui/LevelSlider.tsx`,
`ui/ProgressBar.tsx`, `ui/ScoreRing.tsx`, `ui/Screen.tsx`, `ui/SectionTitle.tsx`

(`mascot/Luna.tsx` and `ui/EmptyState.tsx` are excluded — handled in Task 7.)

**Interfaces:**
- Consumes: `useTheme` (Task 2).
- Produces: no new exports — every file's public props/behavior are
  unchanged, only the internal color/typography access pattern changes.

**The mechanical recipe** (apply to every file in this batch):

0. **First, rename any old typography token references** to the new scale
   (this is a separate concern from the hook-access change in Steps 1-3
   below, but touches the same lines, so do it in the same pass):

   | Old name | New name |
   |----------|----------|
   | `typography.display` | `typography.displayXl` (page greetings) or `typography.displayL` (screen titles) — read the surrounding copy to judge which |
   | `typography.body` | `typography.bodyLarge` |
   | `typography.bodySmall` | `typography.body` |
   | `typography.headline`/`title`/`subtitle`/`caption`/`micro`/`button` | unchanged (same name) |

   Run `grep -n "typography\.\(display\|body\|bodySmall\)\b" <file>` on each
   file in this batch first to find whether it needs this step at all —
   most files only use `title`/`caption`/`body` variants that may or may not
   need renaming depending on which exact old name they used.

1. In the `@/theme` import, remove `colors` and `typography` from the
   destructured names — keep `spacing`, `radius`, `sizes`, `shadows`,
   `duration`, `easing` if present.
2. Add `import { useTheme } from '@/theme/useTheme';` (own import line, not
   merged with the `@/theme` barrel import).
3. As the first line of every exported component function's body, add
   `const { colors, typography } = useTheme();` (if the file only used
   `colors` or only `typography`, still destructure both from the hook call
   — unused destructured names are fine, but importing only what's used from
   the hook's return is also acceptable; do not add an eslint-disable for
   unused vars).
4. If a `StyleSheet.create({...})` block references `colors.x` or spreads
   `typography.x`: remove exactly those properties/spreads from the static
   object, and change every `style={styles.foo}` using them to
   `style={[styles.foo, { <the extracted properties> }]}` (for a
   `typography.x` spread, use `style={[styles.foo, typography.x]}` directly
   — `typography.x` is already a complete `TextStyle`).
5. If a file exports more than one component (rare in this batch), each one
   needing `colors`/`typography` gets its own `useTheme()` call.
6. `GlassCard.tsx` additionally: replace its hardcoded shine-gradient array
   `['rgba(255,255,255,0.62)', 'rgba(255,255,255,0.22)']` with
   `colors.gradients.glass` (already resolves to the correct per-mode value
   per Task 1's tokens).
7. `Screen.tsx`: only the hook-access migration happens in this task — do
   NOT touch the `<LinearGradient colors={colors.gradients.app} />`
   background element yet (that's Task 8's `AuroraBackground` integration).
8. `AppButton.tsx` additionally: its `primary` variant spreads
   `...shadows.glow` (static import) for the button's glow shadow. Change
   this one usage to read `shadows` from `useTheme()` instead of the static
   `@/theme` import (`const { colors, typography, shadows } =
   useTheme();`), so the glow color follows the active accent. Every other
   file in this batch keeps `shadows` as a static import if it uses
   `xs`/`sm`/`md`/`lg` — only `AppButton.tsx`'s glow usage needs the
   hook-sourced `shadows`.

**Worked example 1 — no StyleSheet extraction needed
(`src/components/ui/ChipGroup.tsx`, already "simple"):** confirm it already
compiles with the hook added even though it has no color/typography usage
in its `StyleSheet.create` block — no behavior change, just confirms the
import-only files need nothing beyond Steps 1-2 (skip Steps 3-4 for files
with no `colors.`/`typography.` reference at all, e.g. `ChipGroup.tsx`,
`ProgressBar.tsx`, `SuggestedPrompts.tsx` don't need the hook at all if they
never reference `colors`/`typography` — verify with
`grep -n "colors\.\|typography\." <file>` before editing; if empty, skip the
file entirely).

**Worked example 2 — extraction needed (`src/components/ui/SectionTitle.tsx`):**

Before:

```tsx
import { StyleSheet, Text } from 'react-native';

import { spacing, typography } from '@/theme';

interface Props {
  title: string;
}

export function SectionTitle({ title }: Props) {
  return (
    <Text style={styles.title} accessibilityRole="header">
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.title,
    marginTop: spacing(3),
    marginBottom: spacing(1.5),
  },
});
```

After:

```tsx
import { StyleSheet, Text } from 'react-native';

import { spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';

interface Props {
  title: string;
}

export function SectionTitle({ title }: Props) {
  const { typography } = useTheme();
  return (
    <Text style={[styles.title, typography.title]} accessibilityRole="header">
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: spacing(3),
    marginBottom: spacing(1.5),
  },
});
```

**Worked example 3 — `Card.tsx` (component with a conditional variant, JSX-level color usage):**

Before:

```tsx
import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { GlassCard } from '@/components/ui/GlassCard';
import { colors, radius, shadows, sizes } from '@/theme';

interface Props {
  variant?: 'solid' | 'glass';
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, variant = 'solid', style }: PropsWithChildren<Props>) {
  if (variant === 'glass') {
    return <GlassCard style={style}>{children}</GlassCard>;
  }

  return <View style={[styles.base, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface.elevated,
    borderRadius: radius.card,
    padding: sizes.cardPadding,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
});
```

After:

```tsx
import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { GlassCard } from '@/components/ui/GlassCard';
import { radius, shadows, sizes } from '@/theme';
import { useTheme } from '@/theme/useTheme';

interface Props {
  variant?: 'solid' | 'glass';
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, variant = 'solid', style }: PropsWithChildren<Props>) {
  const { colors } = useTheme();
  if (variant === 'glass') {
    return <GlassCard style={style}>{children}</GlassCard>;
  }

  return (
    <View
      style={[
        styles.base,
        { backgroundColor: colors.surface.elevated, borderColor: colors.border },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.card,
    padding: sizes.cardPadding,
    borderWidth: 1,
    ...shadows.sm,
  },
});
```

- [ ] **Step 1: Apply the recipe to all 20 files listed above**

- [ ] **Step 2: Verify no static `colors`/`typography` module-scope leaks remain**

Run: `grep -rn "colors\." src/components/{ai,cycle,paywall,ui} --include="*.tsx" | grep -v "useTheme\|const { colors" `

Expected: no output (every remaining `colors.` reference should be inside a
function body that already destructured `colors` from `useTheme()`, so this
grep — which only flags the string `colors.` without nearby destructuring —
is a smoke check; manually confirm any hits are false positives before
moving on).

- [ ] **Step 3: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors at all — the Task 2 static fallback keeps every
not-yet-migrated file (Batches 2/3, `Luna.tsx`, `EmptyState.tsx`,
`(tabs)/_layout.tsx`) compiling throughout.

- [ ] **Step 4: Commit**

```bash
git add src/components/ai src/components/cycle src/components/paywall src/components/ui
git commit -m "feat: migrate shared components to useTheme hook"
```

---

## Task 5: Theme access migration, Batch 2 — onboarding screens

**Files (8 files, all in `src/app/onboarding/`):**
`_layout.tsx`, `disclaimer.tsx`, `goals.tsx`, `last-period.tsx`,
`notifications.tsx`, `paywall-preview.tsx`, `profile.tsx`, `welcome.tsx`

**Interfaces:**
- Consumes: `useTheme` (Task 2).
- Produces: none — same rule as Task 4.

- [ ] **Step 1: Apply the exact same recipe from Task 4 to all 8 files**

(`_layout.tsx` is "simple" — verify with `grep -n "colors\.\|typography\."
src/app/onboarding/_layout.tsx` first; if empty, only Steps 1-2 of the
recipe apply.)

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors at all (same reasoning as Task 4 — the static fallback
covers everything not yet migrated).

- [ ] **Step 3: Commit**

```bash
git add src/app/onboarding
git commit -m "feat: migrate onboarding screens to useTheme hook"
```

---

## Task 6: Theme access migration, Batch 3 — feature screens

**Files (10 files, all in `src/features/**`):**
`ai/AiChatScreen.tsx`, `calendar/CalendarScreen.tsx`,
`calendar/DayDetailSheet.tsx`, `home/HomeScreen.tsx`,
`insights/InsightsScreen.tsx`, `log/LogScreen.tsx`,
`onboarding/DatePickerCalendar.tsx`, `onboarding/Stepper.tsx`,
`paywall/PaywallScreen.tsx`, `settings/SettingsScreen.tsx`

**Interfaces:**
- Consumes: `useTheme` (Task 2).
- Produces: none — same rule as Task 4. `InsightsScreen.tsx`'s
  `<EmptyState lunaExpression="thinking" />` call site needs no change here
  — `"thinking"` is already a valid `LunaOrb` state name (Task 7 changes
  the underlying type, not this call site).

- [ ] **Step 1: Apply the exact same recipe from Task 4 to all 10 files**

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors at all (same reasoning as Task 4).

- [ ] **Step 3: Commit**

```bash
git add src/features
git commit -m "feat: migrate feature screens to useTheme hook"
```

---

## Task 7: Luna Orb mascot (replaces crescent Luna)

**Files:**
- Create: `src/components/mascot/LunaOrb.tsx`
- Delete: `src/components/mascot/Luna.tsx`
- Modify: `src/components/ui/EmptyState.tsx`

**Interfaces:**
- Consumes: `useTheme` (Task 2), `duration`/`easing` (existing static
  `src/theme/motion.ts`, unchanged).
- Produces: `LunaOrbState = 'idle' | 'listening' | 'thinking' |
  'celebrating'`, `LunaOrb({ state?: LunaOrbState; size?: number })`.
  Consumed by: `EmptyState` (this task), Task 10 (tab bar center button).

- [ ] **Step 1: Write `src/components/mascot/LunaOrb.tsx`**

```tsx
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useThemeStore } from '@/store/themeStore';
import { useTheme } from '@/theme/useTheme';

export type LunaOrbState = 'idle' | 'listening' | 'thinking' | 'celebrating';

interface LunaOrbProps {
  state?: LunaOrbState;
  size?: number;
}

export function LunaOrb({ state = 'idle', size = 96 }: LunaOrbProps) {
  const { colors } = useTheme();
  const reduceMotion = useThemeStore((s) => s.reduceMotion);

  const floatY = useSharedValue(0);
  const glowScale = useSharedValue(0.95);
  const glowOpacity = useSharedValue(0.55);
  const rotate = useSharedValue(0);
  const pop = useSharedValue(1);

  useEffect(() => {
    cancelAnimation(floatY);
    cancelAnimation(glowScale);
    cancelAnimation(glowOpacity);
    cancelAnimation(rotate);

    if (reduceMotion) {
      floatY.value = 0;
      rotate.value = 0;
      glowScale.value = 1;
      glowOpacity.value = 0.75;
    } else if (state === 'thinking') {
      rotate.value = withRepeat(
        withSequence(
          withTiming(20, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
          withTiming(-20, { duration: 2200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      glowOpacity.value = withRepeat(withTiming(0.9, { duration: 2000 }), -1, true);
    } else if (state === 'listening') {
      glowScale.value = withRepeat(withTiming(1.1, { duration: 900 }), -1, true);
      glowOpacity.value = withRepeat(withTiming(0.95, { duration: 900 }), -1, true);
    } else {
      floatY.value = withRepeat(withTiming(-8, { duration: 3000, easing: Easing.inOut(Easing.ease) }), -1, true);
      glowScale.value = withRepeat(withTiming(1.08, { duration: 2000 }), -1, true);
      glowOpacity.value = withRepeat(withTiming(0.9, { duration: 2000 }), -1, true);
    }

    if (state === 'celebrating') {
      pop.value = withSequence(
        withTiming(0.6, { duration: 0 }),
        withTiming(1.12, { duration: reduceMotion ? 120 : 240 }),
        withTiming(1, { duration: reduceMotion ? 80 : 160 })
      );
    }
  }, [state, reduceMotion, floatY, glowScale, glowOpacity, rotate, pop]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value },
      { rotate: `${rotate.value}deg` },
      { scale: pop.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const eyeOffset = state === 'thinking' ? 2 : 0;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glow,
          glowStyle,
          {
            width: size * 1.4,
            height: size * 1.4,
            borderRadius: (size * 1.4) / 2,
            backgroundColor: colors.lavenderLight,
          },
        ]}
      />
      <Animated.View
        style={[
          orbStyle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: colors.lunaShadowColor,
            shadowOffset: { width: -size * 0.06, height: -size * 0.08 },
            shadowOpacity: 0.55,
            shadowRadius: size * 0.16,
          },
        ]}
      >
        <View style={{ flexDirection: 'row', gap: size * 0.09, marginTop: eyeOffset }}>
          <View style={[styles.eye, { width: size * 0.06, height: state === 'thinking' ? size * 0.015 : size * 0.06, backgroundColor: colors.lunaEyeColor }]} />
          <View style={[styles.eye, { width: size * 0.06, height: state === 'thinking' ? size * 0.015 : size * 0.06, backgroundColor: colors.lunaEyeColor }]} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
  },
  eye: {
    borderRadius: 999,
  },
});
```

- [ ] **Step 2: Delete `src/components/mascot/Luna.tsx`**

```bash
rm src/components/mascot/Luna.tsx
```

- [ ] **Step 3: Rewrite `src/components/ui/EmptyState.tsx`**

```tsx
import { StyleSheet, Text, View } from 'react-native';

import { LunaOrb, LunaOrbState } from '@/components/mascot/LunaOrb';
import { spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';

interface Props {
  lunaState?: LunaOrbState;
  title: string;
  body: string;
}

export function EmptyState({ lunaState = 'idle', title, body }: Props) {
  const { typography } = useTheme();
  return (
    <View style={styles.container}>
      <LunaOrb state={lunaState} size={88} />
      <Text style={[styles.title, typography.title]}>{title}</Text>
      <Text style={[styles.body, typography.body]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing(6),
    paddingHorizontal: spacing(4),
    gap: spacing(1),
  },
  title: {
    textAlign: 'center',
  },
  body: {
    textAlign: 'center',
  },
});
```

- [ ] **Step 4: Update the one call site**

`src/features/insights/InsightsScreen.tsx` currently has
`<EmptyState lunaExpression="thinking" ... />` — rename the prop:

```tsx
<EmptyState lunaState="thinking" ... />
```

- [ ] **Step 5: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors from `mascot/`, `EmptyState.tsx`, or `InsightsScreen.tsx`

- [ ] **Step 6: Manual visual verification**

Start Expo, deep-link into the Insights screen's empty state (or trigger it
via a fresh onboarding), screenshot via `xcrun simctl io booted screenshot`,
confirm the orb renders with a visible glow and thinking-state eyes (thin
horizontal lines, not circles).

- [ ] **Step 7: Commit**

```bash
git add src/components/mascot src/components/ui/EmptyState.tsx src/features/insights/InsightsScreen.tsx
git commit -m "feat: replace crescent Luna mascot with glowing LunaOrb"
```

---

## Task 8: Aurora Background + Screen.tsx integration

**Files:**
- Create: `src/components/ui/AuroraBackground.tsx`
- Modify: `src/components/ui/Screen.tsx`

**Interfaces:**
- Consumes: `useTheme` (Task 2), `useThemeStore` for `reduceMotion`.
- Produces: `AuroraBackground()` (no props — reads mode/reduceMotion itself).
  Consumed by: `Screen.tsx` only.

- [ ] **Step 1: Write `src/components/ui/AuroraBackground.tsx`**

```tsx
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useThemeStore } from '@/store/themeStore';
import { useTheme } from '@/theme/useTheme';

const OPACITY = {
  dark: { animated: [0.62, 0.5, 0.42], still: [0.4, 0.35, 0.3] },
  light: { animated: [0.3, 0.26, 0.2], still: [0.18, 0.16, 0.12] },
} as const;

function useDrift(durationMs: number, reduceMotion: boolean) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const scale = useSharedValue(1);

  if (!reduceMotion) {
    x.value = withRepeat(
      withSequence(
        withTiming(8, { duration: durationMs / 3, easing: Easing.inOut(Easing.ease) }),
        withTiming(-6, { duration: durationMs / 3, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: durationMs / 3, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: durationMs / 2 }),
        withTiming(1, { duration: durationMs / 2 })
      ),
      -1,
      true
    );
  }

  return useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }, { scale: scale.value }],
  }));
}

export function AuroraBackground() {
  const { colors, mode } = useTheme();
  const reduceMotion = useThemeStore((s) => s.reduceMotion);
  const opacities = reduceMotion ? OPACITY[mode].still : OPACITY[mode].animated;

  const layer1Style = useDrift(14000, reduceMotion);
  const layer2Style = useDrift(11000, reduceMotion);
  const layer3Style = useDrift(16000, reduceMotion);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />
      <Animated.View
        style={[
          styles.layer,
          layer1Style,
          { top: '-8%', left: '-22%', width: 280, height: 280, opacity: opacities[0], backgroundColor: colors.lavender },
        ]}
      />
      <Animated.View
        style={[
          styles.layer,
          layer2Style,
          { top: '32%', right: '-28%', width: 260, height: 260, opacity: opacities[1], backgroundColor: colors.auroraBlue },
        ]}
      />
      <Animated.View
        style={[
          styles.layer,
          layer3Style,
          { bottom: '5%', left: '-10%', width: 240, height: 240, opacity: opacities[2], backgroundColor: colors.roseDeep },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    borderRadius: 999,
  },
});
```

Note: this uses a solid-color circle rather than a true blurred
radial-gradient falloff (see spec's Open Follow-up) — verify visually in
Step 3 and escalate to `expo-blur` only if it reads too hard-edged.

- [ ] **Step 2: Integrate into `Screen.tsx`**

Replace the existing background `LinearGradient` element:

```tsx
      <LinearGradient
        pointerEvents="none"
        colors={colors.gradients.app}
        locations={[0, 0.48, 1]}
        style={StyleSheet.absoluteFill}
      />
```

with:

```tsx
      <AuroraBackground />
```

Add the import (`import { AuroraBackground } from
'@/components/ui/AuroraBackground';`) and remove the now-unused
`LinearGradient` import from `expo-linear-gradient` if `Screen.tsx` doesn't
use it elsewhere.

- [ ] **Step 3: Manual visual verification**

Start Expo, screenshot the Home screen (or any screen using `Screen`),
confirm three soft colored blobs are visible behind content and text
remains legible. Toggle `reduceMotion` via a temporary direct
`useThemeStore.setState({ reduceMotion: true })` call in dev tools (or a
quick throwaway button) to confirm the static (non-animated) opacity row
renders without motion.

- [ ] **Step 4: Verify types and commit**

Run: `npx tsc --noEmit`
Expected: no errors

```bash
git add src/components/ui/AuroraBackground.tsx src/components/ui/Screen.tsx
git commit -m "feat: add animated Aurora background, wire into Screen"
```

---

## Task 9: Progress Ring primitive

**Files:**
- Create: `src/components/ui/ProgressRing.tsx`

**Interfaces:**
- Consumes: `useTheme` (Task 2).
- Produces: `ProgressRing({ progress, size?, strokeWidth?, color?,
  trackColor? })`. Unconsumed this phase (built for Phase B's Home screen),
  matching Foundation v1's precedent of shipping unconsumed primitives.

- [ ] **Step 1: Write `src/components/ui/ProgressRing.tsx`**

```tsx
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { useThemeStore } from '@/store/themeStore';
import { useTheme } from '@/theme/useTheme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  /** 0-1 */
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
}

export function ProgressRing({
  progress,
  size = 104,
  strokeWidth = 6,
  color,
  trackColor,
}: ProgressRingProps) {
  const { colors } = useTheme();
  const reduceMotion = useThemeStore((s) => s.reduceMotion);
  const resolvedColor = color ?? colors.primary;
  const resolvedTrackColor = trackColor ?? colors.border;

  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, progress));
  const animatedProgress = useSharedValue(reduceMotion ? clamped : 0);

  useEffect(() => {
    if (reduceMotion) {
      animatedProgress.value = clamped;
    } else {
      animatedProgress.value = withDelay(300, withTiming(clamped, { duration: 1400 }));
    }
  }, [clamped, reduceMotion, animatedProgress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  return (
    <View style={{ width: size, height: size }} accessibilityRole="progressbar">
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={resolvedTrackColor} strokeWidth={strokeWidth} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={resolvedColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
    </View>
  );
}
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ProgressRing.tsx
git commit -m "feat: add ProgressRing shared primitive"
```

---

## Task 10: Floating Tab Bar v2 (IA change)

**Files:**
- Modify: `src/app/(tabs)/_layout.tsx` (rebuilt with a custom `tabBar`)
- Create: `src/app/(tabs)/premium.tsx` (new tab screen wrapping the existing
  `PaywallScreen`)
- Modify: `src/features/home/HomeScreen.tsx` (temporary Log link, see Task 11
  — do NOT do it in this task; only the tab bar restructure happens here)

**Interfaces:**
- Consumes: `useTheme` (Task 2), `LunaOrb` (Task 7).
- Produces: no new exports — this is the app's root tab navigator.

- [ ] **Step 1: Check what `premium`/paywall currently looks like**

Run: `grep -rn "paywall" src/app --include="*.tsx"`

Confirm the existing route (likely `src/app/paywall.tsx`, a modal
presentation per `_layout.tsx:90`). Do not delete that route — it may still
be linked from elsewhere (e.g. a "See Premium" button inside Settings). This
task adds a **second**, tab-based entry point; the modal route can stay for
now (it's out of scope to hunt down and rewire every existing
premium-upsell link in this phase).

- [ ] **Step 2: Create `src/app/(tabs)/premium.tsx`**

```tsx
import { PaywallScreen } from '@/features/paywall/PaywallScreen';

export default function PremiumTab() {
  return <PaywallScreen />;
}
```

- [ ] **Step 3: Rewrite `src/app/(tabs)/_layout.tsx`**

```tsx
import { Ionicons } from '@expo/vector-icons';
import { Tabs, router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LunaOrb } from '@/components/mascot/LunaOrb';
import { useTheme } from '@/theme/useTheme';

type IconName = keyof typeof Ionicons.glyphMap;

const TAB_ICON: Record<string, IconName> = {
  home: 'moon',
  calendar: 'calendar',
  insights: 'stats-chart',
  premium: 'sparkles',
};

function CustomTabBar({ state, descriptors, navigation }: Parameters<NonNullable<Parameters<typeof Tabs>[0]['tabBar']>>[0]) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        {
          bottom: 26 + Math.max(0, insets.bottom - 26),
          backgroundColor: colors.glass,
          borderColor: colors.glassBorder,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const iconName = TAB_ICON[route.name] ?? 'ellipse';

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={descriptors[route.key].options.title ?? route.name}
            style={[styles.tabButton, isFocused && { transform: [{ scale: 1.05 }] }]}
          >
            <Ionicons name={iconName} size={24} color={isFocused ? colors.primary : colors.textSecondary} />
            <View style={[styles.dot, { backgroundColor: isFocused ? colors.primary : 'transparent' }]} />
          </Pressable>
        );
      })}
      <Pressable
        onPress={() => router.push('/(tabs)/ai')}
        accessibilityRole="button"
        accessibilityLabel="Chat with Luna"
        style={styles.orbButton}
      >
        <LunaOrb state="idle" size={58} />
      </Pressable>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="calendar" options={{ title: 'Calendar' }} />
      <Tabs.Screen name="ai" options={{ title: 'Chat', href: null }} />
      <Tabs.Screen name="insights" options={{ title: 'Insights' }} />
      <Tabs.Screen name="premium" options={{ title: 'Premium' }} />
      <Tabs.Screen name="log" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1,
  },
  tabButton: {
    alignItems: 'center',
    gap: 4,
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  orbButton: {
    marginTop: -28,
  },
});
```

`href: null` on `ai` and `log` removes them from the tab bar's route list
while keeping the screens navigable via `router.push` (the orb button, and
Task 11's temporary Home link, respectively) — `expo-router`'s documented
mechanism for "route exists but isn't a visible tab."

- [ ] **Step 4: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors. If `Parameters<typeof Tabs>[0]['tabBar']` doesn't
type-check against the installed `expo-router` version, replace it with the
type `import type { BottomTabBarProps } from
'@react-navigation/bottom-tabs';` instead (check
`node_modules/expo-router/package.json` dependencies for the exact
`@react-navigation/bottom-tabs` version already installed transitively).

- [ ] **Step 5: Remove the temporary static fallback from `src/theme/index.ts`**

This tab bar rebuild was the last file still using
`import { colors, typography } from '@/theme'` (all other consumers were
migrated in Tasks 4-6, and Tasks 7-9 were written against `useTheme()` from
the start). Confirm this first:

Run: `grep -rn "^import { colors\|, colors[,}]\|^import { .*typography.* } from '@/theme'" src --include="*.tsx" --include="*.ts" | grep -v "theme/index.ts\|theme/typography.ts\|theme/accents\|tokens/"`

Expected: no output. If anything remains, migrate it first (using the Task
4 recipe) before continuing.

Then remove the temporary block from `src/theme/index.ts`:

```ts
// --- TEMPORARY: remove once Task 10 (tab bar rebuild) lands ---
import { applyAccent } from './accents';
import { darkTokens } from './tokens/dark';
import { buildTypography } from './typography';

export const colors = applyAccent(darkTokens, 'lavender');
export const typography = buildTypography(colors);
// --- end temporary ---
```

- [ ] **Step 6: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors — if removing the fallback breaks something, it means
Step 5's grep missed a consumer; find and migrate it, then re-run.

- [ ] **Step 7: Manual visual verification**

Start Expo, screenshot the tab bar, confirm: 4 edge icons + center floating
orb, active tab shows accent color + dot, tapping the orb navigates to Chat.

- [ ] **Step 8: Commit**

```bash
git add src/app/\(tabs\) src/theme/index.ts
git commit -m "feat: rebuild floating tab bar with center Luna orb, add Premium tab; remove temporary theme fallback"
```

---

## Task 11: Home screen temporary Log link

**Files:**
- Modify: `src/features/home/HomeScreen.tsx`

**Interfaces:**
- Consumes: none new.
- Produces: none — one added `Pressable`/`Link`.

- [ ] **Step 1: Add a plain, unstyled entry point to Log**

Find `HomeScreen.tsx`'s top-level returned JSX (inside its `Screen` wrapper)
and add, as the last child before the closing tag:

```tsx
      <Pressable onPress={() => router.push('/(tabs)/log')} accessibilityRole="button">
        <Text>Log how you're feeling</Text>
      </Pressable>
```

Add `Pressable` to the existing `react-native` import if not already
imported, `Text` likewise, and `import { router } from 'expo-router';` if
not already present. No new styling — this is explicitly temporary per the
spec, replaced by Phase B's real CTA.

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Manual verification**

Start Expo, confirm tapping the new link navigates to the Log screen.

- [ ] **Step 4: Commit**

```bash
git add src/features/home/HomeScreen.tsx
git commit -m "feat: add temporary Log entry point on Home (tab bar no longer has a Log tab)"
```

---

## Task 12: Settings additions (theme controls)

**Files:**
- Modify: `src/features/settings/SettingsScreen.tsx`

**Interfaces:**
- Consumes: `useThemeStore` (Task 2), existing `Switch`/`Chip`/`SectionTitle`
  primitives (already migrated in Task 6).
- Produces: none new.

- [ ] **Step 1: Add a new section to `SettingsScreen.tsx`**

Add near the existing notification-toggles section (following the file's
existing `<SectionTitle>` + control pattern):

```tsx
import { useThemeStore } from '@/store/themeStore';

// ...inside the component body, alongside the other useState/useStore reads:
const mode = useThemeStore((s) => s.mode);
const setMode = useThemeStore((s) => s.setMode);
const accent = useThemeStore((s) => s.accent);
const setAccent = useThemeStore((s) => s.setAccent);
const reduceMotion = useThemeStore((s) => s.reduceMotion);
const setReduceMotion = useThemeStore((s) => s.setReduceMotion);

// ...inside the returned JSX, as a new section:
<SectionTitle title="Appearance" />
<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
  <Text>Dark mode</Text>
  <Switch value={mode === 'dark'} onValueChange={(v) => setMode(v ? 'dark' : 'light')} />
</View>
<View style={{ flexDirection: 'row', gap: 8 }}>
  <Chip label="Lavender" selected={accent === 'lavender'} onPress={() => setAccent('lavender')} />
  <Chip label="Rose" selected={accent === 'rose'} onPress={() => setAccent('rose')} />
  <Chip label="Aurora Blue" selected={accent === 'auroraBlue'} onPress={() => setAccent('auroraBlue')} />
</View>
<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
  <Text>Reduce motion</Text>
  <Switch value={reduceMotion} onValueChange={setReduceMotion} />
</View>
```

Adapt the exact JSX to match the file's existing section-wrapping pattern
(read the surrounding notification-toggle section first and mirror its
container/spacing components rather than introducing a new layout style).

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Manual visual verification**

Start Expo, open Settings, toggle dark/light — confirm the entire app
(current screen plus tab bar) re-renders with the new colors immediately
(this is the end-to-end proof that the `useTheme()` migration actually
works). Toggle each accent swatch, confirm the tab bar's active-tab color
and Luna orb's core color change. Toggle reduce motion, confirm the Aurora
background and Luna orb stop animating.

- [ ] **Step 4: Commit**

```bash
git add src/features/settings/SettingsScreen.tsx
git commit -m "feat: add dark/light, accent, and reduce-motion controls to Settings"
```

---

## Final Verification (not a task — run after Task 12)

- [ ] `npx tsc --noEmit` — clean, zero errors
- [ ] `npx vitest run` — all tests pass (existing service tests + new
      `src/theme/*.test.ts`)
- [ ] `grep -rn "Fraunces\|DMSans_" src` — no output (old fonts fully removed)
- [ ] `grep -rln "from '@/components/mascot/Luna'" src` — no output (old
      mascot fully removed)
- [ ] `grep -rn "colors\.\|typography\." src --include="*.tsx" | grep -v "useTheme\|tokens/\|theme/typography.ts\|theme/accents"` —
      spot-check any hits are false positives (e.g. inside a function that
      already called `useTheme()`)
- [ ] Simulator screenshots: Home (aurora background + tab bar), Settings
      (theme controls, before/after toggling dark/light), Insights empty
      state (LunaOrb thinking), tab bar orb tap → Chat
