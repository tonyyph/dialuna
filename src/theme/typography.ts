import { TextStyle } from 'react-native';
import { colors } from './colors';

const base: TextStyle = { color: colors.textPrimary };

export const typography = {
  display: {
    ...base,
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.2,
  },
  headline: {
    ...base,
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 26,
    lineHeight: 32,
  },
  title: {
    ...base,
    fontFamily: 'DMSans_700Bold',
    fontSize: 20,
    lineHeight: 26,
  },
  subtitle: {
    ...base,
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 17,
    lineHeight: 22,
  },
  body: {
    ...base,
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 23,
  },
  bodySmall: {
    ...base,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  caption: {
    ...base,
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.1,
    color: colors.textSecondary,
  },
  micro: {
    ...base,
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },
  button: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
    lineHeight: 20,
  },
} satisfies Record<string, TextStyle>;
