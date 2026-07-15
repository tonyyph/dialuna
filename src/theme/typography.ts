import { TextStyle } from 'react-native';

/**
 * Type scale per the 2026-07 design handoff. No colors here — text color
 * always comes from useTheme() at the usage site.
 */
export const typography = {
  displayXL: { fontFamily: 'Manrope_600SemiBold', fontSize: 52, lineHeight: 56 },
  displayL: { fontFamily: 'Manrope_600SemiBold', fontSize: 42, lineHeight: 47 },
  titleXL: { fontFamily: 'Manrope_600SemiBold', fontSize: 32, lineHeight: 38 },
  titleL: { fontFamily: 'Manrope_600SemiBold', fontSize: 26, lineHeight: 32 },
  titleM: { fontFamily: 'Manrope_600SemiBold', fontSize: 21, lineHeight: 27 },
  bodyL: { fontFamily: 'Manrope_400Regular', fontSize: 17, lineHeight: 25 },
  bodyM: { fontFamily: 'Manrope_400Regular', fontSize: 15, lineHeight: 22 },
  labelL: { fontFamily: 'Manrope_600SemiBold', fontSize: 14, lineHeight: 18 },
  labelM: { fontFamily: 'Manrope_500Medium', fontSize: 12, lineHeight: 16 },
  display: { fontFamily: 'Manrope_600SemiBold', fontSize: 42, lineHeight: 47 },
  hero: { fontFamily: 'Manrope_600SemiBold', fontSize: 32, lineHeight: 38 },
  headline: { fontFamily: 'Manrope_600SemiBold', fontSize: 26, lineHeight: 32 },
  headlineSm: { fontFamily: 'Manrope_600SemiBold', fontSize: 21, lineHeight: 27 },
  title: { fontFamily: 'Manrope_600SemiBold', fontSize: 19, lineHeight: 25 },
  score: { fontFamily: 'Manrope_600SemiBold', fontSize: 32, lineHeight: 38 },
  serifValue: { fontFamily: 'Manrope_600SemiBold', fontSize: 20, lineHeight: 24 },
  subtitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 15, lineHeight: 20 },
  body: { fontFamily: 'Manrope_400Regular', fontSize: 15, lineHeight: 22 },
  bodySmall: { fontFamily: 'Manrope_400Regular', fontSize: 14, lineHeight: 20 },
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
