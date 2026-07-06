import { TextStyle } from 'react-native';

import { applyAccent } from './accents';
import { darkTokens } from './tokens/dark';
import { buildTypography, TypographyTokens } from './typography';

export { spacing } from './spacing';
export { radius } from './radius';
export { shadows, legacyShadowAliases } from './shadows';
export { duration, easing } from './motion';
export { sizes } from './sizes';

// --- TEMPORARY: remove once Task 10 (tab bar rebuild) lands ---
// Keeps not-yet-migrated files (still on `import { colors, typography }
// from '@/theme'`) compiling against the default dark+lavender resolution
// while Tasks 4-6 migrate consumers to `useTheme()` one batch at a time.
export const colors = applyAccent(darkTokens, 'lavender');

const baseTypography = buildTypography(colors);

// `display`/`bodySmall` are v1 key names dropped from `TypographyTokens`
// (see typography.ts) but still referenced by call sites Tasks 4-6 haven't
// migrated yet (see plan Task 4 Step 1's rename recipe:
// display -> displayXl/displayL, bodySmall -> body). Aliasing them here only
// —  not on `TypographyTokens` itself — keeps this hack scoped to the
// temporary fallback; it disappears with the rest of this block in Task 10.
export const typography: TypographyTokens & { display: TextStyle; bodySmall: TextStyle } = {
  ...baseTypography,
  display: baseTypography.displayXl,
  bodySmall: baseTypography.body,
};
// --- end temporary ---
