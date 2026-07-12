import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Card } from '@/components/ui/Card';
import { CircleButton } from '@/components/ui/CircleButton';
import { DisclaimerBox } from '@/components/ui/DisclaimerBox';
import { Screen } from '@/components/ui/Screen';
import { SegmentedToggle } from '@/components/ui/SegmentedToggle';
import { DatePickerCalendar } from '@/features/onboarding/DatePickerCalendar';
import { Stepper } from '@/features/onboarding/Stepper';
import i18n, { setAppLanguage } from '@/i18n';
import {
  resetAllData,
  usePremiumStore,
  useSettingsStore,
  useUserStore,
} from '@/store';
import { radius, spacing, typography, useTheme } from '@/theme';
import { emailSchema, nicknameSchema } from '@/utils/validation';

export function SettingsScreen() {
  const { t } = useTranslation();
  const p = useTheme();
  const profile = useUserStore((s) => s.profile);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const signOut = useUserStore((s) => s.signOut);
  const settings = useSettingsStore();
  const isPremium = usePremiumStore((s) => s.isPremium);
  const plan = usePremiumStore((s) => s.plan);
  const togglePremiumDev = usePremiumStore((s) => s.togglePremiumDev);

  const [dateOpen, setDateOpen] = useState(false);
  const [exportedFlash, setExportedFlash] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [medicalOpen, setMedicalOpen] = useState(false);

  if (!profile) return null;

  const language = i18n.language === 'vi' ? 'vi' : 'en';
  const daysUnit = t('onboarding.cycleBasics.daysUnit');

  const onSignOut = () => {
    signOut();
    router.dismissAll();
    router.replace('/onboarding');
  };

  const onConfirmDelete = () => {
    resetAllData();
    router.dismissAll();
    router.replace('/onboarding');
  };

  const kicker = { ...styles.kicker, color: p.textFaint };
  const label = { ...styles.label, color: p.textMuted };

  return (
    <Screen>
      <View style={styles.header}>
        <CircleButton
          icon="chevron-back"
          label={t('common.back')}
          onPress={() => router.back()}
        />
        <Text style={[styles.title, { color: p.text }]}>{t('settings.title')}</Text>
      </View>

      <Text style={kicker}>{t('settings.sections.account')}</Text>
      <Card style={styles.card}>
        <Text style={label}>{t('settings.name')}</Text>
        <TextInput
          style={[styles.input, { color: p.text }]}
          defaultValue={profile.nickname}
          accessibilityLabel={t('settings.name')}
          maxLength={30}
          onEndEditing={(e) => {
            const nickname = e.nativeEvent.text.trim();
            if (nicknameSchema.safeParse(nickname).success) updateProfile({ nickname });
          }}
        />
        <Text style={label}>{t('settings.email')}</Text>
        <TextInput
          style={[styles.input, { color: p.text }]}
          defaultValue={profile.email ?? ''}
          accessibilityLabel={t('settings.email')}
          autoCapitalize="none"
          keyboardType="email-address"
          onEndEditing={(e) => {
            const email = e.nativeEvent.text.trim();
            if (emailSchema.safeParse(email).success) {
              updateProfile({ email: email || undefined });
            }
          }}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('settings.signOut')}
          onPress={onSignOut}
          style={[styles.pillBtn, { backgroundColor: p.fillSubtle }]}
        >
          <Text style={[styles.pillBtnText, { color: p.text }]}>
            {t('settings.signOut')}
          </Text>
        </Pressable>
      </Card>

      <Text style={kicker}>{t('settings.sections.cycle')}</Text>
      <Card style={[styles.card, styles.gapLg]}>
        <Stepper
          label={t('settings.cycleLength')}
          unit={daysUnit}
          value={profile.averageCycleLength}
          min={21}
          max={40}
          onChange={(averageCycleLength) => updateProfile({ averageCycleLength })}
        />
        <Stepper
          label={t('settings.periodLength')}
          unit={daysUnit}
          value={profile.averagePeriodLength}
          min={2}
          max={10}
          onChange={(averagePeriodLength) => updateProfile({ averagePeriodLength })}
        />
        <Stepper
          label={t('settings.lutealLength')}
          unit={daysUnit}
          value={settings.lutealLength}
          min={10}
          max={16}
          onChange={(lutealLength) => settings.set({ lutealLength })}
        />
        <View>
          <Text style={label}>{t('settings.lastPeriodStart')}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('settings.lastPeriodStart')}
            onPress={() => setDateOpen((v) => !v)}
            style={styles.dateRow}
          >
            <Text style={[styles.dateValue, { color: p.text }]}>
              {profile.lastPeriodStartDate}
            </Text>
          </Pressable>
          {dateOpen ? (
            <DatePickerCalendar
              selected={profile.lastPeriodStartDate}
              onSelect={(lastPeriodStartDate) => {
                updateProfile({ lastPeriodStartDate });
                setDateOpen(false);
              }}
            />
          ) : null}
        </View>
      </Card>

      <Text style={kicker}>{t('settings.sections.notifications')}</Text>
      <Card style={[styles.card, styles.gapMd]}>
        <NotifRow
          label={t('settings.notifPeriod')}
          value={settings.notifPeriod}
          onChange={(notifPeriod) => settings.set({ notifPeriod })}
        />
        <NotifRow
          label={t('settings.notifOvulation')}
          value={settings.notifOvulation}
          onChange={(notifOvulation) => settings.set({ notifOvulation })}
        />
        <NotifRow
          label={t('settings.notifDaily')}
          value={settings.notifDaily}
          onChange={(notifDaily) => settings.set({ notifDaily })}
        />
        <Text style={[styles.caption, { color: p.textFaint }]}>
          {t('settings.notifDeferred')}
        </Text>
      </Card>

      <Text style={kicker}>{t('settings.sections.appearance')}</Text>
      <Card style={[styles.card, styles.gapLg]}>
        <View>
          <Text style={label}>{t('settings.units')}</Text>
          <SegmentedToggle
            label={t('settings.units')}
            options={[
              { value: 'us', label: t('settings.unitsUS') },
              { value: 'metric', label: t('settings.unitsMetric') },
            ]}
            value={settings.units}
            onChange={(units) => settings.set({ units })}
          />
        </View>
        <View>
          <Text style={label}>{t('settings.themeLabel')}</Text>
          <SegmentedToggle
            label={t('settings.themeLabel')}
            options={[
              { value: 'light', label: t('settings.themeLight') },
              { value: 'dark', label: t('settings.themeDark') },
            ]}
            value={settings.theme}
            onChange={(theme) => settings.set({ theme })}
          />
        </View>
        <View>
          <Text style={label}>{t('settings.language')}</Text>
          <SegmentedToggle
            label={t('settings.language')}
            options={[
              { value: 'en', label: t('settings.languageEn') },
              { value: 'vi', label: t('settings.languageVi') },
            ]}
            value={language}
            onChange={(lng) => setAppLanguage(lng)}
          />
        </View>
      </Card>

      <Text style={kicker}>{t('settings.sections.privacy')}</Text>
      <Card style={[styles.card, styles.gapMd]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('settings.privacyTitle')}
          onPress={() => setPrivacyOpen((v) => !v)}
          style={[styles.pillBtn, { backgroundColor: p.fillSubtle }]}
        >
          <Text style={[styles.pillBtnText, { color: p.text }]}>
            {t('settings.privacyTitle')}
          </Text>
        </Pressable>
        {privacyOpen ? (
          <Text style={[styles.caption, { color: p.textMuted }]}>
            {t('settings.privacyBody')}
          </Text>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('settings.medicalTitle')}
          onPress={() => setMedicalOpen((v) => !v)}
          style={[styles.pillBtn, { backgroundColor: p.fillSubtle }]}
        >
          <Text style={[styles.pillBtnText, { color: p.text }]}>
            {t('settings.medicalTitle')}
          </Text>
        </Pressable>
        {medicalOpen ? <DisclaimerBox text={t('disclaimer.full')} /> : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('settings.exportData')}
          onPress={() => setExportedFlash(true)}
          style={[styles.pillBtn, { backgroundColor: p.fillSubtle }]}
        >
          <Text style={[styles.pillBtnText, { color: p.text }]}>
            {t('settings.exportData')}
          </Text>
        </Pressable>
        {exportedFlash ? (
          <Text style={[styles.caption, { color: p.accent700 }]}>
            {t('settings.exportReady')}
          </Text>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('settings.deleteData')}
          onPress={() => setConfirmingDelete((v) => !v)}
          style={[styles.pillBtn, { backgroundColor: p.fillSubtle }]}
        >
          <Text style={[styles.pillBtnText, { color: p.danger }]}>
            {t('settings.deleteData')}
          </Text>
        </Pressable>
        {confirmingDelete ? (
          <View style={styles.gapSm}>
            <Text style={[styles.caption, { color: p.textMuted }]}>
              {t('settings.deleteConfirmBody')}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('settings.deleteConfirmCta')}
              onPress={onConfirmDelete}
              style={[styles.pillBtn, { backgroundColor: p.danger }]}
            >
              <Text style={[styles.pillBtnText, { color: p.surfaceSolid }]}>
                {t('settings.deleteConfirmCta')}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </Card>

      <Text style={kicker}>{t('settings.sections.subscription')}</Text>
      <Card style={styles.card}>
        <View style={styles.subRow}>
          <View>
            <Text style={[styles.subLabel, { color: p.text }]}>
              {isPremium ? t('settings.planPremium') : t('settings.planFree')}
            </Text>
            <Text style={[styles.caption, { color: p.textMuted }]}>
              {isPremium
                ? t('settings.planActiveSub', {
                    plan: plan ? t(`paywall.plans.${plan === 'yearly' ? 'annual' : 'monthly'}`) : '',
                  })
                : t('settings.planFreeSub')}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isPremium ? t('settings.manage') : t('settings.upgrade')}
            onPress={() => router.push('/paywall')}
            style={[
              styles.subBtn,
              { backgroundColor: isPremium ? p.fillSubtle : p.primaryBtn },
            ]}
          >
            <Text
              style={[
                styles.pillBtnText,
                { color: isPremium ? p.text : p.onPrimaryBtn },
              ]}
            >
              {isPremium ? t('settings.manage') : t('settings.upgrade')}
            </Text>
          </Pressable>
        </View>
        <NotifRow
          label={t('settings.devToggle')}
          value={isPremium}
          onChange={togglePremiumDev}
        />
      </Card>

      <View style={styles.footer}>
        <Text style={[styles.caption, { color: p.textFaint }]}>
          {t('common.appName')} · {t('settings.version')}{' '}
          {Constants.expoConfig?.version ?? '0.1.0'}
        </Text>
      </View>
    </Screen>
  );
}

function NotifRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const { t } = useTranslation();
  const p = useTheme();
  return (
    <View style={styles.notifRow}>
      <Text style={[styles.notifLabel, { color: p.text }]}>{label}</Text>
      <SegmentedToggle
        label={label}
        options={[
          { value: 'off', label: t('settings.off') },
          { value: 'on', label: t('settings.on') },
        ]}
        value={value ? 'on' : 'off'}
        onChange={(v) => onChange(v === 'on')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1.5),
    paddingTop: spacing(1),
    paddingBottom: spacing(1),
  },
  title: { ...typography.headlineSm },
  kicker: { ...typography.kicker, marginTop: spacing(2.5), marginBottom: spacing(1) },
  card: { gap: spacing(1.25) },
  gapSm: { gap: spacing(1) },
  gapMd: { gap: spacing(1.75) },
  gapLg: { gap: spacing(2) },
  label: { ...typography.caption, marginBottom: spacing(0.5) },
  input: { ...typography.body, fontSize: 15, minHeight: 24, padding: 0 },
  caption: { ...typography.caption },
  pillBtn: {
    minHeight: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing(2),
  },
  pillBtnText: { ...typography.button, fontSize: 13 },
  dateRow: { minHeight: 36, justifyContent: 'center' },
  dateValue: { ...typography.serifValue },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing(1),
  },
  notifLabel: { ...typography.body, flexShrink: 1 },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing(1),
  },
  subLabel: { ...typography.title, fontSize: 16 },
  subBtn: {
    minHeight: 40,
    borderRadius: radius.md,
    paddingHorizontal: spacing(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { alignItems: 'center', marginTop: spacing(4) },
});
