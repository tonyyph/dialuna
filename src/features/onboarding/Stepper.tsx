import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

interface Props {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

export function Stepper({ label, unit, value, min, max, onChange }: Props) {
  const step = (delta: number) => {
    const next = Math.min(max, Math.max(min, value + delta));
    if (next !== value) {
      Haptics.selectionAsync();
      onChange(next);
    }
  };

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label} -`}
          onPress={() => step(-1)}
          style={styles.btn}
        >
          <Text style={styles.btnText}>−</Text>
        </Pressable>
        <Text style={styles.value}>
          {value} {unit}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label} +`}
          onPress={() => step(1)}
          style={styles.btn}
        >
          <Text style={styles.btnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing(1),
  },
  label: {
    ...typography.subtitle,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.glassStrong,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing(1),
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.softRose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    ...typography.title,
    color: colors.primary,
  },
  value: {
    ...typography.subtitle,
  },
});
