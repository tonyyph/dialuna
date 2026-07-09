import { Insets } from 'react-native';

import { radius, shadows, sizes, spacing } from '@/theme';

export { radius, shadows, sizes, spacing };

export const layout = {
  screenPadding: sizes.screenPadding,
  minTouchTarget: sizes.touchTarget,
  orbitHeroMinHeight: 520,
  sheetPeekPercent: 28,
  sheetMediumPercent: 62,
  sheetFullPercent: 92,
} as const;

export const hitSlop44: Insets = {
  top: 10,
  right: 10,
  bottom: 10,
  left: 10,
};

