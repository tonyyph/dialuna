import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Pressable } from '@/components/ui/Pressable';
import { usePremiumStore } from '@/store';
import { paywallColors as pw, radius, spacing, typography } from '@/theme';

type Plan = 'monthly' | 'yearly';

const SLIDE_ICONS = ['moon-outline', 'trending-up-outline', 'calendar-outline'] as const;
const SLIDE_KEYS = ['s1', 's2', 's3'] as const;
const FEATURE_KEYS = ['f1', 'f2', 'f3', 'f4'] as const;

export function PaywallScreen() {
  const { t } = useTranslation();
  const purchase = usePremiumStore((s) => s.purchase);
  const restore = usePremiumStore((s) => s.restore);
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<Plan>('yearly');

  const next = () => setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const subscribe = () => {
    purchase(plan);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.progressRow}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.segment,
                { backgroundColor: i <= step ? pw.text : pw.segment },
              ]}
            />
          ))}
        </View>
        <View style={styles.closeRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            hitSlop={8}
            onPress={() => router.back()}
            scaleTo={0.94}
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={16} color={pw.text} />
          </Pressable>
        </View>

        {step < 3 ? (
          <View style={styles.storyArea}>
            <View style={StyleSheet.absoluteFill}>
              <View style={styles.tapRow}>
                <Pressable
                  accessibilityLabel={t('common.back')}
                  style={styles.tapBack}
                  onPress={back}
                />
                <Pressable
                  accessibilityLabel={t('common.next')}
                  style={styles.tapNext}
                  onPress={next}
                />
              </View>
            </View>
            <Animated.View
              key={step}
              entering={FadeIn.duration(220)}
              pointerEvents="none"
              style={styles.slide}
            >
              <Ionicons name={SLIDE_ICONS[step]} size={40} color={pw.text} />
              <Text style={styles.slideTitle}>
                {t(`paywall.slides.${SLIDE_KEYS[step]}.title`)}
              </Text>
              <Text style={styles.slideBody}>
                {t(`paywall.slides.${SLIDE_KEYS[step]}.body`)}
              </Text>
            </Animated.View>
          </View>
        ) : (
          <Animated.View entering={FadeIn.duration(220)} style={styles.plansArea}>
            <Text style={styles.plansTitle}>{t('paywall.choosePlan')}</Text>
            <Text style={styles.trialNote}>{t('paywall.trialNote')}</Text>

            <PlanRow
              label={t('paywall.plans.monthly')}
              price={t('paywall.plans.monthlyPrice')}
              selected={plan === 'monthly'}
              onPress={() => setPlan('monthly')}
            />
            <PlanRow
              label={t('paywall.plans.annual')}
              price={t('paywall.plans.annualPrice')}
              badge={t('paywall.saveBadge')}
              selected={plan === 'yearly'}
              onPress={() => setPlan('yearly')}
            />

            <View style={styles.features}>
              {FEATURE_KEYS.map((k) => (
                <View key={k} style={styles.featureRow}>
                  <Ionicons name="checkmark" size={14} color={pw.accent} />
                  <Text style={styles.featureText}>{t(`paywall.features.${k}`)}</Text>
                </View>
              ))}
            </View>

            <View style={styles.flex} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('paywall.cta')}
              onPress={subscribe}
              style={styles.cta}
            >
              <Text style={styles.ctaText}>{t('paywall.cta')}</Text>
            </Pressable>
            <View style={styles.footerRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('paywall.restore')}
                onPress={restore}
              >
                <Text style={styles.footerText}>{t('paywall.restore')}</Text>
              </Pressable>
              <Text style={styles.footerText}>{t('paywall.terms')}</Text>
              <Text style={styles.footerText}>{t('paywall.privacy')}</Text>
            </View>
          </Animated.View>
        )}
      </SafeAreaView>
    </View>
  );
}

function PlanRow({
  label,
  price,
  badge,
  selected,
  onPress,
}: {
  label: string;
  price: string;
  badge?: string;
  selected: boolean;
  onPress: () => void;
}) {
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(selected ? 1 : 0, { duration: 150 });
  }, [selected, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(progress.value, [0, 1], [pw.border, pw.accent]),
    backgroundColor: interpolateColor(progress.value, [0, 1], ['transparent', pw.accentTint]),
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label} ${price}`}
      accessibilityState={{ selected }}
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      scaleTo={0.98}
      style={[styles.planRow, animatedStyle]}
    >
      <View>
        <Text style={styles.planLabel}>{label}</Text>
        <Text style={styles.planPrice}>{price}</Text>
      </View>
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: pw.bg },
  safe: { flex: 1 },
  flex: { flex: 1 },
  progressRow: {
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: spacing(2),
    paddingTop: spacing(1),
  },
  segment: { flex: 1, height: 2.5, borderRadius: 2 },
  closeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing(2),
    paddingTop: spacing(1.25),
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: pw.closeFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyArea: { flex: 1 },
  tapRow: { flex: 1, flexDirection: 'row' },
  tapBack: { width: '35%' },
  tapNext: { flex: 1 },
  slide: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing(4.5),
  },
  slideTitle: {
    ...typography.headlineSm,
    fontSize: 26,
    color: pw.text,
    marginTop: spacing(2.75),
    marginBottom: spacing(1.25),
    textAlign: 'center',
  },
  slideBody: {
    ...typography.body,
    color: pw.textDim,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
  plansArea: { flex: 1, paddingHorizontal: spacing(3), paddingTop: spacing(2.5) },
  plansTitle: { ...typography.headlineSm, fontSize: 26, color: pw.text, textAlign: 'center' },
  trialNote: {
    ...typography.bodySmall,
    color: pw.textDim,
    textAlign: 'center',
    marginTop: spacing(0.5),
    marginBottom: spacing(2.5),
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing(2),
    borderRadius: radius.md,
    borderWidth: 1.5,
    marginBottom: spacing(1.25),
  },
  planLabel: { ...typography.title, fontSize: 16, color: pw.text },
  planPrice: { ...typography.caption, color: pw.textDim, marginTop: 2 },
  badge: {
    backgroundColor: pw.badge,
    borderRadius: 10,
    paddingHorizontal: spacing(1.25),
    paddingVertical: spacing(0.6),
  },
  badgeText: { ...typography.micro, color: pw.text },
  features: { gap: spacing(1.25), marginTop: spacing(1.5) },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(1.25) },
  featureText: { ...typography.bodySmall, color: pw.text },
  cta: {
    backgroundColor: pw.accent,
    borderRadius: radius.button,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { ...typography.button, fontFamily: 'Manrope_700Bold', color: pw.ctaText },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing(2),
    marginTop: spacing(1.75),
    marginBottom: spacing(1),
  },
  footerText: { ...typography.caption, fontSize: 11, color: pw.textFaint },
});
