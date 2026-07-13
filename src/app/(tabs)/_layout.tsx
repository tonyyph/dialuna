import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { BottomTabBarProps } from 'expo-router/js-tabs';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { GlassSurface } from '@/components/ui/GlassSurface';
import { Pressable } from '@/components/ui/Pressable';
import { radius, shadows, spacing, springs, typography, useTheme } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

const TAB_ICONS: Record<string, IconName> = {
  home: 'ellipse-outline',
  log: 'add-circle-outline',
  calendar: 'calendar-outline',
  insights: 'stats-chart-outline',
  ai: 'sparkles',
};

function FloatingDock({ state, descriptors, navigation }: BottomTabBarProps) {
  const p = useTheme();
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const widths = useSharedValue<number[]>([]);
  const offsets = useSharedValue<number[]>([]);

  useEffect(() => {
    const w = widths.value[state.index];
    const x = offsets.value[state.index];
    if (w !== undefined && x !== undefined) {
      indicatorWidth.value = withSpring(w, springs.soft);
      indicatorX.value = withSpring(x, springs.soft);
    }
    // widths/offsets are read (not depended on for re-runs) so a layout pass
    // after mount doesn't retrigger this effect on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.index]);

  const indicatorStyle = useAnimatedStyle(() => ({
    width: indicatorWidth.value,
    transform: [{ translateX: indicatorX.value }],
  }));

  return (
    <GlassSurface
      tintColor={
        p.name === 'dark' ? 'rgba(43,39,46,0.55)' : 'rgba(255,251,247,0.55)'
      }
      style={styles.dock}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.indicator,
          {
            backgroundColor:
              p.name === 'dark' ? 'rgba(225,173,102,0.22)' : 'rgba(182,130,53,0.16)',
          },
          indicatorStyle,
        ]}
      />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const icon = TAB_ICONS[route.name] ?? 'ellipse-outline';

        const onLayout = (e: LayoutChangeEvent) => {
          const { width, x } = e.nativeEvent.layout;
          widths.value = [
            ...widths.value.slice(0, index),
            width,
            ...widths.value.slice(index + 1),
          ];
          offsets.value = [
            ...offsets.value.slice(0, index),
            x,
            ...offsets.value.slice(index + 1),
          ];
          if (focused) {
            indicatorWidth.value = width;
            indicatorX.value = x;
          }
        };

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <Pressable
            key={route.key}
            onLayout={onLayout}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={options.title}
            style={styles.item}
          >
            <View style={focused ? [styles.iconWrap, shadows.chip] : styles.iconWrap}>
              <Ionicons
                name={icon}
                size={19}
                color={focused ? p.accentInk : p.textFaint}
              />
            </View>
            {focused ? (
              <Text style={[styles.label, { color: p.accentInk }]} numberOfLines={1}>
                {options.title}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </GlassSurface>
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      tabBar={(props) => <FloatingDock {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" options={{ title: t('tabs.home') }} />
      <Tabs.Screen name="log" options={{ title: t('tabs.log') }} />
      <Tabs.Screen name="calendar" options={{ title: t('tabs.calendar') }} />
      <Tabs.Screen name="insights" options={{ title: t('tabs.insights') }} />
      <Tabs.Screen name="ai" options={{ title: t('tabs.ai') }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  dock: {
    position: 'absolute',
    left: spacing(2.25),
    right: spacing(2.25),
    bottom: spacing(1.75),
    height: 62,
    borderRadius: radius.dock,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing(0.75),
    ...shadows.float,
  },
  indicator: {
    position: 'absolute',
    top: 8,
    height: 46,
    borderRadius: radius.dock - 8,
  },
  item: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.micro,
    fontSize: 9.5,
    letterSpacing: 0.2,
  },
});
