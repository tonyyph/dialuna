import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ColorValue, StyleSheet, Text } from 'react-native';

import { radius, shadows, spacing, typography, useTheme } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

function tabIcon(name: IconName) {
  function TabIcon({ color }: { color: ColorValue; size: number }) {
    return <Ionicons name={name} color={color} size={19} />;
  }
  return TabIcon;
}

export default function TabsLayout() {
  const { t } = useTranslation();
  const p = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: p.accentInk,
        tabBarInactiveTintColor: p.textFaint,
        tabBarItemStyle: styles.item,
        tabBarStyle: [
          styles.tabBar,
          { backgroundColor: p.name === 'dark' ? 'rgba(43,39,46,0.92)' : 'rgba(255,251,247,0.92)' },
        ],
        tabBarLabel: ({ focused, color, children }) =>
          focused ? (
            <Text style={[styles.label, { color }]} numberOfLines={1}>
              {children}
            </Text>
          ) : null,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: t('tabs.home'), tabBarIcon: tabIcon('ellipse-outline') }}
      />
      <Tabs.Screen
        name="log"
        options={{ title: t('tabs.log'), tabBarIcon: tabIcon('add-circle-outline') }}
      />
      <Tabs.Screen
        name="calendar"
        options={{ title: t('tabs.calendar'), tabBarIcon: tabIcon('calendar-outline') }}
      />
      <Tabs.Screen
        name="insights"
        options={{ title: t('tabs.insights'), tabBarIcon: tabIcon('stats-chart-outline') }}
      />
      <Tabs.Screen
        name="ai"
        options={{ title: t('tabs.ai'), tabBarIcon: tabIcon('sparkles') }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: spacing(2.25),
    right: spacing(2.25),
    bottom: spacing(1.75),
    height: 62,
    paddingTop: spacing(0.75),
    paddingBottom: spacing(1),
    paddingHorizontal: spacing(0.75),
    borderTopWidth: 0,
    borderRadius: radius.dock,
    ...shadows.float,
  },
  item: { borderRadius: radius.dock - 8 },
  label: { ...typography.micro, fontSize: 9.5, letterSpacing: 0.2 },
});
