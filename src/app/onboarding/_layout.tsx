import { Stack } from 'expo-router';

import { useTheme } from '@/theme';

export default function OnboardingLayout() {
  const p = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        animationDuration: 180,
        contentStyle: { backgroundColor: p.bgGradient[0] },
      }}
    />
  );
}
