import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { radius, spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';

interface Props {
  onPress: () => void;
}

export function PremiumBanner({ onPress }: Props) {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('home.premiumBanner.title')}
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <LinearGradient
        colors={[colors.lavender, colors.royalViolet]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <View style={styles.textCol}>
          <Text style={[typography.subtitle, { color: colors.card }]}>
            {t('home.premiumBanner.title')}
          </Text>
          <Text style={[typography.caption, { color: colors.softRose }]}>
            {t('home.premiumBanner.body')}
          </Text>
        </View>
        <View style={[styles.cta, { backgroundColor: colors.card }]}>
          <Text style={[typography.caption, styles.ctaText, { color: colors.royalViolet }]}>
            {t('home.premiumBanner.cta')}
          </Text>
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
  cta: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
  },
  ctaText: {
    fontWeight: '700',
  },
});
