import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { OnboardingStepHeader } from '@/features/onboarding/OnboardingStepHeader';
import { useOnboardingDraft } from '@/features/onboarding/useOnboardingDraft';
import { radius, spacing, typography, useTheme } from '@/theme';
import { Goal, ONBOARDING_GOALS } from '@/types';

const ICONS: Record<Goal, keyof typeof Ionicons.glyphMap> = {
  understandCycle: 'pulse-outline', reducePms: 'shield-checkmark-outline', improveMood: 'happy-outline',
  planWorkouts: 'fitness-outline', skinInsights: 'sparkles-outline', pregnancyPlanning: 'heart-circle-outline',
  betterSleep: 'bed-outline', avoidPregnancy: 'calendar-outline', trackFertility: 'flower-outline', generalWellness: 'leaf-outline',
};

export default function Goals() {
  const { t } = useTranslation();
  const p = useTheme();
  const draft = useOnboardingDraft();
  return <Screen bottomAction={<Button label={t('common.continue')} disabled={draft.goals.length === 0} onPress={() => router.push('/onboarding/symptoms')} />}>
    <OnboardingStepHeader step={2} />
    <Text style={[styles.eyebrow, { color: p.accentInk }]}>{t('living.calibrationInterests')}</Text>
    <Text style={[styles.title, { color: p.text }]}>{t('onboarding.goals.title')}</Text>
    <Text style={[styles.subtitle, { color: p.textMuted }]}>{t('onboarding.goals.subtitle')}</Text>
    <View style={styles.constellation}>
      <View style={[styles.axisHorizontal, { backgroundColor: p.track }]} />
      <View style={[styles.axisVertical, { backgroundColor: p.track }]} />
      {ONBOARDING_GOALS.map((goal, index) => {
        const selected = draft.goals.includes(goal);
        return <Pressable key={goal} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} accessibilityLabel={t(`goals.${goal}`)} onPress={() => { void Haptics.selectionAsync(); draft.toggleGoal(goal); }} style={[styles.node, index % 2 === 0 ? styles.nodeWide : styles.nodeNarrow, { backgroundColor: selected ? p.accent100 : p.surface, borderColor: selected ? p.accent : p.track }]}>
          <View style={[styles.nodeIcon, { backgroundColor: selected ? p.accent : p.fillSubtle }]}><Ionicons name={ICONS[goal]} size={18} color={selected ? p.onPrimaryBtn : p.textMuted} /></View>
          <Text style={[styles.nodeLabel, { color: p.text }]}>{t(`goals.${goal}`)}</Text>
        </Pressable>;
      })}
    </View>
    <Text style={[styles.count, { color: p.textMuted }]}>{t('living.selectedCount', { count: draft.goals.length })}</Text>
  </Screen>;
}

const styles = StyleSheet.create({
  eyebrow: { ...typography.micro, marginTop: spacing(1) }, title: { ...typography.titleXL, marginTop: spacing(1) }, subtitle: { ...typography.bodyM, marginTop: spacing(1), marginBottom: spacing(2) },
  constellation: { minHeight: 390, flexDirection: 'row', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center', gap: spacing(1.5), position: 'relative' },
  axisHorizontal: { position: 'absolute', height: 1, left: 30, right: 30, top: '50%' }, axisVertical: { position: 'absolute', width: 1, top: 40, bottom: 40, left: '50%' },
  node: { zIndex: 1, minHeight: 82, borderWidth: 1, borderRadius: radius.organic, padding: spacing(1.5), alignItems: 'center', justifyContent: 'center', gap: spacing(0.75) }, nodeWide: { width: '45%' }, nodeNarrow: { width: '39%', transform: [{ translateY: 12 }] },
  nodeIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }, nodeLabel: { ...typography.labelM, textAlign: 'center' }, count: { ...typography.labelM, textAlign: 'center' },
});
