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
import { useReducedMotion } from 'react-native-reanimated';

import { initI18n } from '@/i18n';
import { useLogStore, usePremiumStore, useSettingsStore, useUserStore } from '@/store';
import { duration, palettes } from '@/theme';

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
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });
  const storesReady = useStoresHydrated();
  const theme = useSettingsStore((s) => s.theme);
  const reduceMotion = useReducedMotion();

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
          animation: reduceMotion ? 'fade' : 'fade_from_bottom',
          animationDuration: reduceMotion ? duration.instant : duration.standard,
          contentStyle: { backgroundColor: palettes[theme].bgGradient[0] },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" options={{ animation: reduceMotion ? 'fade' : 'slide_from_bottom', animationDuration: reduceMotion ? duration.instant : duration.standard }} />
        <Stack.Screen name="paywall" options={{ presentation: 'modal', animation: reduceMotion ? 'fade' : 'fade_from_bottom', animationDuration: reduceMotion ? duration.instant : duration.standard }} />
      </Stack>
    </>
  );
}
