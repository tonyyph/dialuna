import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CalendarDayCell } from '@/components/cycle/CalendarDayCell';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { DayDetailSheet } from '@/features/calendar/DayDetailSheet';
import { getDayInfo } from '@/services/cycleEngine';
import { useLogStore, useUserStore } from '@/store';
import { colors, radius, spacing, typography } from '@/theme';
import { toISODate, todayISO } from '@/utils/date';

interface LegendItemProps {
  color: string;
  label: string;
  dashed?: boolean;
}

function LegendItem({ color, label, dashed }: LegendItemProps) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.legendDot,
          { backgroundColor: dashed ? 'transparent' : color },
          dashed && { borderWidth: 1.5, borderStyle: 'dashed', borderColor: color },
        ]}
      />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

export function CalendarScreen() {
  const { t } = useTranslation();
  const profile = useUserStore((s) => s.profile);
  const logs = useLogStore((s) => s.logs);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const today = todayISO();

  if (!profile) return null;

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  });

  return (
    <Screen>
      <Text style={styles.title}>{t('calendar.title')}</Text>

      <Card>
        <View style={styles.monthHeader}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            onPress={() => setMonth((m) => addMonths(m, -1))}
            style={styles.navBtn}
          >
            <Text style={styles.navText}>‹</Text>
          </Pressable>
          <Text style={styles.monthLabel}>{format(month, 'MMMM yyyy')}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.next')}
            onPress={() => setMonth((m) => addMonths(m, 1))}
            style={styles.navBtn}
          >
            <Text style={styles.navText}>›</Text>
          </Pressable>
        </View>

        <View style={styles.grid}>
          {days.map((day) => {
            const iso = toISODate(day);
            const info = getDayInfo(iso, profile);
            const log = logs[iso];
            const isPeriodLogged =
              (log && log.flow !== 'none') ||
              (iso >= profile.lastPeriodStartDate &&
                profile.lastPeriodEndDate !== null &&
                iso <= profile.lastPeriodEndDate);
            return (
              <CalendarDayCell
                key={iso}
                date={iso}
                state={{
                  isPeriodLogged: Boolean(isPeriodLogged),
                  isPredictedPeriod: info.isPredictedPeriod && !isPeriodLogged,
                  isFertile: info.isFertile,
                  isPms: info.isPms,
                  isOvulation: info.isOvulation,
                  isToday: iso === today,
                  hasLog: Boolean(log),
                  isHighEnergy:
                    info.phase === 'follicular' || info.phase === 'ovulation',
                  inMonth: isSameMonth(day, month),
                }}
                onPress={setSelectedDate}
              />
            );
          })}
        </View>
      </Card>

      <Card style={styles.legend}>
        <LegendItem color={colors.primary} label={t('calendar.legend.period')} />
        <LegendItem color={colors.primary} label={t('calendar.legend.predicted')} dashed />
        <LegendItem color={colors.phaseSoft.follicular} label={t('calendar.legend.fertile')} />
        <LegendItem color={colors.mint} label={t('calendar.legend.ovulation')} />
        <LegendItem color={colors.phaseSoft.ovulation} label={t('calendar.legend.pms')} />
        <LegendItem color={colors.lavender} label={t('calendar.legend.logged')} />
      </Card>

      <DayDetailSheet
        date={selectedDate}
        onClose={() => setSelectedDate(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.headline,
    paddingTop: spacing(2),
    marginBottom: spacing(2),
  },
  monthHeader: {
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
    borderRadius: radius.pill,
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
  legend: {
    marginTop: spacing(2),
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(1.5),
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(0.75),
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: radius.pill,
  },
  legendLabel: {
    ...typography.caption,
  },
});
