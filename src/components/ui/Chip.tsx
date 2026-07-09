import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text } from 'react-native';

import { radius, spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';

interface Props {
  label: string;
  emoji?: string;
  selected: boolean;
  onPress: () => void;
}

export function Chip({ label, emoji, selected, onPress }: Props) {
  const { colors, typography, shadows } = useTheme();
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
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: colors.card, borderColor: colors.border },
        selected && {
          backgroundColor: `${colors.lilac}33`,
          borderColor: colors.lilac,
          ...shadows.glow,
          shadowColor: colors.lilac,
        },
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          typography.body,
          { color: selected ? colors.primary : colors.textPrimary },
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
    borderRadius: radius.pill,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  labelSelected: {
    fontWeight: '600',
  },
});
