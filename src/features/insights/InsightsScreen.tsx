import { format, parseISO } from 'date-fns';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { DisclaimerBox } from '@/components/ui/DisclaimerBox';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { computeInsights } from '@/services/insightsEngine';
import { useLogStore, usePremiumStore, useSettingsStore, useUserStore } from '@/store';
import { radius, spacing, typography, useTheme } from '@/theme';
import { CyclePhase } from '@/types';

const MIN_LOGS = 3;
const PHASES: CyclePhase[] = ['menstrual', 'follicular', 'ovulation', 'luteal'];

export function InsightsScreen() {
  const { t } = useTranslation();
  const p = useTheme();
  const profile = useUserStore((s) => s.profile);
  const logs = useLogStore((s) => s.logs);
  const isPremium = usePremiumStore((s) => s.isPremium);
  const lutealLength = useSettingsStore((s) => s.lutealLength);

  const insights = useMemo(
    () => (profile ? computeInsights({ profile, logs, lutealLength }) : null),
    [profile, logs, lutealLength]
  );

  if (!profile || !insights) return null;

  if (insights.logCount < MIN_LOGS) {
    return (
      <Screen>
        <View style={[styles.hero, { backgroundColor: p.primaryBtn }]}>
          <Text style={[styles.kicker, { color: p.accent400 }]}>{t('insights.title')}</Text>
          <Text style={[styles.title, { color: p.onPrimaryBtn }]}>{t('insights.title')}</Text>
          <Text style={styles.subtitle}>{t('insights.empty.body')}</Text>
        </View>
        <EmptyState
          lunaExpression="thinking"
          title={t('insights.empty.title')}
          body={t('insights.empty.body')}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={[styles.hero, { backgroundColor: p.primaryBtn }]}>
        <Text style={[styles.kicker, { color: p.accent400 }]}>{t('insights.title')}</Text>
        <Text style={[styles.title, { color: p.onPrimaryBtn }]}>{t('insights.title')}</Text>
        <Text style={styles.subtitle}>{t('insights.subtitle')}</Text>
      </View>

      <Card variant="glass" style={styles.storyCard}>
        <Text style={styles.storyTitle}>{t('insights.summaryCard.title')}</Text>
        <Text style={styles.body}>{t('insights.summaryCard.text')}</Text>
        <View style={styles.statGrid}>
          <InsightStat
            label={t('insights.cycleCard.avgLength')}
            value={t('common.days', { count: insights.avgCycleLength })}
          />
          <InsightStat
            label={t('insights.cycleCard.regularity')}
            value={
              insights.confidenceScore >= 0.8
                ? t('insights.cycleCard.regular')
                : t('insights.cycleCard.variable')
            }
          />
        </View>
      </Card>

      {isPremium ? (
        <>
          <SectionTitle title={t('insights.energyCard.title')} />
          <Card style={styles.rows}>
            {PHASES.map((phase) => {
              const value = insights.avgEnergyByPhase[phase];
              return (
                <View key={phase} style={styles.barRow}>
                  <Text style={styles.barLabel}>{t(`phases.${phase}`)}</Text>
                  <View style={[styles.barTrack, { backgroundColor: p.accent100 }]}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${((value ?? 0) / 10) * 100}%`,
                          backgroundColor: p.phase[phase],
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barValue}>{value ?? '–'}</Text>
                </View>
              );
            })}
            <Text style={styles.caption}>{t('insights.energyCard.caption')}</Text>
          </Card>

          {insights.pmsSleepAvg !== null && insights.otherSleepAvg !== null && (
            <>
              <SectionTitle title={t('insights.sleepCard.title')} />
              <Card>
                <Text style={styles.body}>
                  {t('insights.sleepCard.text', {
                    pmsSleep: insights.pmsSleepAvg,
                    otherSleep: insights.otherSleepAvg,
                  })}
                </Text>
              </Card>
            </>
          )}

          <SectionTitle title={t('insights.pmsCard.title')} />
          <Card>
            <Text style={styles.body}>
              {t('insights.pmsCard.text', {
                start: format(parseISO(insights.nextPmsStart), 'MMM d'),
                end: format(parseISO(insights.nextPmsEnd), 'MMM d'),
              })}
            </Text>
          </Card>

          <SectionTitle title={t('insights.symptomsCard.title')} />
          <Card variant="glass" style={styles.symptomWrap}>
            {insights.topSymptoms.length === 0 ? (
              <Text style={styles.muted}>—</Text>
            ) : (
              insights.topSymptoms.map(({ symptom, count }) => (
                <Chip
                  key={symptom}
                  label={`${t(`symptoms.${symptom}`)} · ${t('insights.symptomsCard.timesLogged', { count })}`}
                  selected={false}
                  onPress={() => {}}
                />
              ))
            )}
          </Card>

          <DisclaimerBox text={t('disclaimer.short')} />
        </>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('insights.locked.cta')}
          onPress={() => router.push('/paywall')}
        >
          <Card
            variant="glass"
            style={[
              styles.locked,
              { backgroundColor: p.name === 'dark' ? p.overlay : 'rgba(251,243,236,0.9)' },
            ]}
          >
            <Text style={styles.lockIcon}>🔒</Text>
            <Text style={styles.lockTitle}>{t('insights.locked.title')}</Text>
            <Text style={styles.body}>{t('insights.locked.body')}</Text>
            <Text style={[styles.lockCta, { color: p.accent }]}>{t('insights.locked.cta')} →</Text>
          </Card>
        </Pressable>
      )}
    </Screen>
  );
}

function InsightStat({ label, value }: { label: string; value: string }) {
  const p = useTheme();
  return (
    <View style={[styles.insightStat, { backgroundColor: p.accent100 }]}>
      <Text style={[styles.insightStatValue, { color: p.accent }]}>{value}</Text>
      <Text style={styles.insightStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginTop: spacing(1.5),
    marginBottom: spacing(2),
    padding: spacing(2.5),
    borderRadius: radius.sheet,
  },
  kicker: {
    ...typography.caption,
  },
  title: {
    ...typography.headline,
    marginTop: spacing(0.5),
  },
  subtitle: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.78)',
    marginTop: spacing(0.5),
  },
  storyCard: {
    gap: spacing(2),
  },
  storyTitle: {
    ...typography.title,
  },
  statGrid: {
    flexDirection: 'row',
    gap: spacing(1.5),
  },
  insightStat: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing(1.5),
  },
  insightStatValue: {
    ...typography.subtitle,
  },
  insightStatLabel: {
    ...typography.caption,
    marginTop: spacing(0.5),
  },
  rows: {
    gap: spacing(1.5),
  },
  symptomWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(1),
  },
  muted: {
    ...typography.bodySmall,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
  },
  barLabel: {
    ...typography.caption,
    width: 110,
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  barValue: {
    ...typography.caption,
    width: 28,
    textAlign: 'right',
  },
  caption: {
    ...typography.caption,
  },
  body: {
    ...typography.body,
  },
  locked: {
    marginTop: spacing(3),
    alignItems: 'center',
    gap: spacing(1),
  },
  lockIcon: {
    fontSize: 28,
  },
  lockTitle: {
    ...typography.subtitle,
    textAlign: 'center',
  },
  lockCta: {
    ...typography.subtitle,
  },
});
