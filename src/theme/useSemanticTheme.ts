import { useSettingsStore } from '@/store/useSettingsStore';

import { SemanticColorSet, semanticColors } from './semanticColors';

export function useSemanticTheme(): SemanticColorSet {
  const theme = useSettingsStore((s) => s.theme);
  return semanticColors[theme];
}
