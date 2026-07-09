import { LinearGradient } from 'expo-linear-gradient';
import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { radius, sizes } from '@/theme';
import { useTheme } from '@/theme/useTheme';

interface GlassCardProps {
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  gradient?: boolean;
  variant?: 'glass' | 'moonstone';
}

export function GlassCard({
  children,
  style,
  contentStyle,
  gradient = true,
  variant = 'glass',
}: PropsWithChildren<GlassCardProps>) {
  const { colors, shadows } = useTheme();

  if (variant === 'moonstone') {
    // Bloom shadow needs an unclipped wrapper — the inner view has
    // overflow:hidden for the gradient/corner-radius clip, which would
    // otherwise clip the shadow itself on iOS.
    return (
      <View style={[shadows.bloom, style]}>
        <View
          style={[
            styles.card,
            styles.moonstone,
            { backgroundColor: colors.glassStrong, borderColor: `${colors.moonWhite}66` },
          ]}
        >
          {gradient ? (
            <LinearGradient
              pointerEvents="none"
              colors={colors.gradients.pearl}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFill, styles.pearlSheen]}
            />
          ) : null}
          <View style={contentStyle}>{children}</View>
        </View>
      </View>
    );
  }

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
  moonstone: {
    borderTopColor: 'rgba(255,255,255,0.82)',
    borderLeftColor: 'rgba(255,255,255,0.72)',
  },
  pearlSheen: {
    opacity: 0.16,
  },
});
