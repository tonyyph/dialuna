import { describe, expect, it } from 'vitest';
import { applyAccent } from './accents';
import { darkTokens } from './tokens/dark';
import { lightTokens } from './tokens/light';
import { buildTypography } from './typography';

describe('theme resolution', () => {
  it('dark mode + lavender accent resolves textPrimary/deepMidnight correctly', () => {
    const colors = applyAccent(darkTokens, 'lavender');
    expect(colors.deepMidnight).toBe('#07080B');
    expect(colors.textPrimary).toBe('#F6F1E8');
  });

  it('light mode resolves a light deepMidnight regardless of accent', () => {
    const colors = applyAccent(lightTokens, 'rose');
    expect(colors.deepMidnight).toBe('#F6F1E8');
    expect(colors.primary).toBe('#D46A86');
  });

  it('typography.body color matches the resolved textSecondary', () => {
    const colors = applyAccent(darkTokens, 'lavender');
    const typography = buildTypography(colors);
    expect(typography.body.color).toBe(colors.textSecondary);
    expect(typography.headline.color).toBe(colors.textPrimary);
  });
});
