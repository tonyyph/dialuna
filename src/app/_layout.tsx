import { CormorantGaramond_600SemiBold } from '@expo-google-fonts/cormorant-garamond';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

import { initI18n } from '@/i18n';
import { useLogStore, usePremiumStore, useSettingsStore, useUserStore } from '@/store';
import { palettes } from '@/theme';

SplashScreen.preventAutoHideAsync();

function useStoresHydrated(): boolean {
  const [hydrated, setHydrated] = useState(
    () =>
      useUserStore.persist.hasHydrated() &&
      useLogStore.persist.hasHydrated() &&
      usePremiumStore.persist.hasHydrated() &&
      useSettingsStore.persist.hasHydrated()
  );

  useEffect(() => {
    if (hydrated) return;
    const check = () => {
      if (
        useUserStore.persist.hasHydrated() &&
        useLogStore.persist.hasHydrated() &&
        usePremiumStore.persist.hasHydrated() &&
        useSettingsStore.persist.hasHydrated()
      ) {
        setHydrated(true);
      }
    };
    const subs = [
      useUserStore.persist.onFinishHydration(check),
      useLogStore.persist.onFinishHydration(check),
      usePremiumStore.persist.onFinishHydration(check),
      useSettingsStore.persist.onFinishHydration(check),
    ];
    check();
    return () => subs.forEach((unsub) => unsub());
  }, [hydrated]);

  return hydrated;
}

export default function RootLayout() {
  const [i18nReady, setI18nReady] = useState(false);
  const [fontsLoaded] = useFonts({
    CormorantGaramond_600SemiBold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });
  const storesReady = useStoresHydrated();
  const theme = useSettingsStore((s) => s.theme);

  useEffect(() => {
    initI18n().finally(() => setI18nReady(true));
  }, []);

  const ready = i18nReady && storesReady && fontsLoaded;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          animationDuration: 220,
          contentStyle: { backgroundColor: palettes[theme].bgGradient[0] },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" options={{ animation: 'fade', animationDuration: 150 }} />
        <Stack.Screen name="paywall" options={{ presentation: 'modal', animation: 'fade_from_bottom', animationDuration: 380 }} />
      </Stack>
    </>
  );
}
