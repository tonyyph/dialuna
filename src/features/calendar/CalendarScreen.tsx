import { Ionicons } from '@expo/vector-icons';
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
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuroraStage } from '@/components/lunar/AuroraStage';
import { LoadingAurora } from '@/components/lunar/LoadingAurora';
import { PhaseRing } from '@/components/lunar/PhaseRing';
import { CalendarDayCell } from '@/components/cycle/CalendarDayCell';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { DayDetailSheet } from '@/features/calendar/DayDetailSheet';
import { getCyclePrediction, getDayInfo } from '@/services/cycleEngine';
import { useLogStore, useUserStore } from '@/store';
import { radius, shadows, spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';
import { toISODate, todayISO } from '@/utils/date';
import { useTranslation } from 'react-i18next';

type CalendarMode = 'orbit' | 'grid';

export function CalendarScreen() {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();
  const profile = useUserStore((s) => s.profile);
  const logs = useLogStore((s) => s.logs);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [mode, setMode] = useState<CalendarMode>('orbit');
  const today = todayISO();

  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
      }),
    [month]
  );

  if (!profile) return <LoadingAurora fullScreen label={t('common.loading')} />;

  const prediction = getCyclePrediction({
    lastPeriodStartDate: profile.lastPeriodStartDate,
    averageCycleLength: profile.averageCycleLength,
    averagePeriodLength: profile.averagePeriodLength,
    today,
  });
  const cycleProgress = prediction.cycleDay / profile.averageCycleLength;
  const activePhaseLabel = t(prediction.isPmsWindow ? 'phases.pms' : `phases.${prediction.phase}`);

  return (
    <Screen edgeToEdge contentContainerStyle={styles.screenContent}>
      <AuroraStage style={styles.hero}>
        <View style={styles.topBar}>
          <View>
            <Text style={[typography.caption, styles.kicker]}>{t('calendar.orbit.kicker')}</Text>
            <Text style={[typography.displayL, styles.title]}>{t('calendar.orbit.title')}</Text>
          </View>
          <ModeToggle mode={mode} onChange={setMode} />
        </View>

        <View style={styles.monthNav}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            onPress={() => setMonth((value) => addMonths(value, -1))}
            style={styles.navButton}
          >
            <Ionicons name="chevron-back" size={20} color={colors.moonWhite} />
          </Pressable>
          <Text style={[typography.subtitle, styles.monthLabel]}>{format(month, 'MMMM yyyy')}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.next')}
            onPress={() => setMonth((value) => addMonths(value, 1))}
            style={styles.navButton}
          >
            <Ionicons name="chevron-forward" size={20} color={colors.moonWhite} />
          </Pressable>
        </View>

        <View style={styles.orbitVisual}>
          <PhaseRing phase={prediction.phase} progress={cycleProgress} size={280} />
          <View style={styles.orbitCenter}>
            <Text style={[typography.caption, styles.centerMeta]}>{activePhaseLabel}</Text>
            <Text style={[typography.displayL, styles.centerDay]}>{prediction.cycleDay}</Text>
            <Text style={[typography.caption, styles.centerMeta]}>{t('calendar.orbit.cycleDay')}</Text>
          </View>
          <OrbitNode label={t('calendar.legend.period')} angle={-36} color={colors.primary} />
          <OrbitNode label={t('calendar.legend.ovulation')} angle={48} color={colors.ovulationBlue} />
          <OrbitNode label={t('phases.pms')} angle={146} color={colors.softPeach} />
        </View>
      </AuroraStage>

      <View style={styles.content}>
        {mode === 'orbit' ? (
          <Card variant="moonstone" style={styles.eventPanel}>
            <TimelineItem
              icon="water"
              color={colors.primary}
              label={t('calendar.legend.period')}
              value={format(parseISO(prediction.nextPeriodStart), 'MMM d')}
            />
            <TimelineItem
              icon="sparkles"
              color={colors.ovulationBlue}
              label={t('calendar.legend.ovulation')}
              value={format(parseISO(prediction.ovulationEstimate), 'MMM d')}
            />
            <TimelineItem
              icon="moon"
              color={colors.softPeach}
              label={t('phases.pms')}
              value={`${format(parseISO(prediction.pmsWindowStart), 'MMM d')} - ${format(parseISO(prediction.pmsWindowEnd), 'MMM d')}`}
            />
          </Card>
        ) : null}

        <Card style={styles.gridCard}>
          <View style={styles.gridHeader}>
            <Text style={typography.title}>{t('calendar.orbit.gridTitle')}</Text>
            <Text style={[typography.caption, { color: colors.primary }]}>{t('calendar.orbit.gridHint')}</Text>
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
                    isHighEnergy: info.phase === 'follicular' || info.phase === 'ovulation',
                    inMonth: isSameMonth(day, month),
                  }}
                  onPress={setSelectedDate}
                />
              );
            })}
          </View>
        </Card>

        <View style={styles.legend}>
          <LegendItem color={colors.primary} label={t('calendar.legend.period')} />
          <LegendItem color={colors.ovulationBlue} label={t('calendar.legend.ovulation')} />
          <LegendItem color={colors.phase.luteal} label={t('phases.luteal')} />
          <LegendItem color={colors.champagneGold} label={t('calendar.legend.logged')} />
        </View>
      </View>

      <DayDetailSheet date={selectedDate} onClose={() => setSelectedDate(null)} />
    </Screen>
  );
}

function ModeToggle({ mode, onChange }: { mode: CalendarMode; onChange: (mode: CalendarMode) => void }) {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();
  return (
    <View style={styles.modeToggle}>
      {(['orbit', 'grid'] as const).map((item) => {
        const active = mode === item;
        return (
          <Pressable
            key={item}
            accessibilityRole="button"
            accessibilityLabel={t(`calendar.orbit.mode.${item}`)}
            accessibilityState={{ selected: active }}
            onPress={() => onChange(item)}
            style={[styles.modeButton, active && { backgroundColor: colors.moonWhite }]}
          >
            <Text style={[typography.caption, { color: active ? colors.royalViolet : colors.moonWhite }]}>
              {t(`calendar.orbit.mode.${item}`)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function OrbitNode({ label, angle, color }: { label: string; angle: number; color: string }) {
  const { typography } = useTheme();
  const radiusPx = 126;
  const radian = (angle * Math.PI) / 180;
  return (
    <View
      style={[
        styles.orbitNode,
        {
          transform: [
            { translateX: Math.cos(radian) * radiusPx },
            { translateY: Math.sin(radian) * radiusPx },
          ],
        },
      ]}
    >
      <View style={[styles.nodeDot, { backgroundColor: color }]} />
      <Text numberOfLines={1} style={[typography.caption, styles.nodeLabel]}>{label}</Text>
    </View>
  );
}

function TimelineItem({
  icon,
  color,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  label: string;
  value: string;
}) {
  const { typography } = useTheme();
  return (
    <View style={styles.timelineItem}>
      <View style={[styles.timelineIcon, { backgroundColor: `${color}24` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={styles.timelineText}>
        <Text style={typography.caption}>{label}</Text>
        <Text style={typography.subtitle}>{value}</Text>
      </View>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  const { typography } = useTheme();
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={typography.caption}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingBottom: spacing(13),
  },
  hero: {
    minHeight: 568,
    borderBottomLeftRadius: radius.sheet,
    borderBottomRightRadius: radius.sheet,
  },
  topBar: {
    paddingTop: spacing(3),
    paddingHorizontal: spacing(3),
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing(2),
  },
  kicker: {
    color: 'rgba(255,255,255,0.68)',
  },
  title: {
    color: '#FFF8F1',
    marginTop: spacing(0.25),
  },
  modeToggle: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  modeButton: {
    minHeight: 34,
    minWidth: 58,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing(1),
  },
  monthNav: {
    marginTop: spacing(2.5),
    paddingHorizontal: spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  monthLabel: {
    color: '#FFF8F1',
  },
  orbitVisual: {
    alignSelf: 'center',
    width: 304,
    height: 304,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing(2),
  },
  orbitCenter: {
    position: 'absolute',
    width: 138,
    height: 138,
    borderRadius: 69,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  centerMeta: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  centerDay: {
    color: '#FFF8F1',
    fontSize: 44,
    lineHeight: 46,
  },
  orbitNode: {
    position: 'absolute',
    alignItems: 'center',
    width: 92,
  },
  nodeDot: {
    width: 15,
    height: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.72)',
  },
  nodeLabel: {
    color: 'rgba(255,255,255,0.76)',
    marginTop: spacing(0.5),
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: spacing(2.5),
    marginTop: -spacing(4),
    gap: spacing(2.5),
  },
  eventPanel: {
    gap: spacing(1.5),
    ...shadows.lg,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1.25),
  },
  timelineIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineText: {
    flex: 1,
  },
  gridCard: {
    gap: spacing(1.5),
  },
  gridHeader: {
    gap: spacing(0.5),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(1.25),
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(0.75),
  },
  legendDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
  },
});
