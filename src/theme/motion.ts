import { Easing, WithSpringConfig } from 'react-native-reanimated';

export const duration = {
  instant: 100,
  quick: 180,
  standard: 320,
  expressive: 520,
  ambient: 2400,
  fast: 180,
  base: 320,
  slow: 520,
} as const;

export const easing = {
  standard: Easing.out(Easing.cubic),
  responsive: { damping: 18, stiffness: 240, mass: 0.8 } satisfies WithSpringConfig,
  fluid: { damping: 20, stiffness: 130, mass: 1 } satisfies WithSpringConfig,
  gentle: { damping: 24, stiffness: 90, mass: 1.1 } satisfies WithSpringConfig,
  spring: { damping: 20, stiffness: 130, mass: 1 } satisfies WithSpringConfig,
} as const;
