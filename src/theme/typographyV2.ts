import { TextStyle } from 'react-native';

/**
 * Manrope-only type scale for the "Living Lunar Intelligence" redesign (v2).
 * No screen consumes this yet — the existing `typography.ts` (Cormorant
 * Garamond) stays live until each screen migrates in a later phase.
 */
export const typographyV2 = {
  displayXL: { fontFamily: 'Manrope_700Bold', fontSize: 52, lineHeight: 54 },
  displayL: { fontFamily: 'Manrope_700Bold', fontSize: 42, lineHeight: 46 },
  titleXL: { fontFamily: 'Manrope_600SemiBold', fontSize: 32, lineHeight: 37 },
  titleL: { fontFamily: 'Manrope_600SemiBold', fontSize: 26, lineHeight: 32 },
  titleM: { fontFamily: 'Manrope_600SemiBold', fontSize: 21, lineHeight: 27 },
  bodyL: { fontFamily: 'Manrope_400Regular', fontSize: 17, lineHeight: 25 },
  bodyM: { fontFamily: 'Manrope_400Regular', fontSize: 15, lineHeight: 22 },
  labelL: { fontFamily: 'Manrope_500Medium', fontSize: 14, lineHeight: 18 },
  labelM: { fontFamily: 'Manrope_500Medium', fontSize: 12, lineHeight: 16 },
  micro: { fontFamily: 'Manrope_600SemiBold', fontSize: 11, lineHeight: 14 },
} satisfies Record<string, TextStyle>;

/** Tabular-figure variant for numeric display (e.g. cycle day counts). */
export const tabularNums: TextStyle = { fontVariant: ['tabular-nums'] };
