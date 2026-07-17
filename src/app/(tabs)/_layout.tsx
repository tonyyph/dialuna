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
import { radiusV2, shadowsV2, spacing, springs, typographyV2, useSemanticTheme } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

const TAB_ICONS: Record<string, IconName> = {
  home: 'ellipse-outline',
  log: 'add',
  calendar: 'calendar-outline',
  insights: 'stats-chart-outline',
  ai: 'sparkles-outline',
};

function CrescentDock({ state, descriptors, navigation }: BottomTabBarProps) {
  const theme = useSemanticTheme();
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
      tintColor={theme.surface.floating}
      style={[styles.dock, shadowsV2.floating]}
      onLayout={(e: LayoutChangeEvent) => setDockWidth(e.nativeEvent.layout.width)}
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.indicator, { backgroundColor: theme.surface.selected }, indicatorStyle]}
      />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const isLog = route.name === 'log';
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
            <View
              style={[
                styles.iconWrap,
                isLog
                  ? { backgroundColor: theme.brand.primary }
                  : focused
                    ? { backgroundColor: theme.surface.raised }
                    : null,
              ]}
            >
              <Ionicons
                name={icon}
                size={19}
                color={isLog ? theme.content.inverse : focused ? theme.brand.primary : theme.content.tertiary}
              />
            </View>
            {focused && !isLog ? (
              <Text style={[typographyV2.micro, { color: theme.brand.primary }]} numberOfLines={1}>
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
      tabBar={(props) => <CrescentDock {...props} />}
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
    borderTopLeftRadius: radiusV2.organic,
    borderTopRightRadius: radiusV2.organic,
    borderBottomLeftRadius: radiusV2.xl,
    borderBottomRightRadius: radiusV2.xl,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing(0.75),
  },
  indicator: {
    position: 'absolute',
    top: 8,
    height: 46,
    borderRadius: radiusV2.lg,
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
    borderRadius: radiusV2.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
