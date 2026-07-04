import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { useOnboardingDraft } from '@/features/onboarding/useOnboardingDraft';
import { useUserStore } from '@/store';
import { colors, spacing, typography } from '@/theme';
import { UserProfile } from '@/types';
import { addDaysISO, todayISO } from '@/utils/date';

const BENEFIT_KEYS = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6'] as const;

export default function PaywallPreview() {
  const { t } = useTranslation();
  const draft = useOnboardingDraft();
  const setProfile = useUserStore((s) => s.setProfile);
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);

  const finish = () => {
    const start = draft.lastPeriodStartDate ?? todayISO();
    const profile: UserProfile = {
      id: Date.now().toString(36),
      nickname: draft.nickname.trim(),
      ageRange: draft.ageRange,
      averageCycleLength: draft.averageCycleLength,
      averagePeriodLength: draft.averagePeriodLength,
      lastPeriodStartDate: start,
      lastPeriodEndDate: addDaysISO(start, draft.lastPeriodDuration - 1),
      goals: draft.goals,
      createdAt: new Date().toISOString(),
    };
    setProfile(profile);
    completeOnboarding();
    draft.reset();
    router.replace('/(tabs)/home');
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.emoji}>✨</Text>
        <Text style={styles.title}>{t('onboarding.paywallPreview.title')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.paywallPreview.subtitle')}</Text>

        <Card style={styles.card}>
          {BENEFIT_KEYS.map((key) => (
            <View key={key} style={styles.benefitRow}>
              <Text style={styles.check}>✓</Text>
              <Text style={styles.benefit}>{t(`paywall.benefit.${key}`)}</Text>
            </View>
          ))}
        </Card>

        <Button
          label={t('paywall.cta')}
          onPress={() => {
            finish();
            router.push('/paywall');
          }}
        />
        <Button
          label={t('onboarding.paywallPreview.continueFree')}
          variant="ghost"
          onPress={finish}
        />
        <Text style={styles.note}>{t('paywall.mockNote')}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing(4),
    gap: spacing(1.5),
  },
  emoji: {
    fontSize: 44,
    textAlign: 'center',
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodySmall,
    textAlign: 'center',
  },
  card: {
    gap: spacing(1.5),
    marginVertical: spacing(1),
  },
  benefitRow: {
    flexDirection: 'row',
    gap: spacing(1),
    alignItems: 'flex-start',
  },
  check: {
    ...typography.body,
    color: colors.mint,
    fontWeight: '700',
  },
  benefit: {
    ...typography.body,
    flex: 1,
  },
  note: {
    ...typography.caption,
    textAlign: 'center',
  },
});
