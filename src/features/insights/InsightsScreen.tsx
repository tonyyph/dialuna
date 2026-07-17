import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { router } from 'expo-router';
import { ReactNode, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { DisclaimerBox } from '@/components/ui/DisclaimerBox';
import { EmptyState } from '@/components/ui/EmptyState';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { Pressable } from '@/components/ui/Pressable';
import { Screen } from '@/components/ui/Screen';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { computeInsights } from '@/services/insightsEngine';
import { useLogStore, usePremiumStore, useSettingsStore, useUserStore } from '@/store';
import { radius, spacing, staggerDelay, typography, useTheme } from '@/theme';
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
        <View style={[styles.hero, { backgroundColor: '#2c2620' }]}>
          <Text style={[styles.kicker, { color: p.accent400 }]}>{t('insights.title')}</Text>
          <Text style={[styles.title, { color: '#f4ede1' }]}>{t('insights.title')}</Text>
          <Text style={styles.subtitle}>{t('insights.empty.body')}</Text>
        </View>
        <EmptyState
          icon="bulb-outline"
          title={t('insights.empty.title')}
          body={t('insights.empty.body')}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={[styles.hero, { backgroundColor: '#2c2620' }]}>
        <Text style={[styles.kicker, { color: p.accent400 }]}>{t('insights.title')}</Text>
        <Text style={[styles.title, { color: '#f4ede1' }]}>{t('insights.title')}</Text>
        <Text style={styles.subtitle}>{t('insights.subtitle')}</Text>
      </View>

      <Animated.View entering={FadeInDown.delay(staggerDelay(0)).duration(340)}>
        <Card variant="glass" style={[styles.storyCard, styles.radiusA]}>
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
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(staggerDelay(1)).duration(340)}>
        <SectionTitle title={t('insights.energyCard.title')} />
        {withLock(
          <Card style={[styles.rows, styles.radiusB]}>
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
          </Card>,
          !isPremium
        )}
      </Animated.View>

      {insights.pmsSleepAvg !== null && insights.otherSleepAvg !== null && (
        <Animated.View entering={FadeInDown.delay(staggerDelay(2)).duration(340)}>
          <SectionTitle title={t('insights.sleepCard.title')} />
          {withLock(
            <Card>
              <Text style={styles.body}>
                {t('insights.sleepCard.text', {
                  pmsSleep: insights.pmsSleepAvg,
                  otherSleep: insights.otherSleepAvg,
                })}
              </Text>
            </Card>,
            !isPremium
          )}
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.delay(staggerDelay(3)).duration(340)}>
        <SectionTitle title={t('insights.pmsCard.title')} />
        {withLock(
          <Card>
            <Text style={styles.body}>
              {t('insights.pmsCard.text', {
                start: format(parseISO(insights.nextPmsStart), 'MMM d'),
                end: format(parseISO(insights.nextPmsEnd), 'MMM d'),
              })}
            </Text>
          </Card>,
          !isPremium
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(staggerDelay(4)).duration(340)}>
        <SectionTitle title={t('insights.symptomsCard.title')} />
        {withLock(
          <Card variant="glass" style={[styles.symptomWrap, styles.radiusC]}>
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
          </Card>,
          !isPremium
        )}
      </Animated.View>

      <DisclaimerBox text={t('disclaimer.short')} />
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

function LockedCard({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const p = useTheme();
  return (
    <View style={styles.lockedWrap}>
      {children}
      <GlassSurface
        intensity={30}
        tintColor={p.name === 'dark' ? 'rgba(28,26,31,0.55)' : 'rgba(251,243,236,0.55)'}
        style={[StyleSheet.absoluteFill, { borderRadius: radius.xl - 2 }]}
      >
        <View style={styles.lockOverlayContent}>
          <Ionicons name="lock-closed" size={20} color={p.text} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('insights.locked.cta')}
            onPress={() => router.push('/paywall')}
            style={[styles.unlockPill, { backgroundColor: p.primaryBtn }]}
          >
            <Text style={[styles.unlockPillText, { color: p.onPrimaryBtn }]}>
              {t('insights.locked.cta')}
            </Text>
          </Pressable>
        </View>
      </GlassSurface>
    </View>
  );
}

function withLock(node: ReactNode, locked: boolean) {
  return locked ? <LockedCard>{node}</LockedCard> : node;
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
    color: 'rgba(244,237,225,0.78)',
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
  radiusA: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderBottomRightRadius: 26,
    borderBottomLeftRadius: 10,
  },
  radiusB: {
    borderRadius: 14,
  },
  radiusC: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 26,
    borderBottomLeftRadius: 26,
  },
  lockedWrap: {
    position: 'relative',
  },
  lockOverlayContent: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(1),
  },
  unlockPill: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
  },
  unlockPillText: {
    ...typography.button,
    fontSize: 13,
  },
});
