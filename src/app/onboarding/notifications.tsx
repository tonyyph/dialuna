import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { colors, spacing, typography } from '@/theme';

interface ToggleRowProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

function ToggleRow({ label, value, onChange }: ToggleRowProps) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.primary, false: colors.border }}
        accessibilityLabel={label}
      />
    </View>
  );
}

export default function Notifications() {
  const { t } = useTranslation();
  const [daily, setDaily] = useState(true);
  const [period, setPeriod] = useState(true);
  const [pms, setPms] = useState(true);

  return (
    <Screen
      bottomAction={
        <Button
          label={t('common.continue')}
          onPress={() => router.push('/onboarding/paywall-preview')}
        />
      }
    >
      <View style={styles.container}>
        <Text style={styles.emoji}>🔔</Text>
        <Text style={styles.title}>{t('onboarding.notifications.title')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.notifications.subtitle')}</Text>

        <Card style={styles.card}>
          <ToggleRow
            label={t('onboarding.notifications.daily')}
            value={daily}
            onChange={setDaily}
          />
          <ToggleRow
            label={t('onboarding.notifications.period')}
            value={period}
            onChange={setPeriod}
          />
          <ToggleRow
            label={t('onboarding.notifications.pms')}
            value={pms}
            onChange={setPms}
          />
        </Card>

        <Text style={styles.note}>{t('onboarding.notifications.note')}</Text>
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
    ...typography.headline,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodySmall,
    textAlign: 'center',
    marginBottom: spacing(1),
  },
  card: {
    gap: spacing(2),
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    ...typography.body,
  },
  note: {
    ...typography.caption,
    textAlign: 'center',
  },
});
