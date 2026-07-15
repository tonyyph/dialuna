import { Platform, ViewStyle } from 'react-native';

import { rawColors } from './rawColors';

const shadow = rawColors.night950;

function adaptive(native: ViewStyle, web: string): ViewStyle {
  return Platform.select<ViewStyle>({ web: { boxShadow: web }, default: native }) ?? native;
}

const tiny = adaptive(
  { shadowColor: shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 1 },
  '0 2px 8px rgba(7, 8, 18, 0.08)'
);
const soft = adaptive(
  { shadowColor: shadow, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 3 },
  '0 10px 24px rgba(7, 8, 18, 0.10)'
);
const float = adaptive(
  { shadowColor: shadow, shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.16, shadowRadius: 34, elevation: 8 },
  '0 14px 34px rgba(7, 8, 18, 0.18)'
);
const hero = adaptive(
  { shadowColor: rawColors.violet700, shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.14, shadowRadius: 40, elevation: 6 },
  '0 18px 40px rgba(80, 52, 181, 0.16)'
);
const button = adaptive(
  { shadowColor: shadow, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.16, shadowRadius: 22, elevation: 4 },
  '0 10px 22px rgba(7, 8, 18, 0.18)'
);
const chip = adaptive(
  { shadowColor: rawColors.violet700, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.22, shadowRadius: 14, elevation: 3 },
  '0 6px 14px rgba(80, 52, 181, 0.22)'
);

export const shadows = { none: {}, tiny, soft, float, hero, button, chip } satisfies Record<string, ViewStyle>;
