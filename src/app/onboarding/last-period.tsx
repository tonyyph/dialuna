import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { DatePickerCalendar } from '@/features/onboarding/DatePickerCalendar';
import { Stepper } from '@/features/onboarding/Stepper';
import { useOnboardingDraft } from '@/features/onboarding/useOnboardingDraft';
import { spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';

export default function LastPeriod() {
  const { t } = useTranslation();
  const { typography } = useTheme();
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
      <View style={styles.container}>
        <Text style={typography.headline}>{t('onboarding.lastPeriod.title')}</Text>
        <Text style={typography.body}>{t('onboarding.lastPeriod.subtitle')}</Text>

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

        <Text style={[typography.caption, styles.hint]}>{t('onboarding.lastPeriod.notSure')}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing(3),
    gap: spacing(2),
  },
  hint: {
    textAlign: 'center',
  },
});
