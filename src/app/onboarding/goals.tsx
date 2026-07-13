import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { Screen } from '@/components/ui/Screen';
import { OnboardingStepHeader } from '@/features/onboarding/OnboardingStepHeader';
import { useOnboardingDraft } from '@/features/onboarding/useOnboardingDraft';
import { spacing, typography, useTheme } from '@/theme';
import { ONBOARDING_GOALS } from '@/types';

export default function Goals() {
  const { t } = useTranslation();
  const p = useTheme();
  const draft = useOnboardingDraft();

  return (
    <Screen
      bottomAction={
        <Button
          label={t('common.continue')}
          disabled={draft.goals.length === 0}
          onPress={() => router.push('/onboarding/symptoms')}
        />
      }
    >
      <OnboardingStepHeader step={2} />
      <Text style={[styles.title, { color: p.text }]}>{t('onboarding.goals.title')}</Text>
      <Text style={[styles.subtitle, { color: p.textMuted }]}>
        {t('onboarding.goals.subtitle')}
      </Text>
      <ChipGroup>
        {ONBOARDING_GOALS.map((goal) => (
          <Chip
            key={goal}
            label={t(`goals.${goal}`)}
            selected={draft.goals.includes(goal)}
            onPress={() => draft.toggleGoal(goal)}
          />
        ))}
      </ChipGroup>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.headline, marginTop: spacing(1) },
  subtitle: { ...typography.bodySmall, marginTop: spacing(0.5), marginBottom: spacing(2.5) },
});
