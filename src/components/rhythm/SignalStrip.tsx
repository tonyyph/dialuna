import { StyleSheet, Text, View } from 'react-native';
import { format, parseISO } from 'date-fns';

import { radius, spacing, typography, useTheme } from '@/theme';
import { HormoneTwinDailyProfile } from '@/types';

export function SignalStrip({ days }: { days: HormoneTwinDailyProfile[] }) {
  const p = useTheme();
  return (
    <View style={styles.row}>
      {days.map((day, index) => (
        <View key={day.date} style={styles.item}>
          <View style={[styles.signal, { height: 22 + day.energyScore * 0.35, backgroundColor: p.phase[day.phase], opacity: index === 0 ? 1 : 0.55 }]} />
          <Text style={[styles.label, { color: index === 0 ? p.text : p.textMuted }]}>{format(parseISO(day.date), 'EEEEE')}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', minHeight: 74 },
  item: { flex: 1, alignItems: 'center', gap: spacing(0.75) },
  signal: { width: 12, borderRadius: radius.capsule },
  label: { ...typography.micro, textTransform: 'none' },
});
