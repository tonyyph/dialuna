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

import { useThemeStore } from '@/store/themeStore';
import { useTheme } from '@/theme/useTheme';

export type LunaOrbState = 'idle' | 'listening' | 'thinking' | 'celebrating';

interface LunaOrbProps {
  state?: LunaOrbState;
  size?: number;
}

export function LunaOrb({ state = 'idle', size = 96 }: LunaOrbProps) {
  const { colors } = useTheme();
  const reduceMotion = useThemeStore((s) => s.reduceMotion);

  const floatY = useSharedValue(0);
  const glowScale = useSharedValue(0.95);
  const glowOpacity = useSharedValue(0.55);
  const rotate = useSharedValue(0);
  const pop = useSharedValue(1);

  useEffect(() => {
    cancelAnimation(floatY);
    cancelAnimation(glowScale);
    cancelAnimation(glowOpacity);
    cancelAnimation(rotate);

    if (reduceMotion) {
      floatY.value = 0;
      rotate.value = 0;
      glowScale.value = 1;
      glowOpacity.value = 0.75;
    } else if (state === 'thinking') {
      rotate.value = withRepeat(
        withSequence(
          withTiming(20, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
          withTiming(-20, { duration: 2200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      glowOpacity.value = withRepeat(withTiming(0.9, { duration: 2000 }), -1, true);
    } else if (state === 'listening') {
      glowScale.value = withRepeat(withTiming(1.1, { duration: 900 }), -1, true);
      glowOpacity.value = withRepeat(withTiming(0.95, { duration: 900 }), -1, true);
    } else {
      floatY.value = withRepeat(withTiming(-8, { duration: 3000, easing: Easing.inOut(Easing.ease) }), -1, true);
      glowScale.value = withRepeat(withTiming(1.08, { duration: 2000 }), -1, true);
      glowOpacity.value = withRepeat(withTiming(0.9, { duration: 2000 }), -1, true);
    }

    if (state === 'celebrating') {
      pop.value = withSequence(
        withTiming(0.6, { duration: 0 }),
        withTiming(1.12, { duration: reduceMotion ? 120 : 240 }),
        withTiming(1, { duration: reduceMotion ? 80 : 160 })
      );
    }
  }, [state, reduceMotion, floatY, glowScale, glowOpacity, rotate, pop]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value },
      { rotate: `${rotate.value}deg` },
      { scale: pop.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const eyeOffset = state === 'thinking' ? 2 : 0;

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
            backgroundColor: colors.lavenderLight,
          },
        ]}
      />
      <Animated.View
        style={[
          orbStyle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: colors.lunaShadowColor,
            shadowOffset: { width: -size * 0.06, height: -size * 0.08 },
            shadowOpacity: 0.55,
            shadowRadius: size * 0.16,
          },
        ]}
      >
        <View style={{ flexDirection: 'row', gap: size * 0.09, marginTop: eyeOffset }}>
          <View style={[styles.eye, { width: size * 0.06, height: state === 'thinking' ? size * 0.015 : size * 0.06, backgroundColor: colors.lunaEyeColor }]} />
          <View style={[styles.eye, { width: size * 0.06, height: state === 'thinking' ? size * 0.015 : size * 0.06, backgroundColor: colors.lunaEyeColor }]} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
  },
  eye: {
    borderRadius: 999,
  },
});
