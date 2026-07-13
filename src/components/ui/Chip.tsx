import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text } from 'react-native';

import { radius, shadows, spacing, typography, useTheme } from '@/theme';

import { Pressable } from './Pressable';

interface Props {
  label: string;
  emoji?: string;
  selected: boolean;
  onPress: () => void;
}

export function Chip({ label, emoji, selected, onPress }: Props) {
  const p = useTheme();
  const handlePress = () => {
    Haptics.selectionAsync();
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={handlePress}
      scaleTo={0.94}
      style={[
        styles.base,
        { backgroundColor: selected ? 'transparent' : p.surface },
        selected && shadows.chip,
      ]}
    >
      {selected ? (
        <LinearGradient
          pointerEvents="none"
          colors={p.goldChipGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <Text
        style={[
          styles.label,
          { color: selected ? (p.name === 'dark' ? '#201f1d' : p.accent800) : p.text },
          selected && styles.labelSelected,
        ]}
      >
        {emoji ? `${emoji} ${label}` : label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    borderRadius: radius.button,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1.25),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadows.tiny,
  },
  label: { ...typography.bodySmall, fontFamily: 'Manrope_600SemiBold' },
  labelSelected: { fontFamily: 'Manrope_700Bold' },
});
