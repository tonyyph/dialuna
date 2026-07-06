import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ColorValue, StyleSheet } from 'react-native';

import { colors, radius, shadows, spacing, typography } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

function tabIcon(name: IconName) {
  function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons name={name} color={color} size={size} />;
  }
  return TabIcon;
}

export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.item,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: t('tabs.home'), tabBarIcon: tabIcon('moon') }}
      />
      <Tabs.Screen
        name="calendar"
        options={{ title: t('tabs.calendar'), tabBarIcon: tabIcon('calendar') }}
      />
      <Tabs.Screen
        name="log"
        options={{ title: t('tabs.log'), tabBarIcon: tabIcon('add-circle') }}
      />
      <Tabs.Screen
        name="ai"
        options={{ title: t('tabs.ai'), tabBarIcon: tabIcon('sparkles') }}
      />
      <Tabs.Screen
        name="insights"
        options={{ title: t('tabs.insights'), tabBarIcon: tabIcon('stats-chart') }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: spacing(2),
    right: spacing(2),
    bottom: spacing(1.25),
    minHeight: 66,
    paddingTop: spacing(0.75),
    paddingBottom: spacing(1),
    paddingHorizontal: spacing(0.5),
    backgroundColor: colors.glassStrong,
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.card,
    ...shadows.md,
  },
  item: {
    borderRadius: radius.lg,
  },
  label: {
    ...typography.caption,
    fontSize: 11,
  },
});
