/** 8pt grid: spacing(2) = 16. Keep half-steps for existing compact UI. */
export const spacing = (n: number): number => n * 8;

export const space = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;
