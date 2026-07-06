import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
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

export function AuroraBackground() {
  const { colors, mode } = useTheme();
  const reduceMotion = useThemeStore((s) => s.reduceMotion);
  const opacities = reduceMotion ? OPACITY[mode].still : OPACITY[mode].animated;

  const layer1Style = useDrift(14000, reduceMotion);
  const layer2Style = useDrift(11000, reduceMotion);
  const layer3Style = useDrift(16000, reduceMotion);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    borderRadius: 999,
  },
});
