import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { GlassCard } from '@/components/ui/GlassCard';
import { colors, radius, shadows, sizes } from '@/theme';

interface Props {
  variant?: 'solid' | 'glass';
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, variant = 'solid', style }: PropsWithChildren<Props>) {
  if (variant === 'glass') {
    return <GlassCard style={style}>{children}</GlassCard>;
  }

  return <View style={[styles.base, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface.elevated,
    borderRadius: radius.card,
    padding: sizes.cardPadding,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
});
