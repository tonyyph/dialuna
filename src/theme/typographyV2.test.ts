import { describe, expect, it } from 'vitest';

import { typographyV2 } from './typographyV2';

describe('typographyV2', () => {
  it('defines the full Manrope-only scale from the design brief', () => {
    expect(typographyV2.displayXL).toEqual({ fontFamily: 'Manrope_700Bold', fontSize: 52, lineHeight: 54 });
    expect(typographyV2.displayL).toEqual({ fontFamily: 'Manrope_700Bold', fontSize: 42, lineHeight: 46 });
    expect(typographyV2.titleXL).toEqual({ fontFamily: 'Manrope_600SemiBold', fontSize: 32, lineHeight: 37 });
    expect(typographyV2.titleL).toEqual({ fontFamily: 'Manrope_600SemiBold', fontSize: 26, lineHeight: 32 });
    expect(typographyV2.titleM).toEqual({ fontFamily: 'Manrope_600SemiBold', fontSize: 21, lineHeight: 27 });
    expect(typographyV2.bodyL).toEqual({ fontFamily: 'Manrope_400Regular', fontSize: 17, lineHeight: 25 });
    expect(typographyV2.bodyM).toEqual({ fontFamily: 'Manrope_400Regular', fontSize: 15, lineHeight: 22 });
    expect(typographyV2.labelL).toEqual({ fontFamily: 'Manrope_500Medium', fontSize: 14, lineHeight: 18 });
    expect(typographyV2.labelM).toEqual({ fontFamily: 'Manrope_500Medium', fontSize: 12, lineHeight: 16 });
    expect(typographyV2.micro).toEqual({ fontFamily: 'Manrope_600SemiBold', fontSize: 11, lineHeight: 14 });
  });

  it('only uses font weights already loaded by the app (no new font risk)', () => {
    const loadedWeights = ['Manrope_400Regular', 'Manrope_500Medium', 'Manrope_600SemiBold', 'Manrope_700Bold'];
    for (const style of Object.values(typographyV2)) {
      expect(loadedWeights).toContain(style.fontFamily);
    }
  });
});
