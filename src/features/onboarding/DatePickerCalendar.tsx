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
import { useTranslation } from 'react-i18next';

import { radius, spacing, typography, useTheme } from '@/theme';
import { toISODate, todayISO } from '@/utils/date';

interface Props {
  selected: string | null;
  onSelect: (date: string) => void;
  /** Latest selectable date (default today). */
  maxDate?: string;
}

export function DatePickerCalendar({ selected, onSelect, maxDate = todayISO() }: Props) {
  const p = useTheme();
  const { t } = useTranslation();
  const [month, setMonth] = useState(() =>
    startOfMonth(selected ? parseISO(selected) : new Date())
  );

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  });

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          onPress={() => setMonth((m) => addMonths(m, -1))}
          style={styles.navBtn}
        >
          <Text style={[styles.navText, { color: p.accentInk }]}>‹</Text>
        </Pressable>
        <Text style={[styles.monthLabel, { color: p.text }]}>{format(month, 'MMMM yyyy')}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.next')}
          onPress={() => setMonth((m) => addMonths(m, 1))}
          style={styles.navBtn}
        >
          <Text style={[styles.navText, { color: p.accentInk }]}>›</Text>
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
              style={[styles.cell, isSelected && { backgroundColor: p.accent }]}
            >
              <Text
                style={[
                  styles.cellText,
                  { color: !inMonth || disabled ? p.textFaint : p.text },
                  isSelected && [styles.cellTextSelected, { color: p.accent100 }],
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
    borderRadius: radius.card,
    padding: 0,
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
  },
  monthLabel: {
    ...typography.serifValue,
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
  cellText: {
    ...typography.body,
  },
  cellTextSelected: {
    fontWeight: '700',
  },
});
