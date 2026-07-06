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
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CalendarDayCell } from '@/components/cycle/CalendarDayCell';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { DayDetailSheet } from '@/features/calendar/DayDetailSheet';
import { getCyclePrediction, getDayInfo } from '@/services/cycleEngine';
import { useLogStore, useUserStore } from '@/store';
import { radius, spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';
import { toISODate, todayISO } from '@/utils/date';

interface LegendItemProps {
  color: string;
  label: string;
  dashed?: boolean;
}

function LegendItem({ color, label, dashed }: LegendItemProps) {
  const { typography } = useTheme();
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.legendDot,
          { backgroundColor: dashed ? 'transparent' : color },
          dashed && { borderWidth: 1.5, borderStyle: 'dashed', borderColor: color },
        ]}
      />
      <Text style={typography.caption}>{label}</Text>
    </View>
  );
}

export function CalendarScreen() {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();
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
  const prediction = getCyclePrediction({
    lastPeriodStartDate: profile.lastPeriodStartDate,
    averageCycleLength: profile.averageCycleLength,
    averagePeriodLength: profile.averagePeriodLength,
    today,
  });

  return (
    <Screen>
      <View style={[styles.hero, { backgroundColor: colors.deepPlum }]}>
        <View>
          <Text style={[typography.caption, { color: colors.peach }]}>
            {t('calendar.title')}
          </Text>
          <Text style={[typography.headline, styles.title, { color: colors.card }]}>
            {format(parseISO(today), 'EEEE, MMM d')}
          </Text>
          <Text style={[typography.body, styles.subtitle]}>
            {t('common.cycleDay', { day: prediction.cycleDay })} ·{' '}
            {t(prediction.isPmsWindow ? 'phases.pms' : `phases.${prediction.phase}`)}
          </Text>
        </View>
        <View style={[styles.todayOrb, { backgroundColor: colors.primary }]}>
          <Text style={[typography.displayL, styles.todayDay, { color: colors.card }]}>
            {format(parseISO(today), 'd')}
          </Text>
          <Text style={[typography.caption, { color: colors.card }]}>
            {format(parseISO(today), 'MMM')}
          </Text>
        </View>
      </View>

      <Card variant="glass" style={styles.timelineCard}>
        <TimelineItem
          color={colors.primary}
          label={t('calendar.legend.period')}
          value={format(parseISO(prediction.nextPeriodStart), 'MMM d')}
        />
        <TimelineItem
          color={colors.peach}
          label={t('phases.pms')}
          value={`${format(parseISO(prediction.pmsWindowStart), 'MMM d')} - ${format(parseISO(prediction.pmsWindowEnd), 'MMM d')}`}
        />
        <TimelineItem
          color={colors.gold}
          label={t('calendar.legend.ovulation')}
          value={format(parseISO(prediction.ovulationEstimate), 'MMM d')}
        />
      </Card>

      <Card style={{ backgroundColor: colors.surface.elevated }}>
        <View style={styles.monthHeader}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            onPress={() => setMonth((m) => addMonths(m, -1))}
            style={styles.navBtn}
          >
            <Text style={[typography.headline, { color: colors.primary }]}>‹</Text>
          </Pressable>
          <Text style={typography.subtitle}>{format(month, 'MMMM yyyy')}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.next')}
            onPress={() => setMonth((m) => addMonths(m, 1))}
            style={styles.navBtn}
          >
            <Text style={[typography.headline, { color: colors.primary }]}>›</Text>
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

      <Card variant="glass" style={styles.legend}>
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

function TimelineItem({ color, label, value }: { color: string; label: string; value: string }) {
  const { typography } = useTheme();
  return (
    <View style={styles.timelineItem}>
      <View style={[styles.timelineMark, { backgroundColor: color }]} />
      <View style={styles.timelineText}>
        <Text style={typography.caption}>{label}</Text>
        <Text style={[typography.subtitle, styles.timelineValue]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginTop: spacing(1.5),
    marginBottom: spacing(2),
    padding: spacing(2.5),
    borderRadius: radius.sheet,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing(2),
    overflow: 'hidden',
  },
  title: {
    marginTop: spacing(0.5),
  },
  subtitle: {
    color: 'rgba(255,255,255,0.78)',
    marginTop: spacing(0.5),
  },
  todayOrb: {
    width: 86,
    height: 86,
    borderRadius: radius.sheet,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  todayDay: {
    lineHeight: 38,
  },
  timelineCard: {
    flexDirection: 'row',
    gap: spacing(1),
    marginBottom: spacing(2),
  },
  timelineItem: {
    flex: 1,
    gap: spacing(0.75),
  },
  timelineMark: {
    width: 28,
    height: 5,
    borderRadius: radius.pill,
  },
  timelineText: {
    gap: spacing(0.25),
  },
  timelineValue: {
    fontSize: 14,
    lineHeight: 18,
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
});
