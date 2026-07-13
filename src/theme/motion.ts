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
