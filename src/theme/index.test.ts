import { describe, expect, it } from 'vitest';

import * as themeIndex from './index';

describe('theme barrel', () => {
  it('still exports every legacy token untouched', () => {
    expect(themeIndex.palettes).toBeDefined();
    expect(themeIndex.paywallColors).toBeDefined();
    expect(themeIndex.typography).toBeDefined();
    expect(themeIndex.spacing).toBeDefined();
    expect(themeIndex.sizes).toBeDefined();
    expect(themeIndex.radius).toEqual({
      sm: 12, md: 16, lg: 20, xl: 24, xxl: 32,
      card: 24, sheet: 32, button: 18, dock: 31, pill: 999,
    });
  });

  it('exports every new v2 token', () => {
    expect(themeIndex.colors).toBeDefined();
    expect(themeIndex.semanticColors).toBeDefined();
    expect(themeIndex.gradients).toBeDefined();
    expect(themeIndex.typographyV2).toBeDefined();
    expect(themeIndex.radiusV2).toBeDefined();
    expect(themeIndex.shadowsV2).toBeDefined();
    expect(themeIndex.springV2).toBeDefined();
    expect(themeIndex.surfaceElevated).toBeDefined();
    expect(themeIndex.surfaceFloating).toBeDefined();
  });

  it('no longer exports the unused easing constant', () => {
    expect((themeIndex as Record<string, unknown>).easing).toBeUndefined();
  });
});
