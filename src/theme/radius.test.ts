import { describe, expect, it } from 'vitest';

import { radius, radiusV2 } from './radius';

describe('radius', () => {
  it('preserves the legacy scale unchanged, so existing screens keep rendering the same', () => {
    expect(radius).toEqual({
      sm: 12,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 32,
      card: 24,
      sheet: 32,
      button: 18,
      dock: 31,
      pill: 999,
    });
  });

  it('defines the v2 shape scale from the design brief', () => {
    expect(radiusV2).toEqual({
      xs: 8,
      sm: 12,
      md: 18,
      lg: 24,
      xl: 32,
      organic: 40,
      capsule: 999,
    });
  });
});
