import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { DatePickerCalendar } from '@/features/onboarding/DatePickerCalendar';
import { OnboardingStepHeader } from '@/features/onboarding/OnboardingStepHeader';
import { Stepper } from '@/features/onboarding/Stepper';
import { useOnboardingDraft } from '@/features/onboarding/useOnboardingDraft';
import { spacing, typography, useTheme } from '@/theme';

export default function CycleBasics() {
  const { t } = useTranslation();
  const p = useTheme();
  const draft = useOnboardingDraft();

  return (
    <Screen
      bottomAction={
        <Button
          label={t('common.continue')}
          disabled={!draft.lastPeriodStartDate}
          onPress={() => router.push('/onboarding/goals')}
        />
      }
    >
      <OnboardingStepHeader step={1} />
      <Text style={[styles.title, { color: p.text }]}>
        {t('onboarding.cycleBasics.title')}
      </Text>
      <Text style={[styles.subtitle, { color: p.textMuted }]}>
        {t('onboarding.cycleBasics.subtitle')}
      </Text>

      <Card style={styles.card}>
        <Stepper
          label={t('onboarding.cycleBasics.cycleLength')}
          unit={t('onboarding.cycleBasics.daysUnit')}
          value={draft.averageCycleLength}
          min={21}
          max={40}
          onChange={(averageCycleLength) => draft.set({ averageCycleLength })}
        />
      </Card>
      <Card style={styles.card}>
        <Stepper
          label={t('onboarding.cycleBasics.periodLength')}
          unit={t('onboarding.cycleBasics.daysUnit')}
          value={draft.averagePeriodLength}
          min={2}
          max={10}
          onChange={(averagePeriodLength) => draft.set({ averagePeriodLength })}
        />
      </Card>
      <Card style={styles.card}>
        <Text style={[styles.cardLabel, { color: p.textMuted }]}>
          {t('onboarding.cycleBasics.lastPeriod')}
        </Text>
        <DatePickerCalendar
          selected={draft.lastPeriodStartDate}
          onSelect={(lastPeriodStartDate) => draft.set({ lastPeriodStartDate })}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.headline, marginTop: spacing(1) },
  subtitle: { ...typography.bodySmall, marginTop: spacing(0.5), marginBottom: spacing(2.5) },
  card: { marginBottom: spacing(1.75) },
  cardLabel: { ...typography.caption, marginBottom: spacing(1) },
});
