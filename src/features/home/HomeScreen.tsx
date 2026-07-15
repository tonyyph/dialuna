import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { RhythmField } from '@/components/rhythm/RhythmField';
import { SignalStrip } from '@/components/rhythm/SignalStrip';
import { Screen } from '@/components/ui/Screen';
import { useCycleToday } from '@/features/cycle/useCycleToday';
import { usePremiumStore } from '@/store';
import { radius, spacing, typography, useTheme } from '@/theme';

function greetingKey() {
  const hour = new Date().getHours();
  return hour < 12 ? 'home.greeting.morning' : hour < 18 ? 'home.greeting.afternoon' : 'home.greeting.evening';
}

export function HomeScreen() {
  const { t } = useTranslation();
  const p = useTheme();
  const ctx = useCycleToday();
  const isPremium = usePremiumStore((s) => s.isPremium);
  if (!ctx) return null;
  const { profile, prediction, twin, week, today } = ctx;
  const nextEvent = prediction.daysUntilPeriod === 0 ? t('home.periodToday') : t('home.periodIn', { count: prediction.daysUntilPeriod });
  const phaseLabel = t(prediction.isPmsWindow ? 'phases.pms' : `phases.${prediction.phase}`);

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={[styles.date, { color: p.textMuted }]}>{format(parseISO(today), 'EEEE, MMMM d')}</Text>
          <Text style={[styles.greeting, { color: p.text }]}>{t(greetingKey(), { name: profile.nickname })}</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={t('settings.title')} onPress={() => router.push('/settings')} style={[styles.iconButton, { backgroundColor: p.surfaceStrong }]}>
          <Ionicons name="options-outline" size={20} color={p.text} />
        </Pressable>
      </View>

      <RhythmField day={prediction.cycleDay} phase={prediction.phase} phaseLabel={phaseLabel} nextEvent={nextEvent} score={twin.hormoneTwinScore} signal={t(twin.coachMessageKey)} />

      <View style={styles.interpretation}>
        <Text style={[styles.eyebrow, { color: p.accentInk }]}>{t('home.insightTitle')}</Text>
        <Text style={[styles.interpretationTitle, { color: p.text }]}>{t(twin.coachMessageKey)}</Text>
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" accessibilityLabel={t('home.logNow')} onPress={() => router.push('/(tabs)/log')} style={[styles.primaryAction, { backgroundColor: p.primaryBtn }]}>
            <Ionicons name="pulse" size={20} color={p.onPrimaryBtn} />
            <Text style={[styles.actionText, { color: p.onPrimaryBtn }]}>{t('home.logNow')}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={t('home.askAi')} onPress={() => router.push('/(tabs)/ai')} style={[styles.secondaryAction, { borderColor: p.track }]}>
            <Ionicons name="sparkles-outline" size={20} color={p.accentInk} />
          </Pressable>
        </View>
      </View>

      <View style={[styles.upcoming, { borderTopColor: p.track }]}>
        <View style={styles.sectionHead}>
          <Text style={[styles.sectionTitle, { color: p.text }]}>{t('home.weekForecast')}</Text>
          <Text style={[styles.sectionMeta, { color: p.textMuted }]}>{nextEvent}</Text>
        </View>
        <SignalStrip days={week} />
      </View>

      <Pressable accessibilityRole="button" accessibilityLabel={isPremium ? t('tabs.insights') : t('premium.bannerCta')} onPress={() => router.push(isPremium ? '/(tabs)/insights' : '/paywall')} style={[styles.preview, { backgroundColor: p.surface }]}>
        <View style={styles.previewCopy}>
          <Text style={[styles.eyebrow, { color: p.textMuted }]}>{isPremium ? t('tabs.insights') : t('premium.bannerEyebrow')}</Text>
          <Text style={[styles.previewTitle, { color: p.text }]}>{isPremium ? t('insights.subtitle') : t('premium.bannerTitle')}</Text>
        </View>
        <Ionicons name="arrow-forward" size={20} color={p.accentInk} />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: spacing(1), marginBottom: spacing(2) },
  date: { ...typography.labelM, textTransform: 'uppercase', letterSpacing: 0.8 },
  greeting: { ...typography.titleL, marginTop: spacing(0.5) },
  iconButton: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  interpretation: { paddingVertical: spacing(3), gap: spacing(1.25) },
  eyebrow: { ...typography.labelM, textTransform: 'uppercase', letterSpacing: 1 },
  interpretationTitle: { ...typography.titleM, maxWidth: 330 },
  actions: { flexDirection: 'row', gap: spacing(1.25), marginTop: spacing(1) },
  primaryAction: { flex: 1, minHeight: 52, borderRadius: radius.md, paddingHorizontal: spacing(2), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing(1) },
  secondaryAction: { width: 52, height: 52, borderRadius: radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  actionText: { ...typography.labelL },
  upcoming: { paddingVertical: spacing(2.5), borderTopWidth: 1 },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: spacing(2) },
  sectionTitle: { ...typography.titleM },
  sectionMeta: { ...typography.labelM },
  preview: { minHeight: 104, borderRadius: radius.lg, padding: spacing(2), flexDirection: 'row', alignItems: 'center', gap: spacing(2) },
  previewCopy: { flex: 1, gap: spacing(0.75) },
  previewTitle: { ...typography.bodyL },
});
