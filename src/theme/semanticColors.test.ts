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

  it('reserves coral exclusively for signal.period, nowhere else in the set', () => {
    const coralHexes = [colors.coral300, colors.coral400, colors.coral500].map((c) =>
      c.toLowerCase()
    );

    for (const mode of ['light', 'dark'] as const) {
      const set = semanticColors[mode];
      const coralLeaves: string[] = [];

      for (const [groupName, group] of Object.entries(set)) {
        for (const [leafName, value] of Object.entries(group as Record<string, string>)) {
          if (coralHexes.includes(value.toLowerCase())) {
            coralLeaves.push(`${groupName}.${leafName}`);
          }
        }
      }

      expect(coralLeaves).toEqual(['signal.period']);
    }
  });

  it('assigns brand.primary from the iris ramp in both themes', () => {
    expect(semanticColors.light.brand.primary).toBe(colors.iris500);
    expect(semanticColors.dark.brand.primary).toBe(colors.iris400);
  });

  it('assigns brand.accent from the iris ramp in both themes, never coral', () => {
    expect(semanticColors.light.brand.accent).toBe(colors.iris600);
    expect(semanticColors.dark.brand.accent).toBe(colors.iris300);
  });

  it('uses the midnight/porcelain canvases per theme', () => {
    expect(semanticColors.dark.background.canvas).toBe(colors.midnight900);
    expect(semanticColors.light.background.canvas).toBe(colors.porcelain50);
  });
});
