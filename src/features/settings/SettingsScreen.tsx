import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { ReactNode, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { DisclaimerBox } from '@/components/ui/DisclaimerBox';
import { LoadingAurora } from '@/components/lunar/LoadingAurora';
import { Screen } from '@/components/ui/Screen';
import { Stepper } from '@/features/onboarding/Stepper';
import i18n, { setAppLanguage } from '@/i18n';
import { resetAllData, usePremiumStore, useUserStore } from '@/store';
import { useThemeStore } from '@/store/themeStore';
import { radius, shadows, spacing } from '@/theme';
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

  if (!profile) return <LoadingAurora fullScreen label={t('common.loading')} />;

  const language = i18n.language === 'vi' ? 'vi' : 'en';

  const confirmDelete = () => {
    Alert.alert(t('settings.deleteConfirmTitle'), t('settings.deleteConfirmBody'), [
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
    ]);
  };

  return (
    <Screen contentContainerStyle={styles.screenContent}>
      <View style={[styles.hero, { backgroundColor: colors.surface.elevated, borderColor: colors.border }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          onPress={() => router.back()}
          hitSlop={10}
          style={[styles.backButton, { backgroundColor: colors.softRose }]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </Pressable>
        <View style={styles.heroText}>
          <Text style={[typography.caption, { color: colors.primary }]}>{t('settings.atelier.kicker')}</Text>
          <Text style={typography.displayL}>{t('settings.atelier.title')}</Text>
          <Text style={typography.body}>{t('settings.atelier.body')}</Text>
        </View>
      </View>

      <AtelierGroup title={t('settings.sections.profile')} icon="person">
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
          onEndEditing={(event) => {
            const nickname = event.nativeEvent.text.trim();
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
      </AtelierGroup>

      <AtelierGroup title={t('settings.sections.cycle')} icon="sync">
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
        <InfoRow label={t('settings.lastPeriodStart')} value={profile.lastPeriodStartDate} />
      </AtelierGroup>

      <AtelierGroup title={t('settings.sections.notifications')} icon="notifications">
        <ToggleRow label={t('settings.notifDaily')} value={notifDaily} onChange={setNotifDaily} />
        <ToggleRow label={t('settings.notifPeriod')} value={notifPeriod} onChange={setNotifPeriod} />
        <ToggleRow label={t('settings.notifPms')} value={notifPms} onChange={setNotifPms} />
        <Text style={typography.caption}>{t('settings.notifDeferred')}</Text>
      </AtelierGroup>

      <AtelierGroup title={t('settings.atelier.appearance')} icon="color-palette">
        <ToggleRow
          label={t('settings.atelier.darkMode')}
          value={mode === 'dark'}
          onChange={(value) => setMode(value ? 'dark' : 'light')}
        />
        <View style={styles.chipRow}>
          <Chip label="Lavender" selected={accent === 'lavender'} onPress={() => setAccent('lavender')} />
          <Chip label="Rose" selected={accent === 'rose'} onPress={() => setAccent('rose')} />
          <Chip label="Aurora Blue" selected={accent === 'auroraBlue'} onPress={() => setAccent('auroraBlue')} />
        </View>
        <ToggleRow label={t('settings.atelier.reduceMotion')} value={reduceMotion} onChange={setReduceMotion} />
      </AtelierGroup>

      <AtelierGroup title={t('settings.sections.preferences')} icon="language">
        <Text style={typography.bodyLarge}>{t('settings.language')}</Text>
        <View style={styles.chipRow}>
          <Chip label={t('settings.languageEn')} selected={language === 'en'} onPress={() => setAppLanguage('en')} />
          <Chip label={t('settings.languageVi')} selected={language === 'vi'} onPress={() => setAppLanguage('vi')} />
        </View>
      </AtelierGroup>

      <AtelierGroup title={t('common.premium')} icon="sparkles">
        <InfoRow
          label={t('settings.premiumStatus')}
          value={
            isPremium
              ? t('settings.premiumActive', { plan: plan ? t(`paywall.plans.${plan}`) : '' })
              : t('settings.premiumInactive')
          }
        />
        <LinkRow label={t('settings.managePremium')} onPress={() => router.push('/paywall')} />
        <ToggleRow label={t('settings.devToggle')} value={isPremium} onChange={togglePremiumDev} />
      </AtelierGroup>

      <AtelierGroup title={t('settings.sections.privacy')} icon="shield-checkmark">
        <LinkRow label={t('settings.privacyTitle')} onPress={() => setPrivacyOpen((value) => !value)} />
        {privacyOpen ? <Text style={typography.body}>{t('settings.privacyBody')}</Text> : null}
        <LinkRow label={t('settings.medicalTitle')} onPress={() => setMedicalOpen((value) => !value)} />
        {medicalOpen ? <DisclaimerBox text={t('disclaimer.full')} /> : null}
        <InfoRow label={t('settings.exportData')} value={t('settings.exportSoon')} muted />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('settings.deleteData')}
          onPress={confirmDelete}
          style={styles.deleteRow}
        >
          <Ionicons name="trash" size={19} color={colors.error} />
          <Text style={[typography.bodyLarge, { color: colors.error }]}>{t('settings.deleteData')}</Text>
        </Pressable>
      </AtelierGroup>

      <View style={styles.footer}>
        <Text style={typography.caption}>
          {t('common.appName')} · {t('settings.version')} {Constants.expoConfig?.version ?? '0.1.0'}
        </Text>
      </View>
    </Screen>
  );
}

function AtelierGroup({
  title,
  icon,
  children,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: ReactNode;
}) {
  const { colors, typography } = useTheme();
  return (
    <Card variant="glass" style={styles.group}>
      <View style={styles.groupHeader}>
        <View style={[styles.groupIcon, { backgroundColor: colors.softRose }]}>
          <Ionicons name={icon} size={18} color={colors.primary} />
        </View>
        <Text style={typography.title}>{title}</Text>
      </View>
      {children}
    </Card>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  const { colors, typography } = useTheme();
  return (
    <View style={styles.row}>
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

function InfoRow({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  const { colors, typography } = useTheme();
  return (
    <View style={styles.row}>
      <Text style={typography.bodyLarge}>{label}</Text>
      <Text style={[typography.body, styles.value, { color: muted ? colors.textSecondary : colors.primary }]}>
        {value}
      </Text>
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
      style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}
    >
      <Text style={typography.bodyLarge}>{label}</Text>
      <Ionicons name="chevron-forward" size={19} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingBottom: spacing(13),
  },
  hero: {
    borderRadius: radius.sheet,
    borderWidth: 1,
    padding: spacing(2.5),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1.5),
    ...shadows.md,
  },
  backButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: {
    flex: 1,
    gap: spacing(0.35),
  },
  group: {
    gap: spacing(1.5),
    marginTop: spacing(2),
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
  },
  groupIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    borderRadius: radius.card,
    borderWidth: 1,
    paddingHorizontal: spacing(2),
    minHeight: 52,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(1),
  },
  row: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing(1.5),
  },
  value: {
    flexShrink: 1,
    textAlign: 'right',
  },
  linkRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing(1.5),
  },
  pressed: {
    opacity: 0.72,
  },
  deleteRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing(4),
  },
});
