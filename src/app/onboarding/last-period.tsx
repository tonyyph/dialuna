import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { DatePickerCalendar } from '@/features/onboarding/DatePickerCalendar';
import { Stepper } from '@/features/onboarding/Stepper';
import { useOnboardingDraft } from '@/features/onboarding/useOnboardingDraft';
import { spacing, typography } from '@/theme';

export default function LastPeriod() {
  const { t } = useTranslation();
  const draft = useOnboardingDraft();

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>{t('onboarding.lastPeriod.title')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.lastPeriod.subtitle')}</Text>

        <DatePickerCalendar
          selected={draft.lastPeriodStartDate}
          onSelect={(lastPeriodStartDate) => draft.set({ lastPeriodStartDate })}
        />

        <Stepper
          label={t('onboarding.lastPeriod.durationLabel')}
          unit={t('onboarding.profile.daysUnit')}
          value={draft.lastPeriodDuration}
          min={2}
          max={10}
          onChange={(lastPeriodDuration) => draft.set({ lastPeriodDuration })}
        />

        <Text style={styles.hint}>{t('onboarding.lastPeriod.notSure')}</Text>

        <Button
          label={t('common.continue')}
          disabled={!draft.lastPeriodStartDate}
          onPress={() => router.push('/onboarding/goals')}
          style={styles.cta}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing(3),
    gap: spacing(2),
  },
  title: {
    ...typography.h1,
  },
  subtitle: {
    ...typography.bodySmall,
  },
  hint: {
    ...typography.caption,
    textAlign: 'center',
  },
  cta: {
    marginTop: spacing(1),
  },
});
