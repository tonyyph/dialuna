import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { MembershipPlan, useMembershipPurchase } from '@/features/paywall/useMembershipPurchase';
import { paywallColors as pw, radius, spacing, typography } from '@/theme';

export function PaywallScreen() {
  const { t } = useTranslation();
  const { subscribe, restore } = useMembershipPurchase();
  const [plan, setPlan] = useState<MembershipPlan>('yearly');

  return <LinearGradient colors={pw.gradient} style={styles.root}>
    <SafeAreaView style={styles.safe}>
      <Pressable accessibilityRole="button" accessibilityLabel={t('common.close')} onPress={() => router.back()} style={styles.close}><Ionicons name="close" size={20} color={pw.text} /></Pressable>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.field}><View style={styles.orbit} /><View style={styles.core} /></View>
        <Text style={styles.eyebrow}>{t('living.membership')}</Text>
        <Text style={styles.title}>{t('paywall.slides.s1.title')}</Text>
        <Text style={styles.intro}>{t('paywall.slides.s1.body')}</Text>

        <ValueChapter index="01" title={t('paywall.slides.s1.title')} body={t('paywall.slides.s1.body')} color={pw.accent} />
        <ValueChapter index="02" title={t('paywall.slides.s2.title')} body={t('paywall.slides.s2.body')} color={pw.intelligence} />
        <ValueChapter index="03" title={t('paywall.slides.s3.title')} body={t('paywall.slides.s3.body')} color={pw.biological} />

        <Text style={styles.choose}>{t('paywall.choosePlan')}</Text>
        <View style={styles.plans}>
          <PlanOption selected={plan === 'monthly'} label={t('paywall.plans.monthly')} price={t('paywall.plans.monthlyPrice')} onPress={() => setPlan('monthly')} />
          <PlanOption selected={plan === 'yearly'} label={t('paywall.plans.annual')} price={t('paywall.plans.annualPrice')} note={t('paywall.saveBadge')} onPress={() => setPlan('yearly')} />
        </View>
        <Pressable onPress={() => subscribe(plan)} accessibilityRole="button" accessibilityLabel={`${t('paywall.cta')} ${t(`paywall.plans.${plan === 'yearly' ? 'annual' : 'monthly'}`)}`} style={styles.cta}><Text style={styles.ctaText}>{t('paywall.cta')} · {t(`paywall.plans.${plan === 'yearly' ? 'annual' : 'monthly'}`)}</Text></Pressable>
        <View style={styles.footer}><Pressable onPress={restore}><Text style={styles.footerText}>{t('paywall.restore')}</Text></Pressable><Text style={styles.footerText}>{t('paywall.terms')}</Text><Text style={styles.footerText}>{t('paywall.privacy')}</Text></View>
      </ScrollView>
    </SafeAreaView>
  </LinearGradient>;
}

function ValueChapter({ index, title, body, color }: { index: string; title: string; body: string; color: string }) { return <View style={styles.chapter}><View style={[styles.index, { borderColor: color }]}><Text style={[styles.indexText, { color }]}>{index}</Text></View><View style={styles.chapterCopy}><Text style={styles.chapterTitle}>{title}</Text><Text style={styles.chapterBody}>{body}</Text></View></View>; }
function PlanOption({ selected, label, price, note, onPress }: { selected: boolean; label: string; price: string; note?: string; onPress: () => void }) { return <Pressable accessibilityRole="radio" accessibilityState={{ selected }} onPress={() => { void Haptics.selectionAsync(); onPress(); }} style={[styles.plan, selected && styles.planSelected]}><View><Text style={styles.planLabel}>{label}</Text><Text style={styles.planPrice}>{price}</Text></View>{note ? <Text style={styles.planNote}>{note}</Text> : <View style={[styles.radio, selected && styles.radioSelected]} />}</Pressable>; }

const styles = StyleSheet.create({
  root: { flex: 1 }, safe: { flex: 1 }, close: { position: 'absolute', zIndex: 2, right: spacing(2), top: spacing(1), width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }, content: { padding: spacing(2.5), paddingTop: spacing(5), paddingBottom: spacing(4) },
  field: { height: 180, alignItems: 'center', justifyContent: 'center' }, orbit: { width: 220, height: 120, borderRadius: 110, borderWidth: 1, borderColor: pw.orbit, transform: [{ rotate: '-18deg' }] }, core: { position: 'absolute', width: 70, height: 70, borderRadius: 35, backgroundColor: pw.core },
  eyebrow: { ...typography.micro, color: pw.accent, textAlign: 'center' }, title: { ...typography.titleXL, color: pw.text, textAlign: 'center', marginTop: spacing(1) }, intro: { ...typography.bodyL, color: pw.textDim, textAlign: 'center', marginTop: spacing(1.5), marginBottom: spacing(4) },
  chapter: { flexDirection: 'row', gap: spacing(2), paddingVertical: spacing(2.5), borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: pw.border }, index: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, indexText: { ...typography.labelM }, chapterCopy: { flex: 1, gap: spacing(0.75) }, chapterTitle: { ...typography.titleM, color: pw.text }, chapterBody: { ...typography.bodyM, color: pw.textDim },
  choose: { ...typography.titleL, color: pw.text, marginTop: spacing(4), marginBottom: spacing(2) }, plans: { gap: spacing(1) }, plan: { minHeight: 76, borderWidth: 1, borderColor: pw.border, borderRadius: radius.md, padding: spacing(2), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, planSelected: { borderColor: pw.accent, backgroundColor: pw.accentTint }, planLabel: { ...typography.labelL, color: pw.text }, planPrice: { ...typography.labelM, color: pw.textDim, marginTop: spacing(0.5) }, planNote: { ...typography.micro, color: pw.accent }, radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: pw.textFaint }, radioSelected: { borderWidth: 5, borderColor: pw.accent },
  cta: { minHeight: 54, borderRadius: radius.md, backgroundColor: pw.accent, alignItems: 'center', justifyContent: 'center', marginTop: spacing(2) }, ctaText: { ...typography.labelL, color: pw.ctaText }, footer: { flexDirection: 'row', justifyContent: 'center', gap: spacing(2), marginTop: spacing(2.5) }, footerText: { ...typography.labelM, color: pw.textFaint },
});
