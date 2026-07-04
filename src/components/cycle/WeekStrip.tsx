import { format, parseISO } from 'date-fns';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';
import { HormoneTwinDailyProfile } from '@/types';

interface Props {
  days: HormoneTwinDailyProfile[];
}

export function WeekStrip({ days }: Props) {
  return (
    <View style={styles.row}>
      {days.map((day) => (
        <View key={day.date} style={styles.col}>
          <Text style={styles.weekday}>
            {format(parseISO(day.date), 'EEEEE')}
          </Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  height: `${Math.max(12, day.energyScore)}%`,
                  backgroundColor: day.isPmsWindow
                    ? colors.peach
                    : colors.phase[day.phase],
                },
              ]}
            />
          </View>
          <View
            style={[
              styles.dot,
              {
                backgroundColor: day.isPmsWindow
                  ? colors.peach
                  : colors.phase[day.phase],
              },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing(1),
  },
  col: {
    flex: 1,
    alignItems: 'center',
    gap: spacing(0.75),
  },
  weekday: {
    ...typography.caption,
  },
  barTrack: {
    width: 10,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.softRose,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: radius.pill,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
  },
});
