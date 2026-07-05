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
import { useLogStore, usePremiumStore, useUserStore } from '@/store';
import { colors, radius, spacing, typography } from '@/theme';
import { CyclePhase } from '@/types';

const MIN_LOGS = 3;
const PHASES: CyclePhase[] = ['menstrual', 'follicular', 'ovulation', 'luteal'];

export function InsightsScreen() {
  const { t } = useTranslation();
  const profile = useUserStore((s) => s.profile);
  const logs = useLogStore((s) => s.logs);
  const isPremium = usePremiumStore((s) => s.isPremium);

  const insights = useMemo(
    () => (profile ? computeInsights({ profile, logs }) : null),
    [profile, logs]
  );

  if (!profile || !insights) return null;

  if (insights.logCount < MIN_LOGS) {
    return (
      <Screen>
        <Text style={styles.title}>{t('insights.title')}</Text>
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
      <Text style={styles.title}>{t('insights.title')}</Text>
      <Text style={styles.subtitle}>{t('insights.subtitle')}</Text>

      <SectionTitle title={t('insights.cycleCard.title')} />
      <Card style={styles.rows}>
        <InfoRow
          label={t('insights.cycleCard.avgLength')}
          value={t('common.days', { count: insights.avgCycleLength })}
        />
        <InfoRow
          label={t('insights.cycleCard.regularity')}
          value={
            insights.confidenceScore >= 0.8
              ? t('insights.cycleCard.regular')
              : t('insights.cycleCard.variable')
          }
        />
      </Card>

      <SectionTitle title={t('insights.symptomsCard.title')} />
      <Card style={styles.symptomWrap}>
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

      {isPremium ? (
        <>
          <SectionTitle title={t('insights.energyCard.title')} />
          <Card style={styles.rows}>
            {PHASES.map((phase) => {
              const value = insights.avgEnergyByPhase[phase];
              return (
                <View key={phase} style={styles.barRow}>
                  <Text style={styles.barLabel}>{t(`phases.${phase}`)}</Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${((value ?? 0) / 10) * 100}%`,
                          backgroundColor: colors.phase[phase],
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

          <SectionTitle title={t('insights.summaryCard.title')} />
          <Card variant="glass" style={styles.rows}>
            <Text style={styles.body}>✨ {t('insights.summaryCard.text')}</Text>
            <DisclaimerBox text={t('disclaimer.short')} />
          </Card>
        </>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('insights.locked.cta')}
          onPress={() => router.push('/paywall')}
        >
          <Card style={styles.locked}>
            <Text style={styles.lockIcon}>🔒</Text>
            <Text style={styles.lockTitle}>{t('insights.locked.title')}</Text>
            <Text style={styles.body}>{t('insights.locked.body')}</Text>
            <Text style={styles.lockCta}>{t('insights.locked.cta')} →</Text>
          </Card>
        </Pressable>
      )}
    </Screen>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.headline,
    paddingTop: spacing(2),
  },
  subtitle: {
    ...typography.bodySmall,
    marginTop: spacing(0.5),
  },
  rows: {
    gap: spacing(1.5),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    ...typography.body,
  },
  infoValue: {
    ...typography.subtitle,
    color: colors.primary,
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
    backgroundColor: colors.softRose,
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
    backgroundColor: colors.phaseSoft.luteal,
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
    color: colors.primary,
  },
});
