import { AccessibilityState, Insets } from 'react-native';

import { sizes } from '@/theme';

export const minTouchTarget = sizes.touchTarget;

export const touchHitSlop: Insets = {
  top: 10,
  right: 10,
  bottom: 10,
  left: 10,
};

export function selectedState(selected: boolean): AccessibilityState {
  return { selected };
}

export function disabledState(disabled: boolean): AccessibilityState {
  return { disabled };
}

