import { Redirect } from 'expo-router';

import { useUserStore } from '@/store';

export default function Index() {
  const hasOnboarded = useUserStore((s) => s.hasOnboarded);
  return hasOnboarded ? (
    <Redirect href="/(tabs)/home" />
  ) : (
    <Redirect href="/onboarding" />
  );
}
