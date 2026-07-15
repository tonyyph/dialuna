import { rawColors as r } from './rawColors';

export const gradients = {
  lightCanvas: [r.pearl50, '#F4F1FA', '#EEF6F5'] as const,
  darkCanvas: [r.night950, r.night900, '#0E1420'] as const,
  rhythm: [r.violet500, r.aqua500, r.coral400] as const,
  membership: [r.night950, '#15132A'] as const,
} as const;
