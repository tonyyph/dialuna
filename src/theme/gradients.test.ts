import { describe, expect, it } from 'vitest';

import { gradients } from './gradients';

const COLOR_STOP = /^(#[0-9A-Fa-f]{6}|rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\))$/;

describe('gradients', () => {
  it('defines the five named gradients from the design brief', () => {
    expect(Object.keys(gradients)).toEqual([
      'nightField',
      'irisDepth',
      'aquaMist',
      'coralHalo',
      'lunarSheen',
    ]);
  });

  it('gives every gradient at least two valid color stops', () => {
    for (const stops of Object.values(gradients)) {
      expect(stops.length).toBeGreaterThanOrEqual(2);
      for (const stop of stops) {
        expect(stop).toMatch(COLOR_STOP);
      }
    }
  });

  it('matches the exact stop values from the design brief', () => {
    expect(gradients.nightField).toEqual(['#070911', '#101224', '#151124']);
    expect(gradients.aquaMist).toEqual(['#D8F8F3', '#F4F6F3']);
  });
});
