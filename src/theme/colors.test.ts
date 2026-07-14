import { describe, expect, it } from 'vitest';

import { colors } from './colors';

const HEX = /^#[0-9A-Fa-f]{6}$/;

describe('colors', () => {
  it('defines every token as a 6-digit hex string', () => {
    Object.entries(colors).forEach(([key, value]) => {
      expect(value, `${key} should be a hex color`).toMatch(HEX);
    });
  });

  it('exposes the full v2 brand spectrum from the design brief', () => {
    expect(Object.keys(colors)).toEqual([
      'midnight950', 'midnight900', 'midnight850', 'midnight800',
      'porcelain50', 'porcelain100', 'porcelain200',
      'iris300', 'iris400', 'iris500', 'iris600',
      'aqua300', 'aqua400', 'aqua500',
      'coral300', 'coral400', 'coral500',
      'moonWhite', 'silverMist', 'slateText', 'deepInk',
      'success', 'warning', 'danger',
    ]);
  });

  it('matches the exact hex values from the design brief', () => {
    expect(colors.midnight950).toBe('#070911');
    expect(colors.porcelain50).toBe('#FAFAF8');
    expect(colors.iris500).toBe('#7C5CFC');
    expect(colors.aqua500).toBe('#25B8B2');
    expect(colors.coral500).toBe('#F56F5A');
  });
});
