import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/ui/Screen';
import { computeInsights } from '@/services/insightsEngine';
import { useLogStore, usePremiumStore, useSettingsStore, useUserStore } from '@/store';
import { radius, spacing, typography, useTheme } from '@/theme';
import { CyclePhase } from '@/types';

const PHASES: CyclePhase[] = ['menstrual', 'follicular', 'ovulation', 'luteal'];

export function InsightsScreen() {
  const { t } = useTranslation();
  const p = useTheme();
  const profile = useUserStore((s) => s.profile);
  const logs = useLogStore((s) => s.logs);
  const isPremium = usePremiumStore((s) => s.isPremium);
  const lutealLength = useSettingsStore((s) => s.lutealLength);
  const insights = useMemo(() => profile ? computeInsights({ profile, logs, lutealLength }) : null, [profile, logs, lutealLength]);
  if (!profile || !insights) return null;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: p.textMuted }]}>{t('insights.title')}</Text>
        <Text style={[styles.title, { color: p.text }]}>{insights.logCount < 3 ? t('insights.empty.title') : t('insights.subtitle')}</Text>
      </View>

      {insights.logCount < 3 ? (
        <View style={styles.learning}>
          <View style={styles.constellation}>{Array.from({ length: 7 }, (_, i) => <View key={i} style={[styles.star, { backgroundColor: p.accent, opacity: 0.2 + i * 0.1, left: `${10 + i * 12}%`, top: 45 + (i % 3) * 34 }]} />)}</View>
          <Text style={[styles.storyTitle, { color: p.text }]}>{t('insights.empty.body')}</Text>
          <Pressable onPress={() => router.push('/(tabs)/log')} style={[styles.action, { backgroundColor: p.primaryBtn }]}><Text style={[styles.actionText, { color: p.onPrimaryBtn }]}>{t('home.logNow')}</Text></Pressable>
        </View>
      ) : <>
        <SignalStory eyebrow={t('insights.summaryCard.title')} conclusion={insights.confidenceScore >= 0.8 ? t('insights.cycleCard.regular') : t('insights.cycleCard.variable')} reason={t('insights.summaryCard.text')} confidence={Math.round(insights.confidenceScore * 100)}>
          <View style={styles.ribbon}>{PHASES.map((phase) => <View key={phase} style={[styles.ribbonPart, { backgroundColor: p.phase[phase], flex: Math.max(1, insights.avgEnergyByPhase[phase] ?? 4) }]} />)}</View>
        </SignalStory>

        <SignalStory eyebrow={t('insights.energyCard.title')} conclusion={t('insights.energyCard.caption')} reason={t('insights.cycleCard.avgLength') + ` · ${t('common.days', { count: insights.avgCycleLength })}`} confidence={Math.round(insights.confidenceScore * 100)}>
          <View style={styles.curve}>{PHASES.map((phase) => { const value = insights.avgEnergyByPhase[phase] ?? 0; return <View key={phase} style={styles.curveColumn}><View style={[styles.curveSignal, { height: 24 + value * 7, backgroundColor: p.phase[phase] }]} /><Text style={[styles.curveLabel, { color: p.textMuted }]}>{t(`phases.${phase}`).slice(0, 3)}</Text></View>; })}</View>
        </SignalStory>

        {isPremium ? <SignalStory eyebrow={t('insights.pmsCard.title')} conclusion={`${format(parseISO(insights.nextPmsStart), 'MMM d')} – ${format(parseISO(insights.nextPmsEnd), 'MMM d')}`} reason={t('insights.pmsCard.text', { start: format(parseISO(insights.nextPmsStart), 'MMM d'), end: format(parseISO(insights.nextPmsEnd), 'MMM d') })} confidence={Math.round(insights.confidenceScore * 100)}><View style={[styles.comparison, { backgroundColor: p.surface }]}><Ionicons name="git-compare-outline" size={28} color={p.accentInk} /></View></SignalStory> : <Pressable onPress={() => router.push('/paywall')} style={[styles.preview, { borderColor: p.accent }]}><View><Text style={[styles.eyebrow, { color: p.accentInk }]}>{t('insights.locked.title')}</Text><Text style={[styles.previewText, { color: p.text }]}>{t('insights.locked.body')}</Text></View><Ionicons name="arrow-forward" size={20} color={p.accentInk} /></Pressable>}
      </>}
    </Screen>
  );
}

function SignalStory({ eyebrow, conclusion, reason, confidence, children }: { eyebrow: string; conclusion: string; reason: string; confidence: number; children: React.ReactNode }) { const p = useTheme(); const { t } = useTranslation(); return <View style={[styles.story, { borderTopColor: p.track }]}><Text style={[styles.eyebrow, { color: p.textMuted }]}>{eyebrow}</Text><Text style={[styles.storyTitle, { color: p.text }]}>{conclusion}</Text>{children}<Text style={[styles.reason, { color: p.textMuted }]}>{reason}</Text><View style={styles.source}><Ionicons name="analytics-outline" size={14} color={p.accentInk} /><Text style={[styles.sourceText, { color: p.textMuted }]}>{t('living.confidence', { value: confidence, state: t(confidence > 70 ? 'living.pattern' : 'living.learning') })}</Text></View></View>; }

const styles = StyleSheet.create({
  header: { paddingTop: spacing(1), paddingBottom: spacing(3), gap: spacing(1) }, eyebrow: { ...typography.labelM, textTransform: 'uppercase', letterSpacing: 1 }, title: { ...typography.titleXL },
  learning: { flex: 1, minHeight: 480, justifyContent: 'center', gap: spacing(2) }, constellation: { height: 180, position: 'relative' }, star: { position: 'absolute', width: 10, height: 10, borderRadius: 5 },
  action: { minHeight: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start', paddingHorizontal: spacing(3) }, actionText: { ...typography.labelL },
  story: { gap: spacing(1.5), paddingVertical: spacing(3), borderTopWidth: 1 }, storyTitle: { ...typography.titleL }, reason: { ...typography.bodyM },
  ribbon: { height: 54, flexDirection: 'row', gap: 3, alignItems: 'stretch', marginVertical: spacing(1) }, ribbonPart: { borderRadius: radius.xs }, curve: { height: 130, flexDirection: 'row', alignItems: 'flex-end', gap: spacing(1.5) }, curveColumn: { flex: 1, alignItems: 'center', gap: spacing(0.75) }, curveSignal: { width: '100%', borderTopLeftRadius: radius.organic, borderTopRightRadius: radius.organic }, curveLabel: { ...typography.micro, textTransform: 'none' },
  source: { flexDirection: 'row', alignItems: 'center', gap: spacing(0.75) }, sourceText: { ...typography.micro, textTransform: 'none' }, comparison: { height: 90, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' }, preview: { minHeight: 112, borderWidth: 1, borderRadius: radius.lg, padding: spacing(2), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing(2) }, previewText: { ...typography.bodyL, marginTop: spacing(0.75), maxWidth: 280 },
});
