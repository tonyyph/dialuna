import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/useTheme';

type IconName = keyof typeof Ionicons.glyphMap;

const TAB_ICON: Record<string, IconName> = {
  home: 'planet',
  calendar: 'calendar',
  log: 'create',
  insights: 'stats-chart',
};

function CustomTabBar({ state, descriptors, navigation }: Parameters<NonNullable<Parameters<typeof Tabs>[0]['tabBar']>>[0]) {
  const { colors, shadows } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        shadows.bloom,
        {
          bottom: 26 + Math.max(0, insets.bottom - 26),
          backgroundColor: colors.glassStrong,
          borderColor: `${colors.moonWhite}33`,
        },
      ]}
    >
      {state.routes.filter((route) => route.name in TAB_ICON).map((route) => {
        const index = state.routes.indexOf(route);
        const isFocused = state.index === index;
        const iconName = TAB_ICON[route.name];

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={descriptors[route.key].options.title ?? route.name}
            style={[styles.tabButton, isFocused && { transform: [{ scale: 1.05 }] }]}
          >
            <Ionicons name={iconName} size={22} color={isFocused ? colors.primary : colors.textSecondary} />
            <Text
              numberOfLines={1}
              style={[
                styles.tabLabel,
                { color: isFocused ? colors.primary : colors.textSecondary },
              ]}
            >
              {descriptors[route.key].options.title ?? route.name}
            </Text>
            <View style={[styles.dot, { backgroundColor: isFocused ? colors.primary : 'transparent' }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" options={{ title: 'Today' }} />
      <Tabs.Screen name="calendar" options={{ title: 'Calendar' }} />
      <Tabs.Screen name="ai" options={{ title: 'Chat', href: null }} />
      <Tabs.Screen name="log" options={{ title: 'Track' }} />
      <Tabs.Screen name="insights" options={{ title: 'Insights' }} />
      <Tabs.Screen name="premium" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 34,
    borderWidth: 1,
  },
  tabButton: {
    alignItems: 'center',
    gap: 2,
    width: 58,
    minHeight: 50,
    justifyContent: 'center',
  },
  tabLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 9,
    lineHeight: 12,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
