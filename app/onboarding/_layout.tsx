import { Stack } from 'expo-router';

import { BRAND } from '@/lib/theme';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        contentStyle: { backgroundColor: BRAND.paper },
      }}
    />
  );
}
