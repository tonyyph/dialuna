import { rawColors as r } from './rawColors';

export const semanticColors = {
  light: {
    canvas: r.pearl50, subtle: r.pearl100, elevated: '#FFFFFF', inverse: r.night900,
    primary: r.textOnLight, secondary: r.textMutedLight, tertiary: r.textFaintLight, inverseContent: r.textOnDark,
    brand: r.violet600, intelligence: r.aqua600, biological: r.coral600,
    embedded: r.pearl100, raised: '#FFFFFF', floating: '#FFFFFFF2', selected: '#ECE8FF',
    border: '#DCD9E3', activeBorder: r.violet500,
  },
  dark: {
    canvas: r.night950, subtle: r.night900, elevated: r.night850, inverse: r.pearl50,
    primary: r.textOnDark, secondary: r.textMutedDark, tertiary: r.textFaintDark, inverseContent: r.textOnLight,
    brand: r.violet400, intelligence: r.aqua400, biological: r.coral400,
    embedded: r.night900, raised: r.night850, floating: '#171C2CF2', selected: '#282442',
    border: '#2C3147', activeBorder: r.violet400,
  },
} as const;
