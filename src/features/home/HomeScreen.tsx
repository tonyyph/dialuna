import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { ForecastCard } from '@/components/cycle/ForecastCard';
import { PhaseBadge } from '@/components/cycle/PhaseBadge';
import { WeekStrip } from '@/components/cycle/WeekStrip';
import { PremiumBanner } from '@/components/paywall/PremiumBanner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { Screen } from '@/components/ui/Screen';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { useCycleToday } from '@/features/cycle/useCycleToday';
import { usePremiumStore } from '@/store';
import { colors, radius, spacing, typography } from '@/theme';

function greetingKey(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'home.greeting.morning';
  if (hour < 18) return 'home.greeting.afternoon';
  return 'home.greeting.evening';
}

export function HomeScreen() {
  const { t } = useTranslation();
  const ctx = useCycleToday();
  const isPremium = usePremiumStore((s) => s.isPremium);

  if (!ctx) return null;
  const { profile, prediction, twin, week } = ctx;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.greeting}>
          {t(greetingKey(), { name: profile.nickname })}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('settings.title')}
          onPress={() => router.push('/settings')}
          hitSlop={8}
        >
          <Ionicons name="settings-outline" size={24} color={colors.textSecondary} />
        </Pressable>
      </View>

      <Animated.View entering={FadeInDown.duration(400)}>
        <Card style={styles.cycleCard}>
          <View style={styles.cycleInfo}>
            <Text style={styles.cycleDay}>
              {t('common.cycleDay', { day: prediction.cycleDay })}
            </Text>
            <PhaseBadge phase={prediction.phase} pms={prediction.isPmsWindow} />
            <Text style={styles.countdown}>
              {prediction.daysUntilPeriod === 0
                ? t('home.periodToday')
                : t('home.periodIn', { count: prediction.daysUntilPeriod })}
            </Text>
          </View>
          <View style={styles.ringCol}>
            <ScoreRing score={twin.hormoneTwinScore} size={120} label={t('home.twinScore')} />
            <Text style={styles.ringLabel}>{t('home.twinScore')}</Text>
          </View>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(400)}>
        <View style={styles.forecastRow}>
          <ForecastCard emoji="⚡" label={t('home.forecast.energy')} score={twin.energyScore} />
          <ForecastCard emoji="🌸" label={t('home.forecast.mood')} score={twin.moodScore} />
        </View>
        <View style={styles.forecastRow}>
          <ForecastCard emoji="🕊️" label={t('home.forecast.pain')} score={100 - twin.painRisk} />
          <ForecastCard emoji="🎯" label={t('home.forecast.focus')} score={twin.focusScore} />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(160).duration(400)}>
        <SectionTitle title={t('home.insightTitle')} />
        <Card variant="glass" style={styles.coachCard}>
          <Text style={styles.coachEmoji}>🌙</Text>
          <Text style={styles.coachText}>{t(twin.coachMessageKey)}</Text>
          <Button
            label={t('home.askAi')}
            variant="secondary"
            onPress={() => router.push('/(tabs)/ai')}
          />
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(240).duration(400)}>
        <Card style={styles.logCard}>
          <View style={styles.logText}>
            <Text style={styles.logTitle}>{t('home.logCta')}</Text>
            <Text style={styles.logBody}>{t('home.logCtaBody')}</Text>
          </View>
          <Button
            label={t('home.logNow')}
            onPress={() => router.push('/(tabs)/log')}
          />
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(320).duration(400)}>
        <SectionTitle title={t('home.weekForecast')} />
        <Card>
          <WeekStrip days={week} />
          {!isPremium && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('home.premiumBanner.cta')}
              style={styles.lockOverlay}
              onPress={() => router.push('/paywall')}
            >
              <Text style={styles.lockIcon}>🔒</Text>
              <Text style={styles.lockText}>{t('home.premiumBanner.title')}</Text>
            </Pressable>
          )}
        </Card>
      </Animated.View>

      {!isPremium && (
        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.banner}>
          <PremiumBanner onPress={() => router.push('/paywall')} />
        </Animated.View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing(2),
    marginBottom: spacing(2),
  },
  greeting: {
    ...typography.h1,
    flex: 1,
  },
  cycleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
  },
  cycleInfo: {
    flex: 1,
    gap: spacing(1),
  },
  cycleDay: {
    ...typography.h2,
  },
  countdown: {
    ...typography.bodySmall,
  },
  ringCol: {
    alignItems: 'center',
    gap: spacing(0.5),
  },
  ringLabel: {
    ...typography.caption,
  },
  forecastRow: {
    flexDirection: 'row',
    gap: spacing(1.5),
    marginTop: spacing(1.5),
  },
  coachCard: {
    gap: spacing(1.5),
  },
  coachEmoji: {
    fontSize: 24,
  },
  coachText: {
    ...typography.body,
  },
  logCard: {
    marginTop: spacing(2),
    gap: spacing(2),
  },
  logText: {
    gap: spacing(0.5),
  },
  logTitle: {
    ...typography.h3,
  },
  logBody: {
    ...typography.bodySmall,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(0.5),
  },
  lockIcon: {
    fontSize: 22,
  },
  lockText: {
    ...typography.caption,
    fontWeight: '700',
  },
  banner: {
    marginTop: spacing(3),
  },
});
