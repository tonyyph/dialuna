import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { GlassCard } from '@/components/ui/GlassCard';
import { radius, shadows, sizes } from '@/theme';
import { useTheme } from '@/theme/useTheme';

interface Props {
  variant?: 'solid' | 'glass' | 'moonstone';
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, variant = 'solid', style }: PropsWithChildren<Props>) {
  const { colors } = useTheme();
  if (variant === 'glass' || variant === 'moonstone') {
    return (
      <GlassCard variant={variant} style={style}>
        {children}
      </GlassCard>
    );
  }

  return (
    <View
      style={[
        styles.base,
        { backgroundColor: colors.surface.elevated, borderColor: colors.border },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.card,
    padding: sizes.cardPadding,
    borderWidth: 1,
    ...shadows.sm,
  },
});
