import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { DisclaimerBox } from '@/components/ui/DisclaimerBox';
import { Screen } from '@/components/ui/Screen';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Stepper } from '@/features/onboarding/Stepper';
import i18n, { setAppLanguage } from '@/i18n';
import { resetAllData, usePremiumStore, useUserStore } from '@/store';
import { colors, radius, spacing, typography } from '@/theme';
import { ALL_AGE_RANGES } from '@/types';
import { nicknameSchema } from '@/utils/validation';

export function SettingsScreen() {
  const { t } = useTranslation();
  const profile = useUserStore((s) => s.profile);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const isPremium = usePremiumStore((s) => s.isPremium);
  const plan = usePremiumStore((s) => s.plan);
  const togglePremiumDev = usePremiumStore((s) => s.togglePremiumDev);

  const [notifDaily, setNotifDaily] = useState(true);
  const [notifPeriod, setNotifPeriod] = useState(true);
  const [notifPms, setNotifPms] = useState(true);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [medicalOpen, setMedicalOpen] = useState(false);

  if (!profile) return null;

  const language = i18n.language === 'vi' ? 'vi' : 'en';

  const confirmDelete = () => {
    Alert.alert(
      t('settings.deleteConfirmTitle'),
      t('settings.deleteConfirmBody'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.deleteConfirmCta'),
          style: 'destructive',
          onPress: () => {
            resetAllData();
            router.dismissAll();
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={styles.title}>{t('settings.title')}</Text>
      </View>

      <SectionTitle title={t('settings.sections.profile')} />
      <Card style={styles.rows}>
        <Text style={styles.label}>{t('settings.nickname')}</Text>
        <TextInput
          style={styles.input}
          defaultValue={profile.nickname}
          accessibilityLabel={t('settings.nickname')}
          maxLength={30}
          onEndEditing={(e) => {
            const nickname = e.nativeEvent.text.trim();
            if (nicknameSchema.safeParse(nickname).success) {
              updateProfile({ nickname });
            }
          }}
        />
        <Text style={styles.label}>{t('settings.ageRange')}</Text>
        <View style={styles.chipRow}>
          {ALL_AGE_RANGES.map((range) => (
            <Chip
              key={range}
              label={t(`ageRanges.${range}`)}
              selected={profile.ageRange === range}
              onPress={() => updateProfile({ ageRange: range })}
            />
          ))}
        </View>
      </Card>

      <SectionTitle title={t('settings.sections.cycle')} />
      <Card style={styles.rows}>
        <Stepper
          label={t('settings.cycleLength')}
          unit={t('onboarding.profile.daysUnit')}
          value={profile.averageCycleLength}
          min={20}
          max={45}
          onChange={(averageCycleLength) => updateProfile({ averageCycleLength })}
        />
        <Stepper
          label={t('settings.periodLength')}
          unit={t('onboarding.profile.daysUnit')}
          value={profile.averagePeriodLength}
          min={2}
          max={10}
          onChange={(averagePeriodLength) => updateProfile({ averagePeriodLength })}
        />
        <View style={styles.infoRow}>
          <Text style={styles.label}>{t('settings.lastPeriodStart')}</Text>
          <Text style={styles.value}>{profile.lastPeriodStartDate}</Text>
        </View>
      </Card>

      <SectionTitle title={t('settings.sections.notifications')} />
      <Card style={styles.rows}>
        <ToggleRow label={t('settings.notifDaily')} value={notifDaily} onChange={setNotifDaily} />
        <ToggleRow label={t('settings.notifPeriod')} value={notifPeriod} onChange={setNotifPeriod} />
        <ToggleRow label={t('settings.notifPms')} value={notifPms} onChange={setNotifPms} />
        <Text style={styles.caption}>{t('settings.notifDeferred')}</Text>
      </Card>

      <SectionTitle title={t('settings.sections.preferences')} />
      <Card style={styles.rows}>
        <Text style={styles.label}>{t('settings.language')}</Text>
        <View style={styles.chipRow}>
          <Chip
            label={t('settings.languageEn')}
            selected={language === 'en'}
            onPress={() => setAppLanguage('en')}
          />
          <Chip
            label={t('settings.languageVi')}
            selected={language === 'vi'}
            onPress={() => setAppLanguage('vi')}
          />
        </View>
      </Card>

      <SectionTitle title={t('common.premium')} />
      <Card style={styles.rows}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>{t('settings.premiumStatus')}</Text>
          <Text style={styles.value}>
            {isPremium
              ? t('settings.premiumActive', {
                  plan: plan ? t(`paywall.plans.${plan}`) : '',
                })
              : t('settings.premiumInactive')}
          </Text>
        </View>
        <LinkRow
          label={t('settings.managePremium')}
          onPress={() => router.push('/paywall')}
        />
        <ToggleRow
          label={t('settings.devToggle')}
          value={isPremium}
          onChange={togglePremiumDev}
        />
      </Card>

      <SectionTitle title={t('settings.sections.privacy')} />
      <Card style={styles.rows}>
        <LinkRow
          label={t('settings.privacyTitle')}
          onPress={() => setPrivacyOpen((v) => !v)}
        />
        {privacyOpen && <Text style={styles.bodyText}>{t('settings.privacyBody')}</Text>}
        <LinkRow
          label={t('settings.medicalTitle')}
          onPress={() => setMedicalOpen((v) => !v)}
        />
        {medicalOpen && <DisclaimerBox text={t('disclaimer.full')} />}
        <View style={styles.infoRow}>
          <Text style={styles.label}>{t('settings.exportData')}</Text>
          <Text style={styles.caption}>{t('settings.exportSoon')}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('settings.deleteData')}
          onPress={confirmDelete}
          style={styles.deleteBtn}
        >
          <Text style={styles.deleteText}>{t('settings.deleteData')}</Text>
        </Pressable>
      </Card>

      <View style={styles.footer}>
        <Text style={styles.caption}>
          🌙 {t('common.appName')} · {t('settings.version')}{' '}
          {Constants.expoConfig?.version ?? '0.1.0'}
        </Text>
      </View>
    </Screen>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.primary, false: colors.border }}
        accessibilityLabel={label}
      />
    </View>
  );
}

function LinkRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.linkRow}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing(2),
    gap: spacing(1),
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  backText: {
    ...typography.display,
    color: colors.primary,
    lineHeight: 40,
  },
  title: {
    ...typography.h1,
  },
  rows: {
    gap: spacing(1.5),
  },
  label: {
    ...typography.body,
  },
  value: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  input: {
    ...typography.body,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing(2),
    minHeight: 48,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(1),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing(1),
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  chevron: {
    ...typography.h2,
    color: colors.textSecondary,
  },
  caption: {
    ...typography.caption,
  },
  bodyText: {
    ...typography.bodySmall,
    lineHeight: 21,
  },
  deleteBtn: {
    minHeight: 44,
    justifyContent: 'center',
  },
  deleteText: {
    ...typography.body,
    color: colors.error,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    gap: spacing(1),
    marginTop: spacing(4),
  },
});
