import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AuroraStage } from '@/components/lunar/AuroraStage';
import { LunarCompanion } from '@/components/lunar/LunarCompanion';
import { LunarButton } from '@/components/lunar/LunarButton';
import { Screen } from '@/components/ui/Screen';
import { usePremiumStore } from '@/store';
import { radius, shadows, spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';
import { PremiumPlan } from '@/types';

type Plan = Exclude<PremiumPlan, null>;

const PLAN_PRICES: Record<Plan, string> = {
  monthly: '$6.99',
  yearly: '$39.99',
  lifetime: '$99',
};

const FEATURE_KEYS = ['b1', 'b2', 'b3', 'b4', 'b5'] as const;

export function PaywallScreen() {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();
  const purchase = usePremiumStore((s) => s.purchase);
  const isPremium = usePremiumStore((s) => s.isPremium);
  const [selected, setSelected] = useState<Plan>('yearly');

  const buy = () => {
    purchase(selected);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const planPeriod: Record<Plan, string> = {
    monthly: t('paywall.plans.perMonth'),
    yearly: t('paywall.plans.perYear'),
    lifetime: t('paywall.plans.once'),
  };

  return (
    <Screen
      edgeToEdge
      bottomAction={
        <LunarButton
          label={isPremium ? t('paywall.success') : t('paywall.innerCircle.cta')}
          onPress={buy}
          disabled={isPremium}
        />
      }
      contentContainerStyle={styles.screenContent}
    >
      <AuroraStage intensity="premium" style={styles.hero}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={22} color={colors.moonWhite} />
        </Pressable>

        <View style={styles.innerCircleHero}>
          <View style={[styles.outerRing, { borderColor: colors.champagneGold }]} />
          <View style={[styles.midRing, { borderColor: colors.lilac }]} />
          <LunarCompanion size={126} premium state="celebrating" />
        </View>

        <View style={styles.heroCopy}>
          <Text style={[typography.caption, styles.kicker]}>{t('paywall.innerCircle.kicker')}</Text>
          <Text style={[typography.displayXl, styles.title]}>{t('paywall.innerCircle.title')}</Text>
          <Text style={[typography.body, styles.subtitle]}>{t('paywall.innerCircle.body')}</Text>
        </View>
      </AuroraStage>

      <View style={styles.content}>
        <View style={styles.featureStories}>
          {FEATURE_KEYS.map((key, index) => (
            <FeatureStory
              key={key}
              icon={index === 0 ? 'chatbubble-ellipses' : index === 1 ? 'calendar' : index === 2 ? 'analytics' : 'sparkles'}
              text={t(`paywall.benefit.${key}`)}
            />
          ))}
        </View>

        <View style={styles.plans}>
          {(['monthly', 'yearly', 'lifetime'] as const).map((plan) => (
            <PlanPass
              key={plan}
              title={t(`paywall.plans.${plan}`)}
              price={PLAN_PRICES[plan]}
              period={planPeriod[plan]}
              badge={plan === 'yearly' ? t('paywall.saveBadge') : undefined}
              selected={selected === plan}
              onPress={() => setSelected(plan)}
            />
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('paywall.restore')}
          onPress={() => usePremiumStore.getState().restore()}
          style={styles.restore}
        >
          <Text style={[typography.body, { color: colors.primary }]}>{t('paywall.restore')}</Text>
        </Pressable>

        <Text style={[typography.caption, styles.finePrint]}>{t('paywall.finePrint')}</Text>
        <Text style={[typography.caption, styles.finePrint]}>{t('paywall.mockNote')}</Text>
      </View>
    </Screen>
  );
}

function FeatureStory({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  const { colors, typography } = useTheme();
  return (
    <View style={[styles.featureStory, { backgroundColor: colors.surface.elevated, borderColor: colors.border }]}>
      <View style={[styles.featureIcon, { backgroundColor: colors.softRose }]}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <Text style={typography.bodyLarge}>{text}</Text>
    </View>
  );
}

function PlanPass({
  title,
  price,
  period,
  badge,
  selected,
  onPress,
}: {
  title: string;
  price: string;
  period: string;
  badge?: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors, typography } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title} ${price} ${period}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.planPass,
        {
          backgroundColor: selected ? colors.royalViolet : colors.surface.elevated,
          borderColor: selected ? colors.champagneGold : colors.border,
        },
        pressed && styles.pressed,
      ]}
    >
      {badge ? (
        <View style={[styles.badge, { backgroundColor: colors.champagneGold }]}>
          <Text style={[typography.caption, { color: colors.royalViolet }]}>{badge}</Text>
        </View>
      ) : null}
      <View>
        <Text style={[typography.subtitle, selected && { color: colors.moonWhite }]}>{title}</Text>
        <Text style={[typography.caption, selected && { color: 'rgba(255,255,255,0.68)' }]}>{period}</Text>
      </View>
      <Text style={[typography.displayL, selected && { color: colors.moonWhite }]}>{price}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingBottom: spacing(13),
  },
  hero: {
    minHeight: 522,
    borderBottomLeftRadius: radius.sheet,
    borderBottomRightRadius: radius.sheet,
  },
  closeButton: {
    position: 'absolute',
    top: spacing(2.5),
    right: spacing(2.5),
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    zIndex: 2,
  },
  innerCircleHero: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 262,
    marginTop: spacing(4),
  },
  outerRing: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    opacity: 0.48,
  },
  midRing: {
    position: 'absolute',
    width: 184,
    height: 184,
    borderRadius: 92,
    borderWidth: 1,
    opacity: 0.38,
  },
  heroCopy: {
    alignItems: 'center',
    paddingHorizontal: spacing(3),
    gap: spacing(0.75),
  },
  kicker: {
    color: 'rgba(255,255,255,0.68)',
  },
  title: {
    color: '#FFF8F1',
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.76)',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: spacing(2.5),
    marginTop: -spacing(4),
    gap: spacing(2.5),
  },
  featureStories: {
    gap: spacing(1.25),
  },
  featureStory: {
    minHeight: 74,
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing(1.5),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1.25),
    ...shadows.sm,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plans: {
    gap: spacing(1.25),
  },
  planPass: {
    minHeight: 116,
    borderRadius: radius.sheet,
    borderWidth: 1.5,
    padding: spacing(2),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    ...shadows.md,
  },
  badge: {
    position: 'absolute',
    right: spacing(2),
    top: spacing(1.25),
    borderRadius: radius.pill,
    paddingHorizontal: spacing(1),
    paddingVertical: spacing(0.4),
  },
  pressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.95,
  },
  restore: {
    alignSelf: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  finePrint: {
    textAlign: 'center',
  },
});
