import { describe, expect, it } from 'vitest';

import { springs, staggerDelay } from './motion';

describe('motion', () => {
  it('defines soft and snappy spring presets', () => {
    expect(springs.soft).toEqual({ damping: 16, stiffness: 120, mass: 1 });
    expect(springs.snappy).toEqual({ damping: 14, stiffness: 180, mass: 1 });
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
