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
import { useThemeStore } from '@/store/themeStore';
import { radius, spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';
import { ALL_AGE_RANGES } from '@/types';
import { nicknameSchema } from '@/utils/validation';

export function SettingsScreen() {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();
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

  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const accent = useThemeStore((s) => s.accent);
  const setAccent = useThemeStore((s) => s.setAccent);
  const reduceMotion = useThemeStore((s) => s.reduceMotion);
  const setReduceMotion = useThemeStore((s) => s.setReduceMotion);

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
      <View
        style={[
          styles.header,
          { backgroundColor: colors.deepPlum, borderColor: 'rgba(255,255,255,0.18)' },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.backBtn}
        >
          <Text style={[typography.displayL, styles.backText, { color: colors.card }]}>‹</Text>
        </Pressable>
        <Text style={[typography.headline, { color: colors.card }]}>{t('settings.title')}</Text>
      </View>

      <SectionTitle title={t('settings.sections.profile')} />
      <Card variant="glass" style={styles.rows}>
        <Text style={typography.bodyLarge}>{t('settings.nickname')}</Text>
        <TextInput
          style={[
            typography.bodyLarge,
            styles.input,
            { backgroundColor: colors.glassStrong, borderColor: colors.border },
          ]}
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
        <Text style={typography.bodyLarge}>{t('settings.ageRange')}</Text>
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
      <Card variant="glass" style={styles.rows}>
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
          <Text style={typography.bodyLarge}>{t('settings.lastPeriodStart')}</Text>
          <Text style={[typography.body, styles.value, { color: colors.primary }]}>
            {profile.lastPeriodStartDate}
          </Text>
        </View>
      </Card>

      <SectionTitle title={t('settings.sections.notifications')} />
      <Card variant="glass" style={styles.rows}>
        <ToggleRow label={t('settings.notifDaily')} value={notifDaily} onChange={setNotifDaily} />
        <ToggleRow label={t('settings.notifPeriod')} value={notifPeriod} onChange={setNotifPeriod} />
        <ToggleRow label={t('settings.notifPms')} value={notifPms} onChange={setNotifPms} />
        <Text style={typography.caption}>{t('settings.notifDeferred')}</Text>
      </Card>

      <SectionTitle title="Appearance" />
      <Card variant="glass" style={styles.rows}>
        <ToggleRow
          label="Dark mode"
          value={mode === 'dark'}
          onChange={(v) => setMode(v ? 'dark' : 'light')}
        />
        <View style={styles.chipRow}>
          <Chip label="Lavender" selected={accent === 'lavender'} onPress={() => setAccent('lavender')} />
          <Chip label="Rose" selected={accent === 'rose'} onPress={() => setAccent('rose')} />
          <Chip label="Aurora Blue" selected={accent === 'auroraBlue'} onPress={() => setAccent('auroraBlue')} />
        </View>
        <ToggleRow label="Reduce motion" value={reduceMotion} onChange={setReduceMotion} />
      </Card>

      <SectionTitle title={t('settings.sections.preferences')} />
      <Card variant="glass" style={styles.rows}>
        <Text style={typography.bodyLarge}>{t('settings.language')}</Text>
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
      <Card variant="glass" style={styles.rows}>
        <View style={styles.infoRow}>
          <Text style={typography.bodyLarge}>{t('settings.premiumStatus')}</Text>
          <Text style={[typography.body, styles.value, { color: colors.primary }]}>
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
      <Card variant="glass" style={styles.rows}>
        <LinkRow
          label={t('settings.privacyTitle')}
          onPress={() => setPrivacyOpen((v) => !v)}
        />
        {privacyOpen && (
          <Text style={[typography.body, styles.bodyText]}>{t('settings.privacyBody')}</Text>
        )}
        <LinkRow
          label={t('settings.medicalTitle')}
          onPress={() => setMedicalOpen((v) => !v)}
        />
        {medicalOpen && <DisclaimerBox text={t('disclaimer.full')} />}
        <View style={styles.infoRow}>
          <Text style={typography.bodyLarge}>{t('settings.exportData')}</Text>
          <Text style={typography.caption}>{t('settings.exportSoon')}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('settings.deleteData')}
          onPress={confirmDelete}
          style={styles.deleteBtn}
        >
          <Text style={[typography.bodyLarge, styles.deleteText, { color: colors.error }]}>
            {t('settings.deleteData')}
          </Text>
        </Pressable>
      </Card>

      <View style={styles.footer}>
        <Text style={typography.caption}>
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
  const { colors, typography } = useTheme();
  return (
    <View style={styles.infoRow}>
      <Text style={typography.bodyLarge}>{label}</Text>
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
  const { colors, typography } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.linkRow}
    >
      <Text style={typography.bodyLarge}>{label}</Text>
      <Text style={[typography.title, { color: colors.textSecondary }]}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing(1.5),
    padding: spacing(2),
    gap: spacing(1),
    borderRadius: radius.sheet,
    borderWidth: 1,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  backText: {
    lineHeight: 40,
  },
  rows: {
    gap: spacing(1.5),
  },
  value: {
    fontWeight: '600',
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
  bodyText: {
    lineHeight: 21,
  },
  deleteBtn: {
    minHeight: 44,
    justifyContent: 'center',
  },
  deleteText: {
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    gap: spacing(1),
    marginTop: spacing(4),
  },
});
