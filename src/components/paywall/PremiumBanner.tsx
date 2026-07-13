import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { spacing, typography, useTheme } from '@/theme';

interface Props {
  onPress: () => void;
}

export function PremiumBanner({ onPress }: Props) {
  const { t } = useTranslation();
  const p = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('home.premiumBanner.title')}
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <LinearGradient
        colors={p.premiumBannerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <Text style={[styles.kicker, { color: p.accent400 }]}>
          {t('home.premiumBanner.kicker')}
        </Text>
        <Text style={styles.title}>{t('home.premiumBanner.title')}</Text>
        <Text style={styles.body}>{t('home.premiumBanner.body')}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 22,
    padding: spacing(2.25),
    gap: spacing(0.5),
  },
  pressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.94,
  },
  kicker: {
    ...typography.kicker,
  },
  title: {
    ...typography.title,
    fontSize: 18,
    color: '#f4ede1',
  },
  body: {
    ...typography.caption,
    color: 'rgba(244,237,225,0.75)',
  },
});
