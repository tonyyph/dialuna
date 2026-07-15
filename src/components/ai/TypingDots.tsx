import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { duration, radius, spacing, useTheme } from '@/theme';

export function TypingDots() {
  const { t } = useTranslation(); const p = useTheme(); const reduceMotion = useReducedMotion(); const scale = useSharedValue(0.82);
  useEffect(() => { if (!reduceMotion) scale.value = withRepeat(withSequence(withTiming(1, { duration: duration.expressive }), withTiming(0.82, { duration: duration.expressive })), -1, true); }, [reduceMotion, scale]);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: reduceMotion ? 0.65 : scale.value }));
  return <View style={styles.row} accessibilityLabel={t('ai.typing')}><Animated.View style={[styles.field, { borderColor: p.accent }, animated]}><View style={[styles.core, { backgroundColor: p.accent }]} /></Animated.View></View>;
}

const styles = StyleSheet.create({ row: { minHeight: 72, justifyContent: 'center', paddingHorizontal: spacing(1) }, field: { width: 56, height: 40, borderRadius: radius.organic, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, core: { width: 16, height: 16, borderRadius: 8, opacity: 0.28 } });
