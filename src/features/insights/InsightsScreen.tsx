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
import { radius, spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';
import { CyclePhase } from '@/types';

const MIN_LOGS = 3;
const PHASES: CyclePhase[] = ['menstrual', 'follicular', 'ovulation', 'luteal'];

export function InsightsScreen() {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();
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
        <View style={[styles.hero, { backgroundColor: colors.deepPlum }]}>
          <Text style={[typography.caption, { color: colors.gold }]}>
            {t('insights.title')}
          </Text>
          <Text style={[typography.headline, styles.title, { color: colors.card }]}>
            {t('insights.title')}
          </Text>
          <Text style={[typography.body, styles.subtitle]}>{t('insights.empty.body')}</Text>
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
      <View style={[styles.hero, { backgroundColor: colors.deepPlum }]}>
        <Text style={[typography.caption, { color: colors.gold }]}>
          {t('insights.title')}
        </Text>
        <Text style={[typography.headline, styles.title, { color: colors.card }]}>
          {t('insights.title')}
        </Text>
        <Text style={[typography.body, styles.subtitle]}>{t('insights.subtitle')}</Text>
      </View>

      <Card variant="glass" style={styles.storyCard}>
        <Text style={typography.title}>{t('insights.summaryCard.title')}</Text>
        <Text style={typography.bodyLarge}>{t('insights.summaryCard.text')}</Text>
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
                  <Text style={[typography.caption, styles.barLabel]}>{t(`phases.${phase}`)}</Text>
                  <View style={[styles.barTrack, { backgroundColor: colors.softRose }]}>
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
                  <Text style={[typography.caption, styles.barValue]}>{value ?? '–'}</Text>
                </View>
              );
            })}
            <Text style={typography.caption}>{t('insights.energyCard.caption')}</Text>
          </Card>

          {insights.pmsSleepAvg !== null && insights.otherSleepAvg !== null && (
            <>
              <SectionTitle title={t('insights.sleepCard.title')} />
              <Card>
                <Text style={typography.bodyLarge}>
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
            <Text style={typography.bodyLarge}>
              {t('insights.pmsCard.text', {
                start: format(parseISO(insights.nextPmsStart), 'MMM d'),
                end: format(parseISO(insights.nextPmsEnd), 'MMM d'),
              })}
            </Text>
          </Card>

          <SectionTitle title={t('insights.symptomsCard.title')} />
          <Card variant="glass" style={styles.symptomWrap}>
            {insights.topSymptoms.length === 0 ? (
              <Text style={typography.body}>—</Text>
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
          <Card variant="glass" style={[styles.locked, { backgroundColor: colors.phaseSoft.luteal }]}>
            <Text style={styles.lockIcon}>🔒</Text>
            <Text style={[typography.subtitle, styles.lockTitle]}>{t('insights.locked.title')}</Text>
            <Text style={typography.bodyLarge}>{t('insights.locked.body')}</Text>
            <Text style={[typography.subtitle, { color: colors.primary }]}>
              {t('insights.locked.cta')} →
            </Text>
          </Card>
        </Pressable>
      )}
    </Screen>
  );
}

function InsightStat({ label, value }: { label: string; value: string }) {
  const { colors, typography } = useTheme();
  return (
    <View style={[styles.insightStat, { backgroundColor: colors.softRose }]}>
      <Text style={[typography.subtitle, { color: colors.primary }]}>{value}</Text>
      <Text style={[typography.caption, styles.insightStatLabel]}>{label}</Text>
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
  title: {
    marginTop: spacing(0.5),
  },
  subtitle: {
    color: 'rgba(255,255,255,0.78)',
    marginTop: spacing(0.5),
  },
  storyCard: {
    gap: spacing(2),
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
  insightStatLabel: {
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
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
  },
  barLabel: {
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
    width: 28,
    textAlign: 'right',
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
    textAlign: 'center',
  },
});
