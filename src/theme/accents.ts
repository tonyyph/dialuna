import { ThemeTokens } from './tokens/types';

export type AccentKey = 'lavender' | 'rose' | 'auroraBlue';

export const accentPairs: Record<AccentKey, { secondary: string; primary: string }> = {
  lavender: { secondary: '#287B7A', primary: '#76D1C5' },
  rose: { secondary: '#B85E73', primary: '#D46A86' },
  auroraBlue: { secondary: '#5C93D3', primary: '#82B6E8' },
};

/**
 * Overrides only the "current accent" slot (primary/primaryPressed/lavender/
 * gradients.hero). Phase colors and the new fixed named hues (auroraBlue,
 * roseDeep, etc.) are never touched — they represent specific hues, not the
 * user's accent choice.
 */
export function applyAccent(tokens: ThemeTokens, accent: AccentKey): ThemeTokens {
  const { secondary, primary } = accentPairs[accent];
  return {
    ...tokens,
    primary,
    primaryPressed: secondary,
    lavender: secondary,
    gradients: {
      ...tokens.gradients,
      hero: [primary, secondary],
    },
  };
}
