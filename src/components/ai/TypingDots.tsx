import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { spacing, useTheme } from '@/theme';

function Dot({ delay }: { delay: number }) {
  const p = useTheme();
  const opacity = useSharedValue(0.25);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.25, { duration: 700, easing: Easing.inOut(Easing.quad) })
        ),
        -1
      )
    );
  }, [delay, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[styles.dot, { backgroundColor: p.accent }, style]} />;
}

export function TypingDots() {
  return (
    <View style={styles.row} accessibilityLabel="typing">
      <Dot delay={0} />
      <Dot delay={200} />
      <Dot delay={400} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
    paddingVertical: spacing(1.25),
    paddingHorizontal: spacing(0.5),
    alignSelf: 'flex-start',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
