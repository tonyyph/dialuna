import { LinearGradient } from 'expo-linear-gradient';
import { PropsWithChildren, useEffect } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
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

interface AuroraStageProps {
  children?: React.ReactNode;
  intensity?: 'calm' | 'ritual' | 'premium';
  style?: StyleProp<ViewStyle>;
}

const STAR_FIELD = [
  { top: '7%', left: '18%', size: 2, opacity: 0.72 },
  { top: '12%', left: '82%', size: 2.5, opacity: 0.54 },
  { top: '21%', left: '54%', size: 1.5, opacity: 0.5 },
  { top: '34%', left: '11%', size: 2, opacity: 0.48 },
  { top: '44%', left: '91%', size: 1.5, opacity: 0.62 },
  { top: '58%', left: '27%', size: 2.5, opacity: 0.38 },
  { top: '74%', left: '68%', size: 2, opacity: 0.44 },
  { top: '86%', left: '19%', size: 1.5, opacity: 0.5 },
] as const;

function useAmbientDrift(distance: number, duration: number) {
  const reduceMotion = useThemeStore((s) => s.reduceMotion);
  const drift = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      drift.value = 0;
      return;
    }

    drift.value = withRepeat(
      withSequence(
        withTiming(distance, { duration, easing: Easing.inOut(Easing.ease) }),
        withTiming(-distance * 0.55, { duration: duration * 0.85, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: duration * 0.65, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [distance, drift, duration, reduceMotion]);

  return useAnimatedStyle(() => ({
    transform: [{ translateX: drift.value }, { translateY: drift.value * 0.32 }],
  }));
}

export function AuroraStage({
  children,
  intensity = 'calm',
  style,
}: PropsWithChildren<AuroraStageProps>) {
  const { colors } = useTheme();
  const layerOne = useAmbientDrift(12, 9000);
  const layerTwo = useAmbientDrift(-10, 12000);
  const layerThree = useAmbientDrift(8, 15000);
  const isPremium = intensity === 'premium';

  return (
    <View style={[styles.stage, style]}>
      <LinearGradient
        colors={isPremium ? ['#12081F', '#2C1555', '#090713'] : ['#0E0920', '#241047', '#111B3D']}
        start={{ x: 0.08, y: 0 }}
        end={{ x: 0.92, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.orb,
          styles.orbOne,
          layerOne,
          { backgroundColor: intensity === 'ritual' ? colors.roseDeep : colors.lavender },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.orb,
          styles.orbTwo,
          layerTwo,
          { backgroundColor: colors.auroraBlue },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.orb,
          styles.orbThree,
          layerThree,
          { backgroundColor: isPremium ? colors.champagneGold : colors.softPeach },
        ]}
      />
      {STAR_FIELD.map((star, index) => (
        <View
          key={index}
          pointerEvents="none"
          style={[
            styles.star,
            {
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              borderRadius: star.size / 2,
              opacity: star.opacity,
              backgroundColor: colors.moonWhite,
            },
          ]}
        />
      ))}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.34,
  },
  orbOne: {
    width: 310,
    height: 310,
    top: -86,
    left: -118,
  },
  orbTwo: {
    width: 300,
    height: 300,
    top: 118,
    right: -148,
    opacity: 0.24,
  },
  orbThree: {
    width: 250,
    height: 250,
    bottom: 12,
    left: 82,
    opacity: 0.18,
  },
  star: {
    position: 'absolute',
  },
});
