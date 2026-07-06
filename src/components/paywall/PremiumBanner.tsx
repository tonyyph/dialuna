import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, radius, spacing, typography } from '@/theme';

interface Props {
  onPress: () => void;
}

export function PremiumBanner({ onPress }: Props) {
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('home.premiumBanner.title')}
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <LinearGradient
        colors={[colors.lavender, colors.deepPlum]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <View style={styles.textCol}>
          <Text style={styles.title}>{t('home.premiumBanner.title')}</Text>
          <Text style={styles.body}>{t('home.premiumBanner.body')}</Text>
        </View>
        <View style={styles.cta}>
          <Text style={styles.ctaText}>{t('home.premiumBanner.cta')}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: radius.card,
    padding: spacing(2.5),
    gap: spacing(1.5),
  },
  pressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.94,
  },
  textCol: {
    gap: spacing(0.5),
  },
  title: {
    ...typography.subtitle,
    color: colors.card,
  },
  body: {
    ...typography.caption,
    color: colors.softRose,
  },
  cta: {
    alignSelf: 'flex-start',
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
  },
  ctaText: {
    ...typography.caption,
    color: colors.deepPlum,
    fontWeight: '700',
  },
});
