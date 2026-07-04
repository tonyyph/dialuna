import { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { colors, radius, shadows, spacing } from '@/theme';

interface Props {
  variant?: 'solid' | 'glass';
  style?: ViewStyle;
}

export function Card({ children, variant = 'solid', style }: PropsWithChildren<Props>) {
  return (
    <View style={[styles.base, variant === 'glass' && styles.glass, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing(2.5),
    ...shadows.card,
  },
  glass: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
