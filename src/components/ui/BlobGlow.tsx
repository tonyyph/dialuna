import { useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Circle, Defs, RadialGradient, Stop, Svg } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  size: number;
  /** [inner stop, outer stop] — pass the outer stop fully transparent, e.g. ['rgba(182,130,53,0.28)', 'rgba(182,130,53,0)']. */
  colors: readonly [string, string];
  style?: StyleProp<ViewStyle>;
}

/** Soft blurred radial glow with a continuous ~9s drift, matching the prototype's blobFloat keyframe. */
export function BlobGlow({ size, colors, style }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: progress.value * 8 - 4 },
      { translateY: progress.value * 10 },
      { scale: 1 + progress.value * 0.06 },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[{ width: size, height: size }, animatedStyle, style]}
    >
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="blob" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={colors[0]} stopOpacity={1} />
            <Stop offset="100%" stopColor={colors[1]} stopOpacity={1} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#blob)" />
      </Svg>
    </Animated.View>
  );
}
