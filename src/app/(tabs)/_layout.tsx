import { Ionicons } from '@expo/vector-icons';
import { Tabs, router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MoonMark } from '@/components/ui/MoonMark';
import { useTheme } from '@/theme/useTheme';

type IconName = keyof typeof Ionicons.glyphMap;

const TAB_ICON: Record<string, IconName> = {
  home: 'moon',
  calendar: 'calendar',
  insights: 'stats-chart',
  premium: 'sparkles',
};

function CustomTabBar({ state, descriptors, navigation }: Parameters<NonNullable<Parameters<typeof Tabs>[0]['tabBar']>>[0]) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        {
          bottom: 26 + Math.max(0, insets.bottom - 26),
          backgroundColor: colors.glass,
          borderColor: colors.glassBorder,
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
            <Ionicons name={iconName} size={24} color={isFocused ? colors.primary : colors.textSecondary} />
            <View style={[styles.dot, { backgroundColor: isFocused ? colors.primary : 'transparent' }]} />
          </Pressable>
        );
      })}
      <Pressable
        onPress={() => router.push('/(tabs)/ai')}
        accessibilityRole="button"
        accessibilityLabel="Open AI chat"
        style={styles.orbButton}
      >
        <MoonMark state="idle" size={58} />
      </Pressable>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="calendar" options={{ title: 'Calendar' }} />
      <Tabs.Screen name="ai" options={{ title: 'Chat', href: null }} />
      <Tabs.Screen name="insights" options={{ title: 'Insights' }} />
      <Tabs.Screen name="premium" options={{ title: 'Premium' }} />
      <Tabs.Screen name="log" options={{ href: null }} />
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
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1,
  },
  tabButton: {
    alignItems: 'center',
    gap: 4,
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  orbButton: {
    marginTop: -28,
  },
});
