import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { PhaseBadge } from '@/components/cycle/PhaseBadge';
import { WeekStrip } from '@/components/cycle/WeekStrip';
import { MoonMark } from '@/components/ui/MoonMark';
import { PremiumBanner } from '@/components/paywall/PremiumBanner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { useCycleToday } from '@/features/cycle/useCycleToday';
import { usePremiumStore } from '@/store';
import { radius, shadows, spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';

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

export function HomeScreen() {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();
  const ctx = useCycleToday();
  const isPremium = usePremiumStore((s) => s.isPremium);

  if (!ctx) return null;
  const { profile, prediction, twin, week } = ctx;
  const periodText =
    prediction.daysUntilPeriod === 0
      ? t('home.periodToday')
      : t('home.periodIn', { count: prediction.daysUntilPeriod });

  return (
    <Screen edgeToEdge>
      <LinearGradient
        colors={colors.gradients.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroTop}>
          <View>
            <Text style={[typography.micro, styles.appName]}>{t('common.appName')}</Text>
            <Text style={[typography.subtitle, styles.greeting, { color: colors.card }]}>
              {t(greetingKey(), { name: profile.nickname })}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('settings.title')}
            onPress={() => router.push('/settings')}
            hitSlop={8}
            style={styles.settingsBtn}
          >
            <Ionicons name="settings-outline" size={22} color={colors.card} />
          </Pressable>
        </View>

        <View style={styles.heroMain}>
          <View style={styles.heroCopy}>
            <Text style={[typography.caption, styles.heroKicker]}>{t('common.today')}</Text>
            <Text style={[typography.displayXl, styles.heroTitle, { color: colors.card }]}>
              {periodText}
            </Text>
            <PhaseBadge phase={prediction.phase} pms={prediction.isPmsWindow} />
            <Text style={[typography.body, styles.heroBody]}>{t(twin.coachMessageKey)}</Text>
          </View>
          <View style={styles.lunaFrame}>
            <MoonMark state="idle" size={112} />
          </View>
        </View>

        <View style={styles.heroStats}>
          <HeroStat label={t('common.cycleDay', { day: prediction.cycleDay })} value={`${twin.hormoneTwinScore}`} />
          <HeroStat label={t('home.twinScore')} value={t(wellnessTone(twin.hormoneTwinScore))} />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.duration(360)} style={styles.featuredWrap}>
          <Card variant="glass" style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <View>
                <Text style={[typography.caption, { color: colors.primary }]}>
                  {t('home.insightTitle')}
                </Text>
                <Text style={[typography.title, styles.insightTitle]}>
                  {t('home.twinScoreCaption')}
                </Text>
              </View>
              <View style={[styles.sparkBadge, { backgroundColor: colors.softRose }]}>
                <Ionicons name="sparkles" size={18} color={colors.primary} />
              </View>
            </View>
            <Text style={typography.bodyLarge}>{t(twin.coachMessageKey)}</Text>
            <Button
              label={t('home.askAi')}
              variant="secondary"
              onPress={() => router.push('/(tabs)/ai')}
            />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(360)}>
          <View style={styles.sectionHeader}>
            <Text style={typography.title}>{t('home.twinScore')}</Text>
            <Text style={[typography.caption, styles.sectionMeta, { color: colors.primary }]}>
              {t('common.today')}
            </Text>
          </View>
          <View style={styles.snapshotGrid}>
            <MetricTile
              icon="flash"
              label={t('home.forecast.energy')}
              value={twin.energyScore}
              color={colors.ovulationBlue}
            />
            <MetricTile
              icon="heart"
              label={t('home.forecast.mood')}
              value={twin.moodScore}
              color={colors.primary}
            />
            <MetricTile
              icon="leaf"
              label={t('home.forecast.pain')}
              value={100 - twin.painRisk}
              color={colors.auroraBlue}
            />
            <MetricTile
              icon="bulb"
              label={t('home.forecast.focus')}
              value={twin.focusScore}
              color={colors.lilac}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140).duration(360)}>
          <View style={styles.quickGrid}>
            <QuickAction
              icon="add-circle"
              label={t('home.logNow')}
              tone={colors.primary}
              onPress={() => router.push('/(tabs)/log')}
            />
            <QuickAction
              icon="chatbubble-ellipses"
              label={t('home.askAi')}
              tone={colors.lilac}
              onPress={() => router.push('/(tabs)/ai')}
            />
            <QuickAction
              icon="calendar"
              label={t('tabs.calendar')}
              tone={colors.auroraBlue}
              onPress={() => router.push('/(tabs)/calendar')}
            />
            <QuickAction
              icon="analytics"
              label={t('tabs.insights')}
              tone={colors.ovulationBlue}
              onPress={() => router.push('/(tabs)/insights')}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(360)}>
          <Card style={styles.timelineCard}>
            <View style={styles.sectionHeader}>
              <Text style={typography.title}>{t('home.weekForecast')}</Text>
              <Text style={[typography.caption, styles.sectionMeta, { color: colors.primary }]}>
                {periodText}
              </Text>
            </View>
            <WeekStrip days={week} />
            <View style={styles.timelineRows}>
              <TimelineRow
                color={colors.primary}
                label={t('calendar.legend.period')}
                value={prediction.nextPeriodStart}
              />
              <TimelineRow
                color={colors.softPeach}
                label={t('phases.pms')}
                value={`${prediction.pmsWindowStart} - ${prediction.pmsWindowEnd}`}
              />
              <TimelineRow
                color={colors.ovulationBlue}
                label={t('calendar.legend.ovulation')}
                value={prediction.ovulationEstimate}
              />
            </View>
          </Card>
        </Animated.View>

        {isPremium ? (
          <Animated.View entering={FadeInDown.delay(260).duration(360)}>
            <Card variant="glass" style={styles.planCard}>
              <Text style={typography.title}>{t('home.plan.title')}</Text>
              <PlanGroup title={t('home.plan.food')} emoji="🥗" tipKeys={twin.foodTipKeys} />
              <PlanGroup title={t('home.plan.workout')} emoji="🤸‍♀️" tipKeys={twin.workoutTipKeys} />
              <PlanGroup title={t('home.plan.selfcare')} emoji="🫧" tipKeys={twin.selfCareTipKeys} />
            </Card>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(260).duration(360)}>
            <PremiumBanner onPress={() => router.push('/paywall')} />
          </Animated.View>
        )}
      </View>

      <Pressable onPress={() => router.push('/(tabs)/log')} accessibilityRole="button">
        <Text>Log how you're feeling</Text>
      </Pressable>
    </Screen>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  const { colors, typography } = useTheme();
  return (
    <View
      style={[
        styles.heroStat,
        { backgroundColor: 'rgba(255,255,255,0.18)', borderColor: 'rgba(255,255,255,0.28)' },
      ]}
    >
      <Text style={[typography.title, { color: colors.card }]}>{value}</Text>
      <Text style={[typography.caption, styles.heroStatLabel]}>{label}</Text>
    </View>
  );
}

function MetricTile({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  color: string;
}) {
  const { colors, typography } = useTheme();
  return (
    <View
      style={[
        styles.metricTile,
        { backgroundColor: colors.glassStrong, borderColor: colors.glassBorder },
      ]}
    >
      <View style={[styles.metricIcon, { backgroundColor: `${color}22` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={[typography.displayL, styles.metricValue]}>{value}</Text>
      <Text style={typography.caption}>{label}</Text>
      <ProgressBar value={value} color={color} trackColor={colors.divider} thickness={7} />
    </View>
  );
}

function QuickAction({
  icon,
  label,
  tone,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  tone: string;
  onPress: () => void;
}) {
  const { colors, typography } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickAction,
        { backgroundColor: colors.surface.elevated, borderColor: colors.border },
        pressed && styles.quickActionPressed,
      ]}
    >
      <View style={[styles.quickIcon, { backgroundColor: `${tone}24` }]}>
        <Ionicons name={icon} size={20} color={tone} />
      </View>
      <Text style={typography.subtitle}>{label}</Text>
    </Pressable>
  );
}

function TimelineRow({ color, label, value }: { color: string; label: string; value: string }) {
  const { colors, typography } = useTheme();
  return (
    <View style={styles.timelineRow}>
      <View style={[styles.timelineDot, { backgroundColor: color }]} />
      <Text style={[typography.body, styles.timelineLabel, { color: colors.textPrimary }]}>
        {label}
      </Text>
      <Text style={[typography.caption, { color: colors.textSecondary }]}>{value}</Text>
    </View>
  );
}

function PlanGroup({
  title,
  emoji,
  tipKeys,
}: {
  title: string;
  emoji: string;
  tipKeys: string[];
}) {
  const { t } = useTranslation();
  const { typography } = useTheme();
  return (
    <View style={styles.planGroup}>
      <Text style={typography.subtitle}>
        {emoji} {title}
      </Text>
      {tipKeys.slice(0, 2).map((key) => (
        <Text key={key} style={typography.body}>
          {t(key)}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingTop: spacing(3),
    paddingHorizontal: spacing(2.5),
    paddingBottom: spacing(5),
    borderBottomLeftRadius: radius.sheet,
    borderBottomRightRadius: radius.sheet,
    overflow: 'hidden',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing(2),
  },
  appName: {
    color: 'rgba(255,255,255,0.78)',
  },
  greeting: {
    marginTop: spacing(0.25),
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  heroMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    marginTop: spacing(3),
  },
  heroCopy: {
    flex: 1,
    gap: spacing(1),
  },
  heroKicker: {
    color: 'rgba(255,255,255,0.76)',
  },
  heroTitle: {
    fontSize: 34,
    lineHeight: 39,
  },
  heroBody: {
    color: 'rgba(255,255,255,0.86)',
  },
  lunaFrame: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  heroStats: {
    flexDirection: 'row',
    gap: spacing(1.25),
    marginTop: spacing(3),
  },
  heroStat: {
    flex: 1,
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing(1.5),
  },
  heroStatLabel: {
    color: 'rgba(255,255,255,0.78)',
    marginTop: spacing(0.25),
  },
  content: {
    paddingHorizontal: spacing(2.5),
    paddingTop: spacing(0),
    gap: spacing(2.5),
  },
  featuredWrap: {
    marginTop: -spacing(3),
  },
  insightCard: {
    gap: spacing(1.5),
    ...shadows.lg,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing(2),
  },
  insightTitle: {
    marginTop: spacing(0.25),
  },
  sparkBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing(2),
    marginBottom: spacing(1.5),
  },
  sectionMeta: {
    textAlign: 'right',
    flexShrink: 1,
  },
  snapshotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(1.5),
  },
  metricTile: {
    width: '47.8%',
    borderRadius: radius.card,
    padding: spacing(2),
    borderWidth: 1,
    gap: spacing(0.75),
    ...shadows.xs,
  },
  metricIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 30,
    lineHeight: 34,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(1.5),
  },
  quickAction: {
    width: '47.8%',
    minHeight: 82,
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing(1.5),
    justifyContent: 'space-between',
    ...shadows.sm,
  },
  quickActionPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineCard: {
    gap: spacing(1.5),
  },
  timelineRows: {
    gap: spacing(1),
    paddingTop: spacing(0.5),
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
  },
  timelineLabel: {
    flex: 1,
  },
  planCard: {
    gap: spacing(1.5),
  },
  planGroup: {
    gap: spacing(0.5),
  },
});
