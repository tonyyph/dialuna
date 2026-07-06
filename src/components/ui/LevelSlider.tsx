import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';

interface Props {
  label: string;
  /** 1-10 */
  value: number;
  onChange: (value: number) => void;
}

const LEVELS = Array.from({ length: 10 }, (_, i) => i + 1);

export function LevelSlider({ label, value, onChange }: Props) {
  const { colors, typography } = useTheme();
  return (
    <View>
      <View style={styles.header}>
        <Text style={typography.subtitle}>{label}</Text>
        <Text style={[typography.body, styles.value, { color: colors.primary }]}>{value}/10</Text>
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
              { backgroundColor: level <= value ? colors.primary : colors.softRose },
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
  value: {
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
  },
});
