import { StyleSheet, View } from 'react-native';

import { MoonMark, MoonMarkState } from '@/components/ui/MoonMark';
import { useTheme } from '@/theme/useTheme';

interface LunarCompanionProps {
  size?: number;
  state?: MoonMarkState;
  premium?: boolean;
}

export function LunarCompanion({
  size = 142,
  state = 'idle',
  premium = false,
}: LunarCompanionProps) {
  const { colors } = useTheme();
  const haloSize = size * 1.42;

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={state === 'thinking' ? 'Luna is thinking' : 'Luna companion'}
      style={[styles.wrap, { width: haloSize, height: haloSize }]}
    >
      <View
        pointerEvents="none"
        style={[
          styles.halo,
          {
            width: haloSize,
            height: haloSize,
            borderRadius: haloSize / 2,
            backgroundColor: premium ? colors.champagneGold : colors.lilac,
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.innerHalo,
          {
            width: size * 1.06,
            height: size * 1.06,
            borderRadius: (size * 1.06) / 2,
            borderColor: premium ? `${colors.champagneGold}88` : 'rgba(255,255,255,0.36)',
          },
        ]}
      />
      <MoonMark state={state} size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    opacity: 0.2,
  },
  innerHalo: {
    position: 'absolute',
    borderWidth: 1,
    opacity: 0.9,
  },
});
