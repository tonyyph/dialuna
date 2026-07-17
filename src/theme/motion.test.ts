import { describe, expect, it } from 'vitest';

import { duration, springs, springV2, staggerDelay } from './motion';

describe('motion', () => {
  it('preserves the soft and snappy spring presets unchanged (live consumers exist)', () => {
    expect(springs.soft).toEqual({ damping: 16, stiffness: 120, mass: 1 });
    expect(springs.snappy).toEqual({ damping: 14, stiffness: 180, mass: 1 });
  });

  it('defines the v2 duration scale from the design brief', () => {
    expect(duration).toEqual({
      instant: 100,
      quick: 180,
      standard: 320,
      expressive: 520,
      ambient: 2400,
    });
  });

  it('defines the v2 spring presets from the design brief', () => {
    expect(springV2.responsive).toEqual({ damping: 18, stiffness: 240, mass: 0.8 });
    expect(springV2.fluid).toEqual({ damping: 20, stiffness: 130, mass: 1 });
    expect(springV2.gentle).toEqual({ damping: 24, stiffness: 90, mass: 1.1 });
  });

  it('staggerDelay scales linearly with index at the default base (40ms)', () => {
    expect(staggerDelay(0)).toBe(0);
    expect(staggerDelay(1)).toBe(40);
    expect(staggerDelay(3)).toBe(120);
  });

  it('staggerDelay respects a custom base', () => {
    expect(staggerDelay(2, 60)).toBe(120);
  });
});
