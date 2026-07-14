import { colors } from './colors';

export interface SemanticColorSet {
  background: {
    canvas: string;
    elevated: string;
    inverse: string;
  };
  content: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  brand: {
    primary: string;
    secondary: string;
    accent: string;
  };
  signal: {
    period: string;
    fertile: string;
    ovulation: string;
    recovery: string;
    warning: string;
  };
  border: {
    subtle: string;
    strong: string;
  };
  surface: {
    default: string;
    raised: string;
    floating: string;
    selected: string;
  };
}

const light: SemanticColorSet = {
  background: {
    canvas: colors.porcelain50,
    elevated: colors.porcelain100,
    inverse: colors.midnight900,
  },
  content: {
    primary: colors.deepInk,
    secondary: colors.slateText,
    tertiary: colors.silverMist,
    inverse: colors.moonWhite,
  },
  brand: {
    primary: colors.iris500,
    secondary: colors.aqua500,
    accent: colors.iris600,
  },
  signal: {
    period: colors.coral500,
    fertile: colors.iris400,
    ovulation: colors.aqua400,
    recovery: colors.aqua500,
    warning: colors.warning,
  },
  border: {
    subtle: 'rgba(24,26,36,0.08)',
    strong: 'rgba(24,26,36,0.16)',
  },
  surface: {
    default: colors.porcelain100,
    raised: colors.porcelain50,
    floating: 'rgba(250,250,248,0.88)',
    selected: 'rgba(124,92,252,0.12)',
  },
};

const dark: SemanticColorSet = {
  background: {
    canvas: colors.midnight900,
    elevated: colors.midnight850,
    inverse: colors.porcelain50,
  },
  content: {
    primary: colors.moonWhite,
    secondary: colors.silverMist,
    tertiary: colors.slateText,
    inverse: colors.deepInk,
  },
  brand: {
    primary: colors.iris400,
    secondary: colors.aqua400,
    accent: colors.iris300,
  },
  signal: {
    period: colors.coral400,
    fertile: colors.iris300,
    ovulation: colors.aqua300,
    recovery: colors.aqua400,
    warning: colors.warning,
  },
  border: {
    subtle: 'rgba(255,255,255,0.08)',
    strong: 'rgba(255,255,255,0.16)',
  },
  surface: {
    default: colors.midnight850,
    raised: colors.midnight800,
    floating: 'rgba(16,20,33,0.88)',
    selected: 'rgba(156,131,255,0.16)',
  },
};

/**
 * Initial signal-color mapping (period/fertile/ovulation/recovery/warning) is
 * a starting point — not wired to any screen yet. Revisit per-screen in
 * Phase 3/4 when Calendar and Insights actually consume these.
 */
export const semanticColors: Record<'light' | 'dark', SemanticColorSet> = { light, dark };
