import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/ui/Screen';
import { useCycleToday } from '@/features/cycle/useCycleToday';
import { generateLogReflection } from '@/services/aiCoachEngine';
import { useLogStore } from '@/store';
import { duration, radius, spacing, typography, useTheme } from '@/theme';
import { ALL_FLOW_LEVELS, ALL_MOODS, ALL_SYMPTOMS, ALL_WORKOUTS, DailyLog, FlowLevel, Mood, Symptom, WorkoutType } from '@/types';
import { todayISO } from '@/utils/date';

const STEPS = ['mood', 'recovery', 'body', 'symptoms', 'note', 'review'] as const;

export function LogScreen() {
  const { t } = useTranslation();
  const p = useTheme();
  const today = todayISO();
  const existing = useLogStore((s) => s.logs[today]);
  const saveLog = useLogStore((s) => s.saveLog);
  const ctx = useCycleToday();
  const [step, setStep] = useState(0);
  const [flow, setFlow] = useState<FlowLevel>(existing?.flow ?? 'none');
  const [symptoms, setSymptoms] = useState<Symptom[]>(existing?.symptoms ?? []);
  const [moods, setMoods] = useState<Mood[]>(existing?.moods ?? []);
  const [energy, setEnergy] = useState(existing?.energyLevel ?? 5);
  const [sleep, setSleep] = useState(existing?.sleepQuality ?? 5);
  const [stress, setStress] = useState(existing?.stressLevel ?? 5);
  const [workout, setWorkout] = useState<WorkoutType>(existing?.workoutType ?? 'none');
  const [note, setNote] = useState(existing?.note ?? '');
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const toggle = <T,>(items: T[], item: T) => items.includes(item) ? items.filter((x) => x !== item) : [...items, item];

  const save = () => {
    const now = new Date().toISOString();
    const log: DailyLog = { date: today, flow, symptoms, moods, energyLevel: energy, sleepQuality: sleep, stressLevel: stress, workoutType: workout, note: note.trim(), createdAt: existing?.createdAt ?? now, updatedAt: now };
    saveLog(log);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (ctx) setSavedMessage(generateLogReflection({ log, prediction: ctx.prediction, nickname: ctx.profile.nickname, t }));
  };

  return (
    <Screen keyboardAvoiding>
      <View style={styles.top}>
        <View>
          <Text style={[styles.eyebrow, { color: p.textMuted }]}>{t('common.today')} · {step + 1}/{STEPS.length}</Text>
          <Text style={[styles.title, { color: p.text }]}>{t('log.title')}</Text>
        </View>
        <View style={[styles.progress, { backgroundColor: p.track }]}><View style={[styles.progressFill, { backgroundColor: p.accent, width: `${((step + 1) / STEPS.length) * 100}%` }]} /></View>
      </View>

      <View style={styles.stage}>
        {savedMessage ? <SavedState message={savedMessage} onEdit={() => setSavedMessage(null)} /> : (
          <>
            {step === 0 && <ChoiceStage title={t('log.mood')} subtitle={t('log.subtitle')} items={ALL_MOODS} selected={moods} label={(v) => t(`moods.${v}`)} onPress={(v) => setMoods((x) => toggle(x, v))} />}
            {step === 1 && <View><StageTitle title={t('log.energy')} subtitle={t('log.sleep')} /><Continuum label={t('log.energy')} value={energy} onChange={setEnergy} /><Continuum label={t('log.sleep')} value={sleep} onChange={setSleep} /><Continuum label={t('log.stress')} value={stress} onChange={setStress} /></View>}
            {step === 2 && <><ChoiceStage title={t('log.flow')} subtitle={t('log.workout')} items={ALL_FLOW_LEVELS} selected={[flow]} label={(v) => t(`flow.${v}`)} onPress={setFlow} /><View style={styles.secondaryChoices}>{ALL_WORKOUTS.map((v) => <SignalChoice key={v} label={t(`workouts.${v}`)} selected={workout === v} onPress={() => setWorkout(v)} />)}</View></>}
            {step === 3 && <ChoiceStage title={t('log.symptoms')} subtitle={t('log.subtitle')} items={ALL_SYMPTOMS} selected={symptoms} label={(v) => t(`symptoms.${v}`)} onPress={(v) => setSymptoms((x) => toggle(x, v))} />}
            {step === 4 && <View><StageTitle title={t('log.note')} subtitle={t('log.notePlaceholder')} /><TextInput multiline value={note} onChangeText={setNote} placeholder={t('log.notePlaceholder')} placeholderTextColor={p.textFaint} accessibilityLabel={t('log.note')} style={[styles.note, { color: p.text, borderColor: p.track }]} /></View>}
            {step === 5 && <ReviewRow mood={moods.length} symptoms={symptoms.length} energy={energy} sleep={sleep} flow={t(`flow.${flow}`)} />}
          </>
        )}
      </View>

      {!savedMessage && <View style={styles.footer}>
        <Pressable disabled={step === 0} onPress={() => setStep((v) => Math.max(0, v - 1))} accessibilityRole="button" accessibilityLabel={t('common.back')} style={styles.back}><Ionicons name="arrow-back" size={22} color={step === 0 ? p.textFaint : p.text} /></Pressable>
        <Pressable onPress={() => step === STEPS.length - 1 ? save() : setStep((v) => v + 1)} accessibilityRole="button" accessibilityLabel={step === STEPS.length - 1 ? t('log.save') : t('common.continue')} style={[styles.next, { backgroundColor: p.primaryBtn }]}><Text style={[styles.nextText, { color: p.onPrimaryBtn }]}>{step === STEPS.length - 1 ? t('log.save') : t('common.continue')}</Text><Ionicons name="arrow-forward" size={18} color={p.onPrimaryBtn} /></Pressable>
      </View>}
    </Screen>
  );
}

function StageTitle({ title, subtitle }: { title: string; subtitle: string }) { const p = useTheme(); return <View style={styles.stageHead}><Text style={[styles.stageTitle, { color: p.text }]}>{title}</Text><Text style={[styles.stageSubtitle, { color: p.textMuted }]}>{subtitle}</Text></View>; }
function SignalChoice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) { const p = useTheme(); return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={() => { void Haptics.selectionAsync(); onPress(); }} style={[styles.choice, { backgroundColor: selected ? p.accent100 : p.surface, borderColor: selected ? p.accent : p.track }]}><View style={[styles.choiceSignal, { backgroundColor: selected ? p.accent : p.track }]} /><Text style={[styles.choiceLabel, { color: p.text }]}>{label}</Text></Pressable>; }
function ChoiceStage<T extends string>({ title, subtitle, items, selected, label, onPress }: { title: string; subtitle: string; items: readonly T[]; selected: T[]; label: (v: T) => string; onPress: (v: T) => void }) { return <View><StageTitle title={title} subtitle={subtitle} /><View style={styles.choices}>{items.map((v) => <SignalChoice key={v} label={label(v)} selected={selected.includes(v)} onPress={() => onPress(v)} />)}</View></View>; }
function Continuum({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) { const p = useTheme(); return <View style={styles.continuum}><View style={styles.continuumHead}><Text style={[styles.choiceLabel, { color: p.text }]}>{label}</Text><Text style={[styles.value, { color: p.accentInk }]}>{value}</Text></View><View style={styles.dots}>{Array.from({ length: 10 }, (_, i) => i + 1).map((v) => <Pressable key={v} accessibilityRole="button" accessibilityLabel={`${label} ${v}`} onPress={() => onChange(v)} style={[styles.dot, { backgroundColor: v <= value ? p.accent : p.track, transform: [{ scale: v === value ? 1.35 : 1 }] }]} />)}</View></View>; }
function ReviewRow({ mood, symptoms, energy, sleep, flow }: { mood: number; symptoms: number; energy: number; sleep: number; flow: string }) { const p = useTheme(); const { t } = useTranslation(); const rows = [[flow, 'water-outline'], [t('living.moods', { count: mood }), 'happy-outline'], [t('living.signals', { count: symptoms }), 'body-outline'], [t('living.energySleep', { energy, sleep }), 'pulse-outline']] as const; return <View><StageTitle title={t('living.captured')} subtitle={t('living.reviewHint')} />{rows.map(([label, icon]) => <View key={label} style={[styles.reviewRow, { borderBottomColor: p.track }]}><Ionicons name={icon} size={20} color={p.accentInk} /><Text style={[styles.reviewText, { color: p.text }]}>{label}</Text></View>)}</View>; }
function SavedState({ message, onEdit }: { message: string; onEdit: () => void }) { const p = useTheme(); const { t } = useTranslation(); const reduceMotion = useReducedMotion(); return <Animated.View entering={FadeIn.duration(reduceMotion ? duration.instant : duration.expressive)} style={styles.saved}><View style={[styles.savedMark, { backgroundColor: p.accent100 }]}><Ionicons name="checkmark" size={30} color={p.accentInk} /></View><Text style={[styles.stageTitle, { color: p.text }]}>{t('living.fieldChanged')}</Text><Text style={[styles.stageSubtitle, { color: p.textMuted }]}>{message}</Text><Pressable onPress={onEdit}><Text style={[styles.nextText, { color: p.accentInk }]}>{t('living.editCheckIn')}</Text></Pressable></Animated.View>; }

const styles = StyleSheet.create({
  top: { paddingTop: spacing(1), gap: spacing(2) }, eyebrow: { ...typography.labelM, textTransform: 'uppercase', letterSpacing: 1 }, title: { ...typography.titleXL },
  progress: { height: 3, borderRadius: 2, overflow: 'hidden' }, progressFill: { height: '100%' }, stage: { flex: 1, paddingTop: spacing(4) }, stageHead: { marginBottom: spacing(3), gap: spacing(1) }, stageTitle: { ...typography.titleL }, stageSubtitle: { ...typography.bodyM, maxWidth: 330 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1) }, secondaryChoices: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1), marginTop: spacing(2) }, choice: { minHeight: 48, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing(1.5), flexDirection: 'row', alignItems: 'center', gap: spacing(1) }, choiceSignal: { width: 8, height: 8, borderRadius: 4 }, choiceLabel: { ...typography.labelL },
  continuum: { gap: spacing(1.5), marginBottom: spacing(3) }, continuumHead: { flexDirection: 'row', justifyContent: 'space-between' }, value: { ...typography.titleM }, dots: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 32 }, dot: { width: 14, height: 14, borderRadius: 7 },
  note: { ...typography.bodyL, minHeight: 180, borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: spacing(2), textAlignVertical: 'top' },
  reviewRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: spacing(2), borderBottomWidth: 1 }, reviewText: { ...typography.bodyL }, saved: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing(2) }, savedMark: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  footer: { flexDirection: 'row', alignItems: 'center', gap: spacing(1.5), paddingBottom: spacing(1.5) }, back: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' }, next: { flex: 1, minHeight: 52, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing(1) }, nextText: { ...typography.labelL },
});
