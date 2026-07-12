import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, shadows, spacing, typography, useTheme } from '@/theme';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessibility label for the group. */
  label?: string;
}

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  label,
}: Props<T>) {
  const p = useTheme();
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      style={[styles.track, { backgroundColor: p.fillSubtle }]}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="radio"
            accessibilityLabel={opt.label}
            accessibilityState={{ selected }}
            onPress={() => {
              if (selected) return;
              Haptics.selectionAsync();
              onChange(opt.value);
            }}
            style={[
              styles.segment,
              selected && { backgroundColor: p.surfaceSolid, ...shadows.tiny },
            ]}
          >
            <Text
              style={[
                styles.segLabel,
                { color: selected ? p.text : p.textMuted },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: radius.md,
    padding: 3,
    alignSelf: 'flex-start',
  },
  segment: {
    paddingHorizontal: spacing(1.75),
    paddingVertical: spacing(0.75),
    borderRadius: radius.md - 3,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
  },
  segLabel: { ...typography.caption, fontFamily: 'Manrope_600SemiBold' },
});
