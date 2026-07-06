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
