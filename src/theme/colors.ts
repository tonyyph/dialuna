const base = {
  primary: '#FF6B8A',
  softRose: '#FFE4EA',
  lavender: '#B99CFF',
  deepPlum: '#2A1438',
  cream: '#FFF8F2',
  card: '#FFFFFF',
  textPrimary: '#221326',
  textSecondary: '#7A667F',
  mint: '#6ED6B5',
  peach: '#FFB86B',
  error: '#F45B69',

  background: '#FFF8F2',
  border: 'rgba(122, 102, 127, 0.15)',
  overlay: 'rgba(42, 20, 56, 0.5)',
  glass: 'rgba(255, 255, 255, 0.72)',
  divider: 'rgba(122, 102, 127, 0.12)',
} as const;

export const colors = {
  ...base,

  phase: {
    menstrual: '#FF6B8A',
    follicular: '#6ED6B5',
    ovulation: '#FFB86B',
    luteal: '#B99CFF',
  },
  phaseSoft: {
    menstrual: '#FFE4EA',
    follicular: '#E2F7EF',
    ovulation: '#FFF0DE',
    luteal: '#F0E9FF',
  },

  surface: {
    background: base.background,
    card: base.card,
    elevated: base.card,
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
