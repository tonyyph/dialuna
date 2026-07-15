import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { router } from 'expo-router';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { getHormoneTwinProfile } from '@/services/hormoneTwinEngine';
import { useLogStore, useUserStore } from '@/store';
import { duration, radius, spacing, typography, useTheme } from '@/theme';
import { todayISO } from '@/utils/date';

interface Props { date: string | null; onClose: () => void; }

export function DayDetailSheet({ date, onClose }: Props) {
  const { t } = useTranslation(); const p = useTheme(); const insets = useSafeAreaInsets(); const reduceMotion = useReducedMotion();
  const profile = useUserStore((s) => s.profile); const logs = useLogStore((s) => s.logs);
  if (!date || !profile) return null;
  const twin = getHormoneTwinProfile({ date, profile, logs }); const isToday = date === todayISO();
  const metrics = [
    { icon: 'flash-outline', label: t('home.forecast.energy'), value: twin.energyScore },
    { icon: 'heart-outline', label: t('home.forecast.mood'), value: twin.moodScore },
    { icon: 'bulb-outline', label: t('home.forecast.focus'), value: twin.focusScore },
    { icon: 'body-outline', label: t('home.forecast.pain'), value: 100 - twin.painRisk },
  ] as const;
  const Entering = reduceMotion ? FadeIn.duration(duration.quick) : FadeInDown.duration(duration.standard);

  return <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
    <Pressable style={[styles.backdrop, { backgroundColor: p.overlay }]} onPress={onClose} accessibilityLabel={t('common.close')} />
    <Animated.View entering={Entering} style={[styles.layer, { backgroundColor: p.surfaceStrong, paddingBottom: Math.max(insets.bottom + spacing(2), spacing(3)) }]}>
      <View style={styles.header}>
        <View><Text style={[styles.eyebrow, { color: p.accentInk }]}>{t(twin.isPmsWindow ? 'phases.pms' : `phases.${twin.phase}`)}</Text><Text style={[styles.date, { color: p.text }]}>{format(parseISO(date), 'EEEE, MMM d')}</Text><Text style={[styles.cycleDay, { color: p.textMuted }]}>{t('common.cycleDay', { day: twin.cycleDay })}</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel={t('common.close')} onPress={onClose} style={[styles.close, { backgroundColor: p.fillSubtle }]}><Ionicons name="close" size={20} color={p.text} /></Pressable>
      </View>
      <View style={styles.landscape}>
        <View style={[styles.phaseArc, { borderColor: p.phase[twin.phase] }]} />
        {metrics.map((metric, index) => <View key={metric.label} style={[styles.metric, index % 2 ? styles.metricRight : styles.metricLeft, { top: 12 + index * 38 }]}><View style={[styles.metricDot, { backgroundColor: p.phase[twin.phase], opacity: 0.4 + index * 0.15 }]} /><Ionicons name={metric.icon} size={16} color={p.accentInk} /><Text style={[styles.metricValue, { color: p.text }]}>{metric.value}</Text><Text style={[styles.metricLabel, { color: p.textMuted }]}>{metric.label}</Text></View>)}
      </View>
      <Text style={[styles.coach, { color: p.text }]}>{t(twin.coachMessageKey)}</Text>
      <Text style={[styles.disclaimer, { color: p.textMuted }]}>{t('disclaimer.predictions')}</Text>
      {isToday ? <Pressable accessibilityRole="button" accessibilityLabel={t('calendar.detail.logDay')} onPress={() => { onClose(); router.push('/(tabs)/log'); }} style={[styles.cta, { backgroundColor: p.primaryBtn }]}><Text style={[styles.ctaText, { color: p.onPrimaryBtn }]}>{t('calendar.detail.logDay')}</Text><Ionicons name="arrow-forward" size={18} color={p.onPrimaryBtn} /></Pressable> : null}
    </Animated.View>
  </Modal>;
}

const styles = StyleSheet.create({
  backdrop: { flex: 1 }, layer: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing(2.5), gap: spacing(2) },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing(2) }, eyebrow: { ...typography.micro }, date: { ...typography.titleL, marginTop: spacing(0.5) }, cycleDay: { ...typography.bodyM, marginTop: spacing(0.5) }, close: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  landscape: { height: 180, position: 'relative', overflow: 'hidden' }, phaseArc: { position: 'absolute', width: 260, height: 160, borderRadius: 140, borderWidth: 2, borderRightColor: 'transparent', left: '16%', top: 8, transform: [{ rotate: '-20deg' }] },
  metric: { position: 'absolute', minWidth: 122, minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: spacing(0.75) }, metricLeft: { left: 0 }, metricRight: { right: 0 }, metricDot: { width: 12, height: 12, borderRadius: 6 }, metricValue: { ...typography.titleM }, metricLabel: { ...typography.labelM },
  coach: { ...typography.bodyL }, disclaimer: { ...typography.labelM }, cta: { minHeight: 52, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing(1) }, ctaText: { ...typography.labelL },
});
