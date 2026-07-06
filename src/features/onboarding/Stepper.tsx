import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';

interface Props {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

export function Stepper({ label, unit, value, min, max, onChange }: Props) {
  const { colors, typography } = useTheme();
  const step = (delta: number) => {
    const next = Math.min(max, Math.max(min, value + delta));
    if (next !== value) {
      Haptics.selectionAsync();
      onChange(next);
    }
  };

  return (
    <View style={styles.row}>
      <Text style={typography.subtitle}>{label}</Text>
      <View
        style={[
          styles.controls,
          { backgroundColor: colors.glassStrong, borderColor: colors.border },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label} -`}
          onPress={() => step(-1)}
          style={[styles.btn, { backgroundColor: colors.softRose }]}
        >
          <Text style={[typography.title, { color: colors.primary }]}>−</Text>
        </Pressable>
        <Text style={typography.subtitle}>
          {value} {unit}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label} +`}
          onPress={() => step(1)}
          style={[styles.btn, { backgroundColor: colors.softRose }]}
        >
          <Text style={[typography.title, { color: colors.primary }]}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing(1),
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing(1),
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
