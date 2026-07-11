import { useEffect, useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';

import { useThemeStore } from '@/store/themeStore';
import { useTheme } from '@/theme/useTheme';

export type OrbitalMarkState = 'idle' | 'listening' | 'thinking' | 'celebrating';

interface OrbitalMarkProps {
  state?: OrbitalMarkState;
  size?: number;
  premium?: boolean;
}

export function OrbitalMark({ state = 'idle', size = 96, premium = false }: OrbitalMarkProps) {
  const { colors } = useTheme();
  const reduceMotion = useThemeStore((s) => s.reduceMotion);
  const ringGradientId = useId();
  const coreGradientId = useId();

  const floatY = useSharedValue(0);
  const pulse = useSharedValue(0.96);
  const pulseOpacity = useSharedValue(0.42);
  const rotate = useSharedValue(0);
  const pop = useSharedValue(1);

  useEffect(() => {
    cancelAnimation(floatY);
    cancelAnimation(pulse);
    cancelAnimation(pulseOpacity);
    cancelAnimation(rotate);

    if (reduceMotion) {
      floatY.value = 0;
      rotate.value = 0;
      pulse.value = 1;
      pulseOpacity.value = 0.58;
    } else if (state === 'thinking') {
      rotate.value = withRepeat(withTiming(360, { duration: 9000, easing: Easing.linear }), -1, false);
      pulseOpacity.value = withRepeat(withTiming(0.76, { duration: 1800 }), -1, true);
    } else if (state === 'listening') {
      pulse.value = withRepeat(withTiming(1.08, { duration: 900 }), -1, true);
      pulseOpacity.value = withRepeat(withTiming(0.82, { duration: 900 }), -1, true);
    } else {
      floatY.value = withRepeat(withTiming(-5, { duration: 3000, easing: Easing.inOut(Easing.ease) }), -1, true);
      pulse.value = withRepeat(withTiming(1.06, { duration: 2400 }), -1, true);
      pulseOpacity.value = withRepeat(withTiming(0.72, { duration: 2400 }), -1, true);
    }

    if (state === 'celebrating') {
      pop.value = withSequence(
        withTiming(0.9, { duration: 0 }),
        withTiming(1.08, { duration: reduceMotion ? 120 : 220 }),
        withTiming(1, { duration: reduceMotion ? 90 : 180 })
      );
    }
  }, [state, reduceMotion, floatY, pulse, pulseOpacity, rotate, pop]);

  const markStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value },
      { rotate: `${rotate.value}deg` },
      { scale: pop.value },
    ],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
    transform: [{ scale: pulse.value }],
  }));

  const accent = premium ? colors.champagneGold : colors.lilac;

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="Cycle phase mark"
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.halo,
          haloStyle,
          {
            width: size * 1.38,
            height: size * 1.38,
            borderRadius: (size * 1.38) / 2,
            backgroundColor: accent,
          },
        ]}
      />
      <Animated.View style={[markStyle, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id={ringGradientId} x1="12" y1="8" x2="92" y2="94">
              <Stop offset="0%" stopColor={colors.moonWhite} stopOpacity="0.95" />
              <Stop offset="52%" stopColor={accent} stopOpacity="0.88" />
              <Stop offset="100%" stopColor={colors.auroraBlue} stopOpacity="0.78" />
            </LinearGradient>
            <RadialGradient id={coreGradientId} cx="42%" cy="38%" r="65%">
              <Stop offset="0%" stopColor={colors.moonWhite} />
              <Stop offset="62%" stopColor={colors.pearl} />
              <Stop offset="100%" stopColor={accent} />
            </RadialGradient>
          </Defs>
          <Circle cx="50" cy="50" r="38" fill="none" stroke={`url(#${ringGradientId})`} strokeWidth="2.8" opacity="0.82" />
          <Circle cx="50" cy="50" r="26" fill={`url(#${coreGradientId})`} opacity="0.9" />
          <Path
            d="M62 18A32 32 0 1 1 37 79A25 25 0 0 0 62 18Z"
            fill={`url(#${ringGradientId})`}
            opacity="0.92"
          />
          <Circle cx="24" cy="29" r="3.8" fill={colors.champagneGold} opacity={state === 'celebrating' ? 1 : 0.72} />
          <Circle cx="78" cy="72" r="2.6" fill={colors.moonWhite} opacity={state === 'celebrating' ? 0.92 : 0.52} />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  halo: {
    position: 'absolute',
  },
});
