/**
 * Raw palette primitives for the "Living Lunar Intelligence" design system (v2).
 * This is the only place raw hex values should live for v2 work — screens and
 * components should consume `semanticColors`, not this module, once migrated.
 */
export const colors = {
  midnight950: '#070911',
  midnight900: '#0B0E18',
  midnight850: '#101421',
  midnight800: '#151A29',

  porcelain50: '#FAFAF8',
  porcelain100: '#F4F3EF',
  porcelain200: '#EAE8E2',

  iris300: '#B9A8FF',
  iris400: '#9C83FF',
  iris500: '#7C5CFC',
  iris600: '#6544DF',

  aqua300: '#77E5DB',
  aqua400: '#4ED3CA',
  aqua500: '#25B8B2',

  coral300: '#FFB7A6',
  coral400: '#FF927C',
  coral500: '#F56F5A',

  moonWhite: '#F8F7FF',
  silverMist: '#C8CBD8',
  slateText: '#8C92A6',
  deepInk: '#181A24',

  success: '#55CFA4',
  warning: '#F2B45B',
  danger: '#EF6B76',
} as const;

export type ColorToken = keyof typeof colors;
