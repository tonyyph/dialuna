import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { radius, shadows, sizes, useTheme } from '@/theme';

interface Props {
  /** Kept for compatibility; both variants render the same soft card. */
  variant?: 'solid' | 'glass';
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, style }: PropsWithChildren<Props>) {
  const p = useTheme();
  return (
    <View style={[styles.base, { backgroundColor: p.surface }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.xl - 2, // 22 — handoff soft card
    padding: sizes.cardPadding,
    ...shadows.soft,
  },
});
