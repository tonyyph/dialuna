/**
 * Gradients for the v2 system. Each entry's comment documents the semantic
 * purpose it serves per the design brief — gradients are functional
 * (hierarchy, phase, depth, state, focus), never purely decorative.
 */
export const gradients = {
  /** Full-bleed dark canvas depth — base background layering. */
  nightField: ['#070911', '#101224', '#151124'],
  /** Iris-toned depth field — brand/hero surfaces needing spatial depth. */
  irisDepth: ['#312661', '#19172F', '#0B0E18'],
  /** Light, airy recovery/positive-state field. */
  aquaMist: ['#D8F8F3', '#F4F6F3'],
  /** Soft radial halo drawing attention to a period/biological signal point. */
  coralHalo: ['rgba(245,111,90,0.22)', 'rgba(245,111,90,0)'],
  /** Layered sheen used to indicate focus/hierarchy on hero surfaces. */
  lunarSheen: [
    'rgba(185,168,255,0.28)',
    'rgba(78,211,202,0.10)',
    'rgba(7,9,17,0)',
  ],
} as const satisfies Record<string, readonly [string, string, ...string[]]>;

export type GradientToken = keyof typeof gradients;
