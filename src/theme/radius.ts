/**
 * Legacy radius scale (gold/amber era). Preserved verbatim so every
 * currently-shipped screen keeps rendering unchanged. Superseded by
 * `radiusV2` as each screen migrates; deleted once migration is complete.
 */
export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  card: 24,
  sheet: 32,
  button: 18,
  dock: 31,
  pill: 999,
} as const;

/**
 * v2 shape system ("Living Lunar Intelligence"). Usage guidance:
 * - data surface: 18-24 (`md`/`lg`)
 * - overlay/sheet: 28-32 (`xl`/`organic`)
 * - chips: `capsule`
 * - full-bleed section: no radius token — omit `borderRadius` entirely
 * - buttons: pick per component, don't default to `capsule`
 */
export const radiusV2 = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  organic: 40,
  capsule: 999,
} as const;
