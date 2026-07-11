import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AuroraStage } from '@/components/lunar/AuroraStage';
import { LoadingAurora } from '@/components/lunar/LoadingAurora';
import { PhaseRing } from '@/components/lunar/PhaseRing';
import { PremiumBanner } from '@/components/paywall/PremiumBanner';
import { Button } from '@/components/ui/Button';
import { OrbitalMark } from '@/components/ui/OrbitalMark';
import { Screen } from '@/components/ui/Screen';
import { useCycleToday } from '@/features/cycle/useCycleToday';
import { usePremiumStore } from '@/store';
import { radius, shadows, spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';
import { CyclePhase, HormoneTwinDailyProfile } from '@/types/cycle';

function greetingKey(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'home.greeting.morning';
  if (hour < 18) return 'home.greeting.afternoon';
  return 'home.greeting.evening';
}

function wellnessTone(score: number): string {
  if (score < 45) return 'home.level.low';
  if (score < 65) return 'home.level.steady';
  return 'home.level.high';
}

function headlineKey(phase: CyclePhase): string {
  return `home.lunar.headline.${phase}`;
}

export function HomeScreen() {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();
  const ctx = useCycleToday();
  const isPremium = usePremiumStore((s) => s.isPremium);

  if (!ctx) return <LoadingAurora fullScreen label={t('common.loading')} />;

  const { profile, prediction, twin, week } = ctx;
  const cycleProgress = prediction.cycleDay / profile.averageCycleLength;
  const phaseLabel = t(`phases.${prediction.phase}`);
  const periodText =
    prediction.daysUntilPeriod === 0
      ? t('home.periodToday')
      : t('home.periodIn', { count: prediction.daysUntilPeriod });

  return (
    <Screen edgeToEdge contentContainerStyle={styles.screenContent}>
      <AuroraStage style={styles.stage}>
        <View style={styles.topBar}>
          <View>
            <Text style={[typography.micro, styles.meta]}>Today</Text>
            <Text style={[typography.subtitle, styles.greeting]}>
              {t(greetingKey(), { name: profile.nickname })}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('settings.title')}
            onPress={() => router.push('/settings')}
            hitSlop={10}
            style={styles.iconButton}
          >
            <Ionicons name="options-outline" size={21} color={colors.moonWhite} />
          </Pressable>
        </View>

        <View style={styles.signalStage}>
          <View style={styles.phaseVisual}>
            <PhaseRing phase={prediction.phase} progress={cycleProgress} size={232} />
            <View style={styles.markCenter}>
              <OrbitalMark size={112} premium={isPremium} />
            </View>
          </View>

          <View style={styles.signalCopy}>
            <View style={[styles.phasePill, { borderColor: colors.glassBorder, backgroundColor: colors.glass }]}>
              <View style={[styles.phaseDot, { backgroundColor: colors.phase[prediction.phase] }]} />
              <Text style={[typography.caption, styles.phaseText]}>{phaseLabel}</Text>
              <Text style={[typography.caption, styles.phaseText]}>
                {t('common.cycleDay', { day: prediction.cycleDay })}
              </Text>
            </View>
            <Text style={[typography.displayXl, styles.headline]}>
              {t(headlineKey(prediction.phase))}
            </Text>
            <Text style={[typography.bodyLarge, styles.body]}>{t(twin.coachMessageKey)}</Text>
          </View>
        </View>

        <View style={styles.stageActions}>
          <Button label={t('home.logNow')} onPress={() => router.push('/(tabs)/log')} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('home.askAi')}
            onPress={() => router.push('/(tabs)/ai')}
            style={({ pressed }) => [
              styles.aiAction,
              { borderColor: colors.glassBorder, backgroundColor: colors.glass },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="sparkles" size={18} color={colors.primary} />
            <Text style={[typography.button, { color: colors.moonWhite }]}>{t('home.askAi')}</Text>
          </Pressable>
        </View>
      </AuroraStage>

      <View style={styles.content}>
        <RhythmScore
          score={twin.hormoneTwinScore}
          phase={phaseLabel}
          energy={twin.energyScore}
          mood={twin.moodScore}
          focus={twin.focusScore}
        />
        <NextEvent value={periodText} />
        <ForecastStrip week={week} />
        {isPremium ? <InnerCirclePlan twin={twin} /> : <PremiumBanner onPress={() => router.push('/paywall')} />}
      </View>
    </Screen>
  );
}

function RhythmScore({
  score,
  phase,
  energy,
  mood,
  focus,
}: {
  score: number;
  phase: string;
  energy: number;
  mood: number;
  focus: number;
}) {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();

  return (
    <View style={[styles.panel, { backgroundColor: colors.surface.elevated, borderColor: colors.border }]}>
      <View style={styles.panelHeader}>
        <View>
          <Text style={[typography.caption, { color: colors.primary }]}>{phase}</Text>
          <Text style={typography.headline}>{t('home.twinScore')}</Text>
        </View>
        <View style={[styles.scoreBadge, { borderColor: colors.glassBorder, backgroundColor: colors.softRose }]}>
          <Text style={[typography.displayL, { color: colors.primary }]}>{score}</Text>
          <Text style={[typography.caption, styles.scoreLabel]}>{t(wellnessTone(score))}</Text>
        </View>
      </View>
      <Text style={typography.body}>{t('home.lunar.twinBody')}</Text>
      <View style={styles.signalGrid}>
        <Signal label={t('home.forecast.energy')} value={energy} color={colors.phase.follicular} />
        <Signal label={t('home.forecast.mood')} value={mood} color={colors.phase.menstrual} />
        <Signal label={t('home.forecast.focus')} value={focus} color={colors.phase.ovulation} />
      </View>
    </View>
  );
}

function Signal({ label, value, color }: { label: string; value: number; color: string }) {
  const { typography } = useTheme();
  return (
    <View style={styles.signal}>
      <View style={[styles.signalDot, { backgroundColor: color }]} />
      <Text style={typography.caption}>{label}</Text>
      <Text style={typography.subtitle}>{value}</Text>
    </View>
  );
}

function NextEvent({ value }: { value: string }) {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();
  return (
    <View style={[styles.nextEvent, { backgroundColor: colors.glassStrong, borderColor: colors.glassBorder }]}>
      <View style={[styles.eventIcon, { backgroundColor: colors.softRose }]}>
        <Ionicons name="calendar" size={18} color={colors.primary} />
      </View>
      <View style={styles.eventCopy}>
        <Text style={[typography.caption, { color: colors.text.tertiary }]}>{t('calendar.title')}</Text>
        <Text style={typography.subtitle}>{value}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('tabs.calendar')}
        onPress={() => router.push('/(tabs)/calendar')}
        hitSlop={10}
        style={styles.eventButton}
      >
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}

function ForecastStrip({ week }: { week: HormoneTwinDailyProfile[] }) {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();

  return (
    <View style={styles.forecastSection}>
      <View style={styles.sectionHeader}>
        <Text style={typography.title}>{t('home.weekForecast')}</Text>
        <Text style={[typography.caption, { color: colors.primary }]}>7 days</Text>
      </View>
      <View style={styles.forecastStrip}>
        {week.slice(0, 7).map((day, index) => (
          <View
            key={day.date}
            style={[
              styles.forecastDay,
              {
                backgroundColor: colors.phaseSoft[day.phase],
                borderColor: index === 0 ? colors.phase[day.phase] : colors.border,
              },
            ]}
          >
            <Text style={[typography.caption, styles.dayDate]}>{day.date.slice(5)}</Text>
            <View style={[styles.dayMarker, { backgroundColor: colors.phase[day.phase] }]} />
            <Text style={[typography.caption, styles.dayScore]}>{day.hormoneTwinScore}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function InnerCirclePlan({ twin }: { twin: HormoneTwinDailyProfile }) {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();
  const tipKeys = [...twin.foodTipKeys, ...twin.workoutTipKeys, ...twin.selfCareTipKeys].slice(0, 3);

  return (
    <View style={[styles.innerCircle, { backgroundColor: colors.royalViolet, borderColor: colors.champagneGold }]}>
      <Text style={[typography.caption, styles.innerMeta]}>{t('home.lunar.innerCircle')}</Text>
      <Text style={[typography.headline, styles.innerTitle]}>{t('home.plan.title')}</Text>
      {tipKeys.map((key) => (
        <Text key={key} style={[typography.body, styles.innerTip]}>
          {t(key)}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingBottom: spacing(13),
  },
  stage: {
    minHeight: 608,
    borderBottomLeftRadius: radius.sheet,
    borderBottomRightRadius: radius.sheet,
  },
  topBar: {
    paddingTop: spacing(2.5),
    paddingHorizontal: spacing(2.5),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing(2),
  },
  meta: {
    color: 'rgba(246,241,232,0.62)',
  },
  greeting: {
    color: '#F6F1E8',
    marginTop: 2,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(246,241,232,0.18)',
    backgroundColor: 'rgba(246,241,232,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signalStage: {
    paddingHorizontal: spacing(2.5),
    paddingTop: spacing(2.5),
    alignItems: 'center',
  },
  phaseVisual: {
    width: 232,
    height: 232,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signalCopy: {
    marginTop: spacing(2),
    alignItems: 'center',
    gap: spacing(1),
  },
  phasePill: {
    minHeight: 34,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing(1.5),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(0.75),
  },
  phaseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  phaseText: {
    color: 'rgba(246,241,232,0.78)',
  },
  headline: {
    maxWidth: 348,
    color: '#F6F1E8',
    textAlign: 'center',
    fontSize: 42,
    lineHeight: 45,
  },
  body: {
    color: 'rgba(246,241,232,0.72)',
    textAlign: 'center',
    maxWidth: 334,
  },
  stageActions: {
    paddingHorizontal: spacing(2.5),
    paddingTop: spacing(3),
    gap: spacing(1.25),
  },
  aiAction: {
    minHeight: 52,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(0.75),
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },
  content: {
    paddingHorizontal: spacing(2.5),
    paddingTop: spacing(3),
    gap: spacing(2.5),
  },
  panel: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing(2.5),
    gap: spacing(1.5),
    ...shadows.md,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing(2),
  },
  scoreBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreLabel: {
    textAlign: 'center',
  },
  signalGrid: {
    flexDirection: 'row',
    gap: spacing(1),
  },
  signal: {
    flex: 1,
    gap: spacing(0.5),
  },
  signalDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  nextEvent: {
    minHeight: 76,
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing(1.5),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1.25),
  },
  eventIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventCopy: {
    flex: 1,
  },
  eventButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forecastSection: {
    gap: spacing(1.25),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing(2),
  },
  forecastStrip: {
    flexDirection: 'row',
    gap: spacing(1),
  },
  forecastDay: {
    flex: 1,
    minHeight: 104,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: spacing(1.25),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayDate: {
    fontSize: 10,
  },
  dayMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  dayScore: {
    fontSize: 11,
  },
  innerCircle: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing(2.5),
    ...shadows.bloom,
  },
  innerMeta: {
    color: 'rgba(246,241,232,0.62)',
  },
  innerTitle: {
    color: '#F6F1E8',
    marginTop: spacing(0.5),
    marginBottom: spacing(1.5),
  },
  innerTip: {
    color: 'rgba(246,241,232,0.72)',
    marginTop: spacing(0.5),
  },
});
