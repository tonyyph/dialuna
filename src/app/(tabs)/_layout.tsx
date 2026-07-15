import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AdaptiveDock } from '@/components/navigation/AdaptiveDock';

export default function TabsLayout() {
  const { t } = useTranslation();
  return <Tabs tabBar={(props) => <AdaptiveDock {...props} />} screenOptions={{ headerShown: false, tabBarHideOnKeyboard: true }}>
    <Tabs.Screen name="home" options={{ title: t('tabs.home') }} />
    <Tabs.Screen name="calendar" options={{ title: t('tabs.calendar') }} />
    <Tabs.Screen name="log" options={{ title: t('tabs.log') }} />
    <Tabs.Screen name="insights" options={{ title: t('tabs.insights') }} />
    <Tabs.Screen name="ai" options={{ title: t('tabs.ai') }} />
  </Tabs>;
}
