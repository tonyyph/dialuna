import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';
import { toISODate, todayISO } from '@/utils/date';

interface Props {
  selected: string | null;
  onSelect: (date: string) => void;
  /** Latest selectable date (default today). */
  maxDate?: string;
}

export function DatePickerCalendar({ selected, onSelect, maxDate = todayISO() }: Props) {
  const [month, setMonth] = useState(() =>
    startOfMonth(selected ? parseISO(selected) : new Date())
  );

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          onPress={() => setMonth((m) => addMonths(m, -1))}
          style={styles.navBtn}
        >
          <Text style={styles.navText}>‹</Text>
        </Pressable>
        <Text style={styles.monthLabel}>{format(month, 'MMMM yyyy')}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next month"
          onPress={() => setMonth((m) => addMonths(m, 1))}
          style={styles.navBtn}
        >
          <Text style={styles.navText}>›</Text>
        </Pressable>
      </View>
      <View style={styles.grid}>
        {days.map((day) => {
          const iso = toISODate(day);
          const inMonth = isSameMonth(day, month);
          const disabled = iso > maxDate;
          const isSelected = iso === selected;
          return (
            <Pressable
              key={iso}
              accessibilityRole="button"
              accessibilityLabel={iso}
              accessibilityState={{ selected: isSelected, disabled }}
              disabled={disabled}
              onPress={() => {
                Haptics.selectionAsync();
                onSelect(iso);
              }}
              style={[styles.cell, isSelected && styles.cellSelected]}
            >
              <Text
                style={[
                  styles.cellText,
                  (!inMonth || disabled) && styles.cellMuted,
                  isSelected && styles.cellTextSelected,
                ]}
              >
                {format(day, 'd')}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.glassStrong,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing(2),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing(1),
  },
  navBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    ...typography.headline,
    color: colors.primary,
  },
  monthLabel: {
    ...typography.subtitle,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  cellSelected: {
    backgroundColor: colors.primary,
  },
  cellText: {
    ...typography.body,
  },
  cellMuted: {
    color: colors.border,
  },
  cellTextSelected: {
    color: colors.card,
    fontWeight: '700',
  },
});
