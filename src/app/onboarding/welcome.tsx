import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { spacing, typography, useTheme } from '@/theme';

export default function Welcome() {
  const { t } = useTranslation();
  const p = useTheme();
  return (
    <LinearGradient colors={p.bgGradient} style={styles.fill}>
      <View pointerEvents="none" style={styles.blobOuter} />
      <View pointerEvents="none" style={styles.blobInner} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.hero}>
          <View style={[styles.mark, { backgroundColor: p.primaryBtn }]}>
            <View style={[styles.markMoon, { backgroundColor: p.bgGradient[0] }]} />
          </View>
          <Text style={[styles.wordmark, { color: p.text }]}>
            {t('onboarding.welcome.title')}
          </Text>
          <Text style={[styles.subtitle, { color: p.textMuted }]}>
            {t('onboarding.welcome.subtitle')}
          </Text>
        </View>
        <Button
          label={t('onboarding.welcome.cta')}
          onPress={() => router.push('/onboarding/disclaimer')}
          style={styles.cta}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  blobOuter: {
    position: 'absolute',
    top: '6%',
    left: '-18%',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(182,130,53,0.10)',
  },
  blobInner: {
    position: 'absolute',
    top: '10%',
    left: '-10%',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(182,130,53,0.14)',
  },
  safe: { flex: 1, paddingHorizontal: spacing(4), paddingBottom: spacing(3) },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mark: {
    width: 72,
    height: 72,
    borderRadius: 28,
    marginBottom: spacing(3.75),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 8,
  },
  markMoon: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  wordmark: { ...typography.display, marginBottom: spacing(1.25) },
  subtitle: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 260,
  },
  cta: { alignSelf: 'center', width: '100%', maxWidth: 220 },
});
