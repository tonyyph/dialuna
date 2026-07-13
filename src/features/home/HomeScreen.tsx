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
import { BlobGlow } from '@/components/ui/BlobGlow';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { useCycleToday } from '@/features/cycle/useCycleToday';
import { usePremiumStore } from '@/store';
import { radius, shadows, spacing, staggerDelay, typography, useTheme } from '@/theme';

function greetingKey(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'home.greeting.morning';
  if (hour < 18) return 'home.greeting.afternoon';
  return 'home.greeting.evening';
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
      <View style={styles.heroWrap}>
        <LinearGradient
          colors={p.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <BlobGlow
            size={200}
            colors={
              p.name === 'dark'
                ? ['rgba(225,173,102,0.22)', 'rgba(225,173,102,0)']
                : ['rgba(182,130,53,0.26)', 'rgba(182,130,53,0)']
            }
            style={styles.heroBlob}
          />

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
              <Text style={[styles.heroKicker, { color: p.accentInk }]}>
                {t('common.cycleDay', { day: prediction.cycleDay })} ·{' '}
                {t(prediction.isPmsWindow ? 'phases.pms' : `phases.${prediction.phase}`)}
              </Text>
              <Text style={[styles.heroTitle, { color: p.text }]}>
                {t(prediction.isPmsWindow ? 'phases.pms' : `phases.${prediction.phase}`)}
              </Text>
              <PhaseBadge phase={prediction.phase} pms={prediction.isPmsWindow} />
              <Text style={[styles.heroBody, { color: p.textMuted }]}>{t(twin.coachMessageKey)}</Text>
              <Text style={[styles.heroCaption, { color: p.textMuted }]}>{periodText}</Text>
            </View>
            <View style={[styles.lunaFrame, { backgroundColor: p.surface }]}>
              <Luna expression={prediction.isPmsWindow ? 'comforting' : 'happy'} size={112} />
            </View>
          </View>
        </LinearGradient>

        <View style={[styles.scoreBadge, { backgroundColor: p.surfaceSolid }, shadows.hero]}>
          <Text style={[styles.scoreBadgeKicker, { color: p.textFaint }]}>
            {t('home.twinScore')}
          </Text>
          <Text style={[styles.scoreBadgeValue, { color: p.accentInk }]}>
            {twin.hormoneTwinScore}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(staggerDelay(0)).duration(360)}>
          <View style={styles.signalBars}>
            <SignalBar label={t('home.forecast.energy')} value={twin.energyScore} color={p.accent400} />
            <SignalBar label={t('home.forecast.mood')} value={twin.moodScore} color={p.accent} />
            <SignalBar label={t('home.forecast.focus')} value={twin.focusScore} color={p.accentInk} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(staggerDelay(1)).duration(360)}>
          <Text style={[styles.forecastKicker, { color: p.textFaint }]}>
            {t('home.weekForecast')}
          </Text>
          <WeekStrip days={week} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(staggerDelay(2)).duration(360)}>
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

        <Animated.View entering={FadeInDown.delay(staggerDelay(3)).duration(360)}>
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

        <Animated.View entering={FadeInDown.delay(staggerDelay(4)).duration(360)}>
          <Card style={styles.timelineCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('home.upcoming')}</Text>
              <Text style={[styles.sectionMeta, { color: p.accent }]}>{periodText}</Text>
            </View>
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
          <Animated.View entering={FadeInDown.delay(staggerDelay(5)).duration(360)}>
            <Card variant="glass" style={styles.planCard}>
              <Text style={styles.sectionTitle}>{t('home.plan.title')}</Text>
              <PlanGroup title={t('home.plan.food')} emoji="🥗" tipKeys={twin.foodTipKeys} />
              <PlanGroup title={t('home.plan.workout')} emoji="🤸‍♀️" tipKeys={twin.workoutTipKeys} />
              <PlanGroup title={t('home.plan.selfcare')} emoji="🫧" tipKeys={twin.selfCareTipKeys} />
            </Card>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(staggerDelay(5)).duration(360)}>
            <PremiumBanner onPress={() => router.push('/paywall')} />
          </Animated.View>
        )}
      </View>
    </Screen>
  );
}

function SignalBar({ label, value, color }: { label: string; value: number; color: string }) {
  const p = useTheme();
  return (
    <View style={styles.signalRow}>
      <Text style={[styles.signalLabel, { color: p.textMuted }]}>{label}</Text>
      <ProgressBar value={value} color={color} trackColor={p.track} thickness={5} />
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
  heroWrap: {
    overflow: 'visible',
  },
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
  heroBlob: {
    position: 'absolute',
    top: -20,
    left: -20,
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
  heroCaption: {
    ...typography.caption,
    marginTop: spacing(0.5),
  },
  lunaFrame: {
    width: 128,
    height: 128,
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreBadge: {
    position: 'absolute',
    right: spacing(2.5),
    bottom: -34,
    width: 92,
    height: 92,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreBadgeKicker: {
    ...typography.micro,
    fontSize: 9,
  },
  scoreBadgeValue: {
    ...typography.score,
  },
  content: {
    paddingHorizontal: spacing(2.5),
    paddingTop: spacing(4.5),
    gap: spacing(2.5),
  },
  signalBars: {
    gap: spacing(1),
    marginBottom: spacing(2.5),
  },
  signalRow: {
    gap: spacing(0.5),
  },
  signalLabel: {
    ...typography.caption,
  },
  forecastKicker: {
    ...typography.kicker,
    marginBottom: spacing(1),
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
