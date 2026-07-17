import { describe, expect, it } from 'vitest';

import { surfaceElevated, surfaceFloating } from './components';
import { radiusV2 } from './radius';
import { semanticColors } from './semanticColors';

describe('components', () => {
  it('surfaceElevated builds a bordered, shadowed style from the given theme', () => {
    const style = surfaceElevated(semanticColors.dark);
    expect(style.backgroundColor).toBe(semanticColors.dark.surface.raised);
    expect(style.borderRadius).toBe(radiusV2.lg);
    expect(style.borderColor).toBe(semanticColors.dark.border.subtle);
  });

  it('surfaceFloating uses the floating surface tone and organic radius', () => {
    const style = surfaceFloating(semanticColors.light);
    expect(style.backgroundColor).toBe(semanticColors.light.surface.floating);
    expect(style.borderRadius).toBe(radiusV2.xl);
  });
});
