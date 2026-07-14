import { ViewStyle } from 'react-native';

import { radiusV2 } from './radius';
import { SemanticColorSet } from './semanticColors';
import { shadowsV2 } from './shadows';

/**
 * Shared style-fragment helpers for the v2 surface/depth model (design spec
 * §17). Nothing consumes these yet — Phase 2 primitives will be the first
 * real callers.
 */
export function surfaceElevated(theme: SemanticColorSet): ViewStyle {
  return {
    backgroundColor: theme.surface.raised,
    borderRadius: radiusV2.lg,
    borderWidth: 1,
    borderColor: theme.border.subtle,
    ...shadowsV2.elevated,
  };
}

export function surfaceFloating(theme: SemanticColorSet): ViewStyle {
  return {
    backgroundColor: theme.surface.floating,
    borderRadius: radiusV2.xl,
    ...shadowsV2.floating,
  };
}
