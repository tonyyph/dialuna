import { ViewStyle } from 'react-native';

const warm = '#5a3c14';

const legacyTiny: ViewStyle = {
  shadowColor: warm, shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08, shadowRadius: 8, elevation: 1,
};
const legacySoft: ViewStyle = {
  shadowColor: warm, shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.08, shadowRadius: 24, elevation: 3,
};
const legacyFloat: ViewStyle = {
  shadowColor: '#3c2814', shadowOffset: { width: 0, height: 14 },
  shadowOpacity: 0.16, shadowRadius: 34, elevation: 8,
};
const legacyHero: ViewStyle = {
  shadowColor: '#785411', shadowOffset: { width: 0, height: 18 },
  shadowOpacity: 0.14, shadowRadius: 40, elevation: 6,
};
const legacyButton: ViewStyle = {
  shadowColor: '#000000', shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.16, shadowRadius: 22, elevation: 4,
};
const legacyChip: ViewStyle = {
  shadowColor: '#785411', shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.22, shadowRadius: 14, elevation: 3,
};

/**
 * Legacy shadow tiers (gold/amber era). Preserved verbatim so every
 * currently-shipped screen keeps rendering unchanged. Superseded by
 * `shadowsV2` as each screen migrates; deleted once migration is complete.
 */
export const shadows = {
  none: {},
  tiny: legacyTiny,
  soft: legacySoft,
  float: legacyFloat,
  hero: legacyHero,
  button: legacyButton,
  chip: legacyChip,
} satisfies Record<string, ViewStyle>;

/** Neutral-ink shadow color for the v2 model, replacing the legacy warm-tinted family. */
const ink = '#0B0E18';

/**
 * v2 three-tier surface/depth model (design spec §17):
 * - base canvas: no shadow.
 * - elevated surface: short, soft shadow.
 * - floating context: reserved for navigation/contextual overlays only.
 */
export const shadowsV2 = {
  base: {} as ViewStyle,
  elevated: {
    shadowColor: ink, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10, shadowRadius: 16, elevation: 3,
  } as ViewStyle,
  floating: {
    shadowColor: ink, shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18, shadowRadius: 30, elevation: 8,
  } as ViewStyle,
} satisfies Record<string, ViewStyle>;
