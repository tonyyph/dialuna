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
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
  SvgProps,
} from 'react-native-svg';

import { useThemeStore } from '@/store/themeStore';
import { useTheme } from '@/theme/useTheme';

export type LunaOrbState = 'idle' | 'listening' | 'thinking' | 'celebrating';

interface LunaOrbProps {
  state?: LunaOrbState;
  size?: number;
}

type Expression = {
  leftEye: SvgProps['children'];
  rightEye: SvgProps['children'];
  mouth: SvgProps['children'];
  cheekOpacity: number;
};

function expressionForState(state: LunaOrbState): Expression {
  if (state === 'thinking') {
    return {
      leftEye: <Circle cx="82" cy="87" r="5.3" fill="#32205F" />,
      rightEye: <Circle cx="118" cy="87" r="5.3" fill="#32205F" />,
      mouth: <Path d="M94 106C99 101 106 101 111 106" stroke="#7B4CA8" strokeWidth="3" strokeLinecap="round" fill="none" />,
      cheekOpacity: 0.34,
    };
  }

  if (state === 'listening') {
    return {
      leftEye: <Circle cx="82" cy="88" r="6" fill="#32205F" />,
      rightEye: <Circle cx="118" cy="88" r="6" fill="#32205F" />,
      mouth: <Path d="M95 105C99 111 106 111 111 105" stroke="#7B4CA8" strokeWidth="3" strokeLinecap="round" fill="none" />,
      cheekOpacity: 0.46,
    };
  }

  if (state === 'celebrating') {
    return {
      leftEye: <Path d="M76 87C80 92 86 92 90 87" stroke="#32205F" strokeWidth="3.4" strokeLinecap="round" fill="none" />,
      rightEye: <Path d="M112 87C116 92 122 92 126 87" stroke="#32205F" strokeWidth="3.4" strokeLinecap="round" fill="none" />,
      mouth: <Path d="M93 104C99 115 107 115 113 104" stroke="#7B4CA8" strokeWidth="3.4" strokeLinecap="round" fill="none" />,
      cheekOpacity: 0.58,
    };
  }

  return {
    leftEye: <Circle cx="82" cy="88" r="6.3" fill="#32205F" />,
    rightEye: <Circle cx="118" cy="88" r="6.3" fill="#32205F" />,
    mouth: <Path d="M94 105C99 111 106 111 112 105" stroke="#7B4CA8" strokeWidth="3.2" strokeLinecap="round" fill="none" />,
    cheekOpacity: 0.42,
  };
}

function Sparkles({ state }: { state: LunaOrbState }) {
  const isCelebrating = state === 'celebrating';

  return (
    <G opacity={isCelebrating ? 1 : 0.78}>
      <Path d="M35 48L39 58L49 62L39 66L35 76L31 66L21 62L31 58Z" fill="#FFD7A7" />
      <Path d="M159 38L162 46L170 49L162 52L159 60L156 52L148 49L156 46Z" fill="#FFD7A7" />
      <Path d="M158 122L161 130L169 133L161 136L158 144L155 136L147 133L155 130Z" fill="#F8B6DA" />
      <Circle cx="48" cy="119" r="3.2" fill="#F8B6DA" />
      <Circle cx="147" cy="76" r="2.8" fill="#FFFFFF" opacity="0.9" />
      {isCelebrating ? (
        <G>
          <Circle cx="55" cy="38" r="3" fill="#F6A7C8" />
          <Circle cx="139" cy="35" r="3.4" fill="#F6A7C8" />
          <Path d="M52 34C49 28 55 24 59 29C63 23 70 28 66 35C63 40 55 42 52 34Z" fill="#F77FAA" />
          <Path d="M137 30C134 24 140 20 144 25C148 19 155 24 151 31C148 36 140 38 137 30Z" fill="#F77FAA" />
        </G>
      ) : null}
    </G>
  );
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
      glowOpacity.value = 0.72;
    } else if (state === 'thinking') {
      rotate.value = withRepeat(
        withSequence(
          withTiming(4, { duration: 1700, easing: Easing.inOut(Easing.ease) }),
          withTiming(-5, { duration: 1700, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      glowOpacity.value = withRepeat(withTiming(0.88, { duration: 1900 }), -1, true);
    } else if (state === 'listening') {
      glowScale.value = withRepeat(withTiming(1.08, { duration: 900 }), -1, true);
      glowOpacity.value = withRepeat(withTiming(0.92, { duration: 900 }), -1, true);
    } else {
      floatY.value = withRepeat(withTiming(-7, { duration: 3000, easing: Easing.inOut(Easing.ease) }), -1, true);
      glowScale.value = withRepeat(withTiming(1.07, { duration: 2200 }), -1, true);
      glowOpacity.value = withRepeat(withTiming(0.88, { duration: 2200 }), -1, true);
    }

    if (state === 'celebrating') {
      pop.value = withSequence(
        withTiming(0.86, { duration: 0 }),
        withTiming(1.1, { duration: reduceMotion ? 120 : 220 }),
        withTiming(1, { duration: reduceMotion ? 90 : 180 })
      );
    }
  }, [state, reduceMotion, floatY, glowScale, glowOpacity, rotate, pop]);

  const mascotStyle = useAnimatedStyle(() => ({
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

  const expression = expressionForState(state);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glow,
          glowStyle,
          {
            width: size * 1.34,
            height: size * 1.34,
            borderRadius: (size * 1.34) / 2,
            backgroundColor: colors.lavenderLight,
          },
        ]}
      />
      <Animated.View style={[mascotStyle, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 200 200">
          <Defs>
            <RadialGradient id="halo" cx="50%" cy="40%" r="55%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <Stop offset="52%" stopColor="#F3D9FF" stopOpacity="0.72" />
              <Stop offset="100%" stopColor="#A988F5" stopOpacity="0.18" />
            </RadialGradient>
            <LinearGradient id="hair" x1="42" y1="24" x2="147" y2="135">
              <Stop offset="0%" stopColor="#FFE0FF" />
              <Stop offset="47%" stopColor="#C8A8FF" />
              <Stop offset="100%" stopColor="#8E6AE8" />
            </LinearGradient>
            <LinearGradient id="cloak" x1="49" y1="111" x2="150" y2="178">
              <Stop offset="0%" stopColor="#A47AF1" />
              <Stop offset="58%" stopColor="#6F4AD0" />
              <Stop offset="100%" stopColor="#4B2F98" />
            </LinearGradient>
            <LinearGradient id="moon" x1="83" y1="2" x2="139" y2="59">
              <Stop offset="0%" stopColor="#FFF7D8" />
              <Stop offset="48%" stopColor="#FFD9A9" />
              <Stop offset="100%" stopColor="#F5A6D4" />
            </LinearGradient>
            <LinearGradient id="cloud" x1="41" y1="147" x2="163" y2="190">
              <Stop offset="0%" stopColor="#F6EDFF" />
              <Stop offset="100%" stopColor="#BCA4F4" />
            </LinearGradient>
          </Defs>

          <Circle cx="100" cy="98" r="82" fill="url(#halo)" />
          <Sparkles state={state} />

          <G opacity="0.88">
            <Ellipse cx="70" cy="166" rx="30" ry="15" fill="url(#cloud)" />
            <Ellipse cx="105" cy="166" rx="44" ry="20" fill="url(#cloud)" />
            <Ellipse cx="136" cy="166" rx="30" ry="15" fill="url(#cloud)" />
          </G>

          <Path d="M52 147C61 122 75 109 99 108C124 108 143 122 151 148C131 161 75 161 52 147Z" fill="url(#cloak)" />
          <Path d="M99 119L113 151H85Z" fill="#FAD46D" opacity="0.92" />
          <Path d="M99 121C89 132 80 142 66 146C81 157 119 158 136 146C122 142 111 132 99 121Z" fill="#7F58DD" opacity="0.56" />
          <Path d="M95 124C96 134 102 141 111 144C101 151 86 148 79 141C84 140 89 134 95 124Z" fill="#FFF3C4" opacity="0.9" />

          <Path d="M55 84C55 48 78 28 105 28C134 28 151 51 146 84C153 96 148 119 131 125C116 137 83 136 67 125C50 117 47 95 55 84Z" fill="url(#hair)" />
          <Path d="M57 83C47 83 42 95 46 106C49 114 57 118 64 115C57 108 56 94 57 83Z" fill="#B795F8" />
          <Path d="M143 83C153 83 158 95 154 106C151 114 143 118 136 115C143 108 144 94 143 83Z" fill="#B795F8" />

          <Ellipse cx="100" cy="88" rx="43" ry="39" fill="#FFE3F7" />
          <Path d="M60 83C68 55 89 43 112 47C97 55 91 65 89 82C78 76 69 76 60 83Z" fill="#EED2FF" />
          <Path d="M92 50C112 46 132 57 139 81C129 75 118 75 107 83C108 66 104 57 92 50Z" fill="#BA97F7" opacity="0.86" />
          <Path d="M71 54C79 32 103 30 116 43C98 43 84 48 71 54Z" fill="#FFF2FF" opacity="0.58" />

          <Path d="M95 20C107 7 129 10 139 25C126 20 115 25 111 37C107 49 113 61 125 67C106 72 86 58 86 39C86 32 89 25 95 20Z" fill="url(#moon)" />
          <Path d="M100 59C105 54 112 56 115 62C109 58 103 60 101 67C99 74 103 80 110 83C99 86 88 78 88 67C88 64 93 64 100 59Z" fill="#B990F4" opacity="0.82" />

          <G>
            {expression.leftEye}
            {expression.rightEye}
            <Circle cx="84" cy="85" r="2" fill="#FFFFFF" opacity={state === 'celebrating' ? 0 : 0.9} />
            <Circle cx="120" cy="85" r="2" fill="#FFFFFF" opacity={state === 'celebrating' ? 0 : 0.9} />
            <Ellipse cx="70" cy="101" rx="9" ry="5" fill="#F39AC1" opacity={expression.cheekOpacity} />
            <Ellipse cx="130" cy="101" rx="9" ry="5" fill="#F39AC1" opacity={expression.cheekOpacity} />
            {expression.mouth}
          </G>

          <Path d="M51 125C41 132 38 143 45 150C54 151 66 142 72 130Z" fill="#FFE3F7" />
          <Path d="M149 125C159 132 162 143 155 150C146 151 134 142 128 130Z" fill="#FFE3F7" />
          <Circle cx="101" cy="137" r="8" fill="#F7D15C" />
          <Path d="M101 128L104 135L111 137L104 140L101 147L98 140L91 137L98 135Z" fill="#FFF8CF" />
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
