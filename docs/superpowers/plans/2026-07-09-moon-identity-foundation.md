# Moon Identity Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Luna mascot with an icon-derived "Moon Identity" foundation — renamed/extended color tokens, a moonstone material system, a faceless `MoonMark` brand component, and restyled shared components (tab bar, buttons, chips, rings, ambient background) — so every later screen phase (Home, Calendar, AI Chat, Premium, Onboarding, Settings) inherits a consistent, icon-true visual language.

**Architecture:** Evolve the existing `src/theme/tokens/*` and `src/components/ui/*` files in place rather than building a parallel system (pre-release branch, no migration risk). `LunaOrb`/`mascot/` is deleted outright and replaced by a new `MoonMark` component at every call site.

**Tech Stack:** React Native + Expo Router, `react-native-reanimated` (animation, shared values, `reduceMotion`), `react-native-svg` (gradients/shapes), `expo-linear-gradient`, Vitest (unit tests), TypeScript (`tsc --noEmit` as the completeness gate for the token rename).

## Global Constraints

- No mascot, no face, no character — the `MoonMark` brand component (crescent + pearl) has zero facial features in any state.
- Dark and light modes share the same token *names*; only values differ per mode. Every token added/renamed here must exist in both `dark.ts` and `light.ts`.
- All new/changed animations must respect `useThemeStore((s) => s.reduceMotion)` exactly as the current `AuroraBackground`/`LunaOrb`/`ProgressRing` do (no motion when enabled, or an instant settled state).
- No legacy key aliases — a renamed token is removed from `ThemeTokens`, not kept alongside its replacement, so `tsc --noEmit` is the authority on completeness (a stale call site is a compile error, not a silent runtime fallback).
- Reference image for palette/material judgment calls: `assets/images/dialuna.png` (the approved app icon).
- Design spec for this phase: `docs/superpowers/specs/2026-07-09-moon-identity-foundation-design.md`.

---

### Task 1: Discard the conflicting mascot WIP

**Files:**
- Revert (discard, do not commit): `src/components/mascot/LunaOrb.tsx`
- Revert (discard, do not commit): `src/features/home/HomeScreen.tsx`

**Interfaces:** None — this task only resets the working tree to its last committed state for these two files. No code is produced or consumed.

- [ ] **Step 1: Confirm what's currently modified**

Run: `git status --short`
Expected output includes:
```
 M src/components/mascot/LunaOrb.tsx
 M src/features/home/HomeScreen.tsx
```
(plus unrelated already-tracked changes to `app.json`/`package.json`, and the untracked `assets/images/dialuna.png` — leave those alone, they are not part of this revert.)

- [ ] **Step 2: Discard the two files**

Run: `git checkout -- src/components/mascot/LunaOrb.tsx src/features/home/HomeScreen.tsx`

- [ ] **Step 3: Verify they're back to HEAD**

Run: `git status --short -- src/components/mascot/LunaOrb.tsx src/features/home/HomeScreen.tsx`
Expected: no output (clean — matches HEAD).

- [ ] **Step 4: No commit needed**

This step intentionally produces no commit — there's nothing new to record, we've just returned two files to their already-committed state.

---

### Task 2: Rewrite the color token files

**Files:**
- Modify: `src/theme/tokens/types.ts` (full rewrite)
- Modify: `src/theme/tokens/dark.ts` (full rewrite)
- Modify: `src/theme/tokens/light.ts` (full rewrite)

**Interfaces:**
- Consumes: nothing new — pure token data.
- Produces: the `ThemeTokens` interface and `darkTokens`/`lightTokens` objects that every other task in this plan (and every existing call site) resolves colors through via `useTheme()`. Key names produced: `deepMidnight`, `royalViolet`, `lavender`, `primary`, `primaryPressed`, `lilac`, `moonWhite`, `pearl`, `champagneGold`, `softPeach`, `auroraBlue`, `ovulationBlue`, `roseDeep`, `peachDeep`, `mint`, `error`, `softRose`, `card`, `textPrimary`, `textSecondary`, `textDisabled`, `border`, `overlay`, `glass`, `glassStrong`, `glassBorder`, `divider`, `phase`, `phaseSoft`, `gradients.{app,hero,night,aqua,gold,glass,pearl}`, `surface.*`, `text.*`, `semantic.*`. Removed keys (do not exist after this task): `coral`, `iris`, `aqua` (top-level flat one — `auroraBlue` remains), `berry`, `deepPlum`, `cream`, `blush`, `pearl` (old near-black meaning — redefined, not removed), `background`, `night`, `nightElevated`, `lavenderLight`, `gold` (top-level flat — `gradients.gold` nested key stays), `peach`, `lunaEyeColor`, `lunaShadowColor`.

- [ ] **Step 1: Rewrite `src/theme/tokens/types.ts`**

```ts
export interface PhaseColors {
  menstrual: string;
  follicular: string;
  ovulation: string;
  luteal: string;
}

export interface ThemeTokens {
  // Core hues — semantic names derived from the app icon's palette.
  deepMidnight: string;
  royalViolet: string;
  lavender: string;
  primary: string;
  primaryPressed: string;
  lilac: string;
  moonWhite: string;
  pearl: string;
  champagneGold: string;
  softPeach: string;
  auroraBlue: string;
  ovulationBlue: string;
  roseDeep: string;
  peachDeep: string;
  mint: string;
  error: string;
  softRose: string;
  card: string;
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  border: string;
  overlay: string;
  glass: string;
  glassStrong: string;
  glassBorder: string;
  divider: string;

  phase: PhaseColors;
  phaseSoft: PhaseColors;
  gradients: {
    app: readonly [string, string];
    hero: readonly [string, string];
    night: readonly [string, string];
    aqua: readonly [string, string];
    gold: readonly [string, string];
    glass: readonly [string, string];
    pearl: readonly [string, string, string];
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

- [ ] **Step 2: Rewrite `src/theme/tokens/dark.ts`**

```ts
import { ThemeTokens } from './types';

export const darkTokens: ThemeTokens = {
  deepMidnight: '#120B2E',
  royalViolet: '#4B2F98',
  lavender: '#8B6FE8',
  primary: '#8B6FE8',
  primaryPressed: '#6F58C9',
  lilac: '#C9A8E8',
  moonWhite: '#FFF8ED',
  pearl: '#EAD9FF',
  champagneGold: '#F5C878',
  softPeach: '#FFD1A6',
  auroraBlue: '#5AA9E6',
  ovulationBlue: '#8FD2F2',
  roseDeep: '#E87A97',
  peachDeep: '#F7A08B',
  mint: '#6EE7C4',
  error: '#F2879B',
  softRose: 'rgba(245,184,196,0.16)',
  card: '#181230',
  textPrimary: '#F4F1FB',
  textSecondary: 'rgba(244,241,251,0.60)',
  textDisabled: 'rgba(244,241,251,0.35)',
  border: 'rgba(255,255,255,0.11)',
  overlay: 'rgba(14,11,26,0.72)',
  glass: 'rgba(20,15,38,0.62)',
  glassStrong: 'rgba(24,18,45,0.85)',
  glassBorder: 'rgba(255,255,255,0.14)',
  divider: 'rgba(255,255,255,0.08)',

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
    app: ['#120B2E', '#181230'],
    hero: ['#C9A8E8', '#8B6FE8'],
    night: ['#05030A', '#120B2E'],
    aqua: ['#5AA9E6', '#8FD2F2'],
    gold: ['#FFD1A6', '#F7A08B'],
    glass: ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.02)'],
    pearl: ['#FFF8ED', '#EAD9FF', '#C9A8E8'],
  },
  surface: {
    background: '#120B2E',
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

- [ ] **Step 3: Rewrite `src/theme/tokens/light.ts`**

```ts
import { ThemeTokens } from './types';

export const lightTokens: ThemeTokens = {
  deepMidnight: '#F4F1FB',
  royalViolet: '#3D2870',
  lavender: '#8B6FE8',
  primary: '#B9A6F2',
  primaryPressed: '#8B6FE8',
  lilac: '#C9A8E8',
  moonWhite: '#FFFFFF',
  pearl: '#F3E9FF',
  champagneGold: '#E8B564',
  softPeach: '#F6C89A',
  auroraBlue: '#5AA9E6',
  ovulationBlue: '#8FD2F2',
  roseDeep: '#E87A97',
  peachDeep: '#F7A08B',
  mint: '#3FBE95',
  error: '#E0607A',
  softRose: 'rgba(245,184,196,0.24)',
  card: '#FFFFFF',
  textPrimary: '#241E38',
  textSecondary: 'rgba(36,30,56,0.55)',
  textDisabled: 'rgba(36,30,56,0.35)',
  border: 'rgba(40,30,72,0.10)',
  overlay: 'rgba(36,30,56,0.32)',
  glass: 'rgba(255,255,255,0.68)',
  glassStrong: 'rgba(255,255,255,0.88)',
  glassBorder: 'rgba(40,30,72,0.12)',
  divider: 'rgba(40,30,72,0.08)',

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
    hero: ['#C9A8E8', '#8B6FE8'],
    night: ['#F4F1FB', '#FFFFFF'],
    aqua: ['#5AA9E6', '#8FD2F2'],
    gold: ['#F6C89A', '#F7A08B'],
    glass: ['rgba(255,255,255,0.62)', 'rgba(255,255,255,0.22)'],
    pearl: ['#FFFFFF', '#F3E9FF', '#C9A8E8'],
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

- [ ] **Step 4: Confirm the rest of the theme layer still typechecks in isolation**

Run: `npx tsc --noEmit -p . 2>&1 | grep -c "theme/tokens\|theme/accents\|theme/useTheme"`
Expected: `0` (the token/accents/useTheme files themselves are internally consistent — `accents.ts` only touches `primary`/`primaryPressed`/`lavender`/`gradients.hero`, all of which still exist). Every *other* error reported by the full `tsc` run at this point is an expected, not-yet-fixed call site — that's Task 3's job, don't fix them here.

- [ ] **Step 5: Commit**

```bash
git add src/theme/tokens/types.ts src/theme/tokens/dark.ts src/theme/tokens/light.ts
git commit -m "feat: rewrite color tokens with icon-derived semantic names

Renames ambiguous legacy keys (deepPlum, gold, peach, iris, aqua,
background/night, lunaEyeColor/lunaShadowColor) to the semantic
vocabulary from the Moon Identity Foundation spec. Call sites are
migrated in the next commit."
```

---

### Task 3: Migrate every call site to the new token names

**Files:**
- Modify (mechanical rename via `perl -pi`): `src/app/_layout.tsx`, `src/app/onboarding/_layout.tsx`, `src/components/ui/Screen.tsx`, `src/components/ui/AuroraBackground.tsx`, `src/features/settings/SettingsScreen.tsx`, `src/features/insights/InsightsScreen.tsx`, `src/features/calendar/CalendarScreen.tsx`, `src/features/ai/AiChatScreen.tsx`, `src/features/log/LogScreen.tsx`, `src/features/paywall/PaywallScreen.tsx`, `src/components/cycle/CalendarDayCell.tsx`, `src/components/paywall/PremiumBanner.tsx`, `src/components/paywall/PlanCard.tsx`, `src/features/home/HomeScreen.tsx`, `src/components/cycle/PhaseBadge.tsx`, `src/components/cycle/WeekStrip.tsx`
- Modify (targeted contrast fix): `src/features/settings/SettingsScreen.tsx`, `src/features/insights/InsightsScreen.tsx`, `src/features/calendar/CalendarScreen.tsx`, `src/features/ai/AiChatScreen.tsx`, `src/features/log/LogScreen.tsx`, `src/features/paywall/PaywallScreen.tsx`
- Modify: `src/theme/useTheme.test.ts`

**Interfaces:**
- Consumes: `ThemeTokens` keys produced by Task 2.
- Produces: nothing new — this task only removes references to deleted keys so `tsc --noEmit` passes again.

- [ ] **Step 1: Run the mechanical renames**

These six commands each rename one old flat key to its replacement across every file that used it (list built from `grep -rn "colors\.<oldKey>\b" src` prior to this plan). Word-boundary matching via `perl` (not `sed`, which on macOS/BSD doesn't support `\b` reliably).

```bash
perl -pi -e 's/\bcolors\.deepPlum\b/colors.royalViolet/g' \
  src/features/settings/SettingsScreen.tsx \
  src/features/insights/InsightsScreen.tsx \
  src/features/calendar/CalendarScreen.tsx \
  src/features/ai/AiChatScreen.tsx \
  src/features/log/LogScreen.tsx \
  src/features/paywall/PaywallScreen.tsx \
  src/components/cycle/CalendarDayCell.tsx \
  src/components/paywall/PremiumBanner.tsx \
  src/components/paywall/PlanCard.tsx

perl -pi -e 's/\bcolors\.iris\b/colors.lilac/g' src/features/home/HomeScreen.tsx

perl -pi -e 's/\bcolors\.aqua\b/colors.auroraBlue/g' src/features/home/HomeScreen.tsx

perl -pi -e 's/\bcolors\.gold\b/colors.ovulationBlue/g' \
  src/features/home/HomeScreen.tsx \
  src/features/insights/InsightsScreen.tsx \
  src/features/calendar/CalendarScreen.tsx

perl -pi -e 's/\bcolors\.peach\b/colors.softPeach/g' \
  src/features/home/HomeScreen.tsx \
  src/features/calendar/CalendarScreen.tsx \
  src/features/ai/AiChatScreen.tsx \
  src/features/log/LogScreen.tsx \
  src/components/cycle/PhaseBadge.tsx \
  src/components/cycle/WeekStrip.tsx

perl -pi -e 's/\bcolors\.background\b/colors.deepMidnight/g' \
  src/app/_layout.tsx \
  src/app/onboarding/_layout.tsx \
  src/components/ui/Screen.tsx \
  src/components/ui/AuroraBackground.tsx
```

Note on the `gold → ovulationBlue` rename: this isn't a naming-only change — `gold` and `ovulationBlue` already held the *identical* hex value (`#8FD2F2`, a blue, in both modes) before this task, i.e. `gold` was a mislabeled alias for the ovulation-blue hue. Every one of its 6 call sites (badges/icons in Home, Calendar, Insights) renders exactly the same color as before; only the reference name is corrected. The *real* gold color now lives at `champagneGold`, unused by any existing screen yet (reserved for the new material system in later tasks).

- [ ] **Step 2: Fix the header-title contrast bug on the same lines you're already touching**

`colors.card` (a near-black tone in dark mode) was used as text color on top of the same near-black `deepPlum`/now-`royalViolet` background — invisible text in dark mode, the app's default. Fix by editing these exact 6 spots to use `colors.moonWhite` instead:

`src/features/settings/SettingsScreen.tsx` — the two header texts:
```
old: <Text style={[typography.displayL, styles.backText, { color: colors.card }]}>‹</Text>
new: <Text style={[typography.displayL, styles.backText, { color: colors.moonWhite }]}>‹</Text>

old: <Text style={[typography.headline, { color: colors.card }]}>{t('settings.title')}</Text>
new: <Text style={[typography.headline, { color: colors.moonWhite }]}>{t('settings.title')}</Text>
```

`src/features/insights/InsightsScreen.tsx` — both occurrences (empty-state branch and populated branch use the identical string, replace both):
```
old: <Text style={[typography.headline, styles.title, { color: colors.card }]}>
new: <Text style={[typography.headline, styles.title, { color: colors.moonWhite }]}>
```

`src/features/calendar/CalendarScreen.tsx` — only the hero title (leave the `todayOrb` circle's two `colors.card` texts untouched — that circle's background is `colors.primary`, not `royalViolet`, and dark text there already has good contrast):
```
old: <Text style={[typography.headline, styles.title, { color: colors.card }]}>
new: <Text style={[typography.headline, styles.title, { color: colors.moonWhite }]}>
```

`src/features/ai/AiChatScreen.tsx` — only the header title (leave the send-button icon's `colors.card` at line ~114 untouched — different, unrelated background):
```
old: <Text style={[typography.headline, { color: colors.card }]}>{t('ai.title')}</Text>
new: <Text style={[typography.headline, { color: colors.moonWhite }]}>{t('ai.title')}</Text>
```

`src/features/log/LogScreen.tsx`:
```
old: <Text style={[typography.headline, styles.title, { color: colors.card }]}>
new: <Text style={[typography.headline, styles.title, { color: colors.moonWhite }]}>
```

`src/features/paywall/PaywallScreen.tsx` — only the hero title (leave the close-button "✕" at `colors.deepPlum`→`royalViolet`, now correctly dark-on-light-glass, and the `MiniStat` value's `colors.card`, sitting on an unrelated translucent-white chip, both untouched):
```
old: <Text style={[typography.displayXl, styles.heroTitle, { color: colors.card }]}>
new: <Text style={[typography.displayXl, styles.heroTitle, { color: colors.moonWhite }]}>
```

- [ ] **Step 3: Update the token unit test's hardcoded expectations**

Read `src/theme/useTheme.test.ts` first (its current content asserts the pre-rename hex values), then replace it with:

```ts
import { describe, expect, it } from 'vitest';
import { applyAccent } from './accents';
import { darkTokens } from './tokens/dark';
import { lightTokens } from './tokens/light';
import { buildTypography } from './typography';

describe('theme resolution', () => {
  it('dark mode + lavender accent resolves textPrimary/deepMidnight correctly', () => {
    const colors = applyAccent(darkTokens, 'lavender');
    expect(colors.deepMidnight).toBe('#120B2E');
    expect(colors.textPrimary).toBe('#F4F1FB');
  });

  it('light mode resolves a light deepMidnight regardless of accent', () => {
    const colors = applyAccent(lightTokens, 'rose');
    expect(colors.deepMidnight).toBe('#F4F1FB');
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

- [ ] **Step 4: Typecheck — this is the completeness gate**

Run: `npx tsc --noEmit`
Expected: no errors. If any remain, they name the exact file/line of a call site this task's renames missed — fix each one using the same old→new mapping from Step 1, then re-run.

- [ ] **Step 5: Run the existing test suite**

Run: `npx vitest run`
Expected: all tests pass, including the updated `useTheme.test.ts` and the untouched `accents.test.ts` (it never referenced a renamed key).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "fix: migrate call sites to renamed color tokens, fix dark-mode header contrast

Also fixes an existing bug where 6 screen headers used near-black
colors.card text on a near-black colors.deepPlum background —
invisible in dark mode, the app's default."
```

---

### Task 4: Add the `bloom` shadow token

**Files:**
- Modify: `src/theme/shadows.ts`
- Modify: `src/theme/useTheme.ts`

**Interfaces:**
- Consumes: `colors.royalViolet` (dark) / `colors.lilac` (light) from Task 2.
- Produces: `shadows.bloom` (a `ViewStyle`), consumed by Task 5 (GlassCard), Task 8 (tab bar), Task 9 (AppButton), Task 11 (ProgressRing), Task 12 (ScoreRing).

- [ ] **Step 1: Add the `bloom` entry to `src/theme/shadows.ts`**

Add this entry inside the `shadows` object (after `glow`, before the closing `} satisfies Record<string, ViewStyle>;`):

```ts
  bloom: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 28,
    elevation: 5,
  },
```

- [ ] **Step 2: Override `bloom`'s shadow color per mode in `useTheme.ts`**

Read `src/theme/useTheme.ts` first, then change:

```ts
old:
    const shadows = { ...shadowShapes, glow: { ...shadowShapes.glow, shadowColor: colors.primary } };

new:
    const shadows = {
      ...shadowShapes,
      glow: { ...shadowShapes.glow, shadowColor: colors.primary },
      bloom: {
        ...shadowShapes.bloom,
        shadowColor: mode === 'dark' ? colors.royalViolet : colors.lilac,
      },
    };
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/theme/shadows.ts src/theme/useTheme.ts
git commit -m "feat: add bloom shadow token for the moonstone material system"
```

---

### Task 5: Add the `moonstone` card variant

**Files:**
- Modify: `src/components/ui/GlassCard.tsx`
- Modify: `src/components/ui/Card.tsx`

**Interfaces:**
- Consumes: `colors.gradients.pearl` (Task 2), `shadows.bloom` (Task 4), `colors.glassStrong`, `colors.moonWhite`.
- Produces: `GlassCard`'s `variant?: 'glass' | 'moonstone'` prop and `Card`'s widened `variant?: 'solid' | 'glass' | 'moonstone'` prop, consumed by later screen phases (not by anything in this plan — no existing call site opts into `'moonstone'` yet, this is purely additive).

- [ ] **Step 1: Rewrite `src/components/ui/GlassCard.tsx`**

```tsx
import { LinearGradient } from 'expo-linear-gradient';
import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { radius, sizes } from '@/theme';
import { useTheme } from '@/theme/useTheme';

interface GlassCardProps {
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  gradient?: boolean;
  variant?: 'glass' | 'moonstone';
}

export function GlassCard({
  children,
  style,
  contentStyle,
  gradient = true,
  variant = 'glass',
}: PropsWithChildren<GlassCardProps>) {
  const { colors, shadows } = useTheme();

  if (variant === 'moonstone') {
    // Bloom shadow needs an unclipped wrapper — the inner view has
    // overflow:hidden for the gradient/corner-radius clip, which would
    // otherwise clip the shadow itself on iOS.
    return (
      <View style={[shadows.bloom, style]}>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.glassStrong, borderColor: `${colors.moonWhite}40` },
          ]}
        >
          {gradient ? (
            <LinearGradient
              pointerEvents="none"
              colors={colors.gradients.pearl}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFill, styles.pearlSheen]}
            />
          ) : null}
          <View style={contentStyle}>{children}</View>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.glass, borderColor: colors.glassBorder, ...shadows.sm },
        style,
      ]}
    >
      {gradient ? (
        <LinearGradient
          pointerEvents="none"
          colors={colors.gradients.glass}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View style={contentStyle}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: sizes.cardPadding,
    overflow: 'hidden',
  },
  pearlSheen: {
    opacity: 0.16,
  },
});
```

- [ ] **Step 2: Widen `Card`'s variant type in `src/components/ui/Card.tsx`**

```tsx
import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { GlassCard } from '@/components/ui/GlassCard';
import { radius, shadows, sizes } from '@/theme';
import { useTheme } from '@/theme/useTheme';

interface Props {
  variant?: 'solid' | 'glass' | 'moonstone';
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, variant = 'solid', style }: PropsWithChildren<Props>) {
  const { colors } = useTheme();
  if (variant === 'glass' || variant === 'moonstone') {
    return (
      <GlassCard variant={variant} style={style}>
        {children}
      </GlassCard>
    );
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

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/GlassCard.tsx src/components/ui/Card.tsx
git commit -m "feat: add moonstone card variant (pearlescent gradient + bloom shadow)"
```

---

### Task 6: Build the `MoonMark` brand component

**Files:**
- Create: `src/components/ui/MoonMark.tsx`

**Interfaces:**
- Consumes: `colors.lilac`, `colors.moonWhite`, `colors.champagneGold`, `colors.pearl` (Task 2); `useThemeStore((s) => s.reduceMotion)`.
- Produces: `MoonMark({ state?: MoonMarkState; size?: number })` and `export type MoonMarkState = 'idle' | 'listening' | 'thinking' | 'celebrating'`, consumed by Task 7 (tab bar, `EmptyState`).

- [ ] **Step 1: Create `src/components/ui/MoonMark.tsx`**

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
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';

import { useThemeStore } from '@/store/themeStore';
import { useTheme } from '@/theme/useTheme';

export type MoonMarkState = 'idle' | 'listening' | 'thinking' | 'celebrating';

interface MoonMarkProps {
  state?: MoonMarkState;
  size?: number;
}

export function MoonMark({ state = 'idle', size = 96 }: MoonMarkProps) {
  const { colors } = useTheme();
  const reduceMotion = useThemeStore((s) => s.reduceMotion);

  const floatY = useSharedValue(0);
  const glowScale = useSharedValue(0.95);
  const glowOpacity = useSharedValue(0.55);
  const tilt = useSharedValue(0);
  const pop = useSharedValue(1);

  useEffect(() => {
    cancelAnimation(floatY);
    cancelAnimation(glowScale);
    cancelAnimation(glowOpacity);
    cancelAnimation(tilt);

    if (reduceMotion) {
      floatY.value = 0;
      tilt.value = 0;
      glowScale.value = 1;
      glowOpacity.value = 0.75;
    } else if (state === 'thinking') {
      tilt.value = withRepeat(
        withSequence(
          withTiming(4, { duration: 1700, easing: Easing.inOut(Easing.ease) }),
          withTiming(-4, { duration: 1700, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      glowOpacity.value = withRepeat(withTiming(0.9, { duration: 2000 }), -1, true);
    } else if (state === 'listening') {
      glowScale.value = withRepeat(withTiming(1.1, { duration: 900 }), -1, true);
      glowOpacity.value = withRepeat(withTiming(0.95, { duration: 900 }), -1, true);
    } else {
      floatY.value = withRepeat(withTiming(-7, { duration: 3000, easing: Easing.inOut(Easing.ease) }), -1, true);
      glowScale.value = withRepeat(withTiming(1.08, { duration: 2200 }), -1, true);
      glowOpacity.value = withRepeat(withTiming(0.88, { duration: 2200 }), -1, true);
    }

    if (state === 'celebrating') {
      pop.value = withSequence(
        withTiming(0.86, { duration: 0 }),
        withTiming(1.1, { duration: reduceMotion ? 120 : 220 }),
        withTiming(1, { duration: reduceMotion ? 90 : 180 })
      );
    }
  }, [state, reduceMotion, floatY, glowScale, glowOpacity, tilt, pop]);

  const markStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value },
      { rotate: `${tilt.value}deg` },
      { scale: pop.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const sparkleOpacity = state === 'celebrating' ? 1 : 0.7;

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
            backgroundColor: colors.lilac,
          },
        ]}
      />
      <Animated.View style={[markStyle, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="moonMarkCrescent" x1="10" y1="10" x2="90" y2="90">
              <Stop offset="0%" stopColor={colors.moonWhite} />
              <Stop offset="55%" stopColor={colors.champagneGold} />
              <Stop offset="100%" stopColor={colors.lilac} />
            </LinearGradient>
            <RadialGradient id="moonMarkPearl" cx="42%" cy="42%" r="65%">
              <Stop offset="0%" stopColor={colors.moonWhite} />
              <Stop offset="55%" stopColor={colors.pearl} />
              <Stop offset="100%" stopColor={colors.lilac} />
            </RadialGradient>
          </Defs>

          <Path
            d="M62.5 12.5A37.5 37.5 0 1 1 38.9 79.2A29.2 29.2 0 0 0 62.5 12.5Z"
            fill="url(#moonMarkCrescent)"
          />
          <Circle cx="46" cy="55" r="17" fill="url(#moonMarkPearl)" />
          <Ellipse cx="40" cy="49" rx="5.5" ry="3.5" fill={colors.moonWhite} opacity={0.85} />

          <Path
            d="M20 24L22.4 29.6L28 32L22.4 34.4L20 40L17.6 34.4L12 32L17.6 29.6Z"
            fill={colors.champagneGold}
            opacity={sparkleOpacity}
          />
          <Circle cx="78" cy="70" r="2.6" fill={colors.moonWhite} opacity={sparkleOpacity} />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
  },
});
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual visual check (this component has no existing test convention to follow — no test file is added, consistent with the rest of `src/components/`)**

Run the app (`npx expo start`), navigate to any screen that will render `MoonMark` once Task 7 wires it in — for now, confirm only that it compiles; visual verification happens in Task 7's step once it's actually mounted. Note: the crescent/pearl SVG coordinates above are a solid starting point, not pixel-locked — if it doesn't read clearly as a crescent-cradling-a-pearl once on screen, adjust the `Path`/`Circle` coordinates by eye against `assets/images/dialuna.png`.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/MoonMark.tsx
git commit -m "feat: add MoonMark brand component (crescent + pearl, no face)"
```

---

### Task 7: Replace `LunaOrb` with `MoonMark` everywhere, delete the mascot folder

**Files:**
- Delete: `src/components/mascot/LunaOrb.tsx`
- Modify: `src/app/(tabs)/_layout.tsx`
- Modify: `src/components/ui/EmptyState.tsx`
- Modify: `src/features/insights/InsightsScreen.tsx`

**Interfaces:**
- Consumes: `MoonMark`, `MoonMarkState` (Task 6).
- Produces: `EmptyState`'s renamed `markState?: MoonMarkState` prop (was `lunaState?: LunaOrbState`), consumed by `InsightsScreen.tsx`'s two `<EmptyState>` call sites (only one is currently passing the prop — verified below) and by later screen phases.

- [ ] **Step 1: Delete the mascot folder**

Run: `rm -rf src/components/mascot`

- [ ] **Step 2: Update the tab bar**

Read `src/app/(tabs)/_layout.tsx` first, then change:

```tsx
old:
import { LunaOrb } from '@/components/mascot/LunaOrb';

new:
import { MoonMark } from '@/components/ui/MoonMark';
```

```tsx
old:
      <Pressable
        onPress={() => router.push('/(tabs)/ai')}
        accessibilityRole="button"
        accessibilityLabel="Chat with Luna"
        style={styles.orbButton}
      >
        <LunaOrb state="idle" size={58} />
      </Pressable>

new:
      <Pressable
        onPress={() => router.push('/(tabs)/ai')}
        accessibilityRole="button"
        accessibilityLabel="Open AI chat"
        style={styles.orbButton}
      >
        <MoonMark state="idle" size={58} />
      </Pressable>
```

- [ ] **Step 3: Update `EmptyState`**

Rewrite `src/components/ui/EmptyState.tsx`:

```tsx
import { StyleSheet, Text, View } from 'react-native';

import { MoonMark, MoonMarkState } from '@/components/ui/MoonMark';
import { spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';

interface Props {
  markState?: MoonMarkState;
  title: string;
  body: string;
}

export function EmptyState({ markState = 'idle', title, body }: Props) {
  const { typography } = useTheme();
  return (
    <View style={styles.container}>
      <MoonMark state={markState} size={88} />
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

- [ ] **Step 4: Update `InsightsScreen`'s call site**

Read `src/features/insights/InsightsScreen.tsx` first, then change the one place passing the old prop name:

```tsx
old:
        <EmptyState
          lunaState="thinking"
          title={t('insights.empty.title')}
          body={t('insights.empty.body')}
        />

new:
        <EmptyState
          markState="thinking"
          title={t('insights.empty.title')}
          body={t('insights.empty.body')}
        />
```

- [ ] **Step 5: Verify no mascot references remain**

Run: `grep -rn "LunaOrb\|lunaState\|components/mascot" src`
Expected: no output.

- [ ] **Step 6: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: replace LunaOrb mascot with MoonMark everywhere

Deletes src/components/mascot entirely. No character, no face —
per the Moon Identity Foundation spec, brand recognition now comes
from the crescent+pearl mark alone."
```

---

### Task 8: Restyle the tab bar as a moonstone surface

**Files:**
- Modify: `src/app/(tabs)/_layout.tsx`

**Interfaces:**
- Consumes: `shadows.bloom` (Task 4), `colors.glassStrong`, `colors.moonWhite`.
- Produces: nothing new — visual restyle only.

- [ ] **Step 1: Restyle the bar container and orb bump**

Read `src/app/(tabs)/_layout.tsx` first (already modified by Task 7), then change:

```tsx
old:
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

new:
function CustomTabBar({ state, descriptors, navigation }: Parameters<NonNullable<Parameters<typeof Tabs>[0]['tabBar']>>[0]) {
  const { colors, shadows } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        shadows.bloom,
        {
          bottom: 26 + Math.max(0, insets.bottom - 26),
          backgroundColor: colors.glassStrong,
          borderColor: `${colors.moonWhite}33`,
        },
      ]}
    >
```

```tsx
old:
  orbButton: {
    marginTop: -28,
  },

new:
  orbButton: {
    marginTop: -34,
  },
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Run the app and visually confirm**

Run: `npx expo start`, open the app, check the tab bar in both dark and light mode (Settings → theme toggle) and with reduce-motion on/off. It should read as a floating glass/moonstone pill with a soft colored glow beneath it, and the center button should show the crescent+pearl `MoonMark`, breathing gently, popped up above the bar.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(tabs)/_layout.tsx"
git commit -m "feat: restyle tab bar as a floating moonstone surface"
```

---

### Task 9: Restyle `AppButton`'s primary variant as polished pearl

**Files:**
- Modify: `src/components/ui/AppButton.tsx`

**Interfaces:**
- Consumes: `colors.gradients.pearl` (Task 2), `colors.royalViolet`, `shadows.glow` (existing).
- Produces: no prop/API changes — same `AppButtonProps` as before.

- [ ] **Step 1: Rewrite `src/components/ui/AppButton.tsx`**

```tsx
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { PropsWithChildren } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

import { radius, sizes, spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';

export type AppButtonVariant = 'primary' | 'secondary' | 'ghost';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: AppButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: PropsWithChildren<AppButtonProps>) {
  const { colors, typography, shadows } = useTheme();
  const inactive = disabled || loading;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const variantStyle: Record<AppButtonVariant, ViewStyle> = {
    primary: {},
    secondary: { backgroundColor: colors.softRose, borderWidth: 1, borderColor: colors.glassBorder },
    ghost: { backgroundColor: 'transparent' },
  };

  const textColor = variant === 'primary' ? colors.royalViolet : colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={handlePress}
      style={[variant === 'primary' && !inactive ? shadows.glow : null, style]}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.base,
            variantStyle[variant],
            inactive && styles.disabled,
            pressed && !inactive && styles.pressed,
          ]}
        >
          {variant === 'primary' ? (
            <LinearGradient
              pointerEvents="none"
              colors={colors.gradients.pearl}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          ) : null}
          {loading ? (
            <ActivityIndicator color={textColor} />
          ) : (
            <Text style={[styles.label, typography.button, { color: textColor }]}>{label}</Text>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: sizes.buttonHeight,
    borderRadius: radius.lg,
    paddingHorizontal: spacing(3),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.48,
    shadowOpacity: 0,
    elevation: 0,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.975 }],
  },
  label: {
    textAlign: 'center',
  },
});
```

Note the added `View` import — this file previously had no plain `View` import since everything lived on the single `Pressable`. Add `View` to the `react-native` import list at the top:

```tsx
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
```

(The full file content in this step's code block above already includes this — just flagging it since it's easy to miss when diffing by eye.)

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Run the app and visually confirm**

Run: `npx expo start`, find any primary `Button`/`AppButton` (e.g. the paywall CTA), confirm it renders a pearl gradient fill with a visible soft glow around it (not clipped), in both dark and light mode, both enabled and disabled states, and that the label text is legible (dark violet on the pale gradient).

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/AppButton.tsx
git commit -m "feat: restyle primary button as polished pearl with visible glow

Restructures to a Pressable(shadow) > View(gradient+content) two-layer
so the glow shadow isn't clipped by the inner view's overflow:hidden."
```

---

### Task 10: Restyle `Chip`'s selected state as a soft glow

**Files:**
- Modify: `src/components/ui/Chip.tsx`

**Interfaces:**
- Consumes: `colors.lilac`, `shadows.glow`.
- Produces: no API changes.

- [ ] **Step 1: Rewrite `src/components/ui/Chip.tsx`**

```tsx
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text } from 'react-native';

import { radius, spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';

interface Props {
  label: string;
  emoji?: string;
  selected: boolean;
  onPress: () => void;
}

export function Chip({ label, emoji, selected, onPress }: Props) {
  const { colors, typography, shadows } = useTheme();
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
        { backgroundColor: colors.card, borderColor: colors.border },
        selected && {
          backgroundColor: `${colors.lilac}33`,
          borderColor: colors.lilac,
          ...shadows.glow,
          shadowColor: colors.lilac,
        },
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          typography.body,
          { color: selected ? colors.primary : colors.textPrimary },
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
    borderRadius: radius.pill,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  labelSelected: {
    fontWeight: '600',
  },
});
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Chip.tsx
git commit -m "feat: restyle selected chip as a soft lilac glow"
```

---

### Task 11: Gradient stroke + glow for `ProgressRing`

**Files:**
- Modify: `src/components/ui/ProgressRing.tsx`

**Interfaces:**
- Consumes: `colors.pearl`, `shadows.glow`.
- Produces: no `ProgressRingProps` changes.

- [ ] **Step 1: Rewrite `src/components/ui/ProgressRing.tsx`**

```tsx
import { useEffect, useId } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

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
  const { colors, shadows } = useTheme();
  const reduceMotion = useThemeStore((s) => s.reduceMotion);
  const resolvedColor = color ?? colors.primary;
  const resolvedTrackColor = trackColor ?? colors.border;
  const gradientId = useId();

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
    <View
      style={[{ width: size, height: size }, shadows.glow, { shadowColor: resolvedColor }]}
      accessibilityRole="progressbar"
    >
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={resolvedColor} />
            <Stop offset="100%" stopColor={colors.pearl} />
          </LinearGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={resolvedTrackColor} strokeWidth={strokeWidth} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#${gradientId})`}
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

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ProgressRing.tsx
git commit -m "feat: gradient stroke + glow for ProgressRing"
```

---

### Task 12: Gradient stroke + glow for `ScoreRing`

**Files:**
- Modify: `src/components/ui/ScoreRing.tsx`

**Interfaces:**
- Consumes: `colors.lavender`, `colors.pearl`, `shadows.glow`.
- Produces: no prop changes.

- [ ] **Step 1: Rewrite `src/components/ui/ScoreRing.tsx`**

```tsx
import { useEffect, useId } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { useTheme } from '@/theme/useTheme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  /** 0-100 */
  score: number;
  size?: number;
  label?: string;
}

export function ScoreRing({ score, size = 140, label }: Props) {
  const { colors, typography, shadows } = useTheme();
  const gradientId = useId();
  const strokeWidth = 12;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(score / 100, { duration: 900 });
  }, [score, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View
      style={[{ width: size, height: size }, shadows.glow, { shadowColor: colors.primary }]}
      accessibilityRole="progressbar"
      accessibilityLabel={label ? `${label}: ${score}/100` : `${score}/100`}
    >
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.lavender} />
            <Stop offset="100%" stopColor={colors.pearl} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.softRose}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={[typography.displayL, styles.score]}>{score}</Text>
        <Text style={typography.caption}>/ 100</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontSize: 36,
    lineHeight: 40,
  },
});
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ScoreRing.tsx
git commit -m "feat: gradient stroke + glow for ScoreRing"
```

---

### Task 13: Add stars and floating particles to `AuroraBackground`

**Files:**
- Modify: `src/components/ui/AuroraBackground.tsx`

**Interfaces:**
- Consumes: `colors.deepMidnight` (renamed in Task 3), `colors.moonWhite`, `colors.champagneGold`.
- Produces: no prop changes — `AuroraBackground` still takes no props.

- [ ] **Step 1: Rewrite `src/components/ui/AuroraBackground.tsx`**

```tsx
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

import { useThemeStore } from '@/store/themeStore';
import { useTheme } from '@/theme/useTheme';

const OPACITY = {
  dark: { animated: [0.62, 0.5, 0.42], still: [0.4, 0.35, 0.3] },
  light: { animated: [0.3, 0.26, 0.2], still: [0.18, 0.16, 0.12] },
} as const;

const STARS = [
  { top: '8%', left: '15%', size: 2.5, delay: 0 },
  { top: '14%', left: '78%', size: 2, delay: 300 },
  { top: '22%', left: '42%', size: 1.5, delay: 900 },
  { top: '30%', left: '90%', size: 2, delay: 1400 },
  { top: '46%', left: '8%', size: 1.5, delay: 500 },
  { top: '58%', left: '65%', size: 2.5, delay: 1100 },
  { top: '68%', left: '25%', size: 1.5, delay: 200 },
  { top: '78%', left: '85%', size: 2, delay: 1700 },
] as const;

const PARTICLES = [
  { top: '20%', left: '30%', size: 5 },
  { top: '50%', left: '75%', size: 4 },
  { top: '72%', left: '18%', size: 6 },
] as const;

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

function Star({
  top,
  left,
  size,
  delay,
  color,
  reduceMotion,
}: {
  top: string;
  left: string;
  size: number;
  delay: number;
  color: string;
  reduceMotion: boolean;
}) {
  const opacity = useSharedValue(reduceMotion ? 0.7 : 0.3);

  if (!reduceMotion) {
    opacity.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(0.9, { duration: 1800 }), withTiming(0.25, { duration: 1800 })), -1, true)
    );
  }

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.star,
        style,
        { top, left, width: size, height: size, borderRadius: size / 2, backgroundColor: color },
      ]}
    />
  );
}

function useParticleDrift(durationMs: number, reduceMotion: boolean) {
  const y = useSharedValue(0);

  if (!reduceMotion) {
    y.value = withRepeat(
      withSequence(
        withTiming(-14, { duration: durationMs, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: durationMs, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }

  return useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
}

function Particle({
  top,
  left,
  size,
  color,
  reduceMotion,
}: {
  top: string;
  left: string;
  size: number;
  color: string;
  reduceMotion: boolean;
}) {
  const style = useParticleDrift(6000 + size * 400, reduceMotion);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.particle,
        style,
        { top, left, width: size, height: size, borderRadius: size / 2, backgroundColor: color },
      ]}
    />
  );
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
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.deepMidnight }]} />
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
      {STARS.map((star, index) => (
        <Star key={index} {...star} color={colors.moonWhite} reduceMotion={reduceMotion} />
      ))}
      {PARTICLES.map((particle, index) => (
        <Particle key={index} {...particle} color={colors.champagneGold} reduceMotion={reduceMotion} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    borderRadius: 999,
  },
  star: {
    position: 'absolute',
  },
  particle: {
    position: 'absolute',
    opacity: 0.35,
  },
});
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Run the app and visually confirm**

Run: `npx expo start`, open any screen, confirm small twinkling stars and slow-drifting gold/white particles are visible over the aurora blobs, in both light and dark mode, and that toggling reduce-motion (Settings) freezes them to a static state instead of stopping the render entirely.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/AuroraBackground.tsx
git commit -m "feat: add star field and floating particles to AuroraBackground"
```

---

### Task 14: Final verification

**Files:** none (verification only)

**Interfaces:** none.

- [ ] **Step 1: Full typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 2: Full test suite**

Run: `npx vitest run`
Expected: all tests pass.

- [ ] **Step 3: Confirm the mascot is fully gone**

Run: `grep -rn "LunaOrb\|lunaState\|components/mascot\|lunaEyeColor\|lunaShadowColor" src`
Expected: no output.

- [ ] **Step 4: Confirm no legacy token names remain**

Run: `grep -rn "colors\.\(deepPlum\|iris\|coral\|berry\|cream\|blush\)\b" src`
Expected: no output.

- [ ] **Step 5: Manual smoke test**

Run: `npx expo start`, then walk through: Home, Calendar, Insights, AI Chat, Premium, Settings, and the onboarding flow, in both dark and light mode. Confirm: no crashes, no invisible text, the tab bar shows the moonstone bar + `MoonMark` center button, buttons/chips/rings show their new glow/gradient treatments, and the background shows stars/particles drifting.

- [ ] **Step 6: No commit — this task only verifies prior commits**

If any check in Steps 1-5 fails, fix it in place (amend the relevant prior task's work via a new small commit, not by reopening history) and re-run the failing check.

---

## Subsequent phases

Not part of this plan: Home, Calendar, AI Chat, Premium/Paywall, Onboarding, Settings, and empty-states screen redesigns, each consuming the tokens/materials/components built here. Each gets its own brainstorm → spec → plan cycle per `docs/superpowers/specs/2026-07-09-moon-identity-foundation-design.md`.
