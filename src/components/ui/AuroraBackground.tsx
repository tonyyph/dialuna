import { DimensionValue, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useThemeStore } from '@/store/themeStore';
import { useTheme } from '@/theme/useTheme';

const OPACITY = {
  dark: { animated: [0.62, 0.5, 0.42], still: [0.4, 0.35, 0.3] },
  light: { animated: [0.3, 0.26, 0.2], still: [0.18, 0.16, 0.12] },
} as const;

const STARS = [
  { top: '8%', left: '15%', size: 2.5, delay: 0 },
  { top: '14%', left: '78%', size: 2, delay: 300 },
  { top: '22%', left: '42%', size: 1.5, delay: 900 },
  { top: '30%', left: '90%', size: 2, delay: 1400 },
  { top: '46%', left: '8%', size: 1.5, delay: 500 },
  { top: '58%', left: '65%', size: 2.5, delay: 1100 },
  { top: '68%', left: '25%', size: 1.5, delay: 200 },
  { top: '78%', left: '85%', size: 2, delay: 1700 },
] as const;

const PARTICLES = [
  { top: '20%', left: '30%', size: 5 },
  { top: '50%', left: '75%', size: 4 },
  { top: '72%', left: '18%', size: 6 },
] as const;

function useDrift(durationMs: number, reduceMotion: boolean) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const scale = useSharedValue(1);

  if (!reduceMotion) {
    x.value = withRepeat(
      withSequence(
        withTiming(8, { duration: durationMs / 3, easing: Easing.inOut(Easing.ease) }),
        withTiming(-6, { duration: durationMs / 3, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: durationMs / 3, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: durationMs / 2 }),
        withTiming(1, { duration: durationMs / 2 })
      ),
      -1,
      true
    );
  }

  return useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }, { scale: scale.value }],
  }));
}

function Star({
  top,
  left,
  size,
  delay,
  color,
  reduceMotion,
}: {
  top: DimensionValue;
  left: DimensionValue;
  size: number;
  delay: number;
  color: string;
  reduceMotion: boolean;
}) {
  const opacity = useSharedValue(reduceMotion ? 0.7 : 0.3);

  if (!reduceMotion) {
    opacity.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(0.9, { duration: 1800 }), withTiming(0.25, { duration: 1800 })), -1, true)
    );
  }

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.star,
        style,
        { top, left, width: size, height: size, borderRadius: size / 2, backgroundColor: color },
      ]}
    />
  );
}

function useParticleDrift(durationMs: number, reduceMotion: boolean) {
  const y = useSharedValue(0);

  if (!reduceMotion) {
    y.value = withRepeat(
      withSequence(
        withTiming(-14, { duration: durationMs, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: durationMs, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }

  return useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
}

function Particle({
  top,
  left,
  size,
  color,
  reduceMotion,
}: {
  top: DimensionValue;
  left: DimensionValue;
  size: number;
  color: string;
  reduceMotion: boolean;
}) {
  const style = useParticleDrift(6000 + size * 400, reduceMotion);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.particle,
        style,
        { top, left, width: size, height: size, borderRadius: size / 2, backgroundColor: color },
      ]}
    />
  );
}

export function AuroraBackground() {
  const { colors, mode } = useTheme();
  const reduceMotion = useThemeStore((s) => s.reduceMotion);
  const opacities = reduceMotion ? OPACITY[mode].still : OPACITY[mode].animated;

  const layer1Style = useDrift(14000, reduceMotion);
  const layer2Style = useDrift(11000, reduceMotion);
  const layer3Style = useDrift(16000, reduceMotion);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.deepMidnight }]} />
      <Animated.View
        style={[
          styles.layer,
          layer1Style,
          { top: '-8%', left: '-22%', width: 280, height: 280, opacity: opacities[0], backgroundColor: colors.lavender },
        ]}
      />
      <Animated.View
        style={[
          styles.layer,
          layer2Style,
          { top: '32%', right: '-28%', width: 260, height: 260, opacity: opacities[1], backgroundColor: colors.auroraBlue },
        ]}
      />
      <Animated.View
        style={[
          styles.layer,
          layer3Style,
          { bottom: '5%', left: '-10%', width: 240, height: 240, opacity: opacities[2], backgroundColor: colors.roseDeep },
        ]}
      />
      {STARS.map((star, index) => (
        <Star key={index} {...star} color={colors.moonWhite} reduceMotion={reduceMotion} />
      ))}
      {PARTICLES.map((particle, index) => (
        <Particle key={index} {...particle} color={colors.champagneGold} reduceMotion={reduceMotion} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    borderRadius: 999,
  },
  star: {
    position: 'absolute',
  },
  particle: {
    position: 'absolute',
    opacity: 0.35,
  },
});
