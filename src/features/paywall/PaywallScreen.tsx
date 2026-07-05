import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { PlanCard } from '@/components/paywall/PlanCard';
import { Button } from '@/components/ui/Button';
import { usePremiumStore } from '@/store';
import { colors, radius, spacing, typography } from '@/theme';
import { PremiumPlan } from '@/types';

const BENEFIT_KEYS = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6'] as const;

type Plan = Exclude<PremiumPlan, null>;

const PLAN_PRICES: Record<Plan, string> = {
  monthly: '$6.99',
  yearly: '$39.99',
  lifetime: '$99',
};

export function PaywallScreen() {
  const { t } = useTranslation();
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
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.lavender, colors.deepPlum]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.hero}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          onPress={() => router.back()}
          style={styles.closeBtn}
          hitSlop={8}
        >
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
        <Text style={styles.heroEmoji}>🌙✨</Text>
        <Text style={styles.heroTitle}>{t('paywall.title')}</Text>
        <Text style={styles.heroSubtitle}>{t('paywall.subtitle')}</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.benefits}>
          {BENEFIT_KEYS.map((key) => (
            <View key={key} style={styles.benefitRow}>
              <Text style={styles.check}>✓</Text>
              <Text style={styles.benefit}>{t(`paywall.benefit.${key}`)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.plans}>
          <PlanCard
            title={t('paywall.plans.monthly')}
            price={PLAN_PRICES.monthly}
            period={planPeriod.monthly}
            selected={selected === 'monthly'}
            onPress={() => setSelected('monthly')}
          />
          <PlanCard
            title={t('paywall.plans.yearly')}
            price={PLAN_PRICES.yearly}
            period={planPeriod.yearly}
            badge={t('paywall.saveBadge')}
            selected={selected === 'yearly'}
            onPress={() => setSelected('yearly')}
          />
          <PlanCard
            title={t('paywall.plans.lifetime')}
            price={PLAN_PRICES.lifetime}
            period={planPeriod.lifetime}
            selected={selected === 'lifetime'}
            onPress={() => setSelected('lifetime')}
          />
        </View>

        <Button
          label={isPremium ? t('paywall.success') : t('paywall.cta')}
          onPress={buy}
          disabled={isPremium}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('paywall.restore')}
          onPress={() => usePremiumStore.getState().restore()}
          style={styles.restore}
        >
          <Text style={styles.restoreText}>{t('paywall.restore')}</Text>
        </Pressable>

        <Text style={styles.mockNote}>{t('paywall.mockNote')}</Text>
        <Text style={styles.finePrint}>{t('paywall.finePrint')}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    paddingTop: spacing(6),
    paddingBottom: spacing(4),
    paddingHorizontal: spacing(3),
    alignItems: 'center',
    gap: spacing(1),
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  closeBtn: {
    position: 'absolute',
    top: spacing(2),
    right: spacing(2),
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    ...typography.subtitle,
    color: colors.deepPlum,
  },
  heroEmoji: {
    fontSize: 36,
  },
  heroTitle: {
    ...typography.headline,
    color: colors.card,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...typography.bodySmall,
    color: colors.softRose,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing(3),
    gap: spacing(2),
  },
  benefits: {
    gap: spacing(1.5),
  },
  benefitRow: {
    flexDirection: 'row',
    gap: spacing(1),
  },
  check: {
    ...typography.body,
    color: colors.mint,
    fontWeight: '700',
  },
  benefit: {
    ...typography.body,
    flex: 1,
  },
  plans: {
    flexDirection: 'row',
    gap: spacing(1.5),
    marginTop: spacing(1),
  },
  restore: {
    alignSelf: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  restoreText: {
    ...typography.bodySmall,
    color: colors.primary,
  },
  mockNote: {
    ...typography.caption,
    textAlign: 'center',
  },
  finePrint: {
    ...typography.caption,
    textAlign: 'center',
  },
});
