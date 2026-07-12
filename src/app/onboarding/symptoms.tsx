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
import { ONBOARDING_SYMPTOMS } from '@/types';

export default function Symptoms() {
  const { t } = useTranslation();
  const p = useTheme();
  const draft = useOnboardingDraft();

  return (
    <Screen
      bottomAction={
        <Button
          label={t('common.continue')}
          onPress={() => router.push('/onboarding/account')}
        />
      }
    >
      <OnboardingStepHeader step={3} />
      <Text style={[styles.title, { color: p.text }]}>{t('onboarding.symptoms.title')}</Text>
      <Text style={[styles.subtitle, { color: p.textMuted }]}>
        {t('onboarding.symptoms.subtitle')}
      </Text>
      <ChipGroup>
        {ONBOARDING_SYMPTOMS.map((symptom) => (
          <Chip
            key={symptom}
            label={t(`symptoms.${symptom}`)}
            selected={draft.symptoms.includes(symptom)}
            onPress={() => draft.toggleSymptom(symptom)}
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
