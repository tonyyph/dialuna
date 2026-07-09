import { TextStyle } from 'react-native';
import { ThemeTokens } from './tokens/types';

export interface TypographyTokens {
  displayXl: TextStyle;
  displayL: TextStyle;
  headline: TextStyle;
  title: TextStyle;
  subtitle: TextStyle;
  bodyLarge: TextStyle;
  body: TextStyle;
  caption: TextStyle;
  micro: TextStyle;
  button: TextStyle;
}

export function buildTypography(colors: ThemeTokens): TypographyTokens {
  const base: TextStyle = { color: colors.textPrimary };
  return {
    displayXl: { ...base, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 40, lineHeight: 43, letterSpacing: 0 },
    displayL: { ...base, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 32, lineHeight: 36, letterSpacing: 0 },
    headline: { ...base, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 22, lineHeight: 30, letterSpacing: 0 },
    title: { ...base, fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 18, lineHeight: 25 },
    subtitle: { ...base, fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 16, lineHeight: 24 },
    bodyLarge: { ...base, fontFamily: 'PlusJakartaSans_400Regular', fontSize: 16, lineHeight: 25 },
    body: { ...base, fontFamily: 'PlusJakartaSans_400Regular', fontSize: 15, lineHeight: 24, color: colors.textSecondary },
    caption: { ...base, fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, lineHeight: 18, letterSpacing: 0, color: colors.textSecondary },
    micro: { ...base, fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11, lineHeight: 15, letterSpacing: 0, textTransform: 'uppercase', color: colors.textSecondary },
    button: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, lineHeight: 17 },
  };
}
