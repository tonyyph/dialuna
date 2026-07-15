import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { DatePickerCalendar } from '@/features/onboarding/DatePickerCalendar';
import { OnboardingStepHeader } from '@/features/onboarding/OnboardingStepHeader';
import { useOnboardingDraft } from '@/features/onboarding/useOnboardingDraft';
import { radius, spacing, typography, useTheme } from '@/theme';

export default function CycleBasics() {
  const { t } = useTranslation(); const p = useTheme(); const draft = useOnboardingDraft();
  return <Screen bottomAction={<Button label={t('common.continue')} disabled={!draft.lastPeriodStartDate} onPress={() => router.push('/onboarding/goals')} />}>
    <OnboardingStepHeader step={1} />
    <Text style={[styles.eyebrow, { color: p.accentInk }]}>{t('living.calibrationCycle')}</Text>
    <Text style={[styles.title, { color: p.text }]}>{t('onboarding.cycleBasics.title')}</Text>
    <Text style={[styles.subtitle, { color: p.textMuted }]}>{t('onboarding.cycleBasics.subtitle')}</Text>

    <View style={styles.dialStage}>
      <View style={[styles.orbit, { borderColor: p.track }]} />
      <View style={[styles.periodArc, { borderColor: p.phase.menstrual }]} />
      <View style={styles.dialCopy}>
        <Text style={[styles.dialValue, { color: p.text }]}>{draft.averageCycleLength}</Text>
        <Text style={[styles.dialUnit, { color: p.textMuted }]}>{t('onboarding.cycleBasics.daysUnit')}</Text>
      </View>
    </View>

    <CalibrationScale label={t('onboarding.cycleBasics.cycleLength')} value={draft.averageCycleLength} min={21} max={40} onChange={(averageCycleLength) => draft.set({ averageCycleLength })} />
    <CalibrationScale label={t('onboarding.cycleBasics.periodLength')} value={draft.averagePeriodLength} min={2} max={10} onChange={(averagePeriodLength) => draft.set({ averagePeriodLength })} />

    <View style={[styles.timelineSection, { borderTopColor: p.track }]}>
      <Text style={[styles.sectionTitle, { color: p.text }]}>{t('onboarding.cycleBasics.lastPeriod')}</Text>
      <Text style={[styles.sectionHint, { color: p.textMuted }]}>{t('living.timelineHint')}</Text>
      <DatePickerCalendar selected={draft.lastPeriodStartDate} onSelect={(lastPeriodStartDate) => draft.set({ lastPeriodStartDate })} />
    </View>
  </Screen>;
}

function CalibrationScale({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  const p = useTheme(); const marks = Array.from({ length: max - min + 1 }, (_, index) => min + index);
  return <View style={styles.scale}><View style={styles.scaleHeader}><Text style={[styles.scaleLabel, { color: p.text }]}>{label}</Text><Text style={[styles.scaleValue, { color: p.accentInk }]}>{value}</Text></View><View style={styles.marks}>{marks.map((mark) => <Pressable key={mark} accessibilityRole="adjustable" accessibilityLabel={`${label} ${mark}`} onPress={() => { void Haptics.selectionAsync(); onChange(mark); }} style={styles.markTarget}><View style={[styles.mark, { height: mark === value ? 32 : mark % 2 === 0 ? 18 : 12, backgroundColor: mark <= value ? p.accent : p.track }]} /></Pressable>)}</View></View>;
}

const styles = StyleSheet.create({
  eyebrow: { ...typography.micro, marginTop: spacing(1) }, title: { ...typography.titleXL, marginTop: spacing(1) }, subtitle: { ...typography.bodyM, marginTop: spacing(1), marginBottom: spacing(2) },
  dialStage: { height: 230, alignItems: 'center', justifyContent: 'center' }, orbit: { position: 'absolute', width: 230, height: 150, borderRadius: 120, borderWidth: 1, transform: [{ rotate: '-16deg' }] }, periodArc: { position: 'absolute', width: 155, height: 155, borderRadius: 78, borderWidth: 4, borderRightColor: 'transparent', borderBottomColor: 'transparent', transform: [{ rotate: '-35deg' }] }, dialCopy: { alignItems: 'center' }, dialValue: { ...typography.displayXL }, dialUnit: { ...typography.labelM },
  scale: { marginBottom: spacing(3), gap: spacing(1) }, scaleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }, scaleLabel: { ...typography.labelL }, scaleValue: { ...typography.titleM }, marks: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48 }, markTarget: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center' }, mark: { width: 3, borderRadius: radius.capsule },
  timelineSection: { borderTopWidth: 1, paddingTop: spacing(3) }, sectionTitle: { ...typography.titleM }, sectionHint: { ...typography.bodyM, marginTop: spacing(0.75), marginBottom: spacing(2) },
});
