import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { spacing, typography } from '@/theme';

export default function Disclaimer() {
  const { t } = useTranslation();
  return (
    <Screen scroll={false}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.emoji}>🤍</Text>
          <Text style={styles.title}>{t('onboarding.disclaimerScreen.title')}</Text>
          <Card>
            <Text style={styles.body}>{t('onboarding.disclaimerScreen.body')}</Text>
          </Card>
        </View>
        <Button
          label={t('onboarding.disclaimerScreen.cta')}
          onPress={() => router.push('/onboarding/profile')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: spacing(3),
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing(2),
  },
  emoji: {
    fontSize: 44,
    textAlign: 'center',
  },
  title: {
    ...typography.headline,
    textAlign: 'center',
  },
  body: {
    ...typography.body,
    lineHeight: 24,
  },
});
