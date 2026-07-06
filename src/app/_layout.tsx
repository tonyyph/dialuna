import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { Fraunces_600SemiBold, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

import { initI18n } from '@/i18n';
import { useLogStore, usePremiumStore, useUserStore } from '@/store';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

function useStoresHydrated(): boolean {
  const [hydrated, setHydrated] = useState(
    () =>
      useUserStore.persist.hasHydrated() &&
      useLogStore.persist.hasHydrated() &&
      usePremiumStore.persist.hasHydrated()
  );

  useEffect(() => {
    if (hydrated) return;
    const check = () => {
      if (
        useUserStore.persist.hasHydrated() &&
        useLogStore.persist.hasHydrated() &&
        usePremiumStore.persist.hasHydrated()
      ) {
        setHydrated(true);
      }
    };
    const subs = [
      useUserStore.persist.onFinishHydration(check),
      useLogStore.persist.onFinishHydration(check),
      usePremiumStore.persist.onFinishHydration(check),
    ];
    check();
    return () => subs.forEach((unsub) => unsub());
  }, [hydrated]);

  return hydrated;
}

export default function RootLayout() {
  const [i18nReady, setI18nReady] = useState(false);
  const [fontsLoaded] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });
  const storesReady = useStoresHydrated();

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
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}
