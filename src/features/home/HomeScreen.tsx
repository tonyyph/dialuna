import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { AuroraStage } from '@/components/lunar/AuroraStage';
import { LoadingAurora } from '@/components/lunar/LoadingAurora';
import { LunarCompanion } from '@/components/lunar/LunarCompanion';
import { OrbitalIsland } from '@/components/lunar/OrbitalIsland';
import { PhaseRing } from '@/components/lunar/PhaseRing';
import { PremiumBanner } from '@/components/paywall/PremiumBanner';
import { Button } from '@/components/ui/Button';
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
  const periodText =
    prediction.daysUntilPeriod === 0
      ? t('home.periodToday')
      : t('home.periodIn', { count: prediction.daysUntilPeriod });
  const cycleProgress = prediction.cycleDay / profile.averageCycleLength;
  const phaseLabel = t(`phases.${prediction.phase}`);

  return (
    <Screen edgeToEdge contentContainerStyle={styles.screenContent}>
      <AuroraStage style={styles.cover}>
        <View style={styles.coverChrome}>
          <View>
            <Text style={[typography.micro, styles.coverMeta]}>{t('home.lunar.cover')}</Text>
            <Text style={[typography.subtitle, styles.greeting]}>
              {t(greetingKey(), { name: profile.nickname })}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('settings.title')}
            onPress={() => router.push('/settings')}
            hitSlop={10}
            style={styles.settingsButton}
          >
            <Ionicons name="options-outline" size={22} color={colors.moonWhite} />
          </Pressable>
        </View>

        <View style={styles.editorialBlock}>
          <Text style={[typography.displayXl, styles.coverHeadline]}>
            {t(headlineKey(prediction.phase))}
          </Text>
          <Text style={[typography.body, styles.coverBody]}>{t(twin.coachMessageKey)}</Text>
        </View>

        <View style={styles.moonSystem} pointerEvents="box-none">
          <PhaseRing phase={prediction.phase} progress={cycleProgress} size={216} />
          <View style={styles.companionCenter}>
            <LunarCompanion size={136} premium={isPremium} />
          </View>
          <View style={[styles.phasePill, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
            <Text style={[typography.caption, styles.phasePillText]}>{phaseLabel}</Text>
          </View>
        </View>

        <View style={styles.orbitField} pointerEvents="box-none">
          <OrbitalIsland
            icon="add-circle"
            label={t('home.lunar.islands.log')}
            value={t('home.lunar.islands.logValue')}
            accent={colors.roseDeep}
            onPress={() => router.push('/(tabs)/log')}
            style={styles.logIsland}
          />
          <OrbitalIsland
            icon="chatbubble-ellipses"
            label={t('home.lunar.islands.ai')}
            value={t('home.lunar.islands.aiValue')}
            accent={colors.auroraBlue}
            onPress={() => router.push('/(tabs)/ai')}
            style={styles.aiIsland}
          />
          <OrbitalIsland
            icon="calendar"
            label={t('home.lunar.islands.calendar')}
            value={t('common.cycleDay', { day: prediction.cycleDay })}
            accent={colors.ovulationBlue}
            onPress={() => router.push('/(tabs)/calendar')}
            style={styles.calendarIsland}
          />
          <OrbitalIsland
            icon="analytics"
            label={t('home.lunar.islands.insights')}
            value={t(wellnessTone(twin.hormoneTwinScore))}
            accent={colors.lilac}
            onPress={() => router.push('/(tabs)/insights')}
            style={styles.insightIsland}
          />
          <OrbitalIsland
            icon="sparkles"
            label={t('home.lunar.islands.forecast')}
            value={periodText}
            accent={colors.champagneGold}
            onPress={() => router.push('/(tabs)/calendar')}
            style={styles.forecastIsland}
          />
        </View>
      </AuroraStage>

      <View style={styles.journal}>
        <Animated.View entering={FadeInDown.duration(420)}>
          <TodayNote message={t(twin.coachMessageKey)} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(420)}>
          <TwinOrbit
            score={twin.hormoneTwinScore}
            phase={phaseLabel}
            energy={twin.energyScore}
            mood={twin.moodScore}
            focus={twin.focusScore}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140).duration(420)}>
          <ForecastRibbon week={week} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(420)}>
          {isPremium ? <InnerCirclePlan twin={twin} /> : <PremiumBanner onPress={() => router.push('/paywall')} />}
        </Animated.View>
      </View>
    </Screen>
  );
}

function TodayNote({ message }: { message: string }) {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();

  return (
    <View style={[styles.notePanel, { backgroundColor: colors.surface.elevated, borderColor: colors.border }]}>
      <Text style={[typography.caption, { color: colors.primary }]}>{t('home.lunar.todayNote')}</Text>
      <Text style={[typography.displayL, styles.noteTitle]}>{t('home.lunar.noteTitle')}</Text>
      <Text style={typography.bodyLarge}>{message}</Text>
      <Button label={t('home.lunar.beginRitual')} variant="secondary" onPress={() => router.push('/(tabs)/log')} />
    </View>
  );
}

function TwinOrbit({
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
    <View style={[styles.twinPanel, { backgroundColor: colors.glassStrong, borderColor: colors.glassBorder }]}>
      <View style={styles.twinCopy}>
        <Text style={[typography.caption, { color: colors.primary }]}>{phase}</Text>
        <Text style={typography.headline}>{t('home.twinScore')}</Text>
        <Text style={typography.body}>{t('home.lunar.twinBody')}</Text>
      </View>
      <View style={[styles.scoreMoon, { backgroundColor: colors.softRose, borderColor: colors.glassBorder }]}>
        <Text style={[typography.displayL, { color: colors.primary }]}>{score}</Text>
        <Text style={[typography.caption, styles.scoreLabel]}>{t(wellnessTone(score))}</Text>
      </View>
      <View style={styles.signalRow}>
        <Signal label={t('home.forecast.energy')} value={energy} color={colors.ovulationBlue} />
        <Signal label={t('home.forecast.mood')} value={mood} color={colors.roseDeep} />
        <Signal label={t('home.forecast.focus')} value={focus} color={colors.auroraBlue} />
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

function ForecastRibbon({ week }: { week: HormoneTwinDailyProfile[] }) {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();

  return (
    <View style={styles.ribbonSection}>
      <View style={styles.sectionHeader}>
        <Text style={typography.title}>{t('home.lunar.forecastRibbon')}</Text>
        <Text style={[typography.caption, { color: colors.primary }]}>{t('home.weekForecast')}</Text>
      </View>
      <View style={styles.ribbon}>
        {week.slice(0, 7).map((day, index) => (
          <View
            key={day.date}
            style={[
              styles.ribbonDay,
              {
                backgroundColor: colors.phaseSoft[day.phase],
                borderColor: index === 0 ? colors.phase[day.phase] : colors.border,
              },
            ]}
          >
            <Text style={[typography.caption, styles.ribbonDate]}>{day.date.slice(5)}</Text>
            <View style={[styles.ribbonNode, { backgroundColor: colors.phase[day.phase] }]} />
            <Text style={[typography.caption, styles.ribbonScore]}>{day.hormoneTwinScore}</Text>
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
    <View style={[styles.innerCircle, { backgroundColor: colors.royalViolet }]}>
      <View style={[styles.innerRing, { borderColor: colors.champagneGold }]} />
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
    paddingBottom: spacing(14),
  },
  cover: {
    minHeight: 780,
    borderBottomLeftRadius: radius.sheet,
    borderBottomRightRadius: radius.sheet,
  },
  coverChrome: {
    paddingTop: spacing(2.5),
    paddingHorizontal: spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  coverMeta: {
    color: 'rgba(255,255,255,0.68)',
  },
  greeting: {
    color: '#FFF8F1',
    marginTop: 2,
  },
  settingsButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editorialBlock: {
    paddingHorizontal: spacing(3),
    marginTop: spacing(2.5),
    width: '92%',
  },
  coverHeadline: {
    color: '#FFF8F1',
    fontSize: 43,
    lineHeight: 45,
  },
  coverBody: {
    color: 'rgba(255,255,255,0.76)',
    marginTop: spacing(1.25),
    maxWidth: 318,
  },
  moonSystem: {
    alignSelf: 'center',
    width: 216,
    height: 216,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing(2.25),
  },
  companionCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phasePill: {
    position: 'absolute',
    bottom: -12,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(0.75),
  },
  phasePillText: {
    color: 'rgba(255,255,255,0.8)',
  },
  orbitField: {
    flex: 1,
    marginTop: spacing(0.5),
  },
  logIsland: {
    position: 'absolute',
    left: spacing(3),
    top: spacing(2),
    width: 145,
  },
  aiIsland: {
    position: 'absolute',
    right: spacing(3),
    top: spacing(0.75),
    width: 142,
  },
  calendarIsland: {
    position: 'absolute',
    left: spacing(2.5),
    top: spacing(13),
    width: 154,
  },
  insightIsland: {
    position: 'absolute',
    right: spacing(2.5),
    top: spacing(13.5),
    width: 156,
  },
  forecastIsland: {
    position: 'absolute',
    left: '28%',
    top: spacing(23.5),
    width: 178,
  },
  journal: {
    paddingHorizontal: spacing(2.5),
    paddingTop: spacing(3),
    gap: spacing(3),
  },
  notePanel: {
    borderRadius: radius.sheet,
    borderWidth: 1,
    padding: spacing(3),
    gap: spacing(1.5),
    ...shadows.lg,
  },
  noteTitle: {
    maxWidth: 260,
  },
  twinPanel: {
    borderRadius: radius.sheet,
    borderWidth: 1,
    padding: spacing(2.5),
    ...shadows.md,
  },
  twinCopy: {
    width: '68%',
    gap: spacing(0.75),
  },
  scoreMoon: {
    position: 'absolute',
    top: spacing(2.5),
    right: spacing(2.5),
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreLabel: {
    textAlign: 'center',
  },
  signalRow: {
    flexDirection: 'row',
    gap: spacing(1),
    marginTop: spacing(2.5),
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
  ribbonSection: {
    gap: spacing(1.5),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing(2),
  },
  ribbon: {
    flexDirection: 'row',
    gap: spacing(1),
  },
  ribbonDay: {
    flex: 1,
    minHeight: 110,
    borderRadius: radius.xl,
    borderWidth: 1,
    paddingVertical: spacing(1.25),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ribbonDate: {
    fontSize: 10,
  },
  ribbonNode: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  ribbonScore: {
    fontSize: 11,
  },
  innerCircle: {
    borderRadius: radius.sheet,
    padding: spacing(3),
    overflow: 'hidden',
    ...shadows.bloom,
  },
  innerRing: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 1,
    opacity: 0.28,
    right: -72,
    top: -64,
  },
  innerMeta: {
    color: 'rgba(255,255,255,0.68)',
  },
  innerTitle: {
    color: '#FFF8F1',
    marginTop: spacing(0.5),
    marginBottom: spacing(1.5),
  },
  innerTip: {
    color: 'rgba(255,255,255,0.78)',
    marginTop: spacing(0.5),
  },
});
