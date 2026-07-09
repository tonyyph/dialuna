import { ViewStyle } from 'react-native';

export const shadows = {
  none: {},
  xs: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.035,
    shadowRadius: 5,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.055,
    shadowRadius: 14,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 22,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.09,
    shadowRadius: 34,
    elevation: 6,
  },
  glow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 4,
  },
  bloom: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 28,
    elevation: 5,
  },
} satisfies Record<string, ViewStyle>;

// Deprecated alias — Card.tsx is the sole remaining consumer of the old
// `shadows.card` name; migrate it to `sm` directly when Card is next touched,
// then delete this.
export const legacyShadowAliases = {
  card: shadows.sm,
} satisfies Record<string, ViewStyle>;

// Widened to `ViewStyle` (not `typeof shadows`) so `useTheme.ts` can override
// `glow.shadowColor` with the resolved (mode/accent-dependent)
// `colors.primary: string` without a literal-type mismatch.
export type ShadowTokens = Record<keyof typeof shadows, ViewStyle>;
