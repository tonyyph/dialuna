# Foundation Redesign (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the design-system foundation (color/typography/motion/elevation tokens, the Luna mascot component, and two shared primitives) that every later Dialuna redesign phase will build on — with zero changes to any existing screen's business logic or data flow.

**Architecture:** Pure additive/renaming changes to `src/theme/*` token files, one new `src/components/mascot/Luna.tsx` SVG component, and two new `src/components/ui/*` primitives (`ProgressBar`, `ChipGroup`). The one mechanical exception is a project-wide rename of `typography.h1/h2/h3` → `typography.headline/title/subtitle` (find/replace only, no visual behavior change beyond new font metrics).

**Tech Stack:** Expo, TypeScript (strict), `react-native-svg` (already a dependency), `expo-font` + `expo-splash-screen` (already dependencies), new deps: `@expo-google-fonts/fraunces`, `@expo-google-fonts/dm-sans`.

## Global Constraints

- No hardcoded hex/rgba color values outside `src/theme/colors.ts` — every task must sweep its own touched files with `grep -rnE "#[0-9A-Fa-f]{3,8}"` / `grep -rn "rgba("` and confirm zero new hits.
- `npx tsc --noEmit` must be clean after every task.
- `npx expo lint` must be clean after every task.
- This phase does not redesign any screen. If a step would require touching a feature screen's layout/JSX beyond a mechanical token rename, it is out of scope — leave a comment in the task instead of doing it.
- Existing `src/services/*`, `src/store/*`, `src/types/*` are never touched.
- Commit after every task using the repo's existing commit style (`type: summary`, no body needed for mechanical changes).

---

### Task 1: Motion, Sizes tokens + radius.xl + theme barrel

**Files:**
- Create: `src/theme/motion.ts`
- Create: `src/theme/sizes.ts`
- Modify: `src/theme/radius.ts`
- Modify: `src/theme/index.ts`

**Interfaces:**
- Produces: `duration: { instant: 120, fast: 200, base: 300, slow: 500, ambient: 1400 }`, `easing: { standard: Easing.out(Easing.cubic), spring: { damping: 15, stiffness: 120, mass: 1 } }`, `sizes: { iconSm: 16, iconMd: 20, iconLg: 24, touchTarget: 44 }`, `radius.xl = 32` (in addition to existing `sm/md/lg/pill`).
- Consumes: nothing (pure token definitions).

- [ ] **Step 1: Write `src/theme/motion.ts`**

```ts
import { Easing, WithSpringConfig } from 'react-native-reanimated';

export const duration = {
  instant: 120,
  fast: 200,
  base: 300,
  slow: 500,
  ambient: 1400,
} as const;

export const easing = {
  standard: Easing.out(Easing.cubic),
  spring: { damping: 15, stiffness: 120, mass: 1 } satisfies WithSpringConfig,
} as const;
```

- [ ] **Step 2: Write `src/theme/sizes.ts`**

```ts
export const sizes = {
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
  touchTarget: 44,
} as const;
```

- [ ] **Step 3: Add `xl` to `src/theme/radius.ts`**

```ts
export const radius = {
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;
```

- [ ] **Step 4: Update `src/theme/index.ts` barrel**

```ts
export { colors } from './colors';
export { spacing } from './spacing';
export { typography } from './typography';
export { radius } from './radius';
export { shadows } from './shadows';
export { duration, easing } from './motion';
export { sizes } from './sizes';
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/theme/motion.ts src/theme/sizes.ts src/theme/radius.ts src/theme/index.ts
git commit -m "feat: add motion and size tokens, radius.xl"
```

---

### Task 2: Color system v2 additions

**Files:**
- Modify: `src/theme/colors.ts`

**Interfaces:**
- Produces: `colors.surface.{background,card,elevated,overlay}`, `colors.text.{primary,secondary,tertiary,onDark}`, `colors.semantic.{success,warning,danger,info}`, `colors.divider`. All nested under the existing `colors` export — no new top-level import needed anywhere that already does `import { colors } from '@/theme'`.
- Consumes: nothing new — all values alias existing keys or add the 3 genuinely new hex values (`textTertiary #B3A3B8`, `onDark #FFF8F2` which equals existing `cream`, `divider rgba(122, 102, 127, 0.12)`).

- [ ] **Step 1: Rewrite `src/theme/colors.ts`** — introduce an internal `base` palette object, then build the exported `colors` as `base` spread plus the new nested groups (avoids the self-reference problem of nesting `colors.background` inside the same `as const` literal being defined):

```ts
const base = {
  primary: '#FF6B8A',
  softRose: '#FFE4EA',
  lavender: '#B99CFF',
  deepPlum: '#2A1438',
  cream: '#FFF8F2',
  card: '#FFFFFF',
  textPrimary: '#221326',
  textSecondary: '#7A667F',
  mint: '#6ED6B5',
  peach: '#FFB86B',
  error: '#F45B69',

  background: '#FFF8F2',
  border: 'rgba(122, 102, 127, 0.15)',
  overlay: 'rgba(42, 20, 56, 0.5)',
  glass: 'rgba(255, 255, 255, 0.72)',
  divider: 'rgba(122, 102, 127, 0.12)',
} as const;

export const colors = {
  ...base,

  phase: {
    menstrual: '#FF6B8A',
    follicular: '#6ED6B5',
    ovulation: '#FFB86B',
    luteal: '#B99CFF',
  },
  phaseSoft: {
    menstrual: '#FFE4EA',
    follicular: '#E2F7EF',
    ovulation: '#FFF0DE',
    luteal: '#F0E9FF',
  },

  surface: {
    background: base.background,
    card: base.card,
    elevated: base.card,
    overlay: base.overlay,
  },
  text: {
    primary: base.textPrimary,
    secondary: base.textSecondary,
    tertiary: '#B3A3B8',
    onDark: base.cream,
  },
  semantic: {
    success: base.mint,
    warning: base.peach,
    danger: base.error,
    info: base.lavender,
  },
} as const;

export type PhaseColorKey = keyof typeof colors.phase;
```

All existing call sites (`colors.primary`, `colors.textPrimary`, `colors.phase.menstrual`, etc.) keep working unchanged since every flat key from `base` is spread onto `colors` at the top level.

- [ ] **Step 2: No barrel change needed** — `src/theme/index.ts` already exports `colors` as a single name; the new `surface`/`text`/`semantic` groups ride along as nested properties, so this step is a no-op verification only: confirm `src/theme/index.ts` still has `export { colors } from './colors';` (it does, untouched from Task 1).

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `grep -rnE "#[0-9A-Fa-f]{3,8}" src/theme/colors.ts`
Expected: every hit is inside `colors.ts` itself (the only file allowed raw hex) — confirm no other file in `src/` gained a new raw hex value as a side effect of this task (there shouldn't be any, since no other file was touched).

- [ ] **Step 4: Commit**

```bash
git add src/theme/colors.ts
git commit -m "feat: add surface, text, and semantic color token groups"
```

---

### Task 3: Elevation scale v2 + Card glass-variant fix

**Files:**
- Modify: `src/theme/shadows.ts`
- Modify: `src/components/ui/Card.tsx`

**Interfaces:**
- Produces: `shadows.{none,xs,sm,md,lg,glow}`, plus `legacyShadowAliases.{card,soft}` aliasing `sm`/`md` respectively. `Card`'s public API (`variant?: 'solid' | 'glass'`) is unchanged — only the `glass` variant's rendered shadow changes (no longer inherits a drop shadow).
- Consumes: `colors.deepPlum`, `colors.primary` (both already exist, from Task 2's file but unaffected by its edits).
- These two files are edited together in one task because `Card.tsx` is the sole consumer of `shadows.card`/`shadows.soft` (confirmed via `grep -rln "shadows\.card\|shadows\.soft" src` → only `src/components/ui/Card.tsx`) — splitting them would leave `tsc` red at a commit boundary.

- [ ] **Step 1: Rewrite `src/theme/shadows.ts`**

```ts
import { ViewStyle } from 'react-native';
import { colors } from './colors';

export const shadows = {
  none: {},
  xs: {
    shadowColor: colors.deepPlum,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sm: {
    shadowColor: colors.deepPlum,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  md: {
    shadowColor: colors.deepPlum,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.deepPlum,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 28,
    elevation: 6,
  },
  glow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 4,
  },
} satisfies Record<string, ViewStyle>;

// Deprecated aliases — existing call sites use these names; migrate to sm/md
// directly as each screen is touched in a later redesign phase, then delete.
export const legacyShadowAliases = {
  card: shadows.sm,
  soft: shadows.md,
} satisfies Record<string, ViewStyle>;
```

- [ ] **Step 2: Edit `src/components/ui/Card.tsx`**

Note before editing: `style={[styles.base, variant === 'glass' && styles.glass, style]}` merges style objects shallowly by key. Since `styles.base` sets `shadowOpacity`/`elevation` (via the spread of `legacyShadowAliases.card`), `styles.glass` must explicitly set those same keys to `0` to override them — merely omitting them (or spreading an empty `shadows.none`) would leave `styles.base`'s values in effect.

```tsx
import { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { colors, legacyShadowAliases, radius, spacing } from '@/theme';

interface Props {
  variant?: 'solid' | 'glass';
  style?: ViewStyle;
}

export function Card({ children, variant = 'solid', style }: PropsWithChildren<Props>) {
  return (
    <View style={[styles.base, variant === 'glass' && styles.glass, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing(2.5),
    ...legacyShadowAliases.card,
  },
  glass: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
});
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

Manual check: run the app (`npx expo start`, press `i` for iOS simulator or `w` for web) and open the Home screen — the AI coach card (glass variant) should render with no visible drop shadow beneath it, while the cycle-day card above it (solid variant) still has one.

- [ ] **Step 4: Commit**

```bash
git add src/theme/shadows.ts src/components/ui/Card.tsx
git commit -m "feat: expand shadow scale to 6 tiers, fix Card glass double-shadow"
```

---

### Task 4: Typography v2 — Fraunces + DM Sans, scale rename

**Files:**
- Modify: `package.json` (new deps, via `npx expo install`)
- Modify: `src/app/_layout.tsx`
- Modify: `src/theme/typography.ts`
- Modify: 20 files currently referencing `typography.h1`/`h2`/`h3` (mechanical rename — full list in Step 4)

**Interfaces:**
- Produces: `typography.{display,headline,title,subtitle,body,bodySmall,caption,micro,button}` (replaces `display,h1,h2,h3,body,bodySmall,caption,button`).
- Consumes: font family constants `Fraunces_600SemiBold`, `Fraunces_700Bold`, `DMSans_400Regular`, `DMSans_500Medium`, `DMSans_600SemiBold`, `DMSans_700Bold` from the new packages.

- [ ] **Step 1: Install font packages**

Run: `npx expo install @expo-google-fonts/fraunces @expo-google-fonts/dm-sans`
Expected: `package.json` gains both as dependencies; no peer-dependency errors.

- [ ] **Step 2: Rewrite `src/theme/typography.ts`**

```ts
import { TextStyle } from 'react-native';
import { colors } from './colors';

const base: TextStyle = { color: colors.textPrimary };

export const typography = {
  display: {
    ...base,
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.2,
  },
  headline: {
    ...base,
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 26,
    lineHeight: 32,
  },
  title: {
    ...base,
    fontFamily: 'DMSans_700Bold',
    fontSize: 20,
    lineHeight: 26,
  },
  subtitle: {
    ...base,
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 17,
    lineHeight: 22,
  },
  body: {
    ...base,
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 23,
  },
  bodySmall: {
    ...base,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  caption: {
    ...base,
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.1,
    color: colors.textSecondary,
  },
  micro: {
    ...base,
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },
  button: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
    lineHeight: 20,
  },
} satisfies Record<string, TextStyle>;
```

- [ ] **Step 3: Load fonts in `src/app/_layout.tsx`** — add the `useFonts` gate alongside the existing i18n/store hydration gates:

```tsx
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { Fraunces_600SemiBold, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

import { initI18n } from '@/i18n';
import { useLogStore, usePremiumStore, useUserStore } from '@/store';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

function useStoresHydrated(): boolean {
  const [hydrated, setHydrated] = useState(
    () =>
      useUserStore.persist.hasHydrated() &&
      useLogStore.persist.hasHydrated() &&
      usePremiumStore.persist.hasHydrated()
  );

  useEffect(() => {
    if (hydrated) return;
    const check = () => {
      if (
        useUserStore.persist.hasHydrated() &&
        useLogStore.persist.hasHydrated() &&
        usePremiumStore.persist.hasHydrated()
      ) {
        setHydrated(true);
      }
    };
    const subs = [
      useUserStore.persist.onFinishHydration(check),
      useLogStore.persist.onFinishHydration(check),
      usePremiumStore.persist.onFinishHydration(check),
    ];
    check();
    return () => subs.forEach((unsub) => unsub());
  }, [hydrated]);

  return hydrated;
}

export default function RootLayout() {
  const [i18nReady, setI18nReady] = useState(false);
  const [fontsLoaded] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });
  const storesReady = useStoresHydrated();

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
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
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

- [ ] **Step 4: Mechanical rename across all call sites**

Run these three commands from the repo root (macOS `sed`, hence `-i ''`):

```bash
grep -rl 'typography\.h1' src --include="*.tsx" --include="*.ts" | xargs sed -i '' 's/typography\.h1/typography.headline/g'
grep -rl 'typography\.h2' src --include="*.tsx" --include="*.ts" | xargs sed -i '' 's/typography\.h2/typography.title/g'
grep -rl 'typography\.h3' src --include="*.tsx" --include="*.ts" | xargs sed -i '' 's/typography\.h3/typography.subtitle/g'
```

This touches (confirmed by `grep -rn "typography\.h[123]\b" src` before this step): `src/app/onboarding/disclaimer.tsx`, `goals.tsx`, `last-period.tsx`, `notifications.tsx`, `paywall-preview.tsx`, `profile.tsx`; `src/components/cycle/ForecastCard.tsx`; `src/components/paywall/PlanCard.tsx`, `PremiumBanner.tsx`; `src/components/ui/EmptyState.tsx`, `LevelSlider.tsx`, `SectionTitle.tsx`; `src/features/ai/AiChatScreen.tsx`; `src/features/calendar/CalendarScreen.tsx`, `DayDetailSheet.tsx`; `src/features/home/HomeScreen.tsx`; `src/features/insights/InsightsScreen.tsx`; `src/features/log/LogScreen.tsx`; `src/features/onboarding/DatePickerCalendar.tsx`, `Stepper.tsx`; `src/features/paywall/PaywallScreen.tsx`; `src/features/settings/SettingsScreen.tsx`.

- [ ] **Step 5: Verify no old references remain**

Run: `grep -rn "typography\.h[123]\b" src`
Expected: no output.

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx expo lint`
Expected: no errors.

- [ ] **Step 6: Manual visual check**

Run: `npx expo start`, open the app (web or simulator), navigate to Home, Log, and Settings screens.
Expected: headings render in the Fraunces serif face (visibly different letterforms from the DM Sans body text — Fraunces has a distinctive high-contrast serif look), no text is clipped or overlapping, no fallback-to-system-font flash lasting more than a moment on cold start.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add Fraunces + DM Sans typography, rename h1/h2/h3 to headline/title/subtitle"
```

---

### Task 5: Luna mascot component

**Files:**
- Create: `src/components/mascot/Luna.tsx`

**Interfaces:**
- Produces: `LunaExpression = 'happy' | 'thinking' | 'sleeping' | 'celebrating' | 'comforting'`, `Luna({ expression?: LunaExpression; size?: number }): JSX.Element`, default export none (named export `Luna` and type `LunaExpression`).
- Consumes: `colors.{softRose,primary,deepPlum,lavender,peach}` (all already exist in `colors.ts`, no dependency on Task 2's additions).

- [ ] **Step 1: Write `src/components/mascot/Luna.tsx`**

```tsx
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';

import { colors } from '@/theme';

export type LunaExpression = 'happy' | 'thinking' | 'sleeping' | 'celebrating' | 'comforting';

interface LunaProps {
  expression?: LunaExpression;
  size?: number;
}

const CRESCENT_PATH =
  'M85 20 C55 20 35 45 35 70 C35 95 55 120 85 120 C68 112 58 92 58 70 C58 48 68 28 85 20 Z';

function renderBackground(expression: LunaExpression) {
  switch (expression) {
    case 'thinking':
      return (
        <>
          <Circle
            cx={100}
            cy={30}
            r={10}
            fill="none"
            stroke={colors.lavender}
            strokeWidth={1.5}
            strokeDasharray="3 3"
          />
          <Circle cx={112} cy={18} r={3} fill={colors.lavender} />
        </>
      );
    case 'sleeping':
      return (
        <>
          <SvgText x={95} y={35} fontSize={14} fill={colors.lavender}>
            z
          </SvgText>
          <SvgText x={105} y={25} fontSize={10} fill={colors.lavender}>
            z
          </SvgText>
        </>
      );
    case 'celebrating':
      return (
        <>
          <Circle cx={30} cy={30} r={2} fill={colors.peach} />
          <Circle cx={105} cy={25} r={2.5} fill={colors.primary} />
          <Circle cx={110} cy={55} r={1.6} fill={colors.lavender} />
          <Circle cx={25} cy={60} r={1.8} fill={colors.lavender} />
        </>
      );
    case 'comforting':
      return (
        <Path
          d="M70 55 C65 50 55 52 55 60 C55 68 70 78 70 78 C70 78 85 68 85 60 C85 52 75 50 70 55 Z"
          fill={colors.primary}
          opacity={0.4}
        />
      );
    case 'happy':
      return null;
  }
}

function renderFace(expression: LunaExpression) {
  switch (expression) {
    case 'happy':
      return (
        <>
          <Circle cx={60} cy={63} r={3.2} fill={colors.deepPlum} />
          <Circle cx={72} cy={66} r={3.2} fill={colors.deepPlum} />
          <Path
            d="M61 78 Q66 84 72 79"
            stroke={colors.deepPlum}
            strokeWidth={2.2}
            fill="none"
            strokeLinecap="round"
          />
          <Circle cx={55} cy={72} r={4} fill={colors.primary} opacity={0.35} />
          <Circle cx={79} cy={74} r={4} fill={colors.primary} opacity={0.35} />
        </>
      );
    case 'thinking':
      return (
        <>
          <Path
            d="M56 60 Q60 56 64 60"
            stroke={colors.deepPlum}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
          <Circle cx={60} cy={66} r={2.6} fill={colors.deepPlum} />
          <Circle cx={72} cy={68} r={2.6} fill={colors.deepPlum} />
          <Path
            d="M63 80 Q66 82 70 80"
            stroke={colors.deepPlum}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
        </>
      );
    case 'sleeping':
      return (
        <>
          <Path
            d="M56 63 Q60 60 64 63"
            stroke={colors.deepPlum}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M68 66 Q72 63 76 66"
            stroke={colors.deepPlum}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M62 78 Q66 80 70 78"
            stroke={colors.deepPlum}
            strokeWidth={1.6}
            fill="none"
            strokeLinecap="round"
          />
        </>
      );
    case 'celebrating':
      return (
        <>
          <Path d="M57 60 L63 66 M63 60 L57 66" stroke={colors.deepPlum} strokeWidth={2.2} strokeLinecap="round" />
          <Path d="M69 63 L75 69 M75 63 L69 69" stroke={colors.deepPlum} strokeWidth={2.2} strokeLinecap="round" />
          <Path
            d="M58 76 Q66 88 76 76"
            stroke={colors.deepPlum}
            strokeWidth={2.2}
            fill="none"
            strokeLinecap="round"
          />
        </>
      );
    case 'comforting':
      return (
        <>
          <Path
            d="M57 65 Q60 62 63 65"
            stroke={colors.deepPlum}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M69 67 Q72 64 75 67"
            stroke={colors.deepPlum}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M62 80 Q66 83 71 80"
            stroke={colors.deepPlum}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
        </>
      );
  }
}

export function Luna({ expression = 'happy', size = 96 }: LunaProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 140 140" accessibilityLabel={`Luna, ${expression}`}>
      {renderBackground(expression)}
      <Path d={CRESCENT_PATH} fill={colors.softRose} stroke={colors.primary} strokeWidth={2} />
      {renderFace(expression)}
    </Svg>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual visual check**

Temporarily render `<Luna expression="happy" />`, `<Luna expression="thinking" />`, `<Luna expression="sleeping" />`, `<Luna expression="celebrating" />`, and `<Luna expression="comforting" />` side by side on any existing screen (e.g. add them temporarily to the top of `HomeScreen.tsx`, run `npx expo start`, view on web/simulator, then remove the temporary render before committing). Expected: all 5 render the crescent shape with visibly distinct eyes/mouth/particles per expression, matching the approved brainstorm mockups (moon-shaped body, dot/curve eyes, small particle accents for thinking/sleeping/celebrating/comforting).

- [ ] **Step 4: Commit**

```bash
git add src/components/mascot/Luna.tsx
git commit -m "feat: add Luna mascot SVG component with 5 expressions"
```

---

### Task 6: EmptyState uses Luna instead of emoji

**Files:**
- Modify: `src/components/ui/EmptyState.tsx`
- Modify: `src/features/ai/AiChatScreen.tsx:55-59`
- Modify: `src/features/insights/InsightsScreen.tsx:38-42`

**Interfaces:**
- Consumes: `Luna` and `LunaExpression` from `src/components/mascot/Luna.tsx` (Task 5).
- Produces: `EmptyState({ lunaExpression?: LunaExpression; title: string; body: string })` — the `emoji: string` prop is removed (breaking change to this component's props, fixed up at both of its 2 call sites in this same task).

- [ ] **Step 1: Rewrite `src/components/ui/EmptyState.tsx`**

```tsx
import { StyleSheet, Text, View } from 'react-native';

import { Luna, LunaExpression } from '@/components/mascot/Luna';
import { spacing, typography } from '@/theme';

interface Props {
  lunaExpression?: LunaExpression;
  title: string;
  body: string;
}

export function EmptyState({ lunaExpression = 'happy', title, body }: Props) {
  return (
    <View style={styles.container}>
      <Luna expression={lunaExpression} size={88} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
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
    ...typography.title,
    textAlign: 'center',
  },
  body: {
    ...typography.bodySmall,
    textAlign: 'center',
  },
});
```

- [ ] **Step 2: Update `src/features/ai/AiChatScreen.tsx`** — replace the `emoji="✨"` prop (around line 56) with `lunaExpression="happy"`:

```tsx
            <EmptyState
              lunaExpression="happy"
              title={t('ai.emptyTitle')}
              body={t('ai.emptyBody')}
            />
```

- [ ] **Step 3: Update `src/features/insights/InsightsScreen.tsx`** — replace the `emoji="🌱"` prop (around line 39) with `lunaExpression="thinking"` (fits the "still learning your patterns" narrative of that empty state):

```tsx
        <EmptyState
          lunaExpression="thinking"
          title={t('insights.empty.title')}
          body={t('insights.empty.body')}
        />
```

- [ ] **Step 4: Verify**

Run: `grep -rn "emoji=" src/features/ai/AiChatScreen.tsx src/features/insights/InsightsScreen.tsx`
Expected: no output (both `emoji` props fully replaced).

Run: `npx tsc --noEmit`
Expected: no errors (confirms no other file still passes the removed `emoji` prop to `EmptyState`).

- [ ] **Step 5: Manual visual check**

Run: `npx expo start`. Open AI Coach tab with zero messages sent — Luna (happy) should render where the ✨ emoji used to be. Open Insights tab with fewer than 3 logs — Luna (thinking) should render where the 🌱 emoji used to be.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/EmptyState.tsx src/features/ai/AiChatScreen.tsx src/features/insights/InsightsScreen.tsx
git commit -m "feat: replace EmptyState emoji glyphs with Luna mascot"
```

---

### Task 7: ProgressBar shared primitive

**Files:**
- Create: `src/components/ui/ProgressBar.tsx`

**Interfaces:**
- Produces: `ProgressBar({ value: number; orientation?: 'horizontal' | 'vertical'; color?: string; trackColor?: string; thickness?: number; length?: number; radius?: number })`.
- Consumes: `colors.primary`, `colors.border`, `radius.pill` (all existing).
- Not wired into `ForecastCard`, `InsightsScreen`, `WeekStrip`, or `DayDetailSheet.ScoreRow` in this task — those 4 refactors happen when each owning screen is redesigned in a later phase (per the Foundation spec's explicit scope boundary). This task only creates and verifies the standalone component.

- [ ] **Step 1: Write `src/components/ui/ProgressBar.tsx`**

```tsx
import { StyleSheet, View } from 'react-native';

import { colors, radius as radiusTokens } from '@/theme';

interface ProgressBarProps {
  value: number;
  orientation?: 'horizontal' | 'vertical';
  color?: string;
  trackColor?: string;
  thickness?: number;
  length?: number;
  radius?: number;
}

export function ProgressBar({
  value,
  orientation = 'horizontal',
  color = colors.primary,
  trackColor = colors.border,
  thickness = 8,
  length = 64,
  radius = radiusTokens.pill,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const isVertical = orientation === 'vertical';

  return (
    <View
      style={[
        styles.track,
        { borderRadius: radius, backgroundColor: trackColor },
        isVertical
          ? { width: thickness, height: length, justifyContent: 'flex-end' }
          : { height: thickness, width: '100%' },
      ]}
    >
      <View
        style={[
          { borderRadius: radius, backgroundColor: color },
          isVertical ? { height: `${clamped}%`, width: '100%' } : { width: `${clamped}%`, height: '100%' },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
  },
});
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual visual check**

Temporarily render `<ProgressBar value={65} />` and `<ProgressBar value={40} orientation="vertical" length={80} />` on any existing screen, run `npx expo start`, confirm the horizontal bar fills 65% left-to-right and the vertical bar fills 40% bottom-to-top, then remove the temporary render before committing.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/ProgressBar.tsx
git commit -m "feat: add shared ProgressBar primitive"
```

---

### Task 8: ChipGroup shared primitive

**Files:**
- Create: `src/components/ui/ChipGroup.tsx`

**Interfaces:**
- Produces: `ChipGroup({ children: ReactNode; style?: ViewStyle })` — a `View` wrapper applying `flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1)`.
- Consumes: `spacing` (existing).
- Not wired into Log's 4 chip sections, Goals, age-range pickers, or language selection in this task — same deferral rationale as Task 7.

- [ ] **Step 1: Write `src/components/ui/ChipGroup.tsx`**

```tsx
import { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { spacing } from '@/theme';

interface Props {
  style?: ViewStyle;
}

export function ChipGroup({ children, style }: PropsWithChildren<Props>) {
  return <View style={[styles.wrap, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(1),
  },
});
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx expo lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ChipGroup.tsx
git commit -m "feat: add shared ChipGroup layout primitive"
```

---

## Final Verification (run after Task 8)

- [ ] Run: `npx tsc --noEmit` — expected clean.
- [ ] Run: `npx expo lint` — expected clean.
- [ ] Run: `npx vitest run` — expected all existing engine tests still pass (this phase never touched `src/services/*`).
- [ ] Run: `grep -rnE "#[0-9A-Fa-f]{3,8}" src/features src/components` — expected zero hits (matches the project's existing no-hardcoded-color acceptance gate).
- [ ] Run: `npx expo start`, click through Home, Log, Calendar, AI Chat, Insights, Settings, and one onboarding screen — expected: every screen still renders and functions exactly as before, except headings now use Fraunces/DM Sans instead of the system font, the AI-chat and Insights empty states show Luna instead of an emoji, and the Home screen's glass coach card has no drop shadow.
