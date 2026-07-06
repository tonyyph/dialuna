import { ViewStyle } from 'react-native';
import { colors } from './colors';

export const shadows = {
  none: {},
  xs: {
    shadowColor: colors.deepPlum,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.035,
    shadowRadius: 5,
    elevation: 1,
  },
  sm: {
    shadowColor: colors.deepPlum,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.055,
    shadowRadius: 14,
    elevation: 2,
  },
  md: {
    shadowColor: colors.deepPlum,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 22,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.deepPlum,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.09,
    shadowRadius: 34,
    elevation: 6,
  },
  glow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 4,
  },
} satisfies Record<string, ViewStyle>;

// Deprecated alias — Card.tsx is the sole remaining consumer of the old
// `shadows.card` name; migrate it to `sm` directly when Card is next touched,
// then delete this.
export const legacyShadowAliases = {
  card: shadows.sm,
} satisfies Record<string, ViewStyle>;

// Widened to `ViewStyle` (not `typeof shadows`) because `colors.ts` is
// declared `as const`, which would otherwise lock `glow.shadowColor` to the
// literal `'#D9467D'` — incompatible with useTheme.ts overriding it with the
// resolved (mode/accent-dependent) `colors.primary: string`.
export type ShadowTokens = Record<keyof typeof shadows, ViewStyle>;
