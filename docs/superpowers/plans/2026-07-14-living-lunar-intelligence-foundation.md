# Living Lunar Intelligence — Phase 0+1 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stabilize the app (fix an unguarded dev-only settings toggle) and add the "Living Lunar
Intelligence" v2 design-token foundation (colors, semantic colors, gradients, typography, radius,
shadows, motion, shared style helpers) plus a dev-only showcase screen — without changing how any
currently-shipped screen looks or behaves.

**Architecture:** Every v2 token is additive. Existing `@/theme` exports (`palettes`, `useTheme`,
`typography`, `radius`, `shadows`, `spacing`, `sizes`) keep their current names and values so
every real screen keeps compiling and rendering unchanged. New tokens are added under new names
(`colors`, `semanticColors`, `gradients`, `typographyV2`, `radiusV2`, `shadowsV2`, `springV2`,
`surfaceElevated`/`surfaceFloating`) and are exercised only by a new dev-only route,
`/dev/design-showcase`. The one non-additive change is `motion.ts`'s `duration`/`easing` shape,
which is safe to redefine in place because it has zero consumers anywhere in the app today.

**Tech Stack:** TypeScript (strict), React Native 0.86 / Expo ~57, Reanimated 4, `expo-linear-gradient`,
Vitest, Zustand. No new dependencies are introduced by this plan.

## Global Constraints

- Package manager is npm (`package-lock.json` is authoritative) — use `npm run <script>`, not `npx` ad hoc, for typecheck/lint/test.
- TypeScript strict mode: no `any`, no broad type assertions, no suppressed errors.
- No screen outside this plan's explicit file list may change — existing screens must render byte-identical to before this plan.
- Every new hex/rgba color value lives in `src/theme/colors.ts` or, for computed rgba tints, directly in `src/theme/semanticColors.ts` — no new hardcoded colors in the showcase screen or `components.ts`.
- Do not remove or rename any currently-exported `@/theme` member (`palettes`, `useTheme`, `paywallColors`, `spacing`, `typography`, `radius`, `shadows`, `springs`, `staggerDelay`, `sizes`) — only `easing` may be dropped (confirmed zero consumers app-wide).
- `npm run typecheck && npm run lint && npm test` must pass after every task before committing.
- Vitest only runs `src/services/**/*.test.ts`, `src/utils/**/*.test.ts`, `src/store/**/*.test.ts`, `src/theme/**/*.test.ts` (per `vitest.config.ts`) — new theme test files are auto-discovered; no config change needed.
- Commit after every task (small, imperative commit messages, no type prefix required — match the existing log style, e.g. `git log --oneline -5`).

---

## Task 1: Guard the dev premium-override toggle

**Files:**
- Modify: `src/features/settings/SettingsScreen.tsx:346-350`

**Interfaces:**
- Consumes: nothing new — `__DEV__` is a React Native global (no import needed), already used implicitly by the framework; `isPremium` and `togglePremiumDev` are existing local variables in this file (lines 33, 35).
- Produces: nothing consumed by later tasks — this task is independent of the theme work in Tasks 2-13.

- [ ] **Step 1: Confirm the current baseline is green**

Run: `npm run typecheck && npm run lint && npm test`
Expected: all three succeed with no errors (this is the starting baseline — if anything fails here, stop and report before making any change, since it's pre-existing and out of scope for this plan).

- [ ] **Step 2: Guard the toggle**

In `src/features/settings/SettingsScreen.tsx`, find (around lines 346-350):

```tsx
        <NotifRow
          label={t('settings.devToggle')}
          value={isPremium}
          onChange={togglePremiumDev}
        />
```

Replace with:

```tsx
        {__DEV__ && (
          <NotifRow
            label={t('settings.devToggle')}
            value={isPremium}
            onChange={togglePremiumDev}
          />
        )}
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck && npm run lint`
Expected: both pass. (There is no component test harness for `SettingsScreen.tsx` — `vitest.config.ts` only includes `services/`, `utils/`, `store/`, and `theme/` — so this task has no new automated test; verification is typecheck/lint plus the manual check in Task 13.)

- [ ] **Step 4: Commit**

```bash
git add src/features/settings/SettingsScreen.tsx
git commit -m "fix: guard dev premium-override toggle behind __DEV__"
```

---

## Task 2: `src/theme/colors.ts` — raw v2 color primitives

**Files:**
- Create: `src/theme/colors.ts`
- Test: `src/theme/colors.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `colors` (object with 24 string keys, each a 6-digit hex string), `ColorToken` (type = `keyof typeof colors`). Consumed by Tasks 3, 9, 12.

- [ ] **Step 1: Write the failing test**

Create `src/theme/colors.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { colors } from './colors';

const HEX = /^#[0-9A-Fa-f]{6}$/;

describe('colors', () => {
  it('defines every token as a 6-digit hex string', () => {
    Object.entries(colors).forEach(([key, value]) => {
      expect(value, `${key} should be a hex color`).toMatch(HEX);
    });
  });

  it('exposes the full v2 brand spectrum from the design brief', () => {
    expect(Object.keys(colors)).toEqual([
      'midnight950', 'midnight900', 'midnight850', 'midnight800',
      'porcelain50', 'porcelain100', 'porcelain200',
      'iris300', 'iris400', 'iris500', 'iris600',
      'aqua300', 'aqua400', 'aqua500',
      'coral300', 'coral400', 'coral500',
      'moonWhite', 'silverMist', 'slateText', 'deepInk',
      'success', 'warning', 'danger',
    ]);
  });

  it('matches the exact hex values from the design brief', () => {
    expect(colors.midnight950).toBe('#070911');
    expect(colors.porcelain50).toBe('#FAFAF8');
    expect(colors.iris500).toBe('#7C5CFC');
    expect(colors.aqua500).toBe('#25B8B2');
    expect(colors.coral500).toBe('#F56F5A');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/theme/colors.test.ts`
Expected: FAIL with "Cannot find module './colors'" or similar.

- [ ] **Step 3: Write the implementation**

Create `src/theme/colors.ts`:

```ts
/**
 * Raw palette primitives for the "Living Lunar Intelligence" design system (v2).
 * This is the only place raw hex values should live for v2 work — screens and
 * components should consume `semanticColors`, not this module, once migrated.
 */
export const colors = {
  midnight950: '#070911',
  midnight900: '#0B0E18',
  midnight850: '#101421',
  midnight800: '#151A29',

  porcelain50: '#FAFAF8',
  porcelain100: '#F4F3EF',
  porcelain200: '#EAE8E2',

  iris300: '#B9A8FF',
  iris400: '#9C83FF',
  iris500: '#7C5CFC',
  iris600: '#6544DF',

  aqua300: '#77E5DB',
  aqua400: '#4ED3CA',
  aqua500: '#25B8B2',

  coral300: '#FFB7A6',
  coral400: '#FF927C',
  coral500: '#F56F5A',

  moonWhite: '#F8F7FF',
  silverMist: '#C8CBD8',
  slateText: '#8C92A6',
  deepInk: '#181A24',

  success: '#55CFA4',
  warning: '#F2B45B',
  danger: '#EF6B76',
} as const;

export type ColorToken = keyof typeof colors;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/theme/colors.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/theme/colors.ts src/theme/colors.test.ts
git commit -m "feat: add v2 color primitives"
```

---

## Task 3: `src/theme/semanticColors.ts` — light/dark semantic tokens

**Files:**
- Create: `src/theme/semanticColors.ts`
- Test: `src/theme/semanticColors.test.ts`

**Interfaces:**
- Consumes: `colors` from `./colors` (Task 2).
- Produces: `SemanticColorSet` (interface), `semanticColors: Record<'light' | 'dark', SemanticColorSet>`. Consumed by Tasks 9, 12.

- [ ] **Step 1: Write the failing test**

Create `src/theme/semanticColors.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { colors } from './colors';
import { semanticColors } from './semanticColors';

const KEY_SHAPE = {
  background: ['canvas', 'elevated', 'inverse'],
  content: ['primary', 'secondary', 'tertiary', 'inverse'],
  brand: ['primary', 'secondary', 'accent'],
  signal: ['period', 'fertile', 'ovulation', 'recovery', 'warning'],
  border: ['subtle', 'strong'],
  surface: ['default', 'raised', 'floating', 'selected'],
} as const;

describe('semanticColors', () => {
  it('defines light and dark with an identical key shape', () => {
    for (const mode of ['light', 'dark'] as const) {
      const set = semanticColors[mode];
      for (const [group, keys] of Object.entries(KEY_SHAPE)) {
        const groupValue = set[group as keyof typeof set] as Record<string, string>;
        expect(Object.keys(groupValue).sort()).toEqual([...keys].sort());
      }
    }
  });

  it('reserves coral for brand.accent/signal.period only, never as a background', () => {
    const coralHexes = [colors.coral300, colors.coral400, colors.coral500].map((c) =>
      c.toLowerCase()
    );
    for (const mode of ['light', 'dark'] as const) {
      const set = semanticColors[mode];
      expect(coralHexes).not.toContain(set.background.canvas.toLowerCase());
      expect(coralHexes).not.toContain(set.background.elevated.toLowerCase());
    }
  });

  it('assigns brand.primary from the iris ramp in both themes', () => {
    expect(semanticColors.light.brand.primary).toBe(colors.iris500);
    expect(semanticColors.dark.brand.primary).toBe(colors.iris400);
  });

  it('uses the midnight/porcelain canvases per theme', () => {
    expect(semanticColors.dark.background.canvas).toBe(colors.midnight900);
    expect(semanticColors.light.background.canvas).toBe(colors.porcelain50);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/theme/semanticColors.test.ts`
Expected: FAIL with "Cannot find module './semanticColors'".

- [ ] **Step 3: Write the implementation**

Create `src/theme/semanticColors.ts`:

```ts
import { colors } from './colors';

export interface SemanticColorSet {
  background: {
    canvas: string;
    elevated: string;
    inverse: string;
  };
  content: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  brand: {
    primary: string;
    secondary: string;
    accent: string;
  };
  signal: {
    period: string;
    fertile: string;
    ovulation: string;
    recovery: string;
    warning: string;
  };
  border: {
    subtle: string;
    strong: string;
  };
  surface: {
    default: string;
    raised: string;
    floating: string;
    selected: string;
  };
}

const light: SemanticColorSet = {
  background: {
    canvas: colors.porcelain50,
    elevated: colors.porcelain100,
    inverse: colors.midnight900,
  },
  content: {
    primary: colors.deepInk,
    secondary: colors.slateText,
    tertiary: colors.silverMist,
    inverse: colors.moonWhite,
  },
  brand: {
    primary: colors.iris500,
    secondary: colors.aqua500,
    accent: colors.coral500,
  },
  signal: {
    period: colors.coral500,
    fertile: colors.iris400,
    ovulation: colors.aqua400,
    recovery: colors.aqua500,
    warning: colors.warning,
  },
  border: {
    subtle: 'rgba(24,26,36,0.08)',
    strong: 'rgba(24,26,36,0.16)',
  },
  surface: {
    default: colors.porcelain100,
    raised: colors.porcelain50,
    floating: 'rgba(250,250,248,0.88)',
    selected: 'rgba(124,92,252,0.12)',
  },
};

const dark: SemanticColorSet = {
  background: {
    canvas: colors.midnight900,
    elevated: colors.midnight850,
    inverse: colors.porcelain50,
  },
  content: {
    primary: colors.moonWhite,
    secondary: colors.silverMist,
    tertiary: colors.slateText,
    inverse: colors.deepInk,
  },
  brand: {
    primary: colors.iris400,
    secondary: colors.aqua400,
    accent: colors.coral400,
  },
  signal: {
    period: colors.coral400,
    fertile: colors.iris300,
    ovulation: colors.aqua300,
    recovery: colors.aqua400,
    warning: colors.warning,
  },
  border: {
    subtle: 'rgba(255,255,255,0.08)',
    strong: 'rgba(255,255,255,0.16)',
  },
  surface: {
    default: colors.midnight850,
    raised: colors.midnight800,
    floating: 'rgba(16,20,33,0.88)',
    selected: 'rgba(156,131,255,0.16)',
  },
};

/**
 * Initial signal-color mapping (period/fertile/ovulation/recovery/warning) is
 * a starting point — not wired to any screen yet. Revisit per-screen in
 * Phase 3/4 when Calendar and Insights actually consume these.
 */
export const semanticColors: Record<'light' | 'dark', SemanticColorSet> = { light, dark };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/theme/semanticColors.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/theme/semanticColors.ts src/theme/semanticColors.test.ts
git commit -m "feat: add v2 semantic color tokens"
```

---

## Task 4: `src/theme/gradients.ts` — functional gradients

**Files:**
- Create: `src/theme/gradients.ts`
- Test: `src/theme/gradients.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `gradients` (object, each value a `readonly [string, string, ...string[]]` tuple), `GradientToken` (type). Consumed by Task 12.

- [ ] **Step 1: Write the failing test**

Create `src/theme/gradients.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { gradients } from './gradients';

const COLOR_STOP = /^(#[0-9A-Fa-f]{6}|rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\))$/;

describe('gradients', () => {
  it('defines the five named gradients from the design brief', () => {
    expect(Object.keys(gradients)).toEqual([
      'nightField',
      'irisDepth',
      'aquaMist',
      'coralHalo',
      'lunarSheen',
    ]);
  });

  it('gives every gradient at least two valid color stops', () => {
    for (const stops of Object.values(gradients)) {
      expect(stops.length).toBeGreaterThanOrEqual(2);
      for (const stop of stops) {
        expect(stop).toMatch(COLOR_STOP);
      }
    }
  });

  it('matches the exact stop values from the design brief', () => {
    expect(gradients.nightField).toEqual(['#070911', '#101224', '#151124']);
    expect(gradients.aquaMist).toEqual(['#D8F8F3', '#F4F6F3']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/theme/gradients.test.ts`
Expected: FAIL with "Cannot find module './gradients'".

- [ ] **Step 3: Write the implementation**

Create `src/theme/gradients.ts`:

```ts
/**
 * Gradients for the v2 system. Each entry's comment documents the semantic
 * purpose it serves per the design brief — gradients are functional
 * (hierarchy, phase, depth, state, focus), never purely decorative.
 */
export const gradients = {
  /** Full-bleed dark canvas depth — base background layering. */
  nightField: ['#070911', '#101224', '#151124'],
  /** Iris-toned depth field — brand/hero surfaces needing spatial depth. */
  irisDepth: ['#312661', '#19172F', '#0B0E18'],
  /** Light, airy recovery/positive-state field. */
  aquaMist: ['#D8F8F3', '#F4F6F3'],
  /** Soft radial halo drawing attention to a period/biological signal point. */
  coralHalo: ['rgba(245,111,90,0.22)', 'rgba(245,111,90,0)'],
  /** Layered sheen used to indicate focus/hierarchy on hero surfaces. */
  lunarSheen: [
    'rgba(185,168,255,0.28)',
    'rgba(78,211,202,0.10)',
    'rgba(7,9,17,0)',
  ],
} as const satisfies Record<string, readonly [string, string, ...string[]]>;

export type GradientToken = keyof typeof gradients;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/theme/gradients.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/theme/gradients.ts src/theme/gradients.test.ts
git commit -m "feat: add v2 functional gradients"
```

---

## Task 5: `src/theme/typographyV2.ts` — Manrope-only type scale

**Files:**
- Create: `src/theme/typographyV2.ts`
- Test: `src/theme/typographyV2.test.ts`

**Interfaces:**
- Consumes: nothing (font weights `Manrope_400Regular/500Medium/600SemiBold/700Bold` are already loaded by `src/app/_layout.tsx` — no font-loading change in this task).
- Produces: `typographyV2` (object of 10 `TextStyle` tokens), `tabularNums` (`TextStyle`). Consumed by Task 12.

- [ ] **Step 1: Write the failing test**

Create `src/theme/typographyV2.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { typographyV2 } from './typographyV2';

describe('typographyV2', () => {
  it('defines the full Manrope-only scale from the design brief', () => {
    expect(typographyV2.displayXL).toEqual({ fontFamily: 'Manrope_700Bold', fontSize: 52, lineHeight: 54 });
    expect(typographyV2.displayL).toEqual({ fontFamily: 'Manrope_700Bold', fontSize: 42, lineHeight: 46 });
    expect(typographyV2.titleXL).toEqual({ fontFamily: 'Manrope_600SemiBold', fontSize: 32, lineHeight: 37 });
    expect(typographyV2.titleL).toEqual({ fontFamily: 'Manrope_600SemiBold', fontSize: 26, lineHeight: 32 });
    expect(typographyV2.titleM).toEqual({ fontFamily: 'Manrope_600SemiBold', fontSize: 21, lineHeight: 27 });
    expect(typographyV2.bodyL).toEqual({ fontFamily: 'Manrope_400Regular', fontSize: 17, lineHeight: 25 });
    expect(typographyV2.bodyM).toEqual({ fontFamily: 'Manrope_400Regular', fontSize: 15, lineHeight: 22 });
    expect(typographyV2.labelL).toEqual({ fontFamily: 'Manrope_500Medium', fontSize: 14, lineHeight: 18 });
    expect(typographyV2.labelM).toEqual({ fontFamily: 'Manrope_500Medium', fontSize: 12, lineHeight: 16 });
    expect(typographyV2.micro).toEqual({ fontFamily: 'Manrope_600SemiBold', fontSize: 11, lineHeight: 14 });
  });

  it('only uses font weights already loaded by the app (no new font risk)', () => {
    const loadedWeights = ['Manrope_400Regular', 'Manrope_500Medium', 'Manrope_600SemiBold', 'Manrope_700Bold'];
    for (const style of Object.values(typographyV2)) {
      expect(loadedWeights).toContain(style.fontFamily);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/theme/typographyV2.test.ts`
Expected: FAIL with "Cannot find module './typographyV2'".

- [ ] **Step 3: Write the implementation**

Create `src/theme/typographyV2.ts`:

```ts
import { TextStyle } from 'react-native';

/**
 * Manrope-only type scale for the "Living Lunar Intelligence" redesign (v2).
 * No screen consumes this yet — the existing `typography.ts` (Cormorant
 * Garamond) stays live until each screen migrates in a later phase.
 */
export const typographyV2 = {
  displayXL: { fontFamily: 'Manrope_700Bold', fontSize: 52, lineHeight: 54 },
  displayL: { fontFamily: 'Manrope_700Bold', fontSize: 42, lineHeight: 46 },
  titleXL: { fontFamily: 'Manrope_600SemiBold', fontSize: 32, lineHeight: 37 },
  titleL: { fontFamily: 'Manrope_600SemiBold', fontSize: 26, lineHeight: 32 },
  titleM: { fontFamily: 'Manrope_600SemiBold', fontSize: 21, lineHeight: 27 },
  bodyL: { fontFamily: 'Manrope_400Regular', fontSize: 17, lineHeight: 25 },
  bodyM: { fontFamily: 'Manrope_400Regular', fontSize: 15, lineHeight: 22 },
  labelL: { fontFamily: 'Manrope_500Medium', fontSize: 14, lineHeight: 18 },
  labelM: { fontFamily: 'Manrope_500Medium', fontSize: 12, lineHeight: 16 },
  micro: { fontFamily: 'Manrope_600SemiBold', fontSize: 11, lineHeight: 14 },
} satisfies Record<string, TextStyle>;

/** Tabular-figure variant for numeric display (e.g. cycle day counts). */
export const tabularNums: TextStyle = { fontVariant: ['tabular-nums'] };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/theme/typographyV2.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/theme/typographyV2.ts src/theme/typographyV2.test.ts
git commit -m "feat: add v2 Manrope-only type scale"
```

---

## Task 6: `src/theme/radius.ts` — preserve legacy, add v2 shape scale

**Files:**
- Modify: `src/theme/radius.ts`
- Test: `src/theme/radius.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `radius` (unchanged legacy object, same values as before this task), `radiusV2` (new object: `xs/sm/md/lg/xl/organic/capsule`). Consumed by Task 9, 12, and by the existing barrel re-export in Task 10.

- [ ] **Step 1: Write the failing test**

Create `src/theme/radius.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { radius, radiusV2 } from './radius';

describe('radius', () => {
  it('preserves the legacy scale unchanged, so existing screens keep rendering the same', () => {
    expect(radius).toEqual({
      sm: 12,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 32,
      card: 24,
      sheet: 32,
      button: 18,
      dock: 31,
      pill: 999,
    });
  });

  it('defines the v2 shape scale from the design brief', () => {
    expect(radiusV2).toEqual({
      xs: 8,
      sm: 12,
      md: 18,
      lg: 24,
      xl: 32,
      organic: 40,
      capsule: 999,
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/theme/radius.test.ts`
Expected: FAIL — `radiusV2` is not exported (module found, but `radiusV2` is `undefined`, so the second test's `toEqual` fails).

- [ ] **Step 3: Write the implementation**

Replace the full contents of `src/theme/radius.ts`:

```ts
/**
 * Legacy radius scale (gold/amber era). Preserved verbatim so every
 * currently-shipped screen keeps rendering unchanged. Superseded by
 * `radiusV2` as each screen migrates; deleted once migration is complete.
 */
export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  card: 24,
  sheet: 32,
  button: 18,
  dock: 31,
  pill: 999,
} as const;

/**
 * v2 shape system ("Living Lunar Intelligence"). Usage guidance:
 * - data surface: 18-24 (`md`/`lg`)
 * - overlay/sheet: 28-32 (`xl`/`organic`)
 * - chips: `capsule`
 * - full-bleed section: no radius token — omit `borderRadius` entirely
 * - buttons: pick per component, don't default to `capsule`
 */
export const radiusV2 = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  organic: 40,
  capsule: 999,
} as const;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/theme/radius.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Run typecheck to confirm no existing screen broke**

Run: `npm run typecheck`
Expected: PASS — every screen importing `radius` from `@/theme` still resolves to the same shape.

- [ ] **Step 6: Commit**

```bash
git add src/theme/radius.ts src/theme/radius.test.ts
git commit -m "feat: add v2 radius scale, preserve legacy radius unchanged"
```

---

## Task 7: `src/theme/shadows.ts` — preserve legacy, add v2 three-tier depth model

**Files:**
- Modify: `src/theme/shadows.ts`
- Test: `src/theme/shadows.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `shadows` (unchanged legacy object), `shadowsV2` (new object: `base/elevated/floating`, each a `ViewStyle`). Consumed by Task 9, 12, and the barrel in Task 10.

- [ ] **Step 1: Write the failing test**

Create `src/theme/shadows.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { shadows, shadowsV2 } from './shadows';

describe('shadows', () => {
  it('preserves the legacy warm-tinted tiers unchanged', () => {
    expect(shadows.button).toEqual({
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.16,
      shadowRadius: 22,
      elevation: 4,
    });
    expect(shadows.hero.shadowColor).toBe('#785411');
  });

  it('defines a three-tier v2 depth model with no shadow on the base tier', () => {
    expect(shadowsV2.base).toEqual({});
    expect(shadowsV2.elevated.elevation as number).toBeLessThan(shadowsV2.floating.elevation as number);
  });

  it('uses a neutral-ink shadow color for v2 tiers, not the legacy warm tint', () => {
    expect(shadowsV2.elevated.shadowColor).toBe('#0B0E18');
    expect(shadowsV2.floating.shadowColor).toBe('#0B0E18');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/theme/shadows.test.ts`
Expected: FAIL — `shadowsV2` is `undefined`.

- [ ] **Step 3: Write the implementation**

Replace the full contents of `src/theme/shadows.ts`:

```ts
import { ViewStyle } from 'react-native';

const warm = '#5a3c14';

const legacyTiny: ViewStyle = {
  shadowColor: warm, shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08, shadowRadius: 8, elevation: 1,
};
const legacySoft: ViewStyle = {
  shadowColor: warm, shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.08, shadowRadius: 24, elevation: 3,
};
const legacyFloat: ViewStyle = {
  shadowColor: '#3c2814', shadowOffset: { width: 0, height: 14 },
  shadowOpacity: 0.16, shadowRadius: 34, elevation: 8,
};
const legacyHero: ViewStyle = {
  shadowColor: '#785411', shadowOffset: { width: 0, height: 18 },
  shadowOpacity: 0.14, shadowRadius: 40, elevation: 6,
};
const legacyButton: ViewStyle = {
  shadowColor: '#000000', shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.16, shadowRadius: 22, elevation: 4,
};
const legacyChip: ViewStyle = {
  shadowColor: '#785411', shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.22, shadowRadius: 14, elevation: 3,
};

/**
 * Legacy shadow tiers (gold/amber era). Preserved verbatim so every
 * currently-shipped screen keeps rendering unchanged. Superseded by
 * `shadowsV2` as each screen migrates; deleted once migration is complete.
 */
export const shadows = {
  none: {},
  tiny: legacyTiny,
  soft: legacySoft,
  float: legacyFloat,
  hero: legacyHero,
  button: legacyButton,
  chip: legacyChip,
} satisfies Record<string, ViewStyle>;

/** Neutral-ink shadow color for the v2 model, replacing the legacy warm-tinted family. */
const ink = '#0B0E18';

/**
 * v2 three-tier surface/depth model (design spec §17):
 * - base canvas: no shadow.
 * - elevated surface: short, soft shadow.
 * - floating context: reserved for navigation/contextual overlays only.
 */
export const shadowsV2 = {
  base: {} as ViewStyle,
  elevated: {
    shadowColor: ink, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10, shadowRadius: 16, elevation: 3,
  } as ViewStyle,
  floating: {
    shadowColor: ink, shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18, shadowRadius: 30, elevation: 8,
  } as ViewStyle,
} satisfies Record<string, ViewStyle>;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/theme/shadows.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Run typecheck to confirm no existing screen broke**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/theme/shadows.ts src/theme/shadows.test.ts
git commit -m "feat: add v2 shadow depth model, preserve legacy shadows unchanged"
```

---

## Task 8: `src/theme/motion.ts` — v2 duration/spring tokens

**Files:**
- Modify: `src/theme/motion.ts`
- Modify: `src/theme/motion.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `duration` (redefined shape: `instant/quick/standard/expressive/ambient` — safe to change in place, zero existing consumers confirmed by codebase grep), `springs` (unchanged: `soft`/`snappy`, still consumed by `src/app/(tabs)/_layout.tsx` and `src/components/ui/Pressable.tsx`), `springV2` (new: `responsive/fluid/gentle`), `staggerDelay` (unchanged signature, still consumed by 7 existing screens). `easing` is removed (zero consumers app-wide, confirmed by grep).

- [ ] **Step 1: Update the test file first (red)**

Replace the full contents of `src/theme/motion.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { duration, springs, springV2, staggerDelay } from './motion';

describe('motion', () => {
  it('preserves the soft and snappy spring presets unchanged (live consumers exist)', () => {
    expect(springs.soft).toEqual({ damping: 16, stiffness: 120, mass: 1 });
    expect(springs.snappy).toEqual({ damping: 14, stiffness: 180, mass: 1 });
  });

  it('defines the v2 duration scale from the design brief', () => {
    expect(duration).toEqual({
      instant: 100,
      quick: 180,
      standard: 320,
      expressive: 520,
      ambient: 2400,
    });
  });

  it('defines the v2 spring presets from the design brief', () => {
    expect(springV2.responsive).toEqual({ damping: 18, stiffness: 240, mass: 0.8 });
    expect(springV2.fluid).toEqual({ damping: 20, stiffness: 130, mass: 1 });
    expect(springV2.gentle).toEqual({ damping: 24, stiffness: 90, mass: 1.1 });
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

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/theme/motion.test.ts`
Expected: FAIL — `duration` is currently `{ instant: 120, fast: 200, base: 300, slow: 500, ambient: 1400 }` (old shape) and `springV2` is `undefined`.

- [ ] **Step 3: Write the implementation**

Replace the full contents of `src/theme/motion.ts`:

```ts
import { WithSpringConfig } from 'react-native-reanimated';

/**
 * v2 duration tokens ("Living Lunar Intelligence"). The previous
 * `duration`/`easing` shape here had zero consumers anywhere in the app
 * (confirmed by source audit), so this redefinition breaks nothing existing.
 */
export const duration = {
  instant: 100,
  quick: 180,
  standard: 320,
  expressive: 520,
  ambient: 2400,
} as const;

export const springs = {
  /** Sheets, cards, layout settles — the default "soft" feel. Live consumers: tab indicator, shared Pressable default. */
  soft: { damping: 16, stiffness: 120, mass: 1 } satisfies WithSpringConfig,
  /** Press feedback, small UI. */
  snappy: { damping: 14, stiffness: 180, mass: 1 } satisfies WithSpringConfig,
} as const;

/**
 * v2 spring presets, additive alongside `springs` (unchanged, still live).
 * Wired into real components starting Phase 2.
 */
export const springV2 = {
  responsive: { damping: 18, stiffness: 240, mass: 0.8 } satisfies WithSpringConfig,
  fluid: { damping: 20, stiffness: 130, mass: 1 } satisfies WithSpringConfig,
  gentle: { damping: 24, stiffness: 90, mass: 1.1 } satisfies WithSpringConfig,
} as const;

/** Shared per-index entrance delay so stagger timing agrees across screens. */
export function staggerDelay(index: number, base = 40): number {
  return index * base;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/theme/motion.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Run typecheck to confirm no existing screen broke**

Run: `npm run typecheck`
Expected: PASS — `src/app/(tabs)/_layout.tsx` and `src/components/ui/Pressable.tsx` still resolve `springs.soft`/`springs.snappy`; nothing imports `easing`.

- [ ] **Step 6: Commit**

```bash
git add src/theme/motion.ts src/theme/motion.test.ts
git commit -m "feat: add v2 motion duration/spring tokens, drop unused easing"
```

---

## Task 9: `src/theme/components.ts` — shared style-fragment helpers

**Files:**
- Create: `src/theme/components.ts`
- Test: `src/theme/components.test.ts`

**Interfaces:**
- Consumes: `SemanticColorSet`, `semanticColors` from `./semanticColors` (Task 3); `radiusV2` from `./radius` (Task 6); `shadowsV2` from `./shadows` (Task 7).
- Produces: `surfaceElevated(theme: SemanticColorSet): ViewStyle`, `surfaceFloating(theme: SemanticColorSet): ViewStyle`. Consumed by Task 12.

- [ ] **Step 1: Write the failing test**

Create `src/theme/components.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { surfaceElevated, surfaceFloating } from './components';
import { radiusV2 } from './radius';
import { semanticColors } from './semanticColors';

describe('components', () => {
  it('surfaceElevated builds a bordered, shadowed style from the given theme', () => {
    const style = surfaceElevated(semanticColors.dark);
    expect(style.backgroundColor).toBe(semanticColors.dark.surface.raised);
    expect(style.borderRadius).toBe(radiusV2.lg);
    expect(style.borderColor).toBe(semanticColors.dark.border.subtle);
  });

  it('surfaceFloating uses the floating surface tone and organic radius', () => {
    const style = surfaceFloating(semanticColors.light);
    expect(style.backgroundColor).toBe(semanticColors.light.surface.floating);
    expect(style.borderRadius).toBe(radiusV2.xl);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/theme/components.test.ts`
Expected: FAIL with "Cannot find module './components'".

- [ ] **Step 3: Write the implementation**

Create `src/theme/components.ts`:

```ts
import { ViewStyle } from 'react-native';

import { radiusV2 } from './radius';
import { SemanticColorSet } from './semanticColors';
import { shadowsV2 } from './shadows';

/**
 * Shared style-fragment helpers for the v2 surface/depth model (design spec
 * §17). Nothing consumes these yet — Phase 2 primitives will be the first
 * real callers.
 */
export function surfaceElevated(theme: SemanticColorSet): ViewStyle {
  return {
    backgroundColor: theme.surface.raised,
    borderRadius: radiusV2.lg,
    borderWidth: 1,
    borderColor: theme.border.subtle,
    ...shadowsV2.elevated,
  };
}

export function surfaceFloating(theme: SemanticColorSet): ViewStyle {
  return {
    backgroundColor: theme.surface.floating,
    borderRadius: radiusV2.xl,
    ...shadowsV2.floating,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/theme/components.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/theme/components.ts src/theme/components.test.ts
git commit -m "feat: add v2 surface style-fragment helpers"
```

---

## Task 10: `src/theme/index.ts` — barrel update

**Files:**
- Modify: `src/theme/index.ts`
- Test: `src/theme/index.test.ts`

**Interfaces:**
- Consumes: every export from Tasks 2-9, plus every existing export from `./palettes`, `./useTheme`, `./spacing`, `./typography`, `./sizes`.
- Produces: the full `@/theme` public surface consumed by every screen in the app (existing) and by Task 12 (new, via `@/theme`).

- [ ] **Step 1: Write the failing test**

Create `src/theme/index.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import * as themeIndex from './index';

describe('theme barrel', () => {
  it('still exports every legacy token untouched', () => {
    expect(themeIndex.palettes).toBeDefined();
    expect(themeIndex.paywallColors).toBeDefined();
    expect(themeIndex.typography).toBeDefined();
    expect(themeIndex.spacing).toBeDefined();
    expect(themeIndex.sizes).toBeDefined();
    expect(themeIndex.radius).toEqual({
      sm: 12, md: 16, lg: 20, xl: 24, xxl: 32,
      card: 24, sheet: 32, button: 18, dock: 31, pill: 999,
    });
  });

  it('exports every new v2 token', () => {
    expect(themeIndex.colors).toBeDefined();
    expect(themeIndex.semanticColors).toBeDefined();
    expect(themeIndex.gradients).toBeDefined();
    expect(themeIndex.typographyV2).toBeDefined();
    expect(themeIndex.radiusV2).toBeDefined();
    expect(themeIndex.shadowsV2).toBeDefined();
    expect(themeIndex.springV2).toBeDefined();
    expect(themeIndex.surfaceElevated).toBeDefined();
    expect(themeIndex.surfaceFloating).toBeDefined();
  });

  it('no longer exports the unused easing constant', () => {
    expect((themeIndex as Record<string, unknown>).easing).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/theme/index.test.ts`
Expected: FAIL — the new v2 exports don't exist on the barrel yet.

- [ ] **Step 3: Write the implementation**

Replace the full contents of `src/theme/index.ts`:

```ts
export { palettes, paywallColors } from './palettes';
export type { Palette, ThemeName } from './palettes';
export { useTheme } from './useTheme';
export { spacing } from './spacing';
export { typography } from './typography';
export { radius, radiusV2 } from './radius';
export { shadows, shadowsV2 } from './shadows';
export { duration, springs, springV2, staggerDelay } from './motion';
export { sizes } from './sizes';
export { colors } from './colors';
export type { ColorToken } from './colors';
export { semanticColors } from './semanticColors';
export type { SemanticColorSet } from './semanticColors';
export { gradients } from './gradients';
export type { GradientToken } from './gradients';
export { typographyV2, tabularNums } from './typographyV2';
export { surfaceElevated, surfaceFloating } from './components';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/theme/index.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Run the full theme test suite and typecheck**

Run: `npx vitest run src/theme && npm run typecheck && npm run lint`
Expected: all pass — every theme test file (Tasks 2-10) green, no type errors anywhere in the app.

- [ ] **Step 6: Commit**

```bash
git add src/theme/index.ts src/theme/index.test.ts
git commit -m "feat: export v2 tokens from the theme barrel"
```

---

## Task 11: Delete confirmed-dead components

**Files:**
- Delete: `src/components/ui/GlassCard.tsx`
- Delete: `src/components/ui/ScoreRing.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: nothing (pure removal).

- [ ] **Step 1: Re-confirm zero imports before deleting**

Run: `grep -rn "GlassCard\|ScoreRing" src --include="*.ts*" | grep -v "components/ui/GlassCard.tsx\|components/ui/ScoreRing.tsx"`
Expected: no output (already confirmed during planning research — this step re-verifies nothing changed since then).

- [ ] **Step 2: Delete the files**

```bash
git rm src/components/ui/GlassCard.tsx src/components/ui/ScoreRing.tsx
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck && npm run lint && npm test`
Expected: all pass — no import anywhere referenced these files.

- [ ] **Step 4: Commit**

```bash
git commit -m "chore: remove GlassCard and ScoreRing (confirmed 0 imports)"
```

---

## Task 12: Dev-only design showcase screen

**Files:**
- Create: `src/app/dev/design-showcase.tsx`

**Interfaces:**
- Consumes: `colors`, `semanticColors`, `SemanticColorSet`, `gradients`, `typographyV2`, `radiusV2`, `shadowsV2`, `duration`, `springV2` — all from `@/theme` (Tasks 2-10).
- Produces: the route `/dev/design-showcase`, not linked from any real navigation and not added to `src/app/_layout.tsx`'s explicit `<Stack.Screen>` list (Expo Router still serves it as an unlisted file-based route).

- [ ] **Step 1: Create the directory and screen**

Create `src/app/dev/design-showcase.tsx`:

```tsx
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  WithSpringConfig,
} from 'react-native-reanimated';

import {
  colors,
  duration,
  gradients,
  radiusV2,
  SemanticColorSet,
  semanticColors,
  shadowsV2,
  springV2,
  typographyV2,
} from '@/theme';

type ThemeMode = 'light' | 'dark';

export default function DesignShowcase() {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const theme = semanticColors[mode];

  return (
    <ScrollView
      style={{ backgroundColor: theme.background.canvas }}
      contentContainerStyle={styles.content}
    >
      <View style={styles.row}>
        <Text style={[typographyV2.titleL, { color: theme.content.primary }]}>
          Design Showcase (v2)
        </Text>
        <ThemeToggle mode={mode} onChange={setMode} theme={theme} />
      </View>

      <Section title="Colors (raw)" theme={theme}>
        <View style={styles.swatchRow}>
          {Object.entries(colors).map(([name, hex]) => (
            <Swatch key={name} label={name} color={hex} theme={theme} />
          ))}
        </View>
      </Section>

      <Section title="Semantic colors (current theme)" theme={theme}>
        <View style={styles.swatchRow}>
          <Swatch label="background.canvas" color={theme.background.canvas} theme={theme} />
          <Swatch label="background.elevated" color={theme.background.elevated} theme={theme} />
          <Swatch label="brand.primary" color={theme.brand.primary} theme={theme} />
          <Swatch label="brand.secondary" color={theme.brand.secondary} theme={theme} />
          <Swatch label="brand.accent" color={theme.brand.accent} theme={theme} />
          <Swatch label="signal.period" color={theme.signal.period} theme={theme} />
          <Swatch label="signal.warning" color={theme.signal.warning} theme={theme} />
        </View>
      </Section>

      <Section title="Gradients" theme={theme}>
        <GradientSwatch label="nightField — hierarchy" colors={gradients.nightField} theme={theme} />
        <GradientSwatch label="irisDepth — depth" colors={gradients.irisDepth} theme={theme} />
        <GradientSwatch label="aquaMist — state (recovery)" colors={gradients.aquaMist} theme={theme} />
        <GradientSwatch label="coralHalo — attention (biological)" colors={gradients.coralHalo} theme={theme} />
        <GradientSwatch label="lunarSheen — focus" colors={gradients.lunarSheen} theme={theme} />
      </Section>

      <Section title="Radius" theme={theme}>
        <View style={styles.swatchRow}>
          {Object.entries(radiusV2).map(([name, value]) => (
            <View key={name} style={styles.radiusItem}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: Math.min(value, 32),
                  backgroundColor: theme.surface.raised,
                }}
              />
              <Text style={[typographyV2.micro, { color: theme.content.tertiary }]}>
                {name} ({value})
              </Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Shadows" theme={theme}>
        <View style={styles.swatchRow}>
          {(['base', 'elevated', 'floating'] as const).map((tier) => (
            <View
              key={tier}
              style={[
                styles.shadowSample,
                { backgroundColor: theme.surface.raised },
                shadowsV2[tier],
              ]}
            >
              <Text style={[typographyV2.micro, { color: theme.content.secondary }]}>{tier}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Typography" theme={theme}>
        {Object.entries(typographyV2).map(([name, style]) => (
          <Text key={name} style={[style, { color: theme.content.primary }]}>
            {name} — Aa 123
          </Text>
        ))}
      </Section>

      <Section title="Motion" theme={theme}>
        <View style={styles.swatchRow}>
          <SpringDemo label="responsive" config={springV2.responsive} theme={theme} />
          <SpringDemo label="fluid" config={springV2.fluid} theme={theme} />
          <SpringDemo label="gentle" config={springV2.gentle} theme={theme} />
        </View>
        <DurationDemo theme={theme} />
      </Section>
    </ScrollView>
  );
}

function Section({
  title,
  theme,
  children,
}: {
  title: string;
  theme: SemanticColorSet;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={[typographyV2.labelL, { color: theme.content.secondary }]}>{title}</Text>
      {children}
    </View>
  );
}

function Swatch({ label, color, theme }: { label: string; color: string; theme: SemanticColorSet }) {
  return (
    <View style={styles.swatchItem}>
      <View
        style={[styles.swatchColor, { backgroundColor: color, borderColor: theme.border.subtle }]}
      />
      <Text style={[typographyV2.micro, { color: theme.content.tertiary }]}>{label}</Text>
    </View>
  );
}

function GradientSwatch({
  label,
  colors: stops,
  theme,
}: {
  label: string;
  colors: readonly [string, string, ...string[]];
  theme: SemanticColorSet;
}) {
  return (
    <View style={styles.gradientBlock}>
      <LinearGradient colors={stops} style={styles.gradientSwatch} />
      <Text style={[typographyV2.labelM, { color: theme.content.secondary }]}>{label}</Text>
    </View>
  );
}

function ThemeToggle({
  mode,
  onChange,
  theme,
}: {
  mode: ThemeMode;
  onChange: (mode: ThemeMode) => void;
  theme: SemanticColorSet;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Toggle light/dark preview"
      onPress={() => onChange(mode === 'dark' ? 'light' : 'dark')}
      style={[styles.toggle, { borderColor: theme.border.strong }]}
    >
      <Text style={[typographyV2.labelM, { color: theme.content.primary }]}>
        {mode === 'dark' ? 'Dark' : 'Light'}
      </Text>
    </Pressable>
  );
}

function SpringDemo({
  label,
  config,
  theme,
}: {
  label: string;
  config: WithSpringConfig;
  theme: SemanticColorSet;
}) {
  const offset = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }));

  return (
    <View style={styles.springItem}>
      <Animated.View
        style={[styles.springDot, { backgroundColor: theme.brand.primary }, animatedStyle]}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Play ${label} spring`}
        onPress={() => {
          offset.value = withSpring(offset.value === 0 ? -24 : 0, config);
        }}
        style={[styles.springButton, { borderColor: theme.border.subtle }]}
      >
        <Text style={[typographyV2.micro, { color: theme.content.secondary }]}>{label}</Text>
      </Pressable>
    </View>
  );
}

function DurationDemo({ theme }: { theme: SemanticColorSet }) {
  const width = useSharedValue(40);
  const animatedStyle = useAnimatedStyle(() => ({ width: width.value }));

  return (
    <View style={styles.durationItem}>
      <Animated.View
        style={[styles.durationBar, { backgroundColor: theme.brand.accent }, animatedStyle]}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Play duration.expressive"
        onPress={() => {
          width.value = withTiming(width.value === 40 ? 220 : 40, {
            duration: duration.expressive,
          });
        }}
        style={[styles.springButton, { borderColor: theme.border.subtle }]}
      >
        <Text style={[typographyV2.micro, { color: theme.content.secondary }]}>
          duration.expressive ({duration.expressive}ms)
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 24, paddingBottom: 80 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggle: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderRadius: 999 },
  section: { gap: 12 },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  swatchItem: { alignItems: 'center', gap: 4, width: 72 },
  swatchColor: { width: 48, height: 48, borderRadius: 12, borderWidth: 1 },
  gradientBlock: { gap: 4, marginBottom: 8 },
  gradientSwatch: { height: 64, borderRadius: 16 },
  radiusItem: { alignItems: 'center', gap: 4 },
  shadowSample: {
    width: 96,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  springItem: { alignItems: 'center', gap: 8 },
  springDot: { width: 16, height: 16, borderRadius: 8 },
  springButton: { paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderRadius: 8 },
  durationItem: { gap: 8, marginTop: 12 },
  durationBar: { height: 12, borderRadius: 6 },
});
```

- [ ] **Step 2: Typecheck and lint**

Run: `npm run typecheck && npm run lint`
Expected: both pass. If the `colors` prop on `LinearGradient` in `GradientSwatch` raises a type error, do not widen with `any` — check the exact expected type via `ComponentProps<typeof LinearGradient>['colors']` and narrow the local `colors` prop type on `GradientSwatch` to match (existing usages at `src/app/onboarding/welcome.tsx:15` and `src/features/home/HomeScreen.tsx:45` pass a `readonly [string, string, string]` tuple the same way, so this is expected to just work).

- [ ] **Step 3: Manual smoke check**

Run: `npm run web`
Then navigate the browser to `http://localhost:8081/dev/design-showcase` (or the port Expo prints).
Expected: the screen renders every color swatch, all 5 gradients, the radius samples, the 3 shadow samples, the full type scale, and the theme toggle switches every section between light/dark. Tapping a spring/duration demo button animates the corresponding element.

- [ ] **Step 4: Commit**

```bash
git add src/app/dev/design-showcase.tsx
git commit -m "feat: add dev-only v2 design token showcase screen"
```

---

## Task 13: Final verification pass

**Files:** none (verification only).

**Interfaces:** none.

- [ ] **Step 1: Full automated verification**

Run: `npm run typecheck && npm run lint && npm test`
Expected: all pass, zero errors, zero warnings introduced.

- [ ] **Step 2: Confirm no unrelated files changed**

Run: `git diff main --stat` (or `git log --oneline main..HEAD` if working on a branch off `main`)
Expected: the changed-file list matches exactly: `src/features/settings/SettingsScreen.tsx`, `src/theme/colors.ts` (+test), `src/theme/semanticColors.ts` (+test), `src/theme/gradients.ts` (+test), `src/theme/typographyV2.ts` (+test), `src/theme/radius.ts` (+test), `src/theme/shadows.ts` (+test), `src/theme/motion.ts` + `src/theme/motion.test.ts`, `src/theme/components.ts` (+test), `src/theme/index.ts` (+test), `src/components/ui/GlassCard.tsx` (deleted), `src/components/ui/ScoreRing.tsx` (deleted), `src/app/dev/design-showcase.tsx`.

- [ ] **Step 3: Manual screen-by-screen regression check**

Run: `npm run start` (or `npm run ios` / `npm run android` if a simulator is available).
For each of Home, Log, Calendar, Insights, AI Coach, Onboarding, Paywall, Settings, and the tab bar: confirm it renders exactly as before this plan, in both light and dark mode (toggle via Settings → Appearance). Confirm the Settings screen's dev premium-override row is no longer visible (or confirm it's still visible if testing in an Expo Go / dev-client build where `__DEV__` is `true` — that's expected; the requirement is that it's absent from a release build).

- [ ] **Step 4: Report**

Summarize for the user: which screens were checked, in which modes, on which platform(s) were available in this environment, and explicitly flag any platform (iOS/Android/web) that could not be manually verified due to environment limits.

(No commit — this task is verification only.)

---

## Roadmap (for context — not part of this plan)

This plan covers only Phase 0+1. Phase 2 (tab bar + Home rebuild), Phase 3 (Log + Calendar),
Phase 4 (Insights + AI Coach), Phase 5 (Onboarding + Paywall), Phase 6 (Settings), and Phase 7
(cross-cutting polish + legacy token removal) each get their own brainstorm → spec → plan cycle,
per `docs/superpowers/specs/2026-07-14-living-lunar-intelligence-foundation-design.md` §7.
