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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { CalendarDayCell } from '@/components/cycle/CalendarDayCell';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { DayDetailSheet } from '@/features/calendar/DayDetailSheet';
import { getCyclePrediction, getDayInfo } from '@/services/cycleEngine';
import { useLogStore, useSettingsStore, useUserStore } from '@/store';
import { radius, spacing, staggerDelay, typography, useTheme } from '@/theme';
import { toISODate, todayISO } from '@/utils/date';

interface LegendItemProps {
  color: string;
  label: string;
}

function LegendItem({ color, label }: LegendItemProps) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

export function CalendarScreen() {
  const { t } = useTranslation();
  const p = useTheme();
  const profile = useUserStore((s) => s.profile);
  const logs = useLogStore((s) => s.logs);
  const lutealLength = useSettingsStore((s) => s.lutealLength);
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
    lutealLength,
  });

  return (
    <Screen>
      <Animated.View entering={FadeInDown.delay(staggerDelay(0)).duration(340)}>
        <View style={[styles.hero, { backgroundColor: '#2c2620' }]}>
          <View>
            <Text style={[styles.kicker, { color: p.accent400 }]}>{t('calendar.title')}</Text>
            <Text style={[styles.title, { color: '#f4ede1' }]}>
              {format(parseISO(today), 'EEEE, MMM d')}
            </Text>
            <Text style={styles.subtitle}>
              {t('common.cycleDay', { day: prediction.cycleDay })} ·{' '}
              {t(prediction.isPmsWindow ? 'phases.pms' : `phases.${prediction.phase}`)}
            </Text>
          </View>
          <View style={[styles.todayOrb, { backgroundColor: p.accent }]}>
            <Text style={[styles.todayDay, { color: p.onPrimaryBtn }]}>
              {format(parseISO(today), 'd')}
            </Text>
            <Text style={[styles.todayMonth, { color: p.onPrimaryBtn }]}>
              {format(parseISO(today), 'MMM')}
            </Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(staggerDelay(1)).duration(340)}>
        <Card variant="glass" style={styles.timelineCard}>
          <TimelineItem
            color={p.accent}
            label={t('calendar.legend.period')}
            value={format(parseISO(prediction.nextPeriodStart), 'MMM d')}
          />
          <TimelineItem
            color={p.accent400}
            label={t('phases.pms')}
            value={`${format(parseISO(prediction.pmsWindowStart), 'MMM d')} - ${format(parseISO(prediction.pmsWindowEnd), 'MMM d')}`}
          />
          <TimelineItem
            color={p.accent400}
            label={t('calendar.legend.ovulation')}
            value={format(parseISO(prediction.ovulationEstimate), 'MMM d')}
          />
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(staggerDelay(2)).duration(340)}>
        <View style={[styles.monthHeader, { backgroundColor: p.surface }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            onPress={() => setMonth((m) => addMonths(m, -1))}
            style={styles.navBtn}
          >
            <Text style={[styles.navText, { color: p.accent }]}>‹</Text>
          </Pressable>
          <Text style={styles.monthLabel}>{format(month, 'MMMM yyyy')}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.next')}
            onPress={() => setMonth((m) => addMonths(m, 1))}
            style={styles.navBtn}
          >
            <Text style={[styles.navText, { color: p.accent }]}>›</Text>
          </Pressable>
        </View>

        <View style={styles.grid}>
          {days.map((day) => {
            const iso = toISODate(day);
            const info = getDayInfo(iso, profile, lutealLength);
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
                  isSelected: iso === selectedDate,
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
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(staggerDelay(3)).duration(340)}>
        <Card variant="glass" style={styles.legend}>
          <LegendItem color={p.accent} label={t('calendar.legend.period')} />
          <LegendItem
            color={p.name === 'dark' ? 'rgba(225,173,102,0.28)' : p.accent200}
            label={t('calendar.legend.predicted')}
          />
          <LegendItem color={p.phaseSoft.follicular} label={t('calendar.legend.fertile')} />
          <LegendItem color={p.success} label={t('calendar.legend.ovulation')} />
          <LegendItem color={p.phaseSoft.ovulation} label={t('calendar.legend.pms')} />
          <LegendItem color={p.accent600} label={t('calendar.legend.logged')} />
        </Card>
      </Animated.View>

      <DayDetailSheet
        date={selectedDate}
        onClose={() => setSelectedDate(null)}
      />
    </Screen>
  );
}

function TimelineItem({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <View style={styles.timelineItem}>
      <View style={[styles.timelineMark, { backgroundColor: color }]} />
      <View style={styles.timelineText}>
        <Text style={styles.timelineLabel}>{label}</Text>
        <Text style={styles.timelineValue}>{value}</Text>
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
  kicker: {
    ...typography.caption,
  },
  title: {
    ...typography.headline,
    marginTop: spacing(0.5),
  },
  subtitle: {
    ...typography.bodySmall,
    color: 'rgba(244,237,225,0.78)',
    marginTop: spacing(0.5),
  },
  todayOrb: {
    width: 86,
    height: 86,
    borderRadius: radius.sheet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayDay: {
    ...typography.display,
    lineHeight: 38,
  },
  todayMonth: {
    ...typography.caption,
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
  timelineLabel: {
    ...typography.caption,
  },
  timelineValue: {
    ...typography.subtitle,
    fontSize: 14,
    lineHeight: 18,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing(1),
    borderRadius: radius.lg,
    paddingHorizontal: spacing(1),
    paddingVertical: spacing(0.5),
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
