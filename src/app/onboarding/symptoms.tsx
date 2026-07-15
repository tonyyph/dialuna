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
import { ONBOARDING_SYMPTOMS, Symptom } from '@/types';

const ZONES: { key: string; icon: keyof typeof Ionicons.glyphMap; symptoms: Symptom[] }[] = [
  { key: 'head', icon: 'cloud-outline', symptoms: ['headache', 'insomnia', 'moodSwings'] },
  { key: 'core', icon: 'body-outline', symptoms: ['cramps', 'bloating', 'nausea'] },
  { key: 'surface', icon: 'sparkles-outline', symptoms: ['acne', 'breastTenderness'] },
  { key: 'movement', icon: 'walk-outline', symptoms: ['backPain', 'fatigue'] },
];

export default function Symptoms() {
  const { t } = useTranslation(); const p = useTheme(); const draft = useOnboardingDraft();
  return <Screen bottomAction={<Button label={t('common.continue')} onPress={() => router.push('/onboarding/account')} />}>
    <OnboardingStepHeader step={3} />
    <Text style={[styles.eyebrow, { color: p.accentInk }]}>{t('living.calibrationBody')}</Text>
    <Text style={[styles.title, { color: p.text }]}>{t('onboarding.symptoms.title')}</Text>
    <Text style={[styles.subtitle, { color: p.textMuted }]}>{t('onboarding.symptoms.subtitle')}</Text>
    <View style={[styles.bodyMap, { borderColor: p.track }]}>
      <View style={[styles.bodyCore, { backgroundColor: p.accent100 }]}><Ionicons name="body-outline" size={56} color={p.accentInk} /></View>
      <Text style={[styles.mapLabel, { color: p.textMuted }]}>{t('living.bodyMapHint')}</Text>
    </View>
    <View style={styles.zones}>{ZONES.map((zone) => <View key={zone.key} style={[styles.zone, { borderTopColor: p.track }]}>
      <View style={styles.zoneHeader}><Ionicons name={zone.icon} size={20} color={p.accentInk} /><Text style={[styles.zoneTitle, { color: p.text }]}>{t(`living.bodyZones.${zone.key}`)}</Text></View>
      <View style={styles.signals}>{zone.symptoms.filter((s) => ONBOARDING_SYMPTOMS.includes(s)).map((symptom) => { const selected = draft.symptoms.includes(symptom); return <Pressable key={symptom} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} onPress={() => { void Haptics.selectionAsync(); draft.toggleSymptom(symptom); }} style={[styles.signal, { backgroundColor: selected ? p.accent100 : p.surface }]}><View style={[styles.signalDot, { backgroundColor: selected ? p.accent : p.track }]} /><Text style={[styles.signalText, { color: p.text }]}>{t(`symptoms.${symptom}`)}</Text></Pressable>; })}</View>
    </View>)}</View>
  </Screen>;
}

const styles = StyleSheet.create({
  eyebrow: { ...typography.micro, marginTop: spacing(1) }, title: { ...typography.titleXL, marginTop: spacing(1) }, subtitle: { ...typography.bodyM, marginTop: spacing(1), marginBottom: spacing(2) },
  bodyMap: { minHeight: 190, borderWidth: 1, borderRadius: radius.organic, alignItems: 'center', justifyContent: 'center', gap: spacing(1.5) }, bodyCore: { width: 92, height: 92, borderRadius: 46, alignItems: 'center', justifyContent: 'center' }, mapLabel: { ...typography.labelM },
  zones: { marginTop: spacing(2) }, zone: { paddingVertical: spacing(2), borderTopWidth: 1, gap: spacing(1.25) }, zoneHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing(1) }, zoneTitle: { ...typography.titleM }, signals: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1) }, signal: { minHeight: 46, borderRadius: radius.md, paddingHorizontal: spacing(1.5), flexDirection: 'row', alignItems: 'center', gap: spacing(1) }, signalDot: { width: 8, height: 8, borderRadius: 4 }, signalText: { ...typography.labelM },
});
