import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';

export default function Disclaimer() {
  const { t } = useTranslation();
  const { typography } = useTheme();
  return (
    <Screen
      scroll={false}
      bottomAction={
        <Button
          label={t('onboarding.disclaimerScreen.cta')}
          onPress={() => router.push('/onboarding/profile')}
        />
      }
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.emoji}>🤍</Text>
          <Text style={[typography.headline, styles.title]}>
            {t('onboarding.disclaimerScreen.title')}
          </Text>
          <Card>
            <Text style={[typography.bodyLarge, styles.body]}>
              {t('onboarding.disclaimerScreen.body')}
            </Text>
          </Card>
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
  emoji: {
    fontSize: 44,
    textAlign: 'center',
  },
  title: {
    textAlign: 'center',
  },
  body: {
    lineHeight: 24,
  },
});
