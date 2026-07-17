import { format, parseISO } from 'date-fns';
import { StyleSheet, Text, View } from 'react-native';

import { SemanticColorSet, typographyV2 } from '@/theme';
import { HormoneTwinDailyProfile } from '@/types';

interface Props {
  days: HormoneTwinDailyProfile[];
  theme: SemanticColorSet;
}

export function RhythmStrip({ days, theme }: Props) {
  return (
    <View style={styles.row}>
      {days.map((day) => {
        const color = day.isPmsWindow
          ? theme.signal.warning
          : day.phase === 'menstrual'
            ? theme.signal.period
            : theme.brand.secondary;
        return (
          <View key={day.date} style={styles.col}>
            <View
              style={[
                styles.pulse,
                {
                  height: Math.max(10, day.energyScore) * 0.6,
                  backgroundColor: color,
                },
              ]}
            />
            <Text style={[typographyV2.micro, { color: theme.content.tertiary }]}>
              {format(parseISO(day.date), 'EEEEE')}
            </Text>
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
    alignItems: 'flex-end',
    gap: 4,
  },
  col: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  pulse: {
    width: 6,
    borderRadius: 999,
  },
});
