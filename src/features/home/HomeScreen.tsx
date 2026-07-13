import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { PhaseBadge } from '@/components/cycle/PhaseBadge';
import { WeekStrip } from '@/components/cycle/WeekStrip';
import { Luna } from '@/components/mascot/Luna';
import { PremiumBanner } from '@/components/paywall/PremiumBanner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { useCycleToday } from '@/features/cycle/useCycleToday';
import { usePremiumStore } from '@/store';
import { radius, shadows, spacing, typography, useTheme } from '@/theme';

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
  const p = useTheme();
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
        colors={p.heroGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroTop}>
          <View>
            <Text style={[styles.appName, { color: p.textMuted }]}>{t('common.appName')}</Text>
            <Text style={[styles.greeting, { color: p.text }]}>
              {t(greetingKey(), { name: profile.nickname })}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('settings.title')}
            onPress={() => router.push('/settings')}
            hitSlop={8}
            style={[styles.settingsBtn, { backgroundColor: p.surfaceStrong }]}
          >
            <Ionicons name="settings-outline" size={22} color={p.text} />
          </Pressable>
        </View>

        <View style={styles.heroMain}>
          <View style={styles.heroCopy}>
            <Text style={[styles.heroKicker, { color: p.textMuted }]}>{t('common.today')}</Text>
            <Text style={[styles.heroTitle, { color: p.text }]}>{periodText}</Text>
            <PhaseBadge phase={prediction.phase} pms={prediction.isPmsWindow} />
            <Text style={[styles.heroBody, { color: p.textMuted }]}>{t(twin.coachMessageKey)}</Text>
          </View>
          <View style={[styles.lunaFrame, { backgroundColor: p.surface }]}>
            <Luna expression={prediction.isPmsWindow ? 'comforting' : 'happy'} size={112} />
          </View>
        </View>

        <View style={styles.heroStats}>
          <HeroStat
            label={t('common.cycleDay', { day: prediction.cycleDay })}
            value={`${twin.hormoneTwinScore}`}
            emphasis
          />
          <HeroStat label={t('home.twinScore')} value={t(wellnessTone(twin.hormoneTwinScore))} />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.duration(360)} style={styles.featuredWrap}>
          <Card variant="glass" style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <View>
                <Text style={[styles.sectionKicker, { color: p.accent }]}>{t('home.insightTitle')}</Text>
                <Text style={styles.insightTitle}>{t('home.twinScoreCaption')}</Text>
              </View>
              <View style={[styles.sparkBadge, { backgroundColor: p.accent100 }]}>
                <Ionicons name="sparkles" size={18} color={p.accent} />
              </View>
            </View>
            <Text style={styles.insightText}>{t(twin.coachMessageKey)}</Text>
            <Button
              label={t('home.askAi')}
              variant="secondary"
              onPress={() => router.push('/(tabs)/ai')}
            />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(360)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.twinScore')}</Text>
            <Text style={[styles.sectionMeta, { color: p.accent }]}>{t('common.today')}</Text>
          </View>
          <View style={styles.snapshotGrid}>
            <MetricTile
              icon="flash"
              label={t('home.forecast.energy')}
              value={twin.energyScore}
              color={p.accent400}
            />
            <MetricTile
              icon="heart"
              label={t('home.forecast.mood')}
              value={twin.moodScore}
              color={p.accent}
            />
            <MetricTile
              icon="leaf"
              label={t('home.forecast.pain')}
              value={100 - twin.painRisk}
              color={p.accentInk}
            />
            <MetricTile
              icon="bulb"
              label={t('home.forecast.focus')}
              value={twin.focusScore}
              color={p.accentInk}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140).duration(360)}>
          <View style={styles.quickGrid}>
            <QuickAction
              icon="add-circle"
              label={t('home.logNow')}
              tone={p.accent}
              onPress={() => router.push('/(tabs)/log')}
            />
            <QuickAction
              icon="chatbubble-ellipses"
              label={t('home.askAi')}
              tone={p.accentInk}
              onPress={() => router.push('/(tabs)/ai')}
            />
            <QuickAction
              icon="calendar"
              label={t('tabs.calendar')}
              tone={p.accentInk}
              onPress={() => router.push('/(tabs)/calendar')}
            />
            <QuickAction
              icon="analytics"
              label={t('tabs.insights')}
              tone={p.accent400}
              onPress={() => router.push('/(tabs)/insights')}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(360)}>
          <Card style={styles.timelineCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('home.weekForecast')}</Text>
              <Text style={[styles.sectionMeta, { color: p.accent }]}>{periodText}</Text>
            </View>
            <WeekStrip days={week} />
            <View style={styles.timelineRows}>
              <TimelineRow
                color={p.accent}
                label={t('calendar.legend.period')}
                value={prediction.nextPeriodStart}
              />
              <TimelineRow
                color={p.accent400}
                label={t('phases.pms')}
                value={`${prediction.pmsWindowStart} - ${prediction.pmsWindowEnd}`}
              />
              <TimelineRow
                color={p.accent400}
                label={t('calendar.legend.ovulation')}
                value={prediction.ovulationEstimate}
              />
            </View>
          </Card>
        </Animated.View>

        {isPremium ? (
          <Animated.View entering={FadeInDown.delay(260).duration(360)}>
            <Card variant="glass" style={styles.planCard}>
              <Text style={styles.sectionTitle}>{t('home.plan.title')}</Text>
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
    </Screen>
  );
}

function HeroStat({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  const p = useTheme();
  return (
    <View style={[styles.heroStat, { backgroundColor: p.surface }]}>
      <Text
        style={[
          styles.heroStatValue,
          { color: p.text },
          emphasis && [typography.score, { color: p.accentInk }],
        ]}
      >
        {value}
      </Text>
      <Text style={[styles.heroStatLabel, { color: p.textMuted }]}>{label}</Text>
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
  const p = useTheme();
  return (
    <View style={[styles.metricTile, { backgroundColor: p.surfaceStrong }]}>
      <View style={[styles.metricIcon, { backgroundColor: `${color}22` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.metricValue, { color: p.text }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: p.textMuted }]}>{label}</Text>
      <ProgressBar value={value} color={color} thickness={7} />
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
  const p = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickAction,
        { backgroundColor: p.surfaceSolid },
        pressed && styles.quickActionPressed,
      ]}
    >
      <View style={[styles.quickIcon, { backgroundColor: `${tone}24` }]}>
        <Ionicons name={icon} size={20} color={tone} />
      </View>
      <Text style={[styles.quickLabel, { color: p.text }]}>{label}</Text>
    </Pressable>
  );
}

function TimelineRow({ color, label, value }: { color: string; label: string; value: string }) {
  const p = useTheme();
  return (
    <View style={styles.timelineRow}>
      <View style={[styles.timelineDot, { backgroundColor: color }]} />
      <Text style={[styles.timelineLabel, { color: p.text }]}>{label}</Text>
      <Text style={[styles.timelineValue, { color: p.textMuted }]}>{value}</Text>
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
  return (
    <View style={styles.planGroup}>
      <Text style={styles.planGroupTitle}>
        {emoji} {title}
      </Text>
      {tipKeys.slice(0, 2).map((key) => (
        <Text key={key} style={styles.planTip}>
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
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderBottomRightRadius: 32,
    borderBottomLeftRadius: 12,
    overflow: 'hidden',
    ...shadows.hero,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing(2),
  },
  appName: {
    ...typography.micro,
  },
  greeting: {
    ...typography.subtitle,
    marginTop: spacing(0.25),
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
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
    ...typography.kicker,
  },
  heroTitle: {
    ...typography.display,
    fontSize: 34,
    lineHeight: 39,
  },
  heroBody: {
    ...typography.bodySmall,
  },
  lunaFrame: {
    width: 128,
    height: 128,
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroStats: {
    flexDirection: 'row',
    gap: spacing(1.25),
    marginTop: spacing(3),
  },
  heroStat: {
    flex: 1,
    borderRadius: radius.card,
    padding: spacing(1.5),
  },
  heroStatValue: {
    ...typography.title,
  },
  heroStatLabel: {
    ...typography.caption,
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
    ...shadows.hero,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing(2),
  },
  sectionKicker: {
    ...typography.kicker,
  },
  insightTitle: {
    ...typography.title,
    marginTop: spacing(0.25),
  },
  sparkBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightText: {
    ...typography.body,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing(2),
    marginBottom: spacing(1.5),
  },
  sectionTitle: {
    ...typography.title,
  },
  sectionMeta: {
    ...typography.caption,
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
    gap: spacing(0.75),
    ...shadows.tiny,
  },
  metricIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    ...typography.display,
    fontSize: 30,
    lineHeight: 34,
  },
  metricLabel: {
    ...typography.caption,
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
    padding: spacing(1.5),
    justifyContent: 'space-between',
    ...shadows.soft,
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
  quickLabel: {
    ...typography.subtitle,
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
    ...typography.bodySmall,
    flex: 1,
  },
  timelineValue: {
    ...typography.caption,
  },
  planCard: {
    gap: spacing(1.5),
  },
  planGroup: {
    gap: spacing(0.5),
  },
  planGroupTitle: {
    ...typography.subtitle,
  },
  planTip: {
    ...typography.bodySmall,
  },
});
