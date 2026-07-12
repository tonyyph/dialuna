import { TextStyle } from 'react-native';

/**
 * Type scale per the 2026-07 design handoff. No colors here — text color
 * always comes from useTheme() at the usage site.
 */
export const typography = {
  display: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 42, lineHeight: 46 },
  hero: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 34, lineHeight: 38 },
  headline: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 28, lineHeight: 33 },
  headlineSm: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 24, lineHeight: 28 },
  title: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 19, lineHeight: 24 },
  score: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 32, lineHeight: 34 },
  serifValue: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 20, lineHeight: 24 },
  subtitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 15, lineHeight: 20 },
  body: { fontFamily: 'Manrope_400Regular', fontSize: 14, lineHeight: 21 },
  bodySmall: { fontFamily: 'Manrope_400Regular', fontSize: 13, lineHeight: 19 },
  caption: { fontFamily: 'Manrope_500Medium', fontSize: 12, lineHeight: 16 },
  kicker: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  micro: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  button: { fontFamily: 'Manrope_600SemiBold', fontSize: 14, lineHeight: 18 },
} satisfies Record<string, TextStyle>;
