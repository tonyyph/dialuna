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
