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

// Deprecated alias — Card.tsx is the sole remaining consumer of the old
// `shadows.card` name; migrate it to `sm` directly when Card is next touched,
// then delete this.
export const legacyShadowAliases = {
  card: shadows.sm,
} satisfies Record<string, ViewStyle>;
