import { LinearGradient } from 'expo-linear-gradient';
import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { radius, sizes } from '@/theme';
import { useTheme } from '@/theme/useTheme';

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
  const { colors, shadows } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.glass, borderColor: colors.glassBorder, ...shadows.sm },
        style,
      ]}
    >
      {gradient ? (
        <LinearGradient
          pointerEvents="none"
          colors={colors.gradients.glass}
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
    borderRadius: radius.card,
    borderWidth: 1,
    padding: sizes.cardPadding,
    overflow: 'hidden',
  },
});
