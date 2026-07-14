import { describe, expect, it } from 'vitest';

import { colors } from './colors';
import { semanticColors } from './semanticColors';

const KEY_SHAPE = {
  background: ['canvas', 'elevated', 'inverse'],
  content: ['primary', 'secondary', 'tertiary', 'inverse'],
  brand: ['primary', 'secondary', 'accent'],
  signal: ['period', 'fertile', 'ovulation', 'recovery', 'warning'],
  border: ['subtle', 'strong'],
  surface: ['default', 'raised', 'floating', 'selected'],
} as const;

describe('semanticColors', () => {
  it('defines light and dark with an identical key shape', () => {
    for (const mode of ['light', 'dark'] as const) {
      const set = semanticColors[mode];
      for (const [group, keys] of Object.entries(KEY_SHAPE)) {
        const groupValue = set[group as keyof typeof set] as Record<string, string>;
        expect(Object.keys(groupValue).sort()).toEqual([...keys].sort());
      }
    }
  });

  it('reserves coral for brand.accent/signal.period only, never as a background', () => {
    const coralHexes = [colors.coral300, colors.coral400, colors.coral500].map((c) =>
      c.toLowerCase()
    );
    for (const mode of ['light', 'dark'] as const) {
      const set = semanticColors[mode];
      expect(coralHexes).not.toContain(set.background.canvas.toLowerCase());
      expect(coralHexes).not.toContain(set.background.elevated.toLowerCase());
    }
  });

  it('assigns brand.primary from the iris ramp in both themes', () => {
    expect(semanticColors.light.brand.primary).toBe(colors.iris500);
    expect(semanticColors.dark.brand.primary).toBe(colors.iris400);
  });

  it('uses the midnight/porcelain canvases per theme', () => {
    expect(semanticColors.dark.background.canvas).toBe(colors.midnight900);
    expect(semanticColors.light.background.canvas).toBe(colors.porcelain50);
  });
});
