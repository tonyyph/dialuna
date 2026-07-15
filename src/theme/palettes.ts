import type { CyclePhase } from '@/types';
import { gradients } from './gradients';
import { rawColors as r } from './rawColors';
import { semanticColors } from './semanticColors';

export type ThemeName = 'light' | 'dark';

export interface Palette {
  name: ThemeName;
  /** Full-screen canvas gradient (top → bottom). */
  bgGradient: readonly [string, string, string];
  /** Today hero panel gradient. */
  heroGradient: readonly [string, string, string];
  /** Premium banner dark gradient. */
  premiumBannerGradient: readonly [string, string];
  text: string;
  textMuted: string;
  textFaint: string;
  /** Soft translucent card fill. */
  surface: string;
  /** Stronger translucent fill: inputs, circular buttons, dock. */
  surfaceStrong: string;
  /** Opaque light surface: floating badge, stepper buttons. */
  surfaceSolid: string;
  /** Subtle contrast fill: segmented controls, tertiary buttons. */
  fillSubtle: string;
  /** Progress/track background. */
  track: string;
  overlay: string;
  accent: string;
  /** Accent-toned ink that stays readable on the theme's surfaces. */
  accentInk: string;
  accent100: string;
  accent200: string;
  accent300: string;
  accent400: string;
  accent500: string;
  accent600: string;
  accent700: string;
  accent800: string;
  accent900: string;
  /** Primary button fill + label color on it. */
  primaryBtn: string;
  onPrimaryBtn: string;
  danger: string;
  success: string;
  phase: Record<CyclePhase, string>;
  phaseSoft: Record<CyclePhase, string>;
}

const ramp = {
  accent100: '#F1EEFF', accent200: '#E1DBFF', accent300: r.violet300,
  accent400: r.violet400, accent500: r.violet500, accent600: r.violet600,
  accent700: r.violet700, accent800: '#3D268D', accent900: '#281A62',
} as const;

const light: Palette = {
  name: 'light',
  bgGradient: gradients.lightCanvas, heroGradient: ['#ECE8FF', '#F6F4FD', '#E8F7F4'],
  premiumBannerGradient: gradients.membership,
  text: semanticColors.light.primary, textMuted: semanticColors.light.secondary, textFaint: semanticColors.light.tertiary,
  surface: semanticColors.light.embedded, surfaceStrong: semanticColors.light.raised,
  surfaceSolid: semanticColors.light.elevated, fillSubtle: '#ECEAF1', track: '#E4E1EA',
  overlay: '#07081299', accent: semanticColors.light.brand, accentInk: r.violet700,
  ...ramp,
  primaryBtn: r.violet600, onPrimaryBtn: r.textOnDark, danger: r.danger, success: r.success,
  phase: {
    menstrual: r.coral500, follicular: r.aqua500, ovulation: r.violet500, luteal: r.violet700,
  },
  phaseSoft: {
    menstrual: '#FFE9E4', follicular: '#DDF7F3', ovulation: '#ECE8FF', luteal: '#E4DFF6',
  },
};

const dark: Palette = {
  name: 'dark',
  bgGradient: gradients.darkCanvas, heroGradient: [r.night850, '#15142A', '#101D25'],
  premiumBannerGradient: gradients.membership,
  text: semanticColors.dark.primary, textMuted: semanticColors.dark.secondary, textFaint: semanticColors.dark.tertiary,
  surface: semanticColors.dark.embedded, surfaceStrong: semanticColors.dark.raised,
  surfaceSolid: semanticColors.dark.elevated, fillSubtle: '#171C2C', track: '#252B3D',
  overlay: '#000000A6', accent: semanticColors.dark.brand, accentInk: r.violet300,
  ...ramp,
  primaryBtn: r.violet400, onPrimaryBtn: r.night950, danger: r.danger, success: r.success,
  phase: {
    menstrual: r.coral400, follicular: r.aqua400, ovulation: r.violet300, luteal: r.violet500,
  },
  phaseSoft: {
    menstrual: '#3C2028', follicular: '#163637', ovulation: '#2B2546', luteal: '#231E3B',
  },
};

export const palettes: Record<ThemeName, Palette> = { light, dark };

/** The paywall is always dark, independent of app theme. */
export const paywallColors = {
  bg: r.night950,
  text: r.textOnDark,
  textDim: r.textMutedDark,
  textFaint: r.textFaintDark,
  segment: r.night700,
  border: r.night700,
  closeFill: 'rgba(255,255,255,0.1)',
  accent: r.violet400,
  accentTint: '#282442',
  badge: r.violet700,
  ctaText: r.night950,
  gradient: gradients.membership,
  intelligence: r.aqua400,
  biological: r.coral400,
  orbit: '#A38CFF66',
  core: '#A38CFF33',
} as const;
