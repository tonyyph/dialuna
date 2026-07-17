import * as Haptics from 'expo-haptics';
import { StyleSheet, Text, View } from 'react-native';

import { Pressable } from '@/components/ui/Pressable';
import { shadows, spacing, typography, useTheme } from '@/theme';

interface Props {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

export function Stepper({ label, unit, value, min, max, onChange }: Props) {
  const p = useTheme();
  const step = (delta: number) => {
    const next = Math.min(max, Math.max(min, value + delta));
    if (next !== value) {
      Haptics.selectionAsync();
      onChange(next);
    }
  };

  const circle = { backgroundColor: p.surfaceSolid };

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: p.textMuted }]}>{label}</Text>
      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label} -`}
          onPress={() => step(-1)}
          scaleTo={0.94}
          style={[styles.btn, circle]}
        >
          <Text style={[styles.btnText, { color: p.text }]}>−</Text>
        </Pressable>
        <Text style={[styles.value, { color: p.text }]}>
          {value} {unit}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label} +`}
          onPress={() => step(1)}
          scaleTo={0.94}
          style={[styles.btn, circle]}
        >
          <Text style={[styles.btnText, { color: p.text }]}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing(1) },
  label: { ...typography.caption },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.tiny,
  },
  btnText: { fontSize: 18, lineHeight: 22, fontFamily: 'Manrope_600SemiBold' },
  value: { ...typography.serifValue, minWidth: 80, textAlign: 'center' },
});
