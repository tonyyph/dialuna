import { useSettingsStore } from '@/store/useSettingsStore';

import { Palette, palettes } from './palettes';

export function useTheme(): Palette {
  const theme = useSettingsStore((s) => s.theme);
  return palettes[theme];
}
