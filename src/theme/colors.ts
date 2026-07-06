const base = {
  primary: '#D9467D',
  primaryPressed: '#C8336B',
  coral: '#FF7A6F',
  iris: '#7257E8',
  aqua: '#26B6A0',
  gold: '#F4B84A',
  berry: '#8F2D56',
  softRose: '#FFE3EE',
  lavender: '#A98BFF',
  deepPlum: '#24112F',
  cream: '#FFF7EC',
  blush: '#FFF0F7',
  pearl: '#FFFCF8',
  card: '#FFFFFF',
  textPrimary: '#231328',
  textSecondary: '#715E75',
  mint: '#4FC8A5',
  peach: '#FFB066',
  error: '#D95767',

  background: '#FFF7F0',
  border: 'rgba(115, 83, 125, 0.16)',
  overlay: 'rgba(36, 17, 47, 0.48)',
  glass: 'rgba(255, 255, 255, 0.66)',
  glassStrong: 'rgba(255, 255, 255, 0.88)',
  glassBorder: 'rgba(255, 255, 255, 0.76)',
  divider: 'rgba(115, 83, 125, 0.12)',
} as const;

export const colors = {
  ...base,

  phase: {
    menstrual: base.primary,
    follicular: base.aqua,
    ovulation: base.gold,
    luteal: base.iris,
  },
  phaseSoft: {
    menstrual: '#FFE4EF',
    follicular: '#DDF8F1',
    ovulation: '#FFF1D2',
    luteal: '#EEE8FF',
  },
  gradients: {
    app: ['#FFF1F7', '#FFF7EC', '#F4F0FF'] as const,
    hero: ['#FF7A6F', '#D9467D', '#7257E8'] as const,
    night: ['#24112F', '#5D2C80', '#D9467D'] as const,
    aqua: ['#26B6A0', '#A3E7D6'] as const,
    gold: ['#F4B84A', '#FFE3A3'] as const,
    glass: ['rgba(255,255,255,0.78)', 'rgba(255,255,255,0.28)'] as const,
  },

  surface: {
    background: base.background,
    card: base.card,
    elevated: base.pearl,
    glass: base.glass,
    glassStrong: base.glassStrong,
    overlay: base.overlay,
  },
  text: {
    primary: base.textPrimary,
    secondary: base.textSecondary,
    tertiary: '#B3A3B8',
    onDark: base.cream,
  },
  semantic: {
    success: base.mint,
    warning: base.peach,
    danger: base.error,
    info: base.lavender,
  },
} as const;

export type PhaseColorKey = keyof typeof colors.phase;
