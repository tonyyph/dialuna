import { format, parseISO } from 'date-fns';
import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography, useTheme } from '@/theme';
import { HormoneTwinDailyProfile } from '@/types';

interface Props {
  days: HormoneTwinDailyProfile[];
}

export function WeekStrip({ days }: Props) {
  const p = useTheme();
  return (
    <View style={styles.row}>
      {days.map((day) => {
        const color = day.isPmsWindow ? p.accent400 : p.phase[day.phase];
        return (
          <View key={day.date} style={styles.col}>
            <Text style={styles.weekday}>
              {format(parseISO(day.date), 'EEEEE')}
            </Text>
            <View style={[styles.barTrack, { backgroundColor: p.accent100 }]}>
              <View
                style={[
                  styles.barFill,
                  {
                    height: `${Math.max(12, day.energyScore)}%`,
                    backgroundColor: color,
                  },
                ]}
              />
            </View>
            <View style={[styles.dot, { backgroundColor: color }]} />
          </View>
        );
      })}
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
