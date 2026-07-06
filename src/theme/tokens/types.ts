export interface PhaseColors {
  menstrual: string;
  follicular: string;
  ovulation: string;
  luteal: string;
}

export interface ThemeTokens {
  // Legacy flat keys — preserved 1:1 from Foundation v1 / feat/mascot-handoff
  // so every existing call site keeps compiling after the access-pattern
  // migration (Tasks 4-6).
  primary: string;
  primaryPressed: string;
  coral: string;
  iris: string;
  aqua: string;
  gold: string;
  berry: string;
  softRose: string;
  lavender: string;
  deepPlum: string;
  cream: string;
  blush: string;
  pearl: string;
  card: string;
  textPrimary: string;
  textSecondary: string;
  mint: string;
  peach: string;
  error: string;
  background: string;
  border: string;
  overlay: string;
  glass: string;
  glassStrong: string;
  glassBorder: string;
  divider: string;

  // New Aurora Night named keys — used by new components (LunaOrb,
  // AuroraBackground, ProgressRing, tab bar v2). Not accent-reactive
  // (except via `primary`/`lavender` above) — see accents.ts.
  night: string;
  nightElevated: string;
  lavenderLight: string;
  auroraBlue: string;
  roseDeep: string;
  peachDeep: string;
  ovulationBlue: string;
  textDisabled: string;
  /** Fixed Luna Orb illustration details — same value in both modes, never accent-reactive. */
  lunaEyeColor: string;
  lunaShadowColor: string;

  phase: PhaseColors;
  phaseSoft: PhaseColors;
  gradients: {
    app: readonly [string, string];
    hero: readonly [string, string];
    night: readonly [string, string];
    aqua: readonly [string, string];
    gold: readonly [string, string];
    glass: readonly [string, string];
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
