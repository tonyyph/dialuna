import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Screen } from '@/components/ui/Screen';
import { Stepper } from '@/features/onboarding/Stepper';
import { useOnboardingDraft } from '@/features/onboarding/useOnboardingDraft';
import { radius, spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';
import { ALL_AGE_RANGES } from '@/types';
import { nicknameSchema } from '@/utils/validation';

export default function Profile() {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();
  const draft = useOnboardingDraft();
  const [touched, setTouched] = useState(false);
  const nicknameValid = nicknameSchema.safeParse(draft.nickname).success;

  const continueAction = () => {
    setTouched(true);
    if (nicknameValid) router.push('/onboarding/last-period');
  };

  return (
    <Screen
      keyboardAvoiding
      bottomAction={
        <Button
          label={t('common.continue')}
          disabled={touched ? !nicknameValid : false}
          onPress={continueAction}
        />
      }
    >
      <View style={styles.container}>
        <Text style={typography.headline}>{t('onboarding.profile.title')}</Text>
        <Text style={[typography.body, styles.subtitle]}>{t('onboarding.profile.subtitle')}</Text>

        <Text style={[typography.subtitle, styles.label]}>{t('onboarding.profile.nickname')}</Text>
        <TextInput
          style={[typography.bodyLarge, styles.input, { backgroundColor: colors.glassStrong, borderColor: colors.glassBorder }]}
          value={draft.nickname}
          onChangeText={(nickname) => {
            setTouched(true);
            draft.set({ nickname });
          }}
          placeholder={t('onboarding.profile.nicknamePlaceholder')}
          placeholderTextColor={colors.textSecondary}
          accessibilityLabel={t('onboarding.profile.nickname')}
          maxLength={30}
        />

        <Text style={[typography.subtitle, styles.label]}>{t('onboarding.profile.ageRange')}</Text>
        <View style={styles.chipRow}>
          {ALL_AGE_RANGES.map((range) => (
            <Chip
              key={range}
              label={t(`ageRanges.${range}`)}
              selected={draft.ageRange === range}
              onPress={() => draft.set({ ageRange: range })}
            />
          ))}
        </View>

        <View style={styles.steppers}>
          <Stepper
            label={t('onboarding.profile.cycleLength')}
            unit={t('onboarding.profile.daysUnit')}
            value={draft.averageCycleLength}
            min={20}
            max={45}
            onChange={(averageCycleLength) => draft.set({ averageCycleLength })}
          />
          <Stepper
            label={t('onboarding.profile.periodLength')}
            unit={t('onboarding.profile.daysUnit')}
            value={draft.averagePeriodLength}
            min={2}
            max={10}
            onChange={(averagePeriodLength) => draft.set({ averagePeriodLength })}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing(3),
    gap: spacing(1),
  },
  subtitle: {
    marginBottom: spacing(2),
  },
  label: {
    marginTop: spacing(1.5),
  },
  input: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing(2),
    minHeight: 52,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(1),
  },
  steppers: {
    gap: spacing(2),
    marginTop: spacing(1.5),
  },
});
