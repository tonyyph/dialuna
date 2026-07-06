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
    displayXl: { ...base, fontFamily: 'Fraunces_600SemiBold', fontSize: 32, lineHeight: 34, letterSpacing: -0.4 },
    displayL: { ...base, fontFamily: 'Fraunces_600SemiBold', fontSize: 28, lineHeight: 31 },
    headline: { ...base, fontFamily: 'DMSans_700Bold', fontSize: 22, lineHeight: 29 },
    title: { ...base, fontFamily: 'DMSans_600SemiBold', fontSize: 18, lineHeight: 25 },
    subtitle: { ...base, fontFamily: 'DMSans_600SemiBold', fontSize: 16, lineHeight: 24 },
    bodyLarge: { ...base, fontFamily: 'DMSans_400Regular', fontSize: 15, lineHeight: 23 },
    body: { ...base, fontFamily: 'DMSans_400Regular', fontSize: 14, lineHeight: 22, color: colors.textSecondary },
    caption: { ...base, fontFamily: 'DMSans_500Medium', fontSize: 12, lineHeight: 18, letterSpacing: 0.7, color: colors.textSecondary },
    micro: { ...base, fontFamily: 'DMSans_600SemiBold', fontSize: 10, lineHeight: 14, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.textSecondary },
    button: { fontFamily: 'DMSans_600SemiBold', fontSize: 14, lineHeight: 17 },
  };
}
