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
import { radius, spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';
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
          style={[styles.closeBtn, { backgroundColor: colors.glass }]}
          hitSlop={8}
        >
          <Text style={[typography.subtitle, { color: colors.deepPlum }]}>✕</Text>
        </Pressable>
        <Text style={styles.heroEmoji}>🌙✨</Text>
        <Text style={[typography.caption, styles.heroKicker]}>{t('common.premium')}</Text>
        <Text style={[typography.displayXl, styles.heroTitle, { color: colors.card }]}>
          {t('paywall.title')}
        </Text>
        <Text style={[typography.body, styles.heroSubtitle, { color: colors.softRose }]}>
          {t('paywall.subtitle')}
        </Text>
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
              <View style={[styles.benefitIcon, { backgroundColor: colors.softRose }]}>
                <Ionicons name="sparkles" size={16} color={colors.primary} />
              </View>
              <Text style={[typography.body, { color: colors.textPrimary }]}>
                {t(`paywall.benefit.${key}`)}
              </Text>
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
          <Text style={[typography.body, { color: colors.primary }]}>{t('paywall.restore')}</Text>
        </Pressable>

        <Text style={[typography.caption, styles.mockNote]}>{t('paywall.mockNote')}</Text>
        <Text style={[typography.caption, styles.finePrint]}>{t('paywall.finePrint')}</Text>
      </View>
    </Screen>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  const { colors, typography } = useTheme();
  return (
    <View
      style={[
        styles.miniStat,
        { backgroundColor: 'rgba(255,255,255,0.18)', borderColor: 'rgba(255,255,255,0.28)' },
      ]}
    >
      <Text style={[typography.title, { color: colors.card }]}>{value}</Text>
      <Text style={[typography.caption, styles.miniStatLabel]}>{label}</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: {
    fontSize: 36,
  },
  heroKicker: {
    color: 'rgba(255,255,255,0.78)',
  },
  heroTitle: {
    textAlign: 'center',
  },
  heroSubtitle: {
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
    borderWidth: 1,
    padding: spacing(1.25),
    alignItems: 'center',
  },
  miniStatLabel: {
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
    alignItems: 'center',
    justifyContent: 'center',
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
  mockNote: {
    textAlign: 'center',
  },
  finePrint: {
    textAlign: 'center',
  },
});
