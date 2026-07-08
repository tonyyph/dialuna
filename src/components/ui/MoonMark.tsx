import { useEffect } from 'react';
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
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';

import { useThemeStore } from '@/store/themeStore';
import { useTheme } from '@/theme/useTheme';

export type MoonMarkState = 'idle' | 'listening' | 'thinking' | 'celebrating';

interface MoonMarkProps {
  state?: MoonMarkState;
  size?: number;
}

export function MoonMark({ state = 'idle', size = 96 }: MoonMarkProps) {
  const { colors } = useTheme();
  const reduceMotion = useThemeStore((s) => s.reduceMotion);

  const floatY = useSharedValue(0);
  const glowScale = useSharedValue(0.95);
  const glowOpacity = useSharedValue(0.55);
  const tilt = useSharedValue(0);
  const pop = useSharedValue(1);

  useEffect(() => {
    cancelAnimation(floatY);
    cancelAnimation(glowScale);
    cancelAnimation(glowOpacity);
    cancelAnimation(tilt);

    if (reduceMotion) {
      floatY.value = 0;
      tilt.value = 0;
      glowScale.value = 1;
      glowOpacity.value = 0.75;
    } else if (state === 'thinking') {
      tilt.value = withRepeat(
        withSequence(
          withTiming(4, { duration: 1700, easing: Easing.inOut(Easing.ease) }),
          withTiming(-4, { duration: 1700, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      glowOpacity.value = withRepeat(withTiming(0.9, { duration: 2000 }), -1, true);
    } else if (state === 'listening') {
      glowScale.value = withRepeat(withTiming(1.1, { duration: 900 }), -1, true);
      glowOpacity.value = withRepeat(withTiming(0.95, { duration: 900 }), -1, true);
    } else {
      floatY.value = withRepeat(withTiming(-7, { duration: 3000, easing: Easing.inOut(Easing.ease) }), -1, true);
      glowScale.value = withRepeat(withTiming(1.08, { duration: 2200 }), -1, true);
      glowOpacity.value = withRepeat(withTiming(0.88, { duration: 2200 }), -1, true);
    }

    if (state === 'celebrating') {
      pop.value = withSequence(
        withTiming(0.86, { duration: 0 }),
        withTiming(1.1, { duration: reduceMotion ? 120 : 220 }),
        withTiming(1, { duration: reduceMotion ? 90 : 180 })
      );
    }
  }, [state, reduceMotion, floatY, glowScale, glowOpacity, tilt, pop]);

  const markStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value },
      { rotate: `${tilt.value}deg` },
      { scale: pop.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const sparkleOpacity = state === 'celebrating' ? 1 : 0.7;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glow,
          glowStyle,
          {
            width: size * 1.4,
            height: size * 1.4,
            borderRadius: (size * 1.4) / 2,
            backgroundColor: colors.lilac,
          },
        ]}
      />
      <Animated.View style={[markStyle, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="moonMarkCrescent" x1="10" y1="10" x2="90" y2="90">
              <Stop offset="0%" stopColor={colors.moonWhite} />
              <Stop offset="55%" stopColor={colors.champagneGold} />
              <Stop offset="100%" stopColor={colors.lilac} />
            </LinearGradient>
            <RadialGradient id="moonMarkPearl" cx="42%" cy="42%" r="65%">
              <Stop offset="0%" stopColor={colors.moonWhite} />
              <Stop offset="55%" stopColor={colors.pearl} />
              <Stop offset="100%" stopColor={colors.lilac} />
            </RadialGradient>
          </Defs>

          <Path
            d="M62.5 12.5A37.5 37.5 0 1 1 38.9 79.2A29.2 29.2 0 0 0 62.5 12.5Z"
            fill="url(#moonMarkCrescent)"
          />
          <Circle cx="46" cy="55" r="17" fill="url(#moonMarkPearl)" />
          <Ellipse cx="40" cy="49" rx="5.5" ry="3.5" fill={colors.moonWhite} opacity={0.85} />

          <Path
            d="M20 24L22.4 29.6L28 32L22.4 34.4L20 40L17.6 34.4L12 32L17.6 29.6Z"
            fill={colors.champagneGold}
            opacity={sparkleOpacity}
          />
          <Circle cx="78" cy="70" r="2.6" fill={colors.moonWhite} opacity={sparkleOpacity} />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
  },
});
