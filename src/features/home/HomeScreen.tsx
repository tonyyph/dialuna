import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PremiumBanner } from '@/components/paywall/PremiumBanner';
import { CycleOrb } from '@/components/ui/CycleOrb';
import { Pressable } from '@/components/ui/Pressable';
import { RhythmStrip } from '@/components/ui/RhythmStrip';
import { Screen } from '@/components/ui/Screen';
import { useCycleToday } from '@/features/cycle/useCycleToday';
import { usePremiumStore } from '@/store';
import { radiusV2, spacing, staggerDelay, typographyV2, useSemanticTheme } from '@/theme';
import { HormoneTwinDailyProfile } from '@/types';

function greetingKey(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'home.greeting.morning';
  if (hour < 18) return 'home.greeting.afternoon';
  return 'home.greeting.evening';
}

export function HomeScreen() {
  const { t } = useTranslation();
  const theme = useSemanticTheme();
  const ctx = useCycleToday();
  const isPremium = usePremiumStore((s) => s.isPremium);

  if (!ctx) return null;
  const { profile, prediction, twin, week } = ctx;
  const periodText =
    prediction.daysUntilPeriod === 0
      ? t('home.periodToday')
      : t('home.periodIn', { count: prediction.daysUntilPeriod });

  const tip = pickTip(twin);

  return (
    <Screen edgeToEdge backgroundColor={theme.background.canvas}>
      <View style={styles.contextStrip}>
        <Text style={[typographyV2.bodyM, { color: theme.content.secondary }]}>
          {t(greetingKey(), { name: profile.nickname })}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('settings.title')}
          onPress={() => router.push('/settings')}
          hitSlop={8}
          style={[styles.settingsBtn, { backgroundColor: theme.surface.default }]}
        >
          <Ionicons name="settings-outline" size={20} color={theme.content.primary} />
        </Pressable>
      </View>

      <View style={styles.orbWrap}>
        <CycleOrb
          cycleDay={prediction.cycleDay}
          cycleLength={profile.averageCycleLength}
          phase={prediction.phase}
          isPmsWindow={prediction.isPmsWindow}
          periodText={periodText}
          twinScore={twin.hormoneTwinScore}
          energyScore={twin.energyScore}
          moodScore={twin.moodScore}
          focusScore={twin.focusScore}
          theme={theme}
        />
      </View>

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(staggerDelay(0)).duration(360)}>
          <Text style={[typographyV2.labelL, { color: theme.content.secondary }]}>
            {t('home.insightTitle')}
          </Text>
          <Text style={[typographyV2.bodyL, styles.insightBody, { color: theme.content.primary }]}>
            {t(twin.coachMessageKey)}
          </Text>
          {tip ? (
            <Text style={[typographyV2.bodyM, styles.tipRow, { color: theme.content.secondary }]}>
              {tip.label} · {t(tip.key)}
            </Text>
          ) : null}
          <View style={styles.actionsRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('home.askAi')}
              onPress={() => router.push('/(tabs)/ai')}
            >
              <Text style={[typographyV2.labelL, { color: theme.brand.primary }]}>
                {t('home.askAi')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('home.logNow')}
              onPress={() => router.push('/(tabs)/log')}
            >
              <Text style={[typographyV2.labelL, { color: theme.brand.secondary }]}>
                {t('home.logNow')}
              </Text>
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(staggerDelay(1)).duration(360)}>
          <Text style={[typographyV2.labelL, styles.sectionLabel, { color: theme.content.secondary }]}>
            {t('home.upcoming')}
          </Text>
          <RhythmStrip days={week} theme={theme} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(staggerDelay(2)).duration(360)}>
          {isPremium ? (
            <View style={styles.planSection}>
              <Text style={[typographyV2.labelL, { color: theme.content.secondary }]}>
                {t('home.plan.title')}
              </Text>
              <PlanGroup title={t('home.plan.food')} emoji="🥗" tipKeys={twin.foodTipKeys} theme={theme} />
              <PlanGroup
                title={t('home.plan.workout')}
                emoji="🤸‍♀️"
                tipKeys={twin.workoutTipKeys}
                theme={theme}
              />
              <PlanGroup
                title={t('home.plan.selfcare')}
                emoji="🫧"
                tipKeys={twin.selfCareTipKeys}
                theme={theme}
              />
            </View>
          ) : (
            <PremiumBanner onPress={() => router.push('/paywall')} />
          )}
        </Animated.View>
      </View>
    </Screen>
  );
}

function pickTip(twin: HormoneTwinDailyProfile | null) {
  if (!twin) return null;
  if (twin.foodTipKeys[0]) return { label: 'home.plan.food' as const, key: twin.foodTipKeys[0] };
  if (twin.workoutTipKeys[0])
    return { label: 'home.plan.workout' as const, key: twin.workoutTipKeys[0] };
  if (twin.selfCareTipKeys[0])
    return { label: 'home.plan.selfcare' as const, key: twin.selfCareTipKeys[0] };
  return null;
}

function PlanGroup({
  title,
  emoji,
  tipKeys,
  theme,
}: {
  title: string;
  emoji: string;
  tipKeys: string[];
  theme: ReturnType<typeof useSemanticTheme>;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.planGroup}>
      <Text style={[typographyV2.bodyM, { color: theme.content.primary }]}>
        {emoji} {title}
      </Text>
      {tipKeys.slice(0, 2).map((key) => (
        <Text key={key} style={[typographyV2.bodyM, { color: theme.content.secondary }]}>
          {t(key)}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  contextStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(2.5),
    paddingTop: spacing(2),
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: radiusV2.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbWrap: {
    marginTop: spacing(2),
    marginBottom: spacing(1),
  },
  content: {
    paddingHorizontal: spacing(2.5),
    paddingTop: spacing(3),
    gap: spacing(3.5),
  },
  insightBody: {
    marginTop: spacing(1),
  },
  tipRow: {
    marginTop: spacing(1),
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing(3),
    marginTop: spacing(2),
  },
  sectionLabel: {
    marginBottom: spacing(1.5),
  },
  planSection: {
    gap: spacing(1.5),
  },
  planGroup: {
    gap: spacing(0.5),
  },
});
