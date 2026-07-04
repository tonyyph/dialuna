import { ViewStyle } from 'react-native';
import { colors } from './colors';

export const shadows = {
  soft: {
    shadowColor: colors.deepPlum,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 3,
  },
  card: {
    shadowColor: colors.deepPlum,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
} satisfies Record<string, ViewStyle>;
