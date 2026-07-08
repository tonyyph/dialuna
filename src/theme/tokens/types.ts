export interface PhaseColors {
  menstrual: string;
  follicular: string;
  ovulation: string;
  luteal: string;
}

export interface ThemeTokens {
  // Core hues — semantic names derived from the app icon's palette.
  deepMidnight: string;
  royalViolet: string;
  lavender: string;
  primary: string;
  primaryPressed: string;
  lilac: string;
  moonWhite: string;
  pearl: string;
  champagneGold: string;
  softPeach: string;
  auroraBlue: string;
  ovulationBlue: string;
  roseDeep: string;
  peachDeep: string;
  mint: string;
  error: string;
  softRose: string;
  card: string;
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  border: string;
  overlay: string;
  glass: string;
  glassStrong: string;
  glassBorder: string;
  divider: string;

  phase: PhaseColors;
  phaseSoft: PhaseColors;
  gradients: {
    app: readonly [string, string];
    hero: readonly [string, string];
    night: readonly [string, string];
    aqua: readonly [string, string];
    gold: readonly [string, string];
    glass: readonly [string, string];
    pearl: readonly [string, string, string];
  };
  surface: {
    background: string;
    card: string;
    elevated: string;
    glass: string;
    glassStrong: string;
    overlay: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    onDark: string;
  };
  semantic: {
    success: string;
    warning: string;
    danger: string;
    info: string;
  };
}
