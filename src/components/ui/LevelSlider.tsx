import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

interface Props {
  label: string;
  /** 1-10 */
  value: number;
  onChange: (value: number) => void;
}

const LEVELS = Array.from({ length: 10 }, (_, i) => i + 1);

export function LevelSlider({ label, value, onChange }: Props) {
  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}/10</Text>
      </View>
      <View style={styles.track} accessibilityRole="adjustable" accessibilityLabel={label} accessibilityValue={{ min: 1, max: 10, now: value }}>
        {LEVELS.map((level) => (
          <Pressable
            key={level}
            accessibilityLabel={`${label} ${level}`}
            hitSlop={{ top: 12, bottom: 12 }}
            onPress={() => {
              Haptics.selectionAsync();
              onChange(level);
            }}
            style={[
              styles.dot,
              level <= value && styles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing(1),
  },
  label: {
    ...typography.h3,
  },
  value: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  track: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dot: {
    flex: 1,
    height: 12,
    marginHorizontal: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.softRose,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
});
