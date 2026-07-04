import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { colors, spacing, typography } from '@/theme';

export default function Welcome() {
  const { t } = useTranslation();
  return (
    <LinearGradient
      colors={[colors.softRose, colors.cream]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.hero}>
          <Text style={styles.moon}>🌙</Text>
          <Text style={styles.appName}>{t('common.appName')}</Text>
          <Text style={styles.title}>{t('onboarding.welcome.title')}</Text>
          <Text style={styles.subtitle}>{t('onboarding.welcome.subtitle')}</Text>
        </View>
        <Button
          label={t('onboarding.welcome.cta')}
          onPress={() => router.push('/onboarding/disclaimer')}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
    paddingHorizontal: spacing(3),
    paddingBottom: spacing(3),
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(1.5),
  },
  moon: {
    fontSize: 72,
    marginBottom: spacing(1),
  },
  appName: {
    ...typography.caption,
    letterSpacing: 4,
    textTransform: 'uppercase',
    color: colors.primary,
  },
  title: {
    ...typography.display,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodySmall,
    textAlign: 'center',
    paddingHorizontal: spacing(2),
  },
});
