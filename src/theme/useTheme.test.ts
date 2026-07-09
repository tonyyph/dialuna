import { describe, expect, it } from 'vitest';
import { applyAccent } from './accents';
import { darkTokens } from './tokens/dark';
import { lightTokens } from './tokens/light';
import { buildTypography } from './typography';

describe('theme resolution', () => {
  it('dark mode + lavender accent resolves textPrimary/deepMidnight correctly', () => {
    const colors = applyAccent(darkTokens, 'lavender');
    expect(colors.deepMidnight).toBe('#0E0920');
    expect(colors.textPrimary).toBe('#F4F1FB');
  });

  it('light mode resolves a light deepMidnight regardless of accent', () => {
    const colors = applyAccent(lightTokens, 'rose');
    expect(colors.deepMidnight).toBe('#FBF7FF');
    expect(colors.primary).toBe('#F5B8C4');
  });

  it('typography.body color matches the resolved textSecondary', () => {
    const colors = applyAccent(darkTokens, 'lavender');
    const typography = buildTypography(colors);
    expect(typography.body.color).toBe(colors.textSecondary);
    expect(typography.headline.color).toBe(colors.textPrimary);
  });
});
