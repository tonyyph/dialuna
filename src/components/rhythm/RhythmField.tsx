import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { duration, radius, spacing, typography, useTheme } from '@/theme';
import { CyclePhase } from '@/types';

interface Props {
  day: number;
  phase: CyclePhase;
  phaseLabel: string;
  nextEvent: string;
  score?: number;
  signal: string;
  compact?: boolean;
}

export function RhythmField({ day, phase, phaseLabel, nextEvent, score, signal, compact }: Props) {
  const p = useTheme();
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const phaseColor = p.phase[phase];
  const position = useSharedValue(day % 8);
  useEffect(() => { position.value = withTiming(day % 8, { duration: reduceMotion ? duration.instant : duration.expressive }); }, [day, position, reduceMotion]);
  const focalStyle = useAnimatedStyle(() => ({ transform: [{ translateX: position.value * -4 }, { translateY: position.value * 2 }, { scale: 0.9 + position.value * 0.025 }] }));
  return (
    <View accessibilityLabel={`${phaseLabel}. ${signal}`} style={[styles.field, compact && styles.compact]}>
      <LinearGradient colors={p.heroGradient} style={StyleSheet.absoluteFill} />
      <View style={[styles.orbitLarge, { borderColor: p.fillSubtle }]} />
      <View style={[styles.orbit, { borderColor: phaseColor }]} />
      <Animated.View style={[styles.focal, { backgroundColor: phaseColor }, focalStyle]} />
      <View style={styles.copy}>
        <Text style={[styles.eyebrow, { color: p.textMuted }]}>{phaseLabel}</Text>
        <Text style={[styles.day, { color: p.text }]}>{day}</Text>
        <Text style={[styles.dayLabel, { color: p.textMuted }]}>{nextEvent}</Text>
      </View>
      {score !== undefined ? (
        <View style={[styles.score, { backgroundColor: p.surfaceStrong }]}> 
          <Text style={[styles.scoreValue, { color: p.text }]}>{score}</Text>
          <Text style={[styles.scoreLabel, { color: p.textMuted }]}>{t('home.twinScore')}</Text>
        </View>
      ) : null}
      <Text style={[styles.signal, { color: p.text }]}>{signal}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { minHeight: 330, overflow: 'hidden', justifyContent: 'center', padding: spacing(3), borderRadius: radius.organic },
  compact: { minHeight: 220 },
  orbitLarge: { position: 'absolute', width: 330, height: 210, borderRadius: 180, borderWidth: 1, transform: [{ rotate: '-18deg' }], left: -20, top: 38 },
  orbit: { position: 'absolute', width: 225, height: 225, borderRadius: 120, borderWidth: 2, borderRightColor: 'transparent', right: -18, top: 24, transform: [{ rotate: '28deg' }] },
  focal: { position: 'absolute', width: 74, height: 74, borderRadius: 37, right: 48, top: 83, opacity: 0.22 },
  copy: { alignItems: 'flex-start' },
  eyebrow: { ...typography.labelM, textTransform: 'uppercase', letterSpacing: 1.2 },
  day: { ...typography.displayXL, marginTop: spacing(0.5) },
  dayLabel: { ...typography.bodyM },
  score: { position: 'absolute', right: spacing(3), bottom: spacing(3), width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  scoreValue: { ...typography.titleM },
  scoreLabel: { ...typography.micro },
  signal: { ...typography.titleM, position: 'absolute', left: spacing(3), right: 112, bottom: spacing(3) },
});
