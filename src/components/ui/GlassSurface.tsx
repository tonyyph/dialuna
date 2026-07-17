import { isGlassEffectAPIAvailable, GlassView } from 'expo-glass-effect';
import { BlurView } from 'expo-blur';
import { PropsWithChildren } from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

interface GlassSurfaceProps {
  style?: StyleProp<ViewStyle>;
  onLayout?: ViewProps['onLayout'];
  /** Semi-transparent tint layered over the blur so the warm palette stays visible through it. */
  tintColor?: string;
  /** expo-blur intensity 0-100 — used only on the BlurView fallback path (Android/older iOS/web). */
  intensity?: number;
}

const useNativeGlass = Platform.OS === 'ios' && isGlassEffectAPIAvailable();

/** The only component in the app that renders real native blur/glass. */
export function GlassSurface({
  children,
  onLayout,
  style,
  tintColor,
  intensity = 40,
}: PropsWithChildren<GlassSurfaceProps>) {
  const p = useTheme();
  return (
    <View onLayout={onLayout} style={[styles.wrap, style]}>
      {useNativeGlass ? (
        <GlassView glassEffectStyle="regular" style={StyleSheet.absoluteFill} />
      ) : (
        <BlurView
          intensity={intensity}
          tint={p.name === 'dark' ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      )}
      {tintColor ? (
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: tintColor }]}
        />
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
});
