import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { PlanCard } from '@/components/paywall/PlanCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
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
    <Screen
      edgeToEdge
      bottomAction={
        <Button
          label={isPremium ? t('paywall.success') : t('paywall.cta')}
          onPress={buy}
          disabled={isPremium}
        />
      }
    >
      <LinearGradient
        colors={[colors.lavender, colors.primary, colors.deepPlum]}
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
        <Text style={styles.heroKicker}>{t('common.premium')}</Text>
        <Text style={styles.heroTitle}>{t('paywall.title')}</Text>
        <Text style={styles.heroSubtitle}>{t('paywall.subtitle')}</Text>
        <View style={styles.heroStats}>
          <MiniStat value="7" label={t('common.days', { count: 7 })} />
          <MiniStat value="∞" label={t('ai.unlimited')} />
          <MiniStat value="AI" label={t('insights.title')} />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.benefitGrid}>
          {BENEFIT_KEYS.map((key) => (
            <Card key={key} variant="glass" style={styles.benefitTile}>
              <View style={styles.benefitIcon}>
                <Ionicons name="sparkles" size={16} color={colors.primary} />
              </View>
              <Text style={styles.benefit}>{t(`paywall.benefit.${key}`)}</Text>
            </Card>
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
      </View>
    </Screen>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniStatValue}>{value}</Text>
      <Text style={styles.miniStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingTop: spacing(6),
    paddingBottom: spacing(4),
    paddingHorizontal: spacing(3),
    alignItems: 'center',
    gap: spacing(1),
    borderBottomLeftRadius: radius.sheet,
    borderBottomRightRadius: radius.sheet,
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
  heroKicker: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.78)',
  },
  heroTitle: {
    ...typography.display,
    color: colors.card,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...typography.bodySmall,
    color: colors.softRose,
    textAlign: 'center',
  },
  heroStats: {
    flexDirection: 'row',
    gap: spacing(1),
    marginTop: spacing(1.5),
  },
  miniStat: {
    minWidth: 82,
    borderRadius: radius.card,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    padding: spacing(1.25),
    alignItems: 'center',
  },
  miniStatValue: {
    ...typography.title,
    color: colors.card,
  },
  miniStatLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.78)',
    textAlign: 'center',
  },
  content: {
    padding: spacing(3),
    gap: spacing(2),
  },
  benefitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(1.5),
  },
  benefitTile: {
    width: '47.8%',
    minHeight: 118,
    gap: spacing(1),
    padding: spacing(1.5),
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.softRose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefit: {
    ...typography.bodySmall,
    color: colors.textPrimary,
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
