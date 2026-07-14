import { PropsWithChildren, useState } from 'react';
import {
  Pressable as RNPressable,
  PressableProps as RNPressableProps,
  PressableStateCallbackType,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Animated, {
  AnimatedStyle,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from 'react-native-reanimated';

import { springs } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);

type PressableStyle =
  | StyleProp<ViewStyle>
  | AnimatedStyle<ViewStyle>
  | readonly (StyleProp<ViewStyle> | AnimatedStyle<ViewStyle> | false | null | undefined)[];

export interface AnimatedPressableProps extends Omit<RNPressableProps, 'style'> {
  /** Scale applied on press-in, springs back to 1 on press-out/release. */
  scaleTo?: number;
  springConfig?: WithSpringConfig;
  style?: PressableStyle | ((state: PressableStateCallbackType) => PressableStyle);
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
  const [pressed, setPressed] = useState(false);
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pressableState: PressableStateCallbackType = { pressed, hovered: false };

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e) => {
        setPressed(true);
        // Reanimated shared values are mutated via `.value` by design (not React state).
        // eslint-disable-next-line react-hooks/immutability
        scale.value = withSpring(scaleTo, springConfig);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        // eslint-disable-next-line react-hooks/immutability -- see above
        scale.value = withSpring(1, springConfig);
        onPressOut?.(e);
      }}
      style={[
        typeof style === 'function' ? style(pressableState) : style,
        animatedStyle,
      ]}
    />
  );
}
