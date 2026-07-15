import { describe, expect, it } from 'vitest';

import { rawColors } from '@/theme/rawColors';
import { semanticColors } from '@/theme/semanticColors';

describe('Living Lunar Intelligence color system', () => {
  it('keeps light and dark semantic contracts aligned', () => {
    expect(Object.keys(semanticColors.light)).toEqual(Object.keys(semanticColors.dark));
  });

  it('uses the required brand and signal colors', () => {
    expect(rawColors.night950).toBe('#070812');
    expect(rawColors.violet500).toBe('#8164F7');
    expect(rawColors.aqua500).toBe('#2ABDB7');
    expect(rawColors.coral500).toBe('#F46E5B');
  });
});
