import { TextStyle } from 'react-native';
import { colors } from './colors';

const base: TextStyle = { color: colors.textPrimary };

export const typography = {
  display: {
    ...base,
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 41,
    letterSpacing: 0.2,
  },
  h1: { ...base, fontSize: 28, fontWeight: '700', lineHeight: 34 },
  h2: { ...base, fontSize: 22, fontWeight: '600', lineHeight: 28 },
  h3: { ...base, fontSize: 17, fontWeight: '600', lineHeight: 22 },
  body: { ...base, fontSize: 16, fontWeight: '400', lineHeight: 23 },
  bodySmall: {
    ...base,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: colors.textSecondary,
  },
  caption: {
    ...base,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: colors.textSecondary,
  },
  button: { fontSize: 16, fontWeight: '600', lineHeight: 20 },
} satisfies Record<string, TextStyle>;
