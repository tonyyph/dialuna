# Living Lunar Intelligence — Phase 2: Navigation Shell + Home Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Home as the five-zone "Today Orbit" composition and the tab bar as a Crescent
Dock, both consuming the v2 design tokens from Phase 0+1 for the first time, and retire the Luna
mascot app-wide — without changing any business logic, engine output, store contract, navigation
route, or i18n key.

**Architecture:** Two new presentational components (`CycleOrb`, `RhythmStrip`) consume data
already produced by `useCycleToday()` — no new data shape, no new engine call. A new
`useSemanticTheme()` hook (mirroring the existing `useTheme()`) is the only new theme primitive.
`Screen.tsx` gets one small, optional, backward-compatible prop so Home can paint a solid v2
canvas instead of the legacy warm gradient without touching any of its other 10 consumers. Luna's
removal is mechanical: she has exactly one consumer app-wide.

**Tech Stack:** TypeScript (strict), React Native 0.86 / Expo ~57, Reanimated 4, `react-native-svg`
(already a dependency, used by `BlobGlow`/`Luna` today), Vitest. No new dependencies.

## Global Constraints

- Package manager is npm — use `npm run <script>`.
- TypeScript strict mode: no `any`, no broad type assertions, no suppressed errors.
- No screen other than Home, the tab bar, and the one `EmptyState` call site in
  `InsightsScreen.tsx` may change. Every other screen must render byte-identical to before this
  plan.
- Every color/typography/radius/shadow/motion value in new or rewritten code must come from
  `@/theme`'s v2 exports (`semanticColors`/`useSemanticTheme`, `gradients`, `typographyV2`,
  `radiusV2`, `shadowsV2`, `duration`, `springV2`) or, where a v2 equivalent doesn't yet cover a
  need (e.g. the shared spring/stagger helpers), the still-live `springs`/`staggerDelay` — never a
  new raw hex literal.
- Every string shown to the user must go through `t()` with an existing i18n key — this plan
  introduces zero new i18n keys (verified against `en.json`/`vi.json` during planning; every
  string needed already exists).
- Navigation routes (`(tabs)/home`, `log`, `calendar`, `insights`, `ai`) are unchanged — same
  `Tabs.Screen` names, no additions/removals.
- No component test harness exists for screens in this codebase (`vitest.config.ts` only covers
  `services/`, `utils/`, `store/`, `theme/`) — verification for screen/component tasks in this
  plan is `npm run typecheck && npm run lint` plus a manual check, matching how every other screen
  in this codebase is verified. This is not a gap introduced by this plan.
- `npm run typecheck && npm run lint && npm test` must pass after every task before committing.
- Commit after every task (small, imperative commit messages, no type prefix required).

---

## Task 1: `Screen` — add an optional solid-background override

**Files:**
- Modify: `src/components/ui/Screen.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `Screen`'s `Props` gains an optional `backgroundColor?: string`. When omitted,
  behavior is byte-identical to today (renders `p.bgGradient` via `LinearGradient`, as every
  current consumer relies on). When provided, `Screen` skips the gradient and fills with the given
  solid color instead. Consumed by Task 6 (Home).

- [ ] **Step 1: Confirm current consumers, to size the blast radius**

Run: `grep -rln "from '@/components/ui/Screen'" src`
Expected: 11 files (Home plus 10 others) — none of them pass a `backgroundColor` prop today
(confirm with `grep -rn "<Screen" src | grep backgroundColor` — expect no output), so adding an
optional prop cannot change their behavior.

- [ ] **Step 2: Add the prop**

In `src/components/ui/Screen.tsx`, change the `Props` interface (around line 18) from:

```tsx
interface Props {
  /** Wrap content in a ScrollView (default true). */
  scroll?: boolean;
  /** Remove horizontal padding, e.g. for edge-to-edge headers. */
  edgeToEdge?: boolean;
  /** Fixed bottom action area. Content receives extra bottom inset automatically. */
  bottomAction?: ReactNode;
  /** Enable KeyboardAvoidingView for form/chat surfaces. */
  keyboardAvoiding?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}
```

to:

```tsx
interface Props {
  /** Wrap content in a ScrollView (default true). */
  scroll?: boolean;
  /** Remove horizontal padding, e.g. for edge-to-edge headers. */
  edgeToEdge?: boolean;
  /** Fixed bottom action area. Content receives extra bottom inset automatically. */
  bottomAction?: ReactNode;
  /** Enable KeyboardAvoidingView for form/chat surfaces. */
  keyboardAvoiding?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  /**
   * Solid background override, replacing the default legacy `p.bgGradient`
   * render (e.g. a v2 semantic canvas color). Omit to keep today's gradient
   * — every current screen relies on that default and is unaffected.
   */
  backgroundColor?: string;
}
```

Change the function signature (around line 31) from:

```tsx
export function Screen({
  children,
  scroll = true,
  edgeToEdge = false,
  bottomAction,
  keyboardAvoiding = false,
  contentContainerStyle,
  style,
}: PropsWithChildren<Props>) {
```

to:

```tsx
export function Screen({
  children,
  scroll = true,
  edgeToEdge = false,
  bottomAction,
  keyboardAvoiding = false,
  contentContainerStyle,
  style,
  backgroundColor,
}: PropsWithChildren<Props>) {
```

Change the `body` block (around lines 56-63) from:

```tsx
  const body = (
    <View style={[styles.safe, { backgroundColor: p.bgGradient[0] }, style]}>
      <LinearGradient
        pointerEvents="none"
        colors={p.bgGradient}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
```

to:

```tsx
  const body = (
    <View style={[styles.safe, { backgroundColor: backgroundColor ?? p.bgGradient[0] }, style]}>
      {backgroundColor ? null : (
        <LinearGradient
          pointerEvents="none"
          colors={p.bgGradient}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />
      )}
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck && npm run lint`
Expected: both pass. `grep -rn "<Screen" src` to spot-check that no existing call site needs a
change (none pass `backgroundColor`, so all keep the default gradient path).

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Screen.tsx
git commit -m "feat: add optional solid-background override to Screen"
```

---

## Task 2: `useSemanticTheme` hook

**Files:**
- Create: `src/theme/useSemanticTheme.ts`
- Modify: `src/theme/index.ts`

**Interfaces:**
- Consumes: `useSettingsStore` (existing), `semanticColors`/`SemanticColorSet` from
  `./semanticColors` (Phase 0+1, existing).
- Produces: `useSemanticTheme(): SemanticColorSet`, exported from `@/theme`. Consumed by every
  later task in this plan.

- [ ] **Step 1: Create the hook**

Create `src/theme/useSemanticTheme.ts`:

```ts
import { useSettingsStore } from '@/store/useSettingsStore';

import { SemanticColorSet, semanticColors } from './semanticColors';

export function useSemanticTheme(): SemanticColorSet {
  const theme = useSettingsStore((s) => s.theme);
  return semanticColors[theme];
}
```

- [ ] **Step 2: Export it from the barrel**

In `src/theme/index.ts`, add this line (anywhere among the other exports, e.g. directly after the
existing `export { useTheme } from './useTheme';` line):

```ts
export { useSemanticTheme } from './useSemanticTheme';
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck && npm run lint`
Expected: both pass.

- [ ] **Step 4: Commit**

```bash
git add src/theme/useSemanticTheme.ts src/theme/index.ts
git commit -m "feat: add useSemanticTheme hook"
```

---

## Task 3: Retire Luna

**Files:**
- Delete: `src/components/mascot/Luna.tsx`
- Modify: `src/components/ui/EmptyState.tsx`
- Modify: `src/features/insights/InsightsScreen.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `EmptyState`'s `Props` changes from `{ lunaExpression?: LunaExpression; title: string;
  body: string }` to `{ icon?: keyof typeof Ionicons.glyphMap; title: string; body: string }`.
  `EmptyState` stays on the legacy `useTheme()` palette (its one consumer, `InsightsScreen.tsx`,
  hasn't migrated to v2 tokens in this phase).

- [ ] **Step 1: Confirm Luna's footprint hasn't changed since planning**

Run: `grep -rln "components/mascot/Luna\|<Luna" src`
Expected: exactly one file, `src/components/ui/EmptyState.tsx`.

Run: `grep -rn "<EmptyState" src | grep -v "EmptyState.tsx"`
Expected: exactly one call site, in `src/features/insights/InsightsScreen.tsx`.

- [ ] **Step 2: Rewrite `EmptyState.tsx`**

Replace the full contents of `src/components/ui/EmptyState.tsx`:

```tsx
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { spacing, typography, useTheme } from '@/theme';

interface Props {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
}

export function EmptyState({ icon = 'sparkles-outline', title, body }: Props) {
  const p = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: p.accent100 }]}>
        <Ionicons name={icon} size={40} color={p.accent} />
      </View>
      <Text style={[styles.title, { color: p.text }]}>{title}</Text>
      <Text style={[styles.body, { color: p.textMuted }]}>{body}</Text>
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
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing(1),
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

- [ ] **Step 3: Update the one call site**

In `src/features/insights/InsightsScreen.tsx`, find:

```tsx
        <EmptyState
          lunaExpression="thinking"
          title={t('insights.empty.title')}
          body={t('insights.empty.body')}
        />
```

Replace with:

```tsx
        <EmptyState
          icon="bulb-outline"
          title={t('insights.empty.title')}
          body={t('insights.empty.body')}
        />
```

- [ ] **Step 4: Delete Luna**

```bash
git rm src/components/mascot/Luna.tsx
```

If `src/components/mascot/` is now empty, that's fine — an empty directory has no git effect and
doesn't need special handling.

- [ ] **Step 5: Verify**

Run: `npm run typecheck && npm run lint && npm test`
Expected: all pass — `InsightsScreen.tsx`'s empty state (triggered when `insights.logCount < 3`,
same condition as before) now shows an icon instead of Luna; nothing else in that screen changes.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/EmptyState.tsx src/features/insights/InsightsScreen.tsx
git commit -m "feat: retire Luna mascot, replace with icon in EmptyState"
```

---

## Task 4: `CycleOrb` component

**Files:**
- Create: `src/components/ui/CycleOrb.tsx`

**Interfaces:**
- Consumes: `BlobGlow` (existing, unchanged), `Pressable` (existing, unchanged), `CyclePhase`
  (existing, from `@/types`), `duration`/`SemanticColorSet`/`tabularNums`/`typographyV2` (Phase
  0+1, existing).
- Produces: `CycleOrb` component with props `{ cycleDay: number; cycleLength: number; phase:
  CyclePhase; isPmsWindow: boolean; periodText: string; twinScore: number; energyScore: number;
  moodScore: number; focusScore: number; theme: SemanticColorSet }`. Consumed by Task 6 (Home).
  Pure presentational — no store/engine access inside it.

- [ ] **Step 1: Create the component**

Create `src/components/ui/CycleOrb.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import { Circle, Svg } from 'react-native-svg';

import { BlobGlow } from '@/components/ui/BlobGlow';
import { Pressable } from '@/components/ui/Pressable';
import { duration, SemanticColorSet, tabularNums, typographyV2 } from '@/theme';
import { CyclePhase } from '@/types';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 260;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type OrbStat = 'phase' | 'energy' | 'mood' | 'focus';
const STAT_ORDER: OrbStat[] = ['phase', 'energy', 'mood', 'focus'];

interface Props {
  cycleDay: number;
  cycleLength: number;
  phase: CyclePhase;
  isPmsWindow: boolean;
  periodText: string;
  twinScore: number;
  energyScore: number;
  moodScore: number;
  focusScore: number;
  theme: SemanticColorSet;
}

export function CycleOrb({
  cycleDay,
  cycleLength,
  phase,
  isPmsWindow,
  periodText,
  twinScore,
  energyScore,
  moodScore,
  focusScore,
  theme,
}: Props) {
  const { t } = useTranslation();
  const [statIndex, setStatIndex] = useState(0);
  const progress = useSharedValue(clampProgress(cycleDay, cycleLength));

  useEffect(() => {
    progress.value = withTiming(clampProgress(cycleDay, cycleLength), {
      duration: duration.expressive,
    });
  }, [cycleDay, cycleLength, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  const stat = STAT_ORDER[statIndex];
  const statLabel =
    stat === 'phase' ? t(isPmsWindow ? 'phases.pms' : `phases.${phase}`) : t(`home.forecast.${stat}`);
  const statValue =
    stat === 'phase'
      ? null
      : { energy: energyScore, mood: moodScore, focus: focusScore }[stat];
  const ringColor = isPmsWindow ? theme.signal.warning : theme.brand.primary;

  return (
    <View style={styles.wrap}>
      <BlobGlow
        size={SIZE + 60}
        colors={['rgba(124,92,252,0.24)', 'rgba(124,92,252,0)']}
        style={styles.glow}
      />
      <Svg width={SIZE} height={SIZE}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={theme.border.subtle}
          strokeWidth={STROKE}
          fill="none"
        />
        <AnimatedCircle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={ringColor}
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          animatedProps={animatedProps}
          rotation={-90}
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.cycleDay', { day: cycleDay })}
        onPress={() => setStatIndex((i) => (i + 1) % STAT_ORDER.length)}
        style={styles.center}
      >
        <Text style={[typographyV2.displayXL, tabularNums, { color: theme.content.primary }]}>
          {cycleDay}
        </Text>
        <Text style={[typographyV2.labelM, { color: theme.content.secondary }]}>
          {statValue !== null ? `${statLabel} · ${statValue}` : statLabel}
        </Text>
      </Pressable>

      <View style={[styles.pill, styles.pillTop, { backgroundColor: theme.surface.raised }]}>
        <Text style={[typographyV2.labelM, { color: theme.content.secondary }]}>
          {t('home.twinScore')}
        </Text>
        <Text style={[typographyV2.titleM, tabularNums, { color: theme.brand.primary }]}>
          {twinScore}
        </Text>
      </View>

      <View style={[styles.pill, styles.pillBottom, { backgroundColor: theme.surface.raised }]}>
        <Text style={[typographyV2.labelM, { color: theme.content.secondary }]}>{periodText}</Text>
      </View>
    </View>
  );
}

function clampProgress(cycleDay: number, cycleLength: number): number {
  if (cycleLength <= 0) return 0;
  return Math.min(1, Math.max(0, cycleDay / cycleLength));
}

const styles = StyleSheet.create({
  wrap: {
    width: SIZE + 60,
    height: SIZE + 60,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  glow: {
    position: 'absolute',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    gap: 4,
  },
  pill: {
    position: 'absolute',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
  },
  pillTop: {
    top: 8,
    right: 4,
  },
  pillBottom: {
    bottom: 8,
    left: 4,
  },
});
```

- [ ] **Step 2: Verify**

Run: `npm run typecheck && npm run lint`
Expected: both pass. If `AnimatedCircle`'s `rotation`/`origin` props (react-native-svg's own
rotation shorthand, used here instead of a raw `transform` string for stronger typing) raise a
type error, check `node_modules/react-native-svg`'s `Circle`/`CommonPathProps` types for the
exact accepted prop names/types in the installed version and adjust to match — do not fall back
to `any`.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/CycleOrb.tsx
git commit -m "feat: add CycleOrb component"
```

---

## Task 5: `RhythmStrip` component

**Files:**
- Create: `src/components/ui/RhythmStrip.tsx`

**Interfaces:**
- Consumes: `HormoneTwinDailyProfile` (existing, from `@/types`), `SemanticColorSet`/`typographyV2`
  (Phase 0+1, existing).
- Produces: `RhythmStrip` component with props `{ days: HormoneTwinDailyProfile[]; theme:
  SemanticColorSet }` — same `days` input shape `WeekStrip` took. Consumed by Task 6 (Home).

- [ ] **Step 1: Create the component**

Create `src/components/ui/RhythmStrip.tsx`:

```tsx
import { format, parseISO } from 'date-fns';
import { StyleSheet, Text, View } from 'react-native';

import { SemanticColorSet, typographyV2 } from '@/theme';
import { HormoneTwinDailyProfile } from '@/types';

interface Props {
  days: HormoneTwinDailyProfile[];
  theme: SemanticColorSet;
}

export function RhythmStrip({ days, theme }: Props) {
  return (
    <View style={styles.row}>
      {days.map((day) => {
        const color = day.isPmsWindow
          ? theme.signal.warning
          : day.phase === 'menstrual'
            ? theme.signal.period
            : theme.brand.secondary;
        return (
          <View key={day.date} style={styles.col}>
            <View
              style={[
                styles.pulse,
                {
                  height: Math.max(10, day.energyScore) * 0.6,
                  backgroundColor: color,
                },
              ]}
            />
            <Text style={[typographyV2.micro, { color: theme.content.tertiary }]}>
              {format(parseISO(day.date), 'EEEEE')}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 4,
  },
  col: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  pulse: {
    width: 6,
    borderRadius: 999,
  },
});
```

- [ ] **Step 2: Verify**

Run: `npm run typecheck && npm run lint`
Expected: both pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/RhythmStrip.tsx
git commit -m "feat: add RhythmStrip component"
```

---

## Task 6: Rebuild `HomeScreen`

**Files:**
- Modify: `src/features/home/HomeScreen.tsx` (full rewrite)

**Interfaces:**
- Consumes: `CycleOrb` (Task 4), `RhythmStrip` (Task 5), `useSemanticTheme` (Task 2), `Screen`'s
  new `backgroundColor` prop (Task 1), `useCycleToday` (existing, unchanged), `PremiumBanner`
  (existing, unchanged), `usePremiumStore` (existing, unchanged).
- Produces: the rebuilt Home screen. No new interface consumed by later tasks.

- [ ] **Step 1: Replace the full contents of `src/features/home/HomeScreen.tsx`**

```tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PremiumBanner } from '@/components/paywall/PremiumBanner';
import { CycleOrb } from '@/components/ui/CycleOrb';
import { Pressable } from '@/components/ui/Pressable';
import { RhythmStrip } from '@/components/ui/RhythmStrip';
import { Screen } from '@/components/ui/Screen';
import { useCycleToday } from '@/features/cycle/useCycleToday';
import { usePremiumStore } from '@/store';
import { radiusV2, spacing, staggerDelay, typographyV2, useSemanticTheme } from '@/theme';

function greetingKey(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'home.greeting.morning';
  if (hour < 18) return 'home.greeting.afternoon';
  return 'home.greeting.evening';
}

export function HomeScreen() {
  const { t } = useTranslation();
  const theme = useSemanticTheme();
  const ctx = useCycleToday();
  const isPremium = usePremiumStore((s) => s.isPremium);

  if (!ctx) return null;
  const { profile, prediction, twin, week } = ctx;
  const periodText =
    prediction.daysUntilPeriod === 0
      ? t('home.periodToday')
      : t('home.periodIn', { count: prediction.daysUntilPeriod });

  const tip = pickTip(twin);

  return (
    <Screen edgeToEdge backgroundColor={theme.background.canvas}>
      <View style={styles.contextStrip}>
        <Text style={[typographyV2.bodyM, { color: theme.content.secondary }]}>
          {t(greetingKey(), { name: profile.nickname })}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('settings.title')}
          onPress={() => router.push('/settings')}
          hitSlop={8}
          style={[styles.settingsBtn, { backgroundColor: theme.surface.default }]}
        >
          <Ionicons name="settings-outline" size={20} color={theme.content.primary} />
        </Pressable>
      </View>

      <View style={styles.orbWrap}>
        <CycleOrb
          cycleDay={prediction.cycleDay}
          cycleLength={profile.averageCycleLength}
          phase={prediction.phase}
          isPmsWindow={prediction.isPmsWindow}
          periodText={periodText}
          twinScore={twin.hormoneTwinScore}
          energyScore={twin.energyScore}
          moodScore={twin.moodScore}
          focusScore={twin.focusScore}
          theme={theme}
        />
      </View>

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(staggerDelay(0)).duration(360)}>
          <Text style={[typographyV2.labelL, { color: theme.content.secondary }]}>
            {t('home.insightTitle')}
          </Text>
          <Text style={[typographyV2.bodyL, styles.insightBody, { color: theme.content.primary }]}>
            {t(twin.coachMessageKey)}
          </Text>
          {tip ? (
            <Text style={[typographyV2.bodyM, styles.tipRow, { color: theme.content.secondary }]}>
              {tip.label} · {t(tip.key)}
            </Text>
          ) : null}
          <View style={styles.actionsRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('home.askAi')}
              onPress={() => router.push('/(tabs)/ai')}
            >
              <Text style={[typographyV2.labelL, { color: theme.brand.primary }]}>
                {t('home.askAi')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('home.logNow')}
              onPress={() => router.push('/(tabs)/log')}
            >
              <Text style={[typographyV2.labelL, { color: theme.brand.secondary }]}>
                {t('home.logNow')}
              </Text>
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(staggerDelay(1)).duration(360)}>
          <Text style={[typographyV2.labelL, styles.sectionLabel, { color: theme.content.secondary }]}>
            {t('home.upcoming')}
          </Text>
          <RhythmStrip days={week} theme={theme} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(staggerDelay(2)).duration(360)}>
          {isPremium ? (
            <View style={styles.planSection}>
              <Text style={[typographyV2.labelL, { color: theme.content.secondary }]}>
                {t('home.plan.title')}
              </Text>
              <PlanGroup title={t('home.plan.food')} emoji="🥗" tipKeys={twin.foodTipKeys} theme={theme} />
              <PlanGroup
                title={t('home.plan.workout')}
                emoji="🤸‍♀️"
                tipKeys={twin.workoutTipKeys}
                theme={theme}
              />
              <PlanGroup
                title={t('home.plan.selfcare')}
                emoji="🫧"
                tipKeys={twin.selfCareTipKeys}
                theme={theme}
              />
            </View>
          ) : (
            <PremiumBanner onPress={() => router.push('/paywall')} />
          )}
        </Animated.View>
      </View>
    </Screen>
  );
}

function pickTip(
  twin: ReturnType<typeof useCycleToday> extends infer T
    ? T extends { twin: infer Twin }
      ? Twin
      : never
    : never
) {
  if (!twin) return null;
  if (twin.foodTipKeys[0]) return { label: 'home.plan.food' as const, key: twin.foodTipKeys[0] };
  if (twin.workoutTipKeys[0])
    return { label: 'home.plan.workout' as const, key: twin.workoutTipKeys[0] };
  if (twin.selfCareTipKeys[0])
    return { label: 'home.plan.selfcare' as const, key: twin.selfCareTipKeys[0] };
  return null;
}

function PlanGroup({
  title,
  emoji,
  tipKeys,
  theme,
}: {
  title: string;
  emoji: string;
  tipKeys: string[];
  theme: ReturnType<typeof useSemanticTheme>;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.planGroup}>
      <Text style={[typographyV2.bodyM, { color: theme.content.primary }]}>
        {emoji} {title}
      </Text>
      {tipKeys.slice(0, 2).map((key) => (
        <Text key={key} style={[typographyV2.bodyM, { color: theme.content.secondary }]}>
          {t(key)}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  contextStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(2.5),
    paddingTop: spacing(2),
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: radiusV2.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbWrap: {
    marginTop: spacing(2),
    marginBottom: spacing(1),
  },
  content: {
    paddingHorizontal: spacing(2.5),
    paddingTop: spacing(3),
    gap: spacing(3.5),
  },
  insightBody: {
    marginTop: spacing(1),
  },
  tipRow: {
    marginTop: spacing(1),
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing(3),
    marginTop: spacing(2),
  },
  sectionLabel: {
    marginBottom: spacing(1.5),
  },
  planSection: {
    gap: spacing(1.5),
  },
  planGroup: {
    gap: spacing(0.5),
  },
});
```

Note the `pickTip` function's parameter type is written defensively (deriving the `twin` shape
from `useCycleToday`'s return type) purely to avoid importing an engine type directly into a
screen file unnecessarily; if this reads as awkward during implementation, an equally acceptable
alternative is importing `HormoneTwinDailyProfile` from `@/types` directly and typing the
parameter as `HormoneTwinDailyProfile | null` — either is fine, just avoid `any`.

- [ ] **Step 2: Verify**

Run: `npm run typecheck && npm run lint`
Expected: both pass.

- [ ] **Step 3: Commit**

```bash
git add src/features/home/HomeScreen.tsx
git commit -m "feat: rebuild Home as the Today Orbit composition"
```

---

## Task 7: Delete orphaned `WeekStrip` and `ProgressBar`

**Files:**
- Delete: `src/components/cycle/WeekStrip.tsx`
- Delete: `src/components/ui/ProgressBar.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: nothing (pure removal).

- [ ] **Step 1: Confirm zero remaining imports now that Home no longer uses them**

Run: `grep -rln "components/cycle/WeekStrip\|<WeekStrip" src`
Expected: no output.

Run: `grep -rln "components/ui/ProgressBar\|<ProgressBar" src`
Expected: no output.

If either grep finds a result, STOP — do not delete that file; report which consumer still exists.

- [ ] **Step 2: Delete both files**

```bash
git rm src/components/cycle/WeekStrip.tsx src/components/ui/ProgressBar.tsx
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck && npm run lint && npm test`
Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git commit -m "chore: remove WeekStrip and ProgressBar (orphaned by Home rebuild)"
```

---

## Task 8: Rebuild the tab bar as a Crescent Dock

**Files:**
- Modify: `src/app/(tabs)/_layout.tsx`

**Interfaces:**
- Consumes: `useSemanticTheme` (Task 2), `radiusV2`/`shadowsV2`/`typographyV2` (Phase 0+1,
  existing), `GlassSurface`/`Pressable`/`springs`/`spacing` (existing, unchanged).
- Produces: the rebuilt tab bar. Same `Tabs.Screen` route set as before
  (`home`/`log`/`calendar`/`insights`/`ai`) — no navigation contract change.

- [ ] **Step 1: Replace the full contents of `src/app/(tabs)/_layout.tsx`**

```tsx
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { BottomTabBarProps } from 'expo-router/js-tabs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { GlassSurface } from '@/components/ui/GlassSurface';
import { Pressable } from '@/components/ui/Pressable';
import { radiusV2, shadowsV2, spacing, springs, typographyV2, useSemanticTheme } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

const TAB_ICONS: Record<string, IconName> = {
  home: 'ellipse-outline',
  log: 'add',
  calendar: 'calendar-outline',
  insights: 'stats-chart-outline',
  ai: 'sparkles-outline',
};

function CrescentDock({ state, descriptors, navigation }: BottomTabBarProps) {
  const theme = useSemanticTheme();
  const [dockWidth, setDockWidth] = useState(0);
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  useEffect(() => {
    const routeCount = state.routes.length;
    const contentWidth = dockWidth - spacing(1.5);
    if (routeCount > 0 && contentWidth > 0) {
      const itemWidth = contentWidth / routeCount;
      indicatorWidth.value = withSpring(itemWidth, springs.soft);
      indicatorX.value = withSpring(spacing(0.75) + itemWidth * state.index, springs.soft);
    }
  }, [dockWidth, indicatorWidth, indicatorX, state.index, state.routes.length]);

  const indicatorStyle = useAnimatedStyle(() => ({
    width: indicatorWidth.value,
    transform: [{ translateX: indicatorX.value }],
  }));

  return (
    <GlassSurface
      tintColor={theme.surface.floating}
      style={[styles.dock, shadowsV2.floating]}
      onLayout={(e: LayoutChangeEvent) => setDockWidth(e.nativeEvent.layout.width)}
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.indicator, { backgroundColor: theme.surface.selected }, indicatorStyle]}
      />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const isLog = route.name === 'log';
        const icon = TAB_ICONS[route.name] ?? 'ellipse-outline';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={options.title}
            style={styles.item}
          >
            <View
              style={[
                styles.iconWrap,
                isLog
                  ? { backgroundColor: theme.brand.primary }
                  : focused
                    ? { backgroundColor: theme.surface.raised }
                    : null,
              ]}
            >
              <Ionicons
                name={icon}
                size={19}
                color={isLog ? theme.content.inverse : focused ? theme.brand.primary : theme.content.tertiary}
              />
            </View>
            {focused && !isLog ? (
              <Text style={[typographyV2.micro, { color: theme.brand.primary }]} numberOfLines={1}>
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
      tabBar={(props) => <CrescentDock {...props} />}
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
    borderTopLeftRadius: radiusV2.organic,
    borderTopRightRadius: radiusV2.organic,
    borderBottomLeftRadius: radiusV2.xl,
    borderBottomRightRadius: radiusV2.xl,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing(0.75),
  },
  indicator: {
    position: 'absolute',
    top: 8,
    height: 46,
    borderRadius: radiusV2.lg,
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
    borderRadius: radiusV2.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

- [ ] **Step 2: Verify**

Run: `npm run typecheck && npm run lint`
Expected: both pass. `grep -rn "FloatingDock" src` should return no results (fully renamed to
`CrescentDock`).

- [ ] **Step 3: Commit**

```bash
git add "src/app/(tabs)/_layout.tsx"
git commit -m "feat: rebuild tab bar as a Crescent Dock"
```

---

## Task 9: Final verification pass

**Files:** none (verification only).

**Interfaces:** none.

- [ ] **Step 1: Full automated verification**

Run: `npm run typecheck && npm run lint && npm test`
Expected: all pass, zero errors introduced.

- [ ] **Step 2: Confirm the changed-file list matches this plan exactly**

Run: `git diff <plan-base-commit> HEAD --stat` (base = the commit before Task 1 started)
Expected: `src/components/ui/Screen.tsx`, `src/theme/useSemanticTheme.ts`, `src/theme/index.ts`,
`src/components/mascot/Luna.tsx` (deleted), `src/components/ui/EmptyState.tsx`,
`src/features/insights/InsightsScreen.tsx`, `src/components/ui/CycleOrb.tsx`,
`src/components/ui/RhythmStrip.tsx`, `src/features/home/HomeScreen.tsx`,
`src/components/cycle/WeekStrip.tsx` (deleted), `src/components/ui/ProgressBar.tsx` (deleted),
`src/app/(tabs)/_layout.tsx`. Nothing else.

- [ ] **Step 3: Manual regression check**

Run: `npm run start` (or `npm run ios`/`npm run android`/`npm run web` depending on what's
available in the environment). Confirm:
- Home renders the new Orb, intelligence stream, rhythm strip, and plan/banner section, in both
  light and dark mode (toggle via Settings → Appearance).
- Tapping the Orb's center cycles through phase → energy → mood → focus → back to phase.
- The tab bar shows the curved dock, Log's item is visually distinct (filled), and the active
  indicator still slides smoothly between tabs.
- Insights' empty state (log fewer than 3 days) renders the icon in place of Luna, unchanged
  otherwise.
- Every other screen (Log, Calendar, AI Coach, Onboarding, Paywall, Settings) is visually
  unchanged from before this plan.
- Non-premium and premium states on Home both render correctly (toggle `isPremium` via Settings'
  dev override, `__DEV__` build only).

- [ ] **Step 4: Report**

Summarize for the user: what was checked, in which modes, on which platform(s) were available,
and explicitly flag any platform that could not be manually verified in this environment.

(No commit — this task is verification only.)
