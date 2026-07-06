import { LinearGradient } from 'expo-linear-gradient';
import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { colors, radius, shadows, sizes } from '@/theme';

interface GlassCardProps {
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  gradient?: boolean;
}

export function GlassCard({
  children,
  style,
  contentStyle,
  gradient = true,
}: PropsWithChildren<GlassCardProps>) {
  return (
    <View style={[styles.card, style]}>
      {gradient ? (
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(255,255,255,0.62)', 'rgba(255,255,255,0.22)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View style={contentStyle}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glass,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: sizes.cardPadding,
    overflow: 'hidden',
    ...shadows.sm,
  },
});
