import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import { Circle, Svg } from 'react-native-svg';

import { BlobGlow } from '@/components/ui/BlobGlow';
import { Pressable } from '@/components/ui/Pressable';
import { duration, SemanticColorSet, tabularNums, typographyV2 } from '@/theme';
import { CyclePhase } from '@/types';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 260;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type OrbStat = 'phase' | 'energy' | 'mood' | 'focus';
const STAT_ORDER: OrbStat[] = ['phase', 'energy', 'mood', 'focus'];

interface Props {
  cycleDay: number;
  cycleLength: number;
  phase: CyclePhase;
  isPmsWindow: boolean;
  periodText: string;
  twinScore: number;
  energyScore: number;
  moodScore: number;
  focusScore: number;
  theme: SemanticColorSet;
}

export function CycleOrb({
  cycleDay,
  cycleLength,
  phase,
  isPmsWindow,
  periodText,
  twinScore,
  energyScore,
  moodScore,
  focusScore,
  theme,
}: Props) {
  const { t } = useTranslation();
  const [statIndex, setStatIndex] = useState(0);
  const progress = useSharedValue(clampProgress(cycleDay, cycleLength));

  useEffect(() => {
    progress.value = withTiming(clampProgress(cycleDay, cycleLength), {
      duration: duration.expressive,
    });
  }, [cycleDay, cycleLength, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  const stat = STAT_ORDER[statIndex];
  const statLabel =
    stat === 'phase' ? t(isPmsWindow ? 'phases.pms' : `phases.${phase}`) : t(`home.forecast.${stat}`);
  const statValue =
    stat === 'phase'
      ? null
      : { energy: energyScore, mood: moodScore, focus: focusScore }[stat];
  const ringColor = isPmsWindow ? theme.signal.warning : theme.brand.primary;

  return (
    <View style={styles.wrap}>
      <BlobGlow
        size={SIZE + 60}
        colors={['rgba(124,92,252,0.24)', 'rgba(124,92,252,0)']}
        style={styles.glow}
      />
      <Svg width={SIZE} height={SIZE}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={theme.border.subtle}
          strokeWidth={STROKE}
          fill="none"
        />
        <AnimatedCircle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={ringColor}
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          animatedProps={animatedProps}
          rotation={-90}
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.cycleDay', { day: cycleDay })}
        onPress={() => setStatIndex((i) => (i + 1) % STAT_ORDER.length)}
        style={styles.center}
      >
        <Text style={[typographyV2.displayXL, tabularNums, { color: theme.content.primary }]}>
          {cycleDay}
        </Text>
        <Text style={[typographyV2.labelM, { color: theme.content.secondary }]}>
          {statValue !== null ? `${statLabel} · ${statValue}` : statLabel}
        </Text>
      </Pressable>

      <View style={[styles.pill, styles.pillTop, { backgroundColor: theme.surface.raised }]}>
        <Text style={[typographyV2.labelM, { color: theme.content.secondary }]}>
          {t('home.twinScore')}
        </Text>
        <Text style={[typographyV2.titleM, tabularNums, { color: theme.brand.primary }]}>
          {twinScore}
        </Text>
      </View>

      <View style={[styles.pill, styles.pillBottom, { backgroundColor: theme.surface.raised }]}>
        <Text style={[typographyV2.labelM, { color: theme.content.secondary }]}>{periodText}</Text>
      </View>
    </View>
  );
}

function clampProgress(cycleDay: number, cycleLength: number): number {
  if (cycleLength <= 0) return 0;
  return Math.min(1, Math.max(0, cycleDay / cycleLength));
}

const styles = StyleSheet.create({
  wrap: {
    width: SIZE + 60,
    height: SIZE + 60,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  glow: {
    position: 'absolute',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    gap: 4,
  },
  pill: {
    position: 'absolute',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
  },
  pillTop: {
    top: 8,
    right: 4,
  },
  pillBottom: {
    bottom: 8,
    left: 4,
  },
});
