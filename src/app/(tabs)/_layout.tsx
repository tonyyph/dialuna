import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { BottomTabBarProps } from 'expo-router/js-tabs';
import { useEffect, useState } from 'react';
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
  const [dockWidth, setDockWidth] = useState(0);
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  useEffect(() => {
    const routeCount = state.routes.length;
    const contentWidth = dockWidth - spacing(1.5);
    if (routeCount > 0 && contentWidth > 0) {
      const itemWidth = contentWidth / routeCount;
      indicatorWidth.value = withSpring(itemWidth, springs.soft);
      indicatorX.value = withSpring(spacing(0.75) + itemWidth * state.index, springs.soft);
    }
  }, [dockWidth, indicatorWidth, indicatorX, state.index, state.routes.length]);

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
      onLayout={(e: LayoutChangeEvent) => setDockWidth(e.nativeEvent.layout.width)}
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

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable
            key={route.key}
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
