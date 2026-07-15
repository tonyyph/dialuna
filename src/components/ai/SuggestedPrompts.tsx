import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useCycleToday } from '@/features/cycle/useCycleToday';
import { useLogStore } from '@/store';
import { radius, spacing, typography, useTheme } from '@/theme';
import { todayISO } from '@/utils/date';

interface Props { onSelect: (prompt: string) => void; }

export function SuggestedPrompts({ onSelect }: Props) {
  const { t } = useTranslation(); const p = useTheme(); const ctx = useCycleToday(); const todayLog = useLogStore((s) => s.logs[todayISO()]);
  if (!ctx) return null;
  const phase = t(ctx.prediction.isPmsWindow ? 'phases.pms' : `phases.${ctx.prediction.phase}`);
  const prompts = [
    t('ai.dynamic.phase', { phase }),
    todayLog?.symptoms[0] ? t('ai.dynamic.symptom', { symptom: t(`symptoms.${todayLog.symptoms[0]}`) }) : t('ai.prompts.p1'),
    todayLog ? t('ai.dynamic.energy', { value: todayLog.energyLevel }) : t('ai.prompts.p4'),
    ctx.profile.goals[0] ? t('ai.dynamic.goal', { goal: t(`goals.${ctx.profile.goals[0]}`) }) : t('ai.prompts.p2'),
  ];
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content} accessibilityLabel={t('ai.dynamic.label')}>
    {prompts.map((prompt) => <Pressable key={prompt} accessibilityRole="button" onPress={() => onSelect(prompt)} style={[styles.prompt, { backgroundColor: p.surface, borderColor: p.track }]}><Ionicons name="sparkles-outline" size={14} color={p.accentInk} /><Text style={[styles.text, { color: p.text }]}>{prompt}</Text></Pressable>)}
  </ScrollView>;
}

const styles = StyleSheet.create({
  content: { gap: spacing(1), paddingHorizontal: spacing(2.5), paddingVertical: spacing(1) },
  prompt: { width: 220, minHeight: 54, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing(1.5), paddingVertical: spacing(1), flexDirection: 'row', alignItems: 'center', gap: spacing(1) }, text: { ...typography.labelM, flex: 1 },
});
