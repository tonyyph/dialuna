import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Screen } from '@/components/ui/Screen';
import { useOnboardingDraft } from '@/features/onboarding/useOnboardingDraft';
import { spacing, typography } from '@/theme';
import { ALL_GOALS, Goal } from '@/types';

const GOAL_EMOJI: Record<Goal, string> = {
  understandCycle: '🌙',
  reducePms: '🌿',
  improveMood: '🌸',
  planWorkouts: '💪',
  skinInsights: '✨',
  pregnancyPlanning: '🤍',
  betterSleep: '😴',
};

export default function Goals() {
  const { t } = useTranslation();
  const draft = useOnboardingDraft();

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>{t('onboarding.goals.title')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.goals.subtitle')}</Text>

        <View style={styles.chips}>
          {ALL_GOALS.map((goal) => (
            <Chip
              key={goal}
              label={t(`goals.${goal}`)}
              emoji={GOAL_EMOJI[goal]}
              selected={draft.goals.includes(goal)}
              onPress={() => draft.toggleGoal(goal)}
            />
          ))}
        </View>

        <Button
          label={t('common.continue')}
          disabled={draft.goals.length === 0}
          onPress={() => router.push('/onboarding/notifications')}
          style={styles.cta}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing(3),
    gap: spacing(1),
  },
  title: {
    ...typography.h1,
  },
  subtitle: {
    ...typography.bodySmall,
    marginBottom: spacing(2),
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(1),
  },
  cta: {
    marginTop: spacing(4),
  },
});
