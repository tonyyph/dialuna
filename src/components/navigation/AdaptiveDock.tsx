import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { duration, radius, shadows, spacing, typography, useTheme } from '@/theme';

const ITEMS: Record<string, { icon: keyof typeof Ionicons.glyphMap; label: string; action?: boolean }> = {
  home: { icon: 'pulse-outline', label: 'tabs.home' }, calendar: { icon: 'calendar-outline', label: 'tabs.calendar' },
  log: { icon: 'add', label: 'tabs.log', action: true }, insights: { icon: 'analytics-outline', label: 'tabs.insights' }, ai: { icon: 'sparkles-outline', label: 'tabs.ai' },
};

export function AdaptiveDock({ state, descriptors, navigation }: BottomTabBarProps) {
  const p = useTheme(); const { t } = useTranslation(); const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions(); const reduceMotion = useReducedMotion(); const itemWidth = (width - spacing(5.5)) / 5; const indicatorX = useSharedValue(state.index * itemWidth);
  useEffect(() => { indicatorX.value = withTiming(state.index * itemWidth, { duration: reduceMotion ? duration.instant : duration.standard }); }, [indicatorX, itemWidth, reduceMotion, state.index]);
  const indicatorStyle = useAnimatedStyle(() => ({ transform: [{ translateX: indicatorX.value }] }));
  return <View style={[styles.position, { paddingBottom: Math.max(insets.bottom, spacing(1)) }]}>
    <View style={[styles.dock, { backgroundColor: p.surfaceSolid, borderColor: p.track }]}>
      <Animated.View style={[styles.indicator, { width: itemWidth, backgroundColor: p.accent100 }, indicatorStyle]} />
      {state.routes.map((route, index) => {
        const item = ITEMS[route.name]; if (!item) return null; const focused = state.index === index; const options = descriptors[route.key].options;
        const onPress = () => { const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true }); if (!focused && !event.defaultPrevented) { void Haptics.selectionAsync(); navigation.navigate(route.name, route.params); } };
        return <Pressable key={route.key} accessibilityRole="tab" accessibilityState={{ selected: focused }} accessibilityLabel={options.tabBarAccessibilityLabel ?? t(item.label)} onPress={onPress} onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })} style={[styles.item, item.action && styles.actionSlot]}>
          {item.action ? <View style={[styles.capture, { backgroundColor: p.primaryBtn }]}><Ionicons name={item.icon} size={24} color={p.onPrimaryBtn} /></View> : <><Ionicons name={item.icon} size={19} color={focused ? p.accentInk : p.textFaint} />{focused ? <Text style={[styles.label, { color: p.accentInk }]}>{t(item.label)}</Text> : null}</>}
        </Pressable>;
      })}
    </View>
  </View>;
}

const styles = StyleSheet.create({
  position: { position: 'absolute', left: spacing(2), right: spacing(2), bottom: 0 }, dock: { height: 68, borderWidth: 1, borderRadius: radius.dock, paddingHorizontal: spacing(0.75), flexDirection: 'row', alignItems: 'center', ...shadows.soft },
  indicator: { position: 'absolute', left: spacing(0.75), height: 48, borderRadius: radius.md }, item: { zIndex: 1, flex: 1, minWidth: 48, height: 48, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing(0.6) }, actionSlot: { minWidth: 58 }, capture: { width: 52, height: 52, borderRadius: 19, alignItems: 'center', justifyContent: 'center', transform: [{ translateY: -10 }], ...shadows.button }, label: { ...typography.micro, fontSize: 9 },
});
