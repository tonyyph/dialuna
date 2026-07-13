# Prototype Fidelity & Motion Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Raise the app's visual and motion fidelity to `design_handoff_dialuna/Dialuna.dc.html` — softer layering, real glass/blur where the prototype specifies it, spring-driven motion everywhere, and a rebuilt floating tab bar — without touching business logic, navigation structure, or data.

**Architecture:** A small set of shared motion/glass primitives (springs, stagger helper, an animated Pressable, a cross-platform glass surface, an animated radial blob) get built once, then applied screen-by-screen. Every screen task is independent once the foundation lands; the tab bar rebuild is its own isolated task since it replaces the navigator's default tab bar entirely.

**Tech Stack:** Expo 57 / RN 0.86, `react-native-reanimated` 4, `react-native-svg` 15, `expo-glass-effect` (existing, iOS 26+ Liquid Glass), `expo-blur` (new — cross-platform fallback), `@react-navigation/bottom-tabs` (via `expo-router`'s `Tabs`), vitest.

**Spec:** `docs/superpowers/specs/2026-07-13-prototype-fidelity-motion-pass-design.md`
**Design reference:** `design_handoff_dialuna/Dialuna.dc.html`

## Global Constraints

- No business logic, navigation route structure, Zustand stores, or service-layer (`cycleEngine`/`hormoneTwinEngine`/`insightsEngine`/`aiCoachEngine`) changes. Every task in this plan is presentation/motion only.
- `usePremiumStore.isPremium` remains the sole gate for premium content — the Insights lock-UI change (Task 9) changes rendering, not the gate.
- Verification trio after every task: `npm run typecheck && npm run lint && npm run test` — 0 lint errors required (2 pre-existing i18n warnings in `src/i18n/index.ts` are acceptable); all 36 existing vitest tests must stay green (no service/store logic changes means no reason for them to break).
- Styling pattern (already established in this codebase): layout/spacing/radius in `StyleSheet.create`; theme-dependent colors applied inline via `const p = useTheme();` and style arrays.
- No new borders on cards/chips/buttons (existing rule); calendar day-cell indicator rings are the sole established exception.
- Real native blur/glass is reserved for exactly two surfaces per the spec: the floating tab dock and `DayDetailSheet`'s modal backdrop. No other card/sheet gets blur.
- Commits end with `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`.
- No simulator is available in this environment — every task's manual-check step uses `npx expo start --web` for a first-pass visual read; native-only behavior (real blur, haptics, spring feel) needs a human device pass, called out explicitly in Task 14.

---

### Task 1: Motion primitives — springs and stagger helper

**Files:**
- Modify: `src/theme/motion.ts`
- Create: `src/theme/motion.test.ts`
- Modify: `src/theme/index.ts`

**Interfaces:**
- Produces: `springs.soft: WithSpringConfig` (`{ damping: 16, stiffness: 120, mass: 1 }`), `springs.snappy: WithSpringConfig` (`{ damping: 14, stiffness: 180, mass: 1 }`), `staggerDelay(index: number, base?: number): number` — all exported from `@/theme`. `duration` and `easing.standard` are unchanged; `easing.spring` (the old dead constant) is removed.

- [ ] **Step 1: Confirm the old `easing.spring` constant has no consumers before removing it**

Run: `grep -rn "easing\.spring" src`
Expected: no output (confirms it's safe to remove — the whole `motion.ts` file has zero importers today).

- [ ] **Step 2: Write the failing test**

`src/theme/motion.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { springs, staggerDelay } from './motion';

describe('motion', () => {
  it('defines soft and snappy spring presets', () => {
    expect(springs.soft).toEqual({ damping: 16, stiffness: 120, mass: 1 });
    expect(springs.snappy).toEqual({ damping: 14, stiffness: 180, mass: 1 });
  });

  it('staggerDelay scales linearly with index at the default base (40ms)', () => {
    expect(staggerDelay(0)).toBe(0);
    expect(staggerDelay(1)).toBe(40);
    expect(staggerDelay(3)).toBe(120);
  });

  it('staggerDelay respects a custom base', () => {
    expect(staggerDelay(2, 60)).toBe(120);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run src/theme/motion.test.ts`
Expected: FAIL — `springs`/`staggerDelay` are not exported from `./motion`.

- [ ] **Step 4: Implement**

`src/theme/motion.ts` — full new content:

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
} as const;

export const springs = {
  /** Sheets, cards, layout settles — the default "soft" feel. */
  soft: { damping: 16, stiffness: 120, mass: 1 } satisfies WithSpringConfig,
  /** Press feedback, small UI. */
  snappy: { damping: 14, stiffness: 180, mass: 1 } satisfies WithSpringConfig,
} as const;

/** Shared per-index entrance delay so stagger timing agrees across screens. */
export function staggerDelay(index: number, base = 40): number {
  return index * base;
}
```

`src/theme/index.ts` — replace the motion export line:

```ts
export { duration, easing, springs, staggerDelay } from './motion';
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/theme/motion.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Verify and commit**

Run: `npm run typecheck && npm run lint && npm run test` — all pass.

```bash
git add src/theme/motion.ts src/theme/motion.test.ts src/theme/index.ts
git commit -m "feat: add shared spring presets and stagger helper to motion tokens"
```

---

### Task 2: Animated Pressable primitive

**Files:**
- Create: `src/components/ui/Pressable.tsx`
- Modify: `src/components/ui/AppButton.tsx`, `src/components/ui/Chip.tsx`, `src/components/ui/CircleButton.tsx`

**Interfaces:**
- Consumes: `springs.snappy` from Task 1.
- Produces: `Pressable` — drop-in replacement for RN's `Pressable` with the same prop surface (extends `PressableProps`) plus `scaleTo?: number` (default 0.96) and `springConfig?: WithSpringConfig` (default `springs.snappy`). Drives press scale via `withSpring` on `onPressIn`/`onPressOut` instead of a static style swap.

- [ ] **Step 1: Implement the primitive**

`src/components/ui/Pressable.tsx`:

```tsx
import { PropsWithChildren } from 'react';
import {
  Pressable as RNPressable,
  PressableProps as RNPressableProps,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from 'react-native-reanimated';

import { springs } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);

export interface AnimatedPressableProps extends RNPressableProps {
  /** Scale applied on press-in, springs back to 1 on press-out/release. */
  scaleTo?: number;
  springConfig?: WithSpringConfig;
}

/** Drop-in RN Pressable with a real spring-driven press scale (native thread). */
export function Pressable({
  scaleTo = 0.96,
  springConfig = springs.snappy,
  onPressIn,
  onPressOut,
  style,
  ...rest
}: PropsWithChildren<AnimatedPressableProps>) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e) => {
        scale.value = withSpring(scaleTo, springConfig);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, springConfig);
        onPressOut?.(e);
      }}
      style={(state) => [
        animatedStyle,
        typeof style === 'function' ? style(state) : style,
      ]}
    />
  );
}
```

- [ ] **Step 2: Wire into AppButton**

`src/components/ui/AppButton.tsx`:
- Replace the `Pressable` import from `'react-native'` with `import { Pressable } from './Pressable';`.
- In the `style` callback, remove the `pressed && !inactive && styles.pressed` line (the spring now handles the scale) — keep `inactive && styles.disabled`.
- Delete the now-unused `pressed: { transform: [{ scale: 0.96 }], opacity: 0.95 }` style entry.

- [ ] **Step 3: Wire into Chip**

`src/components/ui/Chip.tsx`:
- Replace `import { Pressable, StyleSheet, Text } from 'react-native';` with `import { StyleSheet, Text } from 'react-native';` and add `import { Pressable } from './Pressable';`.
- Remove `pressed && styles.pressed` from the style array.
- Delete the `pressed: { transform: [{ scale: 0.94 }], opacity: 0.92 }` style entry. Pass `scaleTo={0.94}` on the `Pressable` element to keep the same squish amount: `<Pressable ... scaleTo={0.94} style={...}>`.

- [ ] **Step 4: Wire into CircleButton**

`src/components/ui/CircleButton.tsx`:
- Replace `import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';` with `import { StyleProp, StyleSheet, ViewStyle } from 'react-native';` and add `import { Pressable } from './Pressable';`.
- Remove `pressed && styles.pressed` from the style array and pass `scaleTo={0.94}` on the element.
- Delete the `pressed: { transform: [{ scale: 0.94 }], opacity: 0.92 }` style entry.

- [ ] **Step 5: Verify and commit**

Run: `npm run typecheck && npm run lint && npm run test` — all pass. No new unit tests (this is a visual/interaction primitive); the gate is the trio plus the manual check in Task 14.

```bash
git add src/components/ui/Pressable.tsx src/components/ui/AppButton.tsx src/components/ui/Chip.tsx src/components/ui/CircleButton.tsx
git commit -m "feat: add spring-driven Pressable primitive, wire into core buttons/chips"
```

---

### Task 3: Cross-platform glass surface

**Files:**
- Create: `src/components/ui/GlassSurface.tsx`
- Modify: `package.json`, `package-lock.json` (add `expo-blur`)

**Interfaces:**
- Produces: `GlassSurface` — `{ style?: StyleProp<ViewStyle>; tintColor?: string; intensity?: number }` (children via `PropsWithChildren`). Renders `expo-glass-effect`'s `GlassView` on capable iOS (native Liquid Glass), otherwise `expo-blur`'s `BlurView`. This is the ONLY component in the app that renders real blur — reserved for the tab dock (Task 5) and `DayDetailSheet`'s backdrop (Task 8).

- [ ] **Step 1: Add the dependency**

Run: `npx expo install expo-blur`
Expected: `expo-blur` added to `package.json` dependencies; `package-lock.json` updated.

- [ ] **Step 2: Implement**

`src/components/ui/GlassSurface.tsx`:

```tsx
import { isGlassEffectAPIAvailable, GlassView } from 'expo-glass-effect';
import { BlurView } from 'expo-blur';
import { PropsWithChildren } from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

interface GlassSurfaceProps {
  style?: StyleProp<ViewStyle>;
  /** Semi-transparent tint layered over the blur so the warm palette stays visible through it. */
  tintColor?: string;
  /** expo-blur intensity 0-100 — used only on the BlurView fallback path (Android/older iOS/web). */
  intensity?: number;
}

const useNativeGlass = Platform.OS === 'ios' && isGlassEffectAPIAvailable();

/** The only component in the app that renders real native blur/glass. */
export function GlassSurface({
  children,
  style,
  tintColor,
  intensity = 40,
}: PropsWithChildren<GlassSurfaceProps>) {
  const p = useTheme();
  return (
    <View style={[styles.wrap, style]}>
      {useNativeGlass ? (
        <GlassView glassEffectStyle="regular" style={StyleSheet.absoluteFill} />
      ) : (
        <BlurView
          intensity={intensity}
          tint={p.name === 'dark' ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      )}
      {tintColor ? (
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: tintColor }]}
        />
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
});
```

- [ ] **Step 3: Verify and commit**

Run: `npm run typecheck && npm run lint && npm run test` — all pass. No unit test (native rendering can't be verified in vitest); manual verification deferred to Task 14 (and explicitly flagged there as needing a real device for the iOS Liquid Glass path).

```bash
git add package.json package-lock.json src/components/ui/GlassSurface.tsx
git commit -m "feat: add cross-platform GlassSurface (Liquid Glass on capable iOS, BlurView elsewhere)"
```

---

### Task 4: Animated radial blob glow

**Files:**
- Create: `src/components/ui/BlobGlow.tsx`

**Interfaces:**
- Produces: `BlobGlow` — `{ size: number; colors: readonly [string, string]; style?: StyleProp<ViewStyle> }`. `colors[0]` is the inner (opaque-ish) rgba stop, `colors[1]` the fully-transparent outer stop of the same hue. Self-animating continuous drift (`withRepeat`, 9s per leg, autoreverse) — no props needed to trigger it.

- [ ] **Step 1: Implement**

`src/components/ui/BlobGlow.tsx`:

```tsx
import { useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Circle, Defs, RadialGradient, Stop, Svg } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  size: number;
  /** [inner stop, outer stop] — pass the outer stop fully transparent, e.g. ['rgba(182,130,53,0.28)', 'rgba(182,130,53,0)']. */
  colors: readonly [string, string];
  style?: StyleProp<ViewStyle>;
}

/** Soft blurred radial glow with a continuous ~9s drift, matching the prototype's blobFloat keyframe. */
export function BlobGlow({ size, colors, style }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: progress.value * 8 - 4 },
      { translateY: progress.value * 10 },
      { scale: 1 + progress.value * 0.06 },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[{ width: size, height: size }, animatedStyle, style]}
    >
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="blob" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={colors[0]} stopOpacity={1} />
            <Stop offset="100%" stopColor={colors[1]} stopOpacity={1} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#blob)" />
      </Svg>
    </Animated.View>
  );
}
```

- [ ] **Step 2: Verify and commit**

Run: `npm run typecheck && npm run lint && npm run test` — all pass. No unit test (pure visual/animation); manual check deferred to Task 14.

```bash
git add src/components/ui/BlobGlow.tsx
git commit -m "feat: add animated radial BlobGlow component"
```

---

### Task 5: Floating dock tab bar rebuild

**Files:**
- Modify: `src/app/(tabs)/_layout.tsx`

**Interfaces:**
- Consumes: `GlassSurface` (Task 3), `Pressable` (Task 2), `springs.soft` (Task 1).
- Produces: no new exports (route-level file) — the dock's structure/behavior is what later verification (Task 14) checks against the prototype's `dockIndicatorStyle` sliding pill.

- [ ] **Step 1: Rebuild the tab bar as a custom `tabBar` render function**

`src/app/(tabs)/_layout.tsx` — full new content:

```tsx
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { GlassSurface } from '@/components/ui/GlassSurface';
import { Pressable } from '@/components/ui/Pressable';
import { radius, shadows, spacing, springs, typography, useTheme } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

const TAB_ICONS: Record<string, IconName> = {
  home: 'ellipse-outline',
  log: 'add-circle-outline',
  calendar: 'calendar-outline',
  insights: 'stats-chart-outline',
  ai: 'sparkles',
};

function FloatingDock({ state, descriptors, navigation }: BottomTabBarProps) {
  const p = useTheme();
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const widths = useSharedValue<number[]>([]);
  const offsets = useSharedValue<number[]>([]);

  useEffect(() => {
    const w = widths.value[state.index];
    const x = offsets.value[state.index];
    if (w !== undefined && x !== undefined) {
      indicatorWidth.value = withSpring(w, springs.soft);
      indicatorX.value = withSpring(x, springs.soft);
    }
    // widths/offsets are read (not depended on for re-runs) so a layout pass
    // after mount doesn't retrigger this effect on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.index]);

  const indicatorStyle = useAnimatedStyle(() => ({
    width: indicatorWidth.value,
    transform: [{ translateX: indicatorX.value }],
  }));

  return (
    <GlassSurface
      tintColor={
        p.name === 'dark' ? 'rgba(43,39,46,0.55)' : 'rgba(255,251,247,0.55)'
      }
      style={styles.dock}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.indicator,
          {
            backgroundColor:
              p.name === 'dark' ? 'rgba(225,173,102,0.22)' : 'rgba(182,130,53,0.16)',
          },
          indicatorStyle,
        ]}
      />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const icon = TAB_ICONS[route.name] ?? 'ellipse-outline';

        const onLayout = (e: LayoutChangeEvent) => {
          const { width, x } = e.nativeEvent.layout;
          widths.value = [
            ...widths.value.slice(0, index),
            width,
            ...widths.value.slice(index + 1),
          ];
          offsets.value = [
            ...offsets.value.slice(0, index),
            x,
            ...offsets.value.slice(index + 1),
          ];
          if (focused) {
            indicatorWidth.value = width;
            indicatorX.value = x;
          }
        };

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <Pressable
            key={route.key}
            onLayout={onLayout}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={options.title}
            style={styles.item}
          >
            <View style={focused ? [styles.iconWrap, shadows.chip] : styles.iconWrap}>
              <Ionicons
                name={icon}
                size={19}
                color={focused ? p.accentInk : p.textFaint}
              />
            </View>
            {focused ? (
              <Text style={[styles.label, { color: p.accentInk }]} numberOfLines={1}>
                {options.title}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </GlassSurface>
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      tabBar={(props) => <FloatingDock {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" options={{ title: t('tabs.home') }} />
      <Tabs.Screen name="log" options={{ title: t('tabs.log') }} />
      <Tabs.Screen name="calendar" options={{ title: t('tabs.calendar') }} />
      <Tabs.Screen name="insights" options={{ title: t('tabs.insights') }} />
      <Tabs.Screen name="ai" options={{ title: t('tabs.ai') }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  dock: {
    position: 'absolute',
    left: spacing(2.25),
    right: spacing(2.25),
    bottom: spacing(1.75),
    height: 62,
    borderRadius: radius.dock,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing(0.75),
    ...shadows.float,
  },
  indicator: {
    position: 'absolute',
    top: 8,
    height: 46,
    borderRadius: radius.dock - 8,
  },
  item: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.micro,
    fontSize: 9.5,
    letterSpacing: 0.2,
  },
});
```

- [ ] **Step 2: Verify and commit**

Run: `npm run typecheck && npm run lint && npm run test` — all pass. Manual check (`npx expo start --web`): tapping each tab navigates correctly, the gold indicator pill slides between tabs, only the focused tab shows its label, the active icon gets the chip shadow lift.

```bash
git add "src/app/(tabs)/_layout.tsx"
git commit -m "feat: rebuild tab bar with sliding indicator and real glass background"
```

---

### Task 6: Home hero recompose

**Files:**
- Modify: `src/features/home/HomeScreen.tsx`

**Interfaces:**
- Consumes: `BlobGlow` (Task 4), `staggerDelay` (Task 1), existing `ProgressBar`, `WeekStrip`, `useCycleToday()` (unchanged — returns `{ profile, prediction, twin, week, today }`).
- Produces: no new exports; this task only changes composition inside `HomeScreen`.

- [ ] **Step 1: Recompose the hero — blob glow, restructured text hierarchy, floating score badge**

Replace the hero section and the `heroStats`/`snapshotGrid` blocks in `src/features/home/HomeScreen.tsx`. The full new render body (replacing everything from the opening `<Screen edgeToEdge>` through the closing `</View>` before `</Screen>`) is:

```tsx
  return (
    <Screen edgeToEdge>
      <View style={styles.heroWrap}>
        <LinearGradient
          colors={p.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <BlobGlow
            size={200}
            colors={
              p.name === 'dark'
                ? ['rgba(225,173,102,0.22)', 'rgba(225,173,102,0)']
                : ['rgba(182,130,53,0.26)', 'rgba(182,130,53,0)']
            }
            style={styles.heroBlob}
          />

          <View style={styles.heroTop}>
            <View>
              <Text style={[styles.appName, { color: p.textMuted }]}>{t('common.appName')}</Text>
              <Text style={[styles.greeting, { color: p.text }]}>
                {t(greetingKey(), { name: profile.nickname })}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('settings.title')}
              onPress={() => router.push('/settings')}
              hitSlop={8}
              style={[styles.settingsBtn, { backgroundColor: p.surfaceStrong }]}
            >
              <Ionicons name="settings-outline" size={22} color={p.text} />
            </Pressable>
          </View>

          <View style={styles.heroMain}>
            <View style={styles.heroCopy}>
              <Text style={[styles.heroKicker, { color: p.accentInk }]}>
                {t('common.cycleDay', { day: prediction.cycleDay })} ·{' '}
                {t(prediction.isPmsWindow ? 'phases.pms' : `phases.${prediction.phase}`)}
              </Text>
              <Text style={[styles.heroTitle, { color: p.text }]}>
                {t(prediction.isPmsWindow ? 'phases.pms' : `phases.${prediction.phase}`)}
              </Text>
              <PhaseBadge phase={prediction.phase} pms={prediction.isPmsWindow} />
              <Text style={[styles.heroBody, { color: p.textMuted }]}>{t(twin.coachMessageKey)}</Text>
              <Text style={[styles.heroCaption, { color: p.textMuted }]}>{periodText}</Text>
            </View>
            <View style={[styles.lunaFrame, { backgroundColor: p.surface }]}>
              <Luna expression={prediction.isPmsWindow ? 'comforting' : 'happy'} size={112} />
            </View>
          </View>
        </LinearGradient>

        <View style={[styles.scoreBadge, { backgroundColor: p.surfaceSolid }, shadows.hero]}>
          <Text style={[styles.scoreBadgeKicker, { color: p.textFaint }]}>
            {t('home.twinScore')}
          </Text>
          <Text style={[styles.scoreBadgeValue, { color: p.accentInk }]}>
            {twin.hormoneTwinScore}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(staggerDelay(0)).duration(360)}>
          <View style={styles.signalBars}>
            <SignalBar label={t('home.forecast.energy')} value={twin.energyScore} color={p.accent400} />
            <SignalBar label={t('home.forecast.mood')} value={twin.moodScore} color={p.accent} />
            <SignalBar label={t('home.forecast.focus')} value={twin.focusScore} color={p.accentInk} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(staggerDelay(1)).duration(360)}>
          <Text style={[styles.forecastKicker, { color: p.textFaint }]}>
            {t('home.weekForecast')}
          </Text>
          <WeekStrip days={week} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(staggerDelay(2)).duration(360)}>
          <Card variant="glass" style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <View>
                <Text style={[styles.sectionKicker, { color: p.accent }]}>{t('home.insightTitle')}</Text>
                <Text style={styles.insightTitle}>{t('home.twinScoreCaption')}</Text>
              </View>
              <View style={[styles.sparkBadge, { backgroundColor: p.accent100 }]}>
                <Ionicons name="sparkles" size={18} color={p.accent} />
              </View>
            </View>
            <Text style={styles.insightText}>{t(twin.coachMessageKey)}</Text>
            <Button
              label={t('home.askAi')}
              variant="secondary"
              onPress={() => router.push('/(tabs)/ai')}
            />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(staggerDelay(3)).duration(360)}>
          <View style={styles.quickGrid}>
            <QuickAction
              icon="add-circle"
              label={t('home.logNow')}
              tone={p.accent}
              onPress={() => router.push('/(tabs)/log')}
            />
            <QuickAction
              icon="chatbubble-ellipses"
              label={t('home.askAi')}
              tone={p.accentInk}
              onPress={() => router.push('/(tabs)/ai')}
            />
            <QuickAction
              icon="calendar"
              label={t('tabs.calendar')}
              tone={p.accentInk}
              onPress={() => router.push('/(tabs)/calendar')}
            />
            <QuickAction
              icon="analytics"
              label={t('tabs.insights')}
              tone={p.accent400}
              onPress={() => router.push('/(tabs)/insights')}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(staggerDelay(4)).duration(360)}>
          <Card style={styles.timelineCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('home.upcoming')}</Text>
              <Text style={[styles.sectionMeta, { color: p.accent }]}>{periodText}</Text>
            </View>
            <View style={styles.timelineRows}>
              <TimelineRow
                color={p.accent}
                label={t('calendar.legend.period')}
                value={prediction.nextPeriodStart}
              />
              <TimelineRow
                color={p.accent400}
                label={t('phases.pms')}
                value={`${prediction.pmsWindowStart} - ${prediction.pmsWindowEnd}`}
              />
              <TimelineRow
                color={p.accent400}
                label={t('calendar.legend.ovulation')}
                value={prediction.ovulationEstimate}
              />
            </View>
          </Card>
        </Animated.View>

        {isPremium ? (
          <Animated.View entering={FadeInDown.delay(staggerDelay(5)).duration(360)}>
            <Card variant="glass" style={styles.planCard}>
              <Text style={styles.sectionTitle}>{t('home.plan.title')}</Text>
              <PlanGroup title={t('home.plan.food')} emoji="🥗" tipKeys={twin.foodTipKeys} />
              <PlanGroup title={t('home.plan.workout')} emoji="🤸‍♀️" tipKeys={twin.workoutTipKeys} />
              <PlanGroup title={t('home.plan.selfcare')} emoji="🫧" tipKeys={twin.selfCareTipKeys} />
            </Card>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(staggerDelay(5)).duration(360)}>
            <PremiumBanner onPress={() => router.push('/paywall')} />
          </Animated.View>
        )}
      </View>
    </Screen>
  );
}

function SignalBar({ label, value, color }: { label: string; value: number; color: string }) {
  const p = useTheme();
  return (
    <View style={styles.signalRow}>
      <Text style={[styles.signalLabel, { color: p.textMuted }]}>{label}</Text>
      <ProgressBar value={value} color={color} trackColor={p.track} thickness={5} />
    </View>
  );
}
```

Delete the old `HeroStat` function entirely (no longer used) and the old `MetricTile` function entirely (no longer used) — both are fully replaced by `SignalBar` and the floating score badge.

- [ ] **Step 2: Update imports and add the new i18n key**

At the top of `src/features/home/HomeScreen.tsx`, add:

```ts
import { BlobGlow } from '@/components/ui/BlobGlow';
```

and add `staggerDelay` to the existing theme import line (`shadows` is already imported today):

```ts
import { radius, shadows, spacing, staggerDelay, typography, useTheme } from '@/theme';
```

In `src/i18n/en.json`, inside the `home` object, add: `"upcoming": "Upcoming"`.
In `src/i18n/vi.json`, inside the `home` object, add: `"upcoming": "Sắp tới"`.

- [ ] **Step 3: Replace the relevant styles**

In the `styles` `StyleSheet.create` object:
- Remove: `heroTop` stays, but delete `heroStats`, `heroStat`, `heroStatValue`, `heroStatLabel`, `featuredWrap`, `snapshotGrid`, `metricTile`, `metricIcon`, `metricValue`, `metricLabel` (all superseded).
- Change `hero` to keep its existing radius/padding/shadow but drop `overflow: 'hidden'` is NOT removed — keep it (needed so the LinearGradient itself clips its blob/content to the asymmetric radius); the badge sits OUTSIDE this view as a sibling, so it is unaffected by `hero`'s own clipping.
- Add these new style entries:

```ts
  heroWrap: {
    overflow: 'visible',
  },
  heroBlob: {
    position: 'absolute',
    top: -20,
    left: -20,
  },
  heroCaption: {
    ...typography.caption,
    marginTop: spacing(0.5),
  },
  scoreBadge: {
    position: 'absolute',
    right: spacing(2.5),
    bottom: -34,
    width: 92,
    height: 92,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreBadgeKicker: {
    ...typography.micro,
    fontSize: 9,
  },
  scoreBadgeValue: {
    ...typography.score,
  },
  signalBars: {
    gap: spacing(1),
    marginBottom: spacing(2.5),
  },
  signalRow: {
    gap: spacing(0.5),
  },
  signalLabel: {
    ...typography.caption,
  },
  forecastKicker: {
    ...typography.kicker,
    marginBottom: spacing(1),
  },
```

- `content` needs extra top padding so the floating badge has room to sit clear of the signal bars below it:

```ts
  content: {
    paddingHorizontal: spacing(2.5),
    paddingTop: spacing(4.5),
    gap: spacing(2.5),
  },
```

Every other existing style entry (`heroTop`, `appName`, `greeting`, `settingsBtn`, `heroMain`, `heroCopy`, `heroKicker`, `heroTitle`, `heroBody`, `lunaFrame`, `insightCard`, `insightHeader`, `sectionKicker`, `insightTitle`, `sparkBadge`, `insightText`, `sectionHeader`, `sectionTitle`, `sectionMeta`, `quickGrid`, `quickAction`, `quickActionPressed`, `quickIcon`, `quickLabel`, `timelineCard`, `timelineRows`, `timelineRow`, `timelineDot`, `timelineLabel`, `timelineValue`, `planCard`, `planGroup`, `planGroupTitle`, `planTip`) stays unchanged.

- [ ] **Step 4: Verify and commit**

Run: `npm run typecheck && npm run lint && npm run test` — all pass. Validate both i18n JSON files still parse: `node -e "JSON.parse(require('fs').readFileSync('src/i18n/en.json')); JSON.parse(require('fs').readFileSync('src/i18n/vi.json')); console.log('ok')"`. Manual check (`npx expo start --web`): hero shows the drifting blob glow, the score badge visibly overlaps the hero's bottom-right corner, signal bars + forecast strip render directly below with no visual collision with the badge.

```bash
git add src/features/home/HomeScreen.tsx src/i18n/en.json src/i18n/vi.json
git commit -m "feat: recompose Home hero — floating score badge, blob glow, inline signal bars"
```

---

### Task 7: Log screen motion polish

**Files:**
- Modify: `src/features/log/LogScreen.tsx`

**Interfaces:**
- Consumes: `staggerDelay` (Task 1).

- [ ] **Step 1: Add staggered entrance to each card and a "Saved" pill**

In `src/features/log/LogScreen.tsx`:
- Add `const [savedFlash, setSavedFlash] = useState(false);` alongside the existing `useState` calls.
- In `onSave`, after `Haptics.notificationAsync(...)`, add:

```ts
    setSavedFlash(true);
```

- Change the theme import to add `staggerDelay`: `import { radius, spacing, staggerDelay, typography, useTheme } from '@/theme';`.
- Import `Animated` and `FadeInDown` are already imported — no change needed there.
- Wrap the hero `View` and each `Card` in `Animated.View entering={FadeInDown.delay(staggerDelay(N)).duration(340)}` (N = 0 for the hero, 1 for the flow card, 2 for the mood/symptoms card, 3 for the sliders card, 4 for the workout/notes card). Example for the hero:

```tsx
      <Animated.View entering={FadeInDown.delay(staggerDelay(0)).duration(340)}>
        <View style={[styles.hero, { backgroundColor: '#2c2620' }]}>
          <Text style={[styles.kicker, { color: p.accent400 }]}>{t('common.today')}</Text>
          <Text style={[styles.title, { color: '#f4ede1' }]}>{t('log.title')}</Text>
          <Text style={styles.subtitle}>{t('log.subtitle')}</Text>
          {savedFlash ? (
            <View style={[styles.savedPill, { backgroundColor: p.accent100 }]}>
              <Text style={[styles.savedPillText, { color: p.accent800 }]}>
                {t('log.saved')}
              </Text>
            </View>
          ) : null}
        </View>
      </Animated.View>
```

Apply the same `Animated.View entering={FadeInDown.delay(staggerDelay(N)).duration(340)}` wrapper around the flow `Card` (N=1), the mood/symptoms `Card` (N=2), the sliders `Card` (N=3), and the workout/notes `Card` (N=4) — each one wraps exactly the existing `<Card ...>...</Card>` block with no other changes to its contents.

- [ ] **Step 2: Add the `log.saved` i18n key**

In `src/i18n/en.json`, inside the `log` object, add: `"saved": "Saved"`.
In `src/i18n/vi.json`, inside the `log` object, add: `"saved": "Đã lưu"`.

- [ ] **Step 3: Add the saved-pill style**

In `LogScreen.tsx`'s `styles`, add:

```ts
  savedPill: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(0.5),
    marginTop: spacing(1.5),
  },
  savedPillText: {
    ...typography.caption,
    fontWeight: '700',
  },
```

- [ ] **Step 4: Verify and commit**

Run: `npm run typecheck && npm run lint && npm run test` — all pass (validate both i18n JSON files still parse: `node -e "JSON.parse(require('fs').readFileSync('src/i18n/en.json')); JSON.parse(require('fs').readFileSync('src/i18n/vi.json')); console.log('ok')"`). Manual check: cards stagger in on screen entry, saving shows the "Saved" pill next to the title.

```bash
git add src/features/log/LogScreen.tsx src/i18n/en.json src/i18n/vi.json
git commit -m "feat: stagger Log screen cards and add a Saved confirmation pill"
```

---

### Task 8: Calendar area — motion, unwrapped grid, glass backdrop

**Files:**
- Modify: `src/features/calendar/CalendarScreen.tsx`, `src/features/calendar/DayDetailSheet.tsx`, `src/components/cycle/CalendarDayCell.tsx`

**Interfaces:**
- Consumes: `staggerDelay` (Task 1), `GlassSurface` (Task 3), `Pressable` (Task 2).

- [ ] **Step 1: Unwrap the month grid from its Card and add screen-level stagger**

In `src/features/calendar/CalendarScreen.tsx`:
- Add `Animated, { FadeInDown }` to the `react-native-reanimated` import (new import line: `import Animated, { FadeInDown } from 'react-native-reanimated';`).
- Change the theme import to add `staggerDelay`: `import { radius, spacing, staggerDelay, typography, useTheme } from '@/theme';`.
- Wrap the hero `View`, the timeline `Card`, the month-grid section, and the legend `Card` each in their own `Animated.View entering={FadeInDown.delay(staggerDelay(N)).duration(340)}` (hero=0, timeline=1, grid=2, legend=3).
- Replace the grid's wrapping `<Card style={{ backgroundColor: p.surfaceSolid }}>...</Card>` with a plain `View` so the grid floats directly on the background (matching the prototype, which doesn't box the grid) — keep the month-nav header row's own look by giving IT a card-like fill directly:

```tsx
        <Animated.View entering={FadeInDown.delay(staggerDelay(2)).duration(340)}>
          <View style={[styles.monthHeader, { backgroundColor: p.surface }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('common.back')}
              onPress={() => setMonth((m) => addMonths(m, -1))}
              style={styles.navBtn}
            >
              <Text style={[styles.navText, { color: p.accent }]}>‹</Text>
            </Pressable>
            <Text style={styles.monthLabel}>{format(month, 'MMMM yyyy')}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('common.next')}
              onPress={() => setMonth((m) => addMonths(m, 1))}
              style={styles.navBtn}
            >
              <Text style={[styles.navText, { color: p.accent }]}>›</Text>
            </Pressable>
          </View>

          <View style={styles.grid}>
            {days.map((day) => {
              const iso = toISODate(day);
              const info = getDayInfo(iso, profile, lutealLength);
              const log = logs[iso];
              const isPeriodLogged =
                (log && log.flow !== 'none') ||
                (iso >= profile.lastPeriodStartDate &&
                  profile.lastPeriodEndDate !== null &&
                  iso <= profile.lastPeriodEndDate);
              return (
                <CalendarDayCell
                  key={iso}
                  date={iso}
                  state={{
                    isPeriodLogged: Boolean(isPeriodLogged),
                    isPredictedPeriod: info.isPredictedPeriod && !isPeriodLogged,
                    isFertile: info.isFertile,
                    isPms: info.isPms,
                    isOvulation: info.isOvulation,
                    isToday: iso === today,
                    isSelected: iso === selectedDate,
                    hasLog: Boolean(log),
                    isHighEnergy:
                      info.phase === 'follicular' || info.phase === 'ovulation',
                    inMonth: isSameMonth(day, month),
                  }}
                  onPress={setSelectedDate}
                />
              );
            })}
          </View>
        </Animated.View>
```

Add a `monthHeader` background/padding/radius so it still reads as a soft pill bar now that it's no longer inside a `Card`:

```ts
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing(1),
    borderRadius: radius.lg,
    paddingHorizontal: spacing(1),
    paddingVertical: spacing(0.5),
  },
```

(This replaces the old `monthHeader` style entry, which had no background/padding since it previously relied on the parent `Card`.)

- [ ] **Step 2: Wrap the remaining top-level sections in stagger**

Wrap the hero `View` in `Animated.View entering={FadeInDown.delay(staggerDelay(0)).duration(340)}`, the timeline `Card` in `Animated.View entering={FadeInDown.delay(staggerDelay(1)).duration(340)}`, and the legend `Card` in `Animated.View entering={FadeInDown.delay(staggerDelay(3)).duration(340)}` — each wraps the existing block with no content changes.

- [ ] **Step 3: Give `DayDetailSheet`'s modal backdrop real glass**

In `src/features/calendar/DayDetailSheet.tsx`:
- Add `import { GlassSurface } from '@/components/ui/GlassSurface';`.
- Replace the backdrop `Pressable` with a `Pressable` wrapping a `GlassSurface`:

```tsx
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityLabel={t('common.close')}
      >
        <GlassSurface
          tintColor={p.overlay}
          intensity={20}
          style={StyleSheet.absoluteFill}
        />
      </Pressable>
```

(Remove the old `{ backgroundColor: p.overlay }` inline style from the `Pressable` itself — the tint now comes from `GlassSurface`'s `tintColor`.)

- [ ] **Step 4: Add spring press feedback to day cells**

In `src/components/cycle/CalendarDayCell.tsx`:
- Replace `import { Pressable, StyleSheet, Text, View } from 'react-native';` with `import { StyleSheet, Text, View } from 'react-native';` and add `import { Pressable } from '@/components/ui/Pressable';`.
- No other changes — the `Pressable` element's existing props (`onPress`, `style={styles.wrap}`) are unchanged; the new primitive adds the spring scale automatically.

- [ ] **Step 5: Verify and commit**

Run: `npm run typecheck && npm run lint && npm run test` — all pass. Manual check: screen sections stagger in, the month grid floats directly on the background (no boxed card around it), the day-detail sheet's backdrop shows blur behind it, day cells give a light spring squish on tap.

```bash
git add src/features/calendar/CalendarScreen.tsx src/features/calendar/DayDetailSheet.tsx src/components/cycle/CalendarDayCell.tsx
git commit -m "feat: stagger Calendar entrance, unwrap month grid, add glass sheet backdrop"
```

---

### Task 9: Insights — varied radii, per-card lock, stagger

**Files:**
- Modify: `src/features/insights/InsightsScreen.tsx`

**Interfaces:**
- Consumes: `GlassSurface` (Task 3), `staggerDelay` (Task 1), `Pressable` (Task 2). `usePremiumStore.isPremium` remains the only gate.

- [ ] **Step 1: Add the `LockedCard` wrapper**

In `src/features/insights/InsightsScreen.tsx`:
- Change `import { Pressable, StyleSheet, Text, View } from 'react-native';` to `import { StyleSheet, Text, View } from 'react-native';` — the plain RN `Pressable` was only used by the old locked-teaser block being replaced in Step 2; the new `LockedCard`'s unlock button uses the animated `Pressable` primitive instead, so keeping the old import would leave it unused (a lint error).
- Add these imports:

```ts
import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GlassSurface } from '@/components/ui/GlassSurface';
import { Pressable } from '@/components/ui/Pressable';
```

and change the theme import to add `staggerDelay`: `import { radius, spacing, staggerDelay, typography, useTheme } from '@/theme';`.

Add this helper component near the bottom of the file, alongside `InsightStat`:

```tsx
function LockedCard({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const p = useTheme();
  return (
    <View style={styles.lockedWrap}>
      {children}
      <GlassSurface
        intensity={30}
        tintColor={p.name === 'dark' ? 'rgba(28,26,31,0.55)' : 'rgba(251,243,236,0.55)'}
        style={[StyleSheet.absoluteFillObject, { borderRadius: radius.xl - 2 }]}
      >
        <View style={styles.lockOverlayContent}>
          <Ionicons name="lock-closed" size={20} color={p.text} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('insights.locked.cta')}
            onPress={() => router.push('/paywall')}
            style={[styles.unlockPill, { backgroundColor: p.primaryBtn }]}
          >
            <Text style={[styles.unlockPillText, { color: p.onPrimaryBtn }]}>
              {t('insights.locked.cta')}
            </Text>
          </Pressable>
        </View>
      </GlassSurface>
    </View>
  );
}

function withLock(node: ReactNode, locked: boolean) {
  return locked ? <LockedCard>{node}</LockedCard> : node;
}
```

- [ ] **Step 2: Replace the `isPremium ? (...) : (...)` block**

Replace the whole `{isPremium ? (<>...premium content...</>) : (<Pressable>...locked teaser...</Pressable>)}` block in the component body with:

```tsx
      <Animated.View entering={FadeInDown.delay(staggerDelay(1)).duration(340)}>
        <SectionTitle title={t('insights.energyCard.title')} />
        {withLock(
          <Card style={[styles.rows, styles.radiusB]}>
            {PHASES.map((phase) => {
              const value = insights.avgEnergyByPhase[phase];
              return (
                <View key={phase} style={styles.barRow}>
                  <Text style={styles.barLabel}>{t(`phases.${phase}`)}</Text>
                  <View style={[styles.barTrack, { backgroundColor: p.accent100 }]}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${((value ?? 0) / 10) * 100}%`,
                          backgroundColor: p.phase[phase],
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barValue}>{value ?? '–'}</Text>
                </View>
              );
            })}
            <Text style={styles.caption}>{t('insights.energyCard.caption')}</Text>
          </Card>,
          !isPremium
        )}
      </Animated.View>

      {insights.pmsSleepAvg !== null && insights.otherSleepAvg !== null && (
        <Animated.View entering={FadeInDown.delay(staggerDelay(2)).duration(340)}>
          <SectionTitle title={t('insights.sleepCard.title')} />
          {withLock(
            <Card>
              <Text style={styles.body}>
                {t('insights.sleepCard.text', {
                  pmsSleep: insights.pmsSleepAvg,
                  otherSleep: insights.otherSleepAvg,
                })}
              </Text>
            </Card>,
            !isPremium
          )}
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.delay(staggerDelay(3)).duration(340)}>
        <SectionTitle title={t('insights.pmsCard.title')} />
        {withLock(
          <Card>
            <Text style={styles.body}>
              {t('insights.pmsCard.text', {
                start: format(parseISO(insights.nextPmsStart), 'MMM d'),
                end: format(parseISO(insights.nextPmsEnd), 'MMM d'),
              })}
            </Text>
          </Card>,
          !isPremium
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(staggerDelay(4)).duration(340)}>
        <SectionTitle title={t('insights.symptomsCard.title')} />
        {withLock(
          <Card variant="glass" style={[styles.symptomWrap, styles.radiusC]}>
            {insights.topSymptoms.length === 0 ? (
              <Text style={styles.muted}>—</Text>
            ) : (
              insights.topSymptoms.map(({ symptom, count }) => (
                <Chip
                  key={symptom}
                  label={`${t(`symptoms.${symptom}`)} · ${t('insights.symptomsCard.timesLogged', { count })}`}
                  selected={false}
                  onPress={() => {}}
                />
              ))
            )}
          </Card>,
          !isPremium
        )}
      </Animated.View>

      <DisclaimerBox text={t('disclaimer.short')} />
```

Also wrap the existing top `storyCard` (`Card variant="glass" style={styles.storyCard}`) in `Animated.View entering={FadeInDown.delay(staggerDelay(0)).duration(340)}` and add `styles.radiusA` to its style array: `style={[styles.storyCard, styles.radiusA]}`.

- [ ] **Step 3: Add the varied-radius and lock-overlay styles**

In the `styles` `StyleSheet.create` object, add:

```ts
  radiusA: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderBottomRightRadius: 26,
    borderBottomLeftRadius: 10,
  },
  radiusB: {
    borderRadius: 14,
  },
  radiusC: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 26,
    borderBottomLeftRadius: 26,
  },
  lockedWrap: {
    position: 'relative',
  },
  lockOverlayContent: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(1),
  },
  unlockPill: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
  },
  unlockPillText: {
    ...typography.button,
    fontSize: 13,
  },
```

- [ ] **Step 4: Verify and commit**

Run: `npm run typecheck && npm run lint && npm run test` — all pass. Manual check: as a free user, the energy/sleep/pms/symptoms cards render in place with real content visible-but-blurred and their own unlock button; tapping any unlock button routes to `/paywall`; as premium, the same cards render plain; the three re-radiused cards (summary, energy, symptoms) read visually distinct from the default-radius cards.

```bash
git add src/features/insights/InsightsScreen.tsx
git commit -m "feat: restore per-card blur+unlock and varied card radii on Insights"
```

---

### Task 10: AI Coach — screen fade and TypingDots retune

**Files:**
- Modify: `src/features/ai/AiChatScreen.tsx`, `src/components/ai/TypingDots.tsx`

- [ ] **Step 1: Wrap the Coach screen root in a fade entrance**

In `src/features/ai/AiChatScreen.tsx`:
- Add `import Animated, { FadeIn } from 'react-native-reanimated';`.
- Wrap the `<Screen scroll={false} edgeToEdge keyboardAvoiding>...</Screen>` return value's direct children in a top-level `Animated.View entering={FadeIn.duration(280)} style={styles.flexFill}` — concretely, change the return statement's outer structure so the `Screen`'s children are:

```tsx
    <Screen scroll={false} edgeToEdge keyboardAvoiding>
      <Animated.View entering={FadeIn.duration(280)} style={styles.flexFill}>
        <View style={styles.header}>
          ...unchanged...
        </View>
        ...rest of the existing JSX unchanged, down through the closing disclaimer View...
      </Animated.View>
    </Screen>
```

Add to `styles`: `flexFill: { flex: 1 },`.

- [ ] **Step 2: Retune TypingDots' bounce shape**

In `src/components/ai/TypingDots.tsx`, replace the `useEffect` body inside `Dot` with an asymmetric sequence (fast rise, brief hold near peak, fast fall) matching the prototype's 1.2s cycle instead of the current symmetric 400ms/700ms `inOut(quad)`:

```ts
  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 260, easing: Easing.out(Easing.quad) }),
          withTiming(1, { duration: 220, easing: Easing.linear }),
          withTiming(0.25, { duration: 320, easing: Easing.in(Easing.quad) }),
          withTiming(0.25, { duration: 400, easing: Easing.linear })
        ),
        -1
      )
    );
  }, [delay, opacity]);
```

(Total cycle: 260+220+320+400 = 1200ms, matching the prototype's `dot 1.2s infinite` with a snap-up/hold/snap-down/hold shape rather than a symmetric ease in/out.)

- [ ] **Step 3: Verify and commit**

Run: `npm run typecheck && npm run lint && npm run test` — all pass. Manual check: opening the Coach tab fades in as a whole rather than appearing instantly; the typing indicator's bounce reads as a crisper pulse rather than a slow breathing motion.

```bash
git add src/features/ai/AiChatScreen.tsx src/components/ai/TypingDots.tsx
git commit -m "feat: fade in AI Coach screen root, retune typing indicator bounce"
```

---

### Task 11: Paywall — shared crossfade, animated plan selection

**Files:**
- Modify: `src/features/paywall/PaywallScreen.tsx`

- [ ] **Step 1: Replace the per-slide ZoomIn and plans-step FadeIn with a shared crossfade**

In `src/features/paywall/PaywallScreen.tsx`:
- Change the reanimated import from `import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';` to `import Animated, { FadeIn } from 'react-native-reanimated';`.
- Change the story slide's `entering={ZoomIn.duration(300)}` to `entering={FadeIn.duration(220)}`.
- Change the plans step's `entering={FadeIn.duration(300)}` to `entering={FadeIn.duration(220)}` (same duration as the slide transition now, so both feel like one consistent language rather than two different unplanned effects).

- [ ] **Step 2: Animate plan-row selection instead of an instant snap**

Replace the `PlanRow` function with an animated version using `useAnimatedStyle` + `withTiming` to interpolate border/background on selection change:

```tsx
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
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(selected ? 1 : 0, { duration: 150 });
  }, [selected, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(progress.value, [0, 1], [pw.border, pw.accent]),
    backgroundColor: interpolateColor(progress.value, [0, 1], ['transparent', pw.accentTint]),
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`${label} ${price}`}
      accessibilityState={{ selected }}
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={[styles.planRow, animatedStyle]}
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
    </AnimatedPressable>
  );
}
```

Update the file's existing imports (do not add a second, duplicate import from `'react-native'` — `Pressable` is already imported there and is reused as-is for `Animated.createAnimatedComponent`):
- Change `import { useState } from 'react';` to `import { useEffect, useState } from 'react';`.
- Change `import Animated, { FadeIn } from 'react-native-reanimated';` (from Step 1) to:

```ts
import Animated, {
  FadeIn,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
```

Add `const AnimatedPressable = Animated.createAnimatedComponent(Pressable);` once, near the top of the file below the imports, alongside the existing `type Plan = ...` line — this reuses the file's existing `Pressable` import from `'react-native'`, so the rest of the file's other `Pressable` usages (close button, tap zones, subscribe CTA, restore link) are untouched.

- [ ] **Step 3: Verify and commit**

Run: `npm run typecheck && npm run lint && npm run test` — all pass. Manual check: swiping between story slides now crossfades rather than zooming in; selecting Monthly vs Annual smoothly transitions the border/fill color instead of snapping.

```bash
git add src/features/paywall/PaywallScreen.tsx
git commit -m "feat: replace paywall's ad-hoc zoom/fade with a shared crossfade, animate plan selection"
```

---

### Task 12: Settings — real sheet entrance, section stagger

**Files:**
- Modify: `src/features/settings/SettingsScreen.tsx`, `src/app/_layout.tsx`

**Interfaces:**
- Consumes: `springs.soft` (Task 1).

- [ ] **Step 1: Let the component's own entrance carry the motion instead of the router**

In `src/app/_layout.tsx`, change the `settings` `Stack.Screen`'s options so the navigator's own transition is fast and the component drives the real motion:

```tsx
        <Stack.Screen name="settings" options={{ animation: 'fade', animationDuration: 150 }} />
```

- [ ] **Step 2: Add a real entrance to SettingsScreen's root**

`<Screen>` (non-`edgeToEdge`) already wraps its children in its own default `FadeInDown.duration(360)` entrance — adding a second manual wrapper inside it would stack two competing entrances on the same content. Instead, switch this screen to `edgeToEdge` (which renders children with no auto-wrapper) and apply one deliberate entrance ourselves, restoring the horizontal padding `edgeToEdge` normally skips.

In `src/features/settings/SettingsScreen.tsx`:
- Add `import Animated, { FadeInDown } from 'react-native-reanimated';`.
- Add `import { sizes } from '@/theme';` — merge this into the existing theme import line (see Step 3 below for the final combined import).
- Change `<Screen>` to `<Screen edgeToEdge>`, and wrap everything currently inside it in a single `Animated.View`:

```tsx
    <Screen edgeToEdge>
      <Animated.View
        entering={FadeInDown.duration(380).springify().damping(18).stiffness(140)}
        style={styles.content}
      >
        <View style={styles.header}>
          ...unchanged...
        </View>
        ...rest of the existing content, unchanged, down through the closing footer View...
      </Animated.View>
    </Screen>
```

Add to `styles`: `content: { flex: 1, paddingHorizontal: sizes.screenPadding },` (this restores the padding `Screen` would otherwise have applied).

- [ ] **Step 3: Stagger the six section cards lightly**

Change the theme import to add `staggerDelay` and `sizes` together: `import { radius, sizes, spacing, staggerDelay, typography, useTheme } from '@/theme';`.

Wrap each of the six `<Text style={kicker}>...</Text><Card ...>...</Card>` pairs (Profile & account, Cycle setup, Notifications, Appearance, Privacy & data, Subscription) in its own `Animated.View entering={FadeInDown.delay(staggerDelay(N)).duration(300)}` (N = 0 through 5, in the order they already appear top to bottom). These nest inside the single outer entrance from Step 2 — the same "one container transition + staggered inner content" pattern `HomeScreen` and `LogScreen` already use, not a second competing wrapper.

- [ ] **Step 4: Verify and commit**

Run: `npm run typecheck && npm run lint && npm run test` — all pass. Manual check: opening Settings settles into place (fade + gentle upward spring) rather than the whole screen sliding up from off-bottom; the six sections appear with a light staggered cascade.

```bash
git add src/features/settings/SettingsScreen.tsx src/app/_layout.tsx
git commit -m "feat: drive Settings entrance from the component, stagger its six sections"
```

---

### Task 13: Onboarding — animated blob, lighter transitions, chip stagger

**Files:**
- Modify: `src/app/onboarding/welcome.tsx`, `src/app/onboarding/_layout.tsx`, `src/app/onboarding/goals.tsx`, `src/app/onboarding/symptoms.tsx`

**Interfaces:**
- Consumes: `BlobGlow` (Task 4), `staggerDelay` (Task 1).

- [ ] **Step 1: Replace welcome's static blobs with the animated BlobGlow**

In `src/app/onboarding/welcome.tsx` (note: keep this file's existing single-quote/no-semicolon codebase convention when editing, not the double-quote formatting currently on disk from an unrelated local edit):
- Add `import { BlobGlow } from '@/components/ui/BlobGlow';`.
- Replace the two static `<View pointerEvents="none" style={styles.blobOuter} />` / `<View pointerEvents="none" style={styles.blobInner} />` lines with:

```tsx
      <BlobGlow
        size={260}
        colors={['rgba(182,130,53,0.20)', 'rgba(182,130,53,0)']}
        style={styles.blob}
      />
```

- Remove the `blobOuter` and `blobInner` style entries; add:

```ts
  blob: {
    position: 'absolute',
    top: '6%',
    left: '-18%',
  },
```

- [ ] **Step 2: Quicken the onboarding step transition**

In `src/app/onboarding/_layout.tsx`, add `animation: 'fade'` and `animationDuration: 180` to the existing `screenOptions`:

```tsx
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        animationDuration: 180,
        contentStyle: { backgroundColor: p.bgGradient[0] },
      }}
    />
```

- [ ] **Step 3: Stagger the goal/symptom chip grids**

In `src/app/onboarding/goals.tsx`:
- Add `import Animated, { FadeInDown } from 'react-native-reanimated';` and change the theme import to add `staggerDelay`: `import { spacing, staggerDelay, typography, useTheme } from '@/theme';`.
- Wrap each `Chip` in the `.map()` in an `Animated.View entering={FadeInDown.delay(staggerDelay(index, 25)).duration(260)}` — this requires switching `.map((goal) => (...))` to `.map((goal, index) => (...))`:

```tsx
      <ChipGroup>
        {ONBOARDING_GOALS.map((goal, index) => (
          <Animated.View
            key={goal}
            entering={FadeInDown.delay(staggerDelay(index, 25)).duration(260)}
          >
            <Chip
              label={t(`goals.${goal}`)}
              selected={draft.goals.includes(goal)}
              onPress={() => draft.toggleGoal(goal)}
            />
          </Animated.View>
        ))}
      </ChipGroup>
```

Apply the identical change to `src/app/onboarding/symptoms.tsx` (same import additions, same `.map((symptom, index) => (...))` wrapping pattern with `ONBOARDING_SYMPTOMS`).

- [ ] **Step 4: Verify and commit**

Run: `npm run typecheck && npm run lint && npm run test` — all pass. Manual check: the welcome blob visibly drifts; step-to-step transitions feel quick and light rather than a slow full fade; each goal/symptom chip pops in with a light cascading stagger.

```bash
git add src/app/onboarding/welcome.tsx src/app/onboarding/_layout.tsx src/app/onboarding/goals.tsx src/app/onboarding/symptoms.tsx
git commit -m "feat: animate onboarding welcome blob, quicken step transitions, stagger chip grids"
```

---

### Task 14: Cross-screen verification against the prototype

**Files:**
- Create: `docs/superpowers/plans/2026-07-13-prototype-fidelity-review.md` (the comparison report this task produces)

This task has no code changes — it is the explicit review the spec's Testing & Verification section and the user's own completion criteria require: a screen-by-screen comparison against the prototype, a list of what changed, an explicit note of what couldn't reach 100% fidelity and why, and a check across light/dark mode and screen sizes.

- [ ] **Step 1: Full verification trio**

Run: `npm run typecheck && npm run lint && npm run test`
Expected: 0 typecheck errors, 0 lint errors (2 pre-existing i18n warnings acceptable), all 36 tests passing.

- [ ] **Step 2: Start the app for a first-pass visual read**

Run: `npx expo start --web`
This gives a directly viewable render for layout/motion/color checks. Native-only behavior (`GlassSurface`'s iOS Liquid Glass path, haptics, and the exact feel of spring physics) cannot be verified this way — flag these explicitly in the report as needing a real device pass rather than silently treating the web check as sufficient.

- [ ] **Step 3: Compare each of the nine areas against `design_handoff_dialuna/Dialuna.dc.html`**

For each of: Tab bar, Home, Log, Calendar, Insights, AI Coach, Paywall, Settings, Onboarding — open the corresponding `sc-if` block in the prototype HTML side-by-side with the running screen and check: layout/section sizing and position, spacing between elements, border radius, typography, gradient/glow/shadow, icon/button/card/tab-bar sizing, visual priority, and the ratio between primary content and secondary elements (the exact axes from the spec).

- [ ] **Step 4: Check both themes and two screen sizes**

In Settings, toggle Theme to Dark and repeat the pass over all nine areas. Using the web view's responsive tools (or an iOS Simulator/Android emulator if available on the machine running this task), check one small-screen size (e.g. iPhone SE-class, ~375pt wide) and one large-screen size (e.g. a Pro Max/tablet-class width) for layout breakage — particularly the Home hero's floating badge, the tab bar's label truncation, and the paywall's story-slide text wrapping.

- [ ] **Step 5: Write the comparison report**

Write `docs/superpowers/plans/2026-07-13-prototype-fidelity-review.md` with these sections:

```markdown
# Prototype Fidelity Review

## Verification
- [ ] typecheck/lint/test trio: <result>
- [ ] Light mode pass: <result per area>
- [ ] Dark mode pass: <result per area>
- [ ] Small-screen check: <result>
- [ ] Large-screen check: <result>

## Changes made (by area)
<one bullet list per area: Tab bar, Home, Log, Calendar, Insights, AI Coach, Paywall, Settings, Onboarding>

## Known gaps vs. the prototype, and why
<pull directly from the spec's "Known Fidelity Gaps" section — Liquid Glass iOS-only,
no CSS radial-gradient equivalent, some percentage/viewport-relative values approximated —
plus anything newly discovered during this pass>

## Needs a real device
<GlassSurface's native Liquid Glass path, haptic feel, spring feel — anything the web
preview couldn't verify>
```

- [ ] **Step 6: Commit**

```bash
git add docs/superpowers/plans/2026-07-13-prototype-fidelity-review.md
git commit -m "docs: prototype fidelity review after the motion and polish pass"
```
