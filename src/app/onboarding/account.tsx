import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { OnboardingStepHeader } from '@/features/onboarding/OnboardingStepHeader';
import { useOnboardingDraft } from '@/features/onboarding/useOnboardingDraft';
import { useUserStore } from '@/store';
import { spacing, typography, useTheme } from '@/theme';
import { UserProfile } from '@/types';
import { addDaysISO, todayISO } from '@/utils/date';
import { emailSchema, nicknameSchema } from '@/utils/validation';

export default function Account() {
  const { t } = useTranslation();
  const p = useTheme();
  const draft = useOnboardingDraft();
  const setProfile = useUserStore((s) => s.setProfile);
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);
  const [touched, setTouched] = useState(false);

  const nameValid = nicknameSchema.safeParse(draft.nickname).success;
  const emailValid = emailSchema.safeParse(draft.email).success;

  const finish = () => {
    setTouched(true);
    if (!nameValid || !emailValid) return;
    const start = draft.lastPeriodStartDate ?? todayISO();
    const profile: UserProfile = {
      id: Date.now().toString(36),
      nickname: draft.nickname.trim(),
      email: draft.email.trim() || undefined,
      averageCycleLength: draft.averageCycleLength,
      averagePeriodLength: draft.averagePeriodLength,
      lastPeriodStartDate: start,
      lastPeriodEndDate: addDaysISO(start, draft.averagePeriodLength - 1),
      goals: draft.goals,
      symptomHistory: draft.symptoms,
      createdAt: new Date().toISOString(),
    };
    setProfile(profile);
    completeOnboarding();
    draft.reset();
    router.replace('/(tabs)/home');
  };

  return (
    <Screen keyboardAvoiding>
      <OnboardingStepHeader step={4} />
      <Text style={[styles.title, { color: p.text }]}>
        {t('onboarding.account.title')}
      </Text>
      <Text style={[styles.subtitle, { color: p.textMuted }]}>
        {t('onboarding.account.subtitle')}
      </Text>
      <View style={[styles.privateRow, { borderColor: p.track }]}><Ionicons name="lock-closed-outline" size={19} color={p.accentInk} /><Text style={[styles.privateText, { color: p.textMuted }]}>{t('settings.privacyBody')}</Text></View>

      <View style={styles.card}>
        <Text style={[styles.label, { color: p.textMuted }]}>
          {t('onboarding.account.name')}
        </Text>
        <TextInput
          style={[styles.input, { color: p.text, borderBottomColor: p.track }]}
          value={draft.nickname}
          onChangeText={(nickname) => draft.set({ nickname })}
          placeholder={t('onboarding.account.namePlaceholder')}
          placeholderTextColor={p.textFaint}
          accessibilityLabel={t('onboarding.account.name')}
          maxLength={30}
        />
      </View>
      <View style={styles.card}>
        <Text style={[styles.label, { color: p.textMuted }]}>
          {t('onboarding.account.email')}
        </Text>
        <TextInput
          style={[styles.input, { color: p.text, borderBottomColor: p.track }]}
          value={draft.email}
          onChangeText={(email) => draft.set({ email })}
          placeholder={t('onboarding.account.emailPlaceholder')}
          placeholderTextColor={p.textFaint}
          accessibilityLabel={t('onboarding.account.email')}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
        />
      </View>
      {touched && !emailValid ? (
        <Text style={[styles.error, { color: p.danger }]}>
          {t('onboarding.account.emailInvalid')}
        </Text>
      ) : null}

      <Button
        label={t('onboarding.account.cta')}
        disabled={touched ? !(nameValid && emailValid) : false}
        onPress={finish}
        style={styles.cta}
      />
      {__DEV__ ? <Button
        label={t('onboarding.account.apple')}
        variant="secondary"
        onPress={() => Alert.alert(t('onboarding.account.appleSoon'))}
      /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.headline, marginTop: spacing(1) },
  subtitle: { ...typography.bodySmall, marginTop: spacing(0.5), marginBottom: spacing(2.75) },
  privateRow: { minHeight: 64, borderTopWidth: 1, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: spacing(1.25), marginBottom: spacing(3) }, privateText: { ...typography.bodySmall, flex: 1 },
  card: { marginBottom: spacing(2.25) },
  label: { ...typography.caption, marginBottom: spacing(0.75) },
  input: { ...typography.body, minHeight: 52, paddingVertical: spacing(1), borderBottomWidth: 1 },
  error: { ...typography.caption, marginBottom: spacing(1) },
  cta: { marginTop: spacing(1.5), marginBottom: spacing(1.25) },
});
