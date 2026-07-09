import { useMemo } from 'react';

import { useThemeStore } from '@/store/themeStore';

import { applyAccent } from './accents';
import { shadows as shadowShapes, ShadowTokens } from './shadows';
import { darkTokens } from './tokens/dark';
import { lightTokens } from './tokens/light';
import { ThemeTokens } from './tokens/types';
import { buildTypography, TypographyTokens } from './typography';

interface UseThemeResult {
  colors: ThemeTokens;
  typography: TypographyTokens;
  shadows: ShadowTokens;
  mode: 'dark' | 'light';
  reduceMotion: boolean;
}

export function useTheme(): UseThemeResult {
  const mode = useThemeStore((s) => s.mode);
  const accent = useThemeStore((s) => s.accent);
  const reduceMotion = useThemeStore((s) => s.reduceMotion);

  return useMemo(() => {
    const base = mode === 'dark' ? darkTokens : lightTokens;
    const colors = applyAccent(base, accent);
    const typography = buildTypography(colors);
    const shadows = {
      ...shadowShapes,
      glow: { ...shadowShapes.glow, shadowColor: colors.primary },
      bloom: {
        ...shadowShapes.bloom,
        shadowColor: mode === 'dark' ? colors.royalViolet : colors.lilac,
      },
    };
    return { colors, typography, shadows, mode, reduceMotion };
  }, [mode, accent, reduceMotion]);
}
