import { ThemeTokens } from './tokens/types';

export type AccentKey = 'lavender' | 'rose' | 'auroraBlue';

export const accentPairs: Record<AccentKey, { secondary: string; primary: string }> = {
  lavender: { secondary: '#8B6FE8', primary: '#B9A6F2' },
  rose: { secondary: '#E87A97', primary: '#F5B8C4' },
  auroraBlue: { secondary: '#5AA9E6', primary: '#8FD2F2' },
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
