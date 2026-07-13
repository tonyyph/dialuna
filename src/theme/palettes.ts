import type { CyclePhase } from '@/types';

export type ThemeName = 'light' | 'dark';

export interface Palette {
  name: ThemeName;
  /** Full-screen warm background gradient (top → bottom). */
  bgGradient: readonly [string, string, string];
  /** Today hero panel gradient. */
  heroGradient: readonly [string, string, string];
  /** Selected chip fill gradient (gold). */
  goldChipGradient: readonly [string, string];
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
  shadowColor: string;
}

const ramp = {
  accent100: '#fff3e4',
  accent200: '#ffe3bf',
  accent300: '#facb8d',
  accent400: '#e1ad66',
  accent500: '#c28d41',
  accent600: '#a06f24',
  accent700: '#7d5411',
  accent800: '#5a3b0a',
  accent900: '#3a270d',
} as const;

const light: Palette = {
  name: 'light',
  bgGradient: ['#fbf3ec', '#f7ecee', '#f1e9f0'],
  heroGradient: ['#fff3e4', '#fbf3ec', '#f6ecf1'],
  goldChipGradient: ['#facb8d', '#ffe3bf'],
  premiumBannerGradient: ['#2c2620', '#3a2f22'],
  text: '#201f1d',
  textMuted: 'rgba(32,31,29,0.65)',
  textFaint: 'rgba(32,31,29,0.5)',
  surface: 'rgba(255,255,255,0.55)',
  surfaceStrong: 'rgba(255,255,255,0.7)',
  surfaceSolid: '#fffdfb',
  fillSubtle: 'rgba(0,0,0,0.05)',
  track: 'rgba(0,0,0,0.06)',
  overlay: 'rgba(32,24,16,0.45)',
  accent: '#b68235',
  accentInk: '#7d5411',
  ...ramp,
  primaryBtn: '#2d2b2b',
  onPrimaryBtn: '#fbf3ec',
  danger: '#b3453c',
  success: '#7d5411',
  phase: {
    menstrual: '#e1ad66',
    follicular: '#c28d41',
    ovulation: '#b68235',
    luteal: '#7d5411',
  },
  phaseSoft: {
    menstrual: '#fff3e4',
    follicular: '#ffe3bf',
    ovulation: '#facb8d',
    luteal: '#f0e4d3',
  },
  shadowColor: '#5a3c14',
};

const dark: Palette = {
  name: 'dark',
  bgGradient: ['#211d24', '#1f1b21', '#1c1a1f'],
  heroGradient: ['#2c2530', '#241f27', '#221d24'],
  goldChipGradient: ['#c28d41', '#a06f24'],
  premiumBannerGradient: ['#2c2620', '#3a2f22'],
  text: '#f3f2f2',
  textMuted: 'rgba(243,242,242,0.65)',
  textFaint: 'rgba(243,242,242,0.5)',
  surface: 'rgba(255,255,255,0.07)',
  surfaceStrong: 'rgba(255,255,255,0.12)',
  surfaceSolid: '#2b272e',
  fillSubtle: 'rgba(255,255,255,0.08)',
  track: 'rgba(255,255,255,0.1)',
  overlay: 'rgba(0,0,0,0.6)',
  accent: '#e1ad66',
  accentInk: '#facb8d',
  ...ramp,
  primaryBtn: '#f3f2f2',
  onPrimaryBtn: '#201f1d',
  danger: '#e08079',
  success: '#facb8d',
  phase: {
    menstrual: '#e1ad66',
    follicular: '#c28d41',
    ovulation: '#facb8d',
    luteal: '#a06f24',
  },
  phaseSoft: {
    menstrual: 'rgba(225,173,102,0.2)',
    follicular: 'rgba(194,141,65,0.2)',
    ovulation: 'rgba(250,203,141,0.22)',
    luteal: 'rgba(160,111,36,0.2)',
  },
  shadowColor: '#000000',
};

export const palettes: Record<ThemeName, Palette> = { light, dark };

/** The paywall is always dark, independent of app theme. */
export const paywallColors = {
  bg: '#1f1c18',
  text: '#f4ede1',
  textDim: 'rgba(244,237,225,0.65)',
  textFaint: 'rgba(244,237,225,0.55)',
  segment: 'rgba(244,237,225,0.25)',
  border: 'rgba(244,237,225,0.2)',
  closeFill: 'rgba(255,255,255,0.1)',
  accent: '#b68235',
  accentTint: 'rgba(182,130,53,0.14)',
  badge: '#5a3b0a',
  ctaText: '#1a1712',
} as const;
