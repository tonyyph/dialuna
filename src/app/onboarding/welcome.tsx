import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { LunaOrb } from '@/components/mascot/LunaOrb';
import { radius, spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';

export default function Welcome() {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();
  return (
    <LinearGradient
      colors={colors.gradients.hero}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.hero}>
          <View style={styles.lunaHalo}>
            <LunaOrb state="celebrating" size={132} />
          </View>
          <View style={styles.copy}>
            <Text style={[typography.caption, styles.appName]}>{t('common.appName')}</Text>
            <Text style={[typography.displayXl, styles.title, { color: colors.card }]}>
              {t('onboarding.welcome.title')}
            </Text>
            <Text style={[typography.bodyLarge, styles.subtitle]}>{t('onboarding.welcome.subtitle')}</Text>
          </View>
          <View style={styles.promiseRow}>
            <Promise label={t('home.twinScore')} />
            <Promise label={t('ai.title')} />
            <Promise label={t('insights.title')} />
          </View>
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
  lunaHalo: {
    width: 164,
    height: 164,
    borderRadius: 82,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.32)',
  },
  copy: {
    alignItems: 'center',
    gap: spacing(1),
  },
  appName: {
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.76)',
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.82)',
    paddingHorizontal: spacing(2),
  },
  promiseRow: {
    flexDirection: 'row',
    gap: spacing(1),
    marginTop: spacing(2),
  },
  promise: {
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    paddingHorizontal: spacing(1.25),
    paddingVertical: spacing(1),
  },
});

function Promise({ label }: { label: string }) {
  const { colors, typography } = useTheme();
  return (
    <View style={styles.promise}>
      <Text style={[typography.caption, { color: colors.card }]}>{label}</Text>
    </View>
  );
}
