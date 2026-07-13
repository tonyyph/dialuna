import { PropsWithChildren } from 'react';
import {
  Pressable as RNPressable,
  PressableProps as RNPressableProps,
  PressableStateCallbackType,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from 'react-native-reanimated';

import { springs } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);

export interface AnimatedPressableProps extends RNPressableProps {
  /** Scale applied on press-in, springs back to 1 on press-out/release. */
  scaleTo?: number;
  springConfig?: WithSpringConfig;
}

/** Drop-in RN Pressable with a real spring-driven press scale (native thread). */
export function Pressable({
  scaleTo = 0.96,
  springConfig = springs.snappy,
  onPressIn,
  onPressOut,
  style,
  ...rest
}: PropsWithChildren<AnimatedPressableProps>) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e) => {
        // Reanimated shared values are mutated via `.value` by design (not React state).
        // eslint-disable-next-line react-hooks/immutability
        scale.value = withSpring(scaleTo, springConfig);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        // eslint-disable-next-line react-hooks/immutability -- see above
        scale.value = withSpring(1, springConfig);
        onPressOut?.(e);
      }}
      style={(state: PressableStateCallbackType) => [
        animatedStyle,
        typeof style === 'function' ? style(state) : style,
      ]}
    />
  );
}
