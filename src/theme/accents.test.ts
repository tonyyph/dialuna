import { describe, expect, it } from 'vitest';
import { accentPairs, applyAccent } from './accents';
import { darkTokens } from './tokens/dark';

describe('applyAccent', () => {
  it('overrides only the accent slot, leaving phase colors untouched', () => {
    const result = applyAccent(darkTokens, 'rose');
    expect(result.primary).toBe(accentPairs.rose.primary);
    expect(result.primaryPressed).toBe(accentPairs.rose.secondary);
    expect(result.lavender).toBe(accentPairs.rose.secondary);
    expect(result.gradients.hero).toEqual([accentPairs.rose.primary, accentPairs.rose.secondary]);
    expect(result.phase).toEqual(darkTokens.phase);
    expect(result.auroraBlue).toBe(darkTokens.auroraBlue);
    expect(result.roseDeep).toBe(darkTokens.roseDeep);
  });

  it('lavender accent is a no-op on the accent slot values', () => {
    const result = applyAccent(darkTokens, 'lavender');
    expect(result.primary).toBe(accentPairs.lavender.primary);
    expect(result.lavender).toBe(accentPairs.lavender.secondary);
  });
});
