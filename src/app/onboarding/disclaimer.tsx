import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { spacing, typography, useTheme } from '@/theme';

export default function Disclaimer() {
  const { t } = useTranslation();
  const p = useTheme();
  return (
    <Screen
      bottomAction={
        <Button
          label={t('onboarding.disclaimerScreen.cta')}
          onPress={() => router.push('/onboarding/cycle-basics')}
        />
      }
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: p.text }]}>
            {t('onboarding.disclaimerScreen.title')}
          </Text>
          <View style={[styles.editorial, { borderColor: p.track }]}>
            <Text style={[styles.body, { color: p.textMuted }]}>
              {t('onboarding.disclaimerScreen.body')}
            </Text>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing(2),
  },
  title: {
    ...typography.headline,
    textAlign: 'center',
  },
  body: {
    ...typography.body,
    lineHeight: 24,
  },
  editorial: { paddingVertical: spacing(3), borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth },
});
