import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AuroraStage } from '@/components/lunar/AuroraStage';
import { ConstellationMap } from '@/components/lunar/ConstellationMap';
import { LoadingAurora } from '@/components/lunar/LoadingAurora';
import { LunarCompanion } from '@/components/lunar/LunarCompanion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DisclaimerBox } from '@/components/ui/DisclaimerBox';
import { Screen } from '@/components/ui/Screen';
import { computeInsights } from '@/services/insightsEngine';
import { useLogStore, usePremiumStore, useUserStore } from '@/store';
import { radius, shadows, spacing } from '@/theme';
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

  if (!profile || !insights) return <LoadingAurora fullScreen label={t('common.loading')} />;

  const notEnoughLogs = insights.logCount < MIN_LOGS;

  return (
    <Screen edgeToEdge contentContainerStyle={styles.screenContent}>
      <AuroraStage style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text style={[typography.caption, styles.kicker]}>{t('insights.constellation.kicker')}</Text>
          <Text style={[typography.displayXl, styles.title]}>{t('insights.constellation.title')}</Text>
          <Text style={[typography.body, styles.subtitle]}>
            {notEnoughLogs ? t('insights.empty.body') : t('insights.subtitle')}
          </Text>
        </View>

        <ConstellationMap
          accessibilityLabel={t('insights.constellation.title')}
          nodes={[
            { x: 42, y: 32, active: true, color: colors.champagneGold, label: t('insights.constellation.nodes.energy') },
            { x: 168, y: 74, color: colors.auroraBlue, label: t('insights.constellation.nodes.mood') },
            { x: 260, y: 28, color: colors.roseDeep, label: t('insights.constellation.nodes.comfort') },
            { x: 88, y: 164, color: colors.lilac, label: t('insights.constellation.nodes.sleep') },
            { x: 238, y: 176, locked: !isPremium, color: colors.primary, label: t('insights.constellation.nodes.premium') },
          ]}
        />
      </AuroraStage>

      <View style={styles.content}>
        {notEnoughLogs ? (
          <Card variant="moonstone" style={styles.emptyPanel}>
            <LunarCompanion size={104} state="thinking" />
            <Text style={[typography.displayL, styles.emptyTitle]}>{t('insights.empty.title')}</Text>
            <Text style={[typography.bodyLarge, styles.centerText]}>{t('insights.empty.body')}</Text>
            <Button label={t('home.lunar.beginRitual')} onPress={() => router.push('/(tabs)/log')} />
          </Card>
        ) : (
          <Card variant="moonstone" style={styles.summaryPanel}>
            <Text style={[typography.caption, { color: colors.primary }]}>{t('insights.constellation.weekly')}</Text>
            <Text style={typography.headline}>{t('insights.summaryCard.title')}</Text>
            <Text style={typography.bodyLarge}>{t('insights.summaryCard.text')}</Text>
            <View style={styles.statRow}>
              <InsightStat label={t('insights.cycleCard.avgLength')} value={t('common.days', { count: insights.avgCycleLength })} />
              <InsightStat
                label={t('insights.cycleCard.regularity')}
                value={insights.confidenceScore >= 0.8 ? t('insights.cycleCard.regular') : t('insights.cycleCard.variable')}
              />
            </View>
          </Card>
        )}

        {!notEnoughLogs && isPremium ? (
          <>
            <Card style={styles.phasePanel}>
              <Text style={typography.title}>{t('insights.energyCard.title')}</Text>
              {PHASES.map((phase) => {
                const value = insights.avgEnergyByPhase[phase] ?? 0;
                return (
                  <View key={phase} style={styles.phaseRow}>
                    <View style={[styles.phaseDot, { backgroundColor: colors.phase[phase] }]} />
                    <Text style={[typography.caption, styles.phaseLabel]}>{t(`phases.${phase}`)}</Text>
                    <View style={[styles.phaseTrack, { backgroundColor: colors.phaseSoft[phase] }]}>
                      <View style={[styles.phaseFill, { width: `${(value / 10) * 100}%`, backgroundColor: colors.phase[phase] }]} />
                    </View>
                    <Text style={[typography.caption, styles.phaseValue]}>{value || '-'}</Text>
                  </View>
                );
              })}
              <Text style={typography.caption}>{t('insights.energyCard.caption')}</Text>
            </Card>

            <View style={styles.articleGrid}>
              {insights.pmsSleepAvg !== null && insights.otherSleepAvg !== null ? (
                <PatternArticle
                  icon="moon"
                  title={t('insights.sleepCard.title')}
                  body={t('insights.sleepCard.text', {
                    pmsSleep: insights.pmsSleepAvg,
                    otherSleep: insights.otherSleepAvg,
                  })}
                />
              ) : null}
              <PatternArticle
                icon="sparkles"
                title={t('insights.pmsCard.title')}
                body={t('insights.pmsCard.text', {
                  start: format(parseISO(insights.nextPmsStart), 'MMM d'),
                  end: format(parseISO(insights.nextPmsEnd), 'MMM d'),
                })}
              />
            </View>

            <Card variant="glass" style={styles.symptomPanel}>
              <Text style={typography.title}>{t('insights.symptomsCard.title')}</Text>
              {insights.topSymptoms.length === 0 ? (
                <Text style={typography.body}>{t('insights.constellation.noSymptoms')}</Text>
              ) : (
                insights.topSymptoms.map(({ symptom, count }) => (
                  <View key={symptom} style={styles.symptomRow}>
                    <Ionicons name="radio-button-on" size={14} color={colors.primary} />
                    <Text style={typography.bodyLarge}>
                      {t(`symptoms.${symptom}`)} · {t('insights.symptomsCard.timesLogged', { count })}
                    </Text>
                  </View>
                ))
              )}
            </Card>
            <DisclaimerBox text={t('disclaimer.short')} />
          </>
        ) : null}

        {!notEnoughLogs && !isPremium ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('insights.locked.cta')}
            onPress={() => router.push('/paywall')}
            style={({ pressed }) => [pressed && styles.pressed]}
          >
            <Card variant="glass" style={[styles.lockedPanel, { backgroundColor: colors.phaseSoft.luteal }]}>
              <View style={[styles.lockOrb, { backgroundColor: colors.royalViolet }]}>
                <Ionicons name="lock-closed" size={24} color={colors.moonWhite} />
              </View>
              <Text style={[typography.headline, styles.centerText]}>{t('insights.locked.title')}</Text>
              <Text style={[typography.bodyLarge, styles.centerText]}>{t('insights.locked.body')}</Text>
              <Text style={[typography.subtitle, { color: colors.primary }]}>{t('insights.locked.cta')}</Text>
            </Card>
          </Pressable>
        ) : null}
      </View>
    </Screen>
  );
}

function InsightStat({ label, value }: { label: string; value: string }) {
  const { colors, typography } = useTheme();
  return (
    <View style={[styles.insightStat, { backgroundColor: colors.softRose }]}>
      <Text style={[typography.subtitle, { color: colors.primary }]}>{value}</Text>
      <Text style={typography.caption}>{label}</Text>
    </View>
  );
}

function PatternArticle({ icon, title, body }: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }) {
  const { colors, typography } = useTheme();
  return (
    <Card style={styles.patternArticle}>
      <View style={[styles.articleIcon, { backgroundColor: colors.softRose }]}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <Text style={typography.title}>{title}</Text>
      <Text style={typography.bodyLarge}>{body}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingBottom: spacing(13),
  },
  hero: {
    minHeight: 452,
    borderBottomLeftRadius: radius.sheet,
    borderBottomRightRadius: radius.sheet,
  },
  heroCopy: {
    paddingTop: spacing(3),
    paddingHorizontal: spacing(3),
    gap: spacing(0.75),
  },
  kicker: {
    color: 'rgba(255,255,255,0.68)',
  },
  title: {
    color: '#FFF8F1',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.76)',
    maxWidth: 330,
  },
  content: {
    paddingHorizontal: spacing(2.5),
    marginTop: -spacing(4),
    gap: spacing(2.5),
  },
  emptyPanel: {
    alignItems: 'center',
    gap: spacing(1.5),
    ...shadows.lg,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  summaryPanel: {
    gap: spacing(1.5),
    ...shadows.lg,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing(1.25),
  },
  insightStat: {
    flex: 1,
    borderRadius: radius.card,
    padding: spacing(1.5),
    gap: spacing(0.5),
  },
  phasePanel: {
    gap: spacing(1.5),
  },
  phaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
  },
  phaseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  phaseLabel: {
    width: 104,
  },
  phaseTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  phaseFill: {
    height: '100%',
    borderRadius: 4,
  },
  phaseValue: {
    width: 28,
    textAlign: 'right',
  },
  articleGrid: {
    gap: spacing(2),
  },
  patternArticle: {
    gap: spacing(1),
  },
  articleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symptomPanel: {
    gap: spacing(1.25),
  },
  symptomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
  },
  lockedPanel: {
    alignItems: 'center',
    gap: spacing(1.25),
    ...shadows.lg,
  },
  lockOrb: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.95,
  },
});
