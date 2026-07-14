import { describe, expect, it } from 'vitest';

import { shadows, shadowsV2 } from './shadows';

describe('shadows', () => {
  it('preserves the legacy warm-tinted tiers unchanged', () => {
    expect(shadows.button).toEqual({
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.16,
      shadowRadius: 22,
      elevation: 4,
    });
    expect(shadows.hero.shadowColor).toBe('#785411');
  });

  it('defines a three-tier v2 depth model with no shadow on the base tier', () => {
    expect(shadowsV2.base).toEqual({});
    expect(shadowsV2.elevated.elevation as number).toBeLessThan(shadowsV2.floating.elevation as number);
  });

  it('uses a neutral-ink shadow color for v2 tiers, not the legacy warm tint', () => {
    expect(shadowsV2.elevated.shadowColor).toBe('#0B0E18');
    expect(shadowsV2.floating.shadowColor).toBe('#0B0E18');
  });
});
