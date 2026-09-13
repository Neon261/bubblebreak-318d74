// oxlint-disable-next-line eslint-plugin-import/no-unassigned-import
import '../global.css';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { VarelaRound_400Regular, useFonts } from '@expo-google-fonts/varela-round';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import { useEffect } from 'react';
import * as DevClient from 'expo-dev-client';
import { HeroUINativeProvider } from 'heroui-native';
import { Uniwind } from 'uniwind';
import {
  ErrorBoundary as ExpoErrorBoundary,
  type ErrorBoundaryProps,
  SplashScreen,
  Stack,
} from 'expo-router';

import { initPostHog } from '@/lib/posthog';
import { registerServiceWorker } from '@/lib/registerServiceWorker';
import { reportErrorToParent } from '@/lib/reportPreviewError';
import { InstallPrompt } from '@/components/InstallPrompt';
import { useSession } from '@/hooks/useSession';
import { useStoreHydrated } from '@/hooks/useStoreHydrated';
import { useAppStore } from '@/lib/store';
import { BRAND } from '@/lib/theme';

/**
 * Custom ErrorBoundary that reports React render errors to the parent window (Bilt preview iframe)
 * and then renders the default Expo error UI.
 */
function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    if (Platform.OS === 'web' && error) {
      const message = [error.message, error.stack].filter(Boolean).join('\n');
      reportErrorToParent(message);
    }
  }, [error]);
  return <ExpoErrorBoundary error={error} retry={retry} />;
}

export { ErrorBoundary };

// Starter is light-only by default. Remove this when implementing requested dark mode.
Uniwind.setTheme('light');

// Registered people land on the tabs; the registration flow is the only other
// unguarded route, so it is where everyone else is sent.
export const unstable_settings = { anchor: '(tabs)' };

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    VarelaRound_400Regular,
  });
  const hydrated = useStoreHydrated();

  // Report uncaught JS errors and unhandled promise rejections to parent (Bilt preview iframe)
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return undefined;

    const handleError = (event: ErrorEvent) => {
      const message = event.error?.stack ?? event.message ?? 'Unknown error';
      reportErrorToParent(message);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const err = event.reason;
      const message =
        err instanceof Error ? [err.message, err.stack].filter(Boolean).join('\n') : String(err);
      reportErrorToParent(message);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Inject the rounded brand font for web when the preview proxy blocks expo-font.
  useEffect(() => {
    if (Platform.OS === 'web') {
      const existingLink = document.querySelector(
        'link[href*="fonts.googleapis.com/css2?family=Varela+Round"]',
      );

      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Varela+Round&display=swap';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    }
  }, []);

  useEffect(() => {
    const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
    if (__DEV__ && Platform.OS !== 'web' && !isExpoGo) {
      const timer = setTimeout(() => {
        DevClient.closeMenu();
        DevClient.hideMenu();
      }, 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      initPostHog();
    }
  }, []);

  useEffect(() => {
    registerServiceWorker();
  }, []);

  useEffect(() => {
    if ((loaded || error) && hydrated) {
      void SplashScreen.hideAsync();
    }
  }, [loaded, error, hydrated]);

  if ((!loaded && !error) || !hydrated) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider>
        <AppStack />
        <InstallPrompt />
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}

function AppStack() {
  const registered = useAppStore((state) => state.profile.registeredAt !== undefined);
  useSession();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: BRAND.paper },
        headerTintColor: BRAND.accent,
        headerTitleStyle: { color: BRAND.ink, fontFamily: 'VarelaRound_400Regular', fontSize: 18 },
        headerShadowVisible: false,
        headerBackTitle: 'Back',
        contentStyle: { backgroundColor: BRAND.paper },
      }}
    >
      <Stack.Protected guard={registered}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="discover" options={{ title: 'Around you' }} />
        <Stack.Screen name="spot/[id]" options={{ title: 'Activity details' }} />
        <Stack.Screen name="ping/[id]" options={{ title: 'Your ping' }} />
        <Stack.Screen name="invite/[id]" options={{ title: 'Invitation' }} />
        <Stack.Screen name="plan/[id]" options={{ title: 'The plan' }} />
        <Stack.Screen name="chat/[id]" options={{ title: 'Plan chat' }} />
        <Stack.Screen name="intro" options={{ title: 'Your intro' }} />
        <Stack.Screen name="+not-found" />
      </Stack.Protected>

      <Stack.Protected guard={!registered}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
