import { useEffect } from "react";
import { Stack, useRootNavigationState, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClientProvider } from "@tanstack/react-query";
import { StyleSheet } from "react-native";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAppFonts } from "@/lib/fonts";
import { supabase } from "@/lib/supabase";
import { USE_MOCK_DATA } from "@/lib/mock";
import { useAuthStore } from "@/store/auth.store";
import { resolvePostAuthRoute } from "@/lib/auth/navigation";
import { isAppIntroComplete } from "@/lib/auth/onboarding";
import {
  registerForPushNotifications,
  setupNotificationHandlers,
} from "@/lib/notifications";
import { initAnalytics, trackEvent } from "@/lib/analytics";
import { assertRequiredEnv } from "@/lib/env";
import { createQueryClient } from "@/lib/query-client";
import { initSentry, setSentryUser, Sentry } from "@/lib/sentry";
import { COLORS } from "@/utils/constants";

SplashScreen.preventAutoHideAsync();

const queryClient = createQueryClient();

function useAuthNavigationGuard(isAppReady: boolean): void {
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const session = useAuthStore((state) => state.session);
  const profile = useAuthStore((state) => state.profile);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    if (!isAppReady || !isInitialized || navigationState?.key === undefined) {
      return;
    }

    const rootSegment = segments[0];
    const inAuthGroup = rootSegment === "(auth)";
    const inOnboarding = rootSegment === "onboarding";

    if (session === null) {
      if (inOnboarding || inAuthGroup) {
        return;
      }

      void isAppIntroComplete().then((introDone) => {
        if (!introDone) {
          router.replace("/onboarding/student/1");
          return;
        }
        router.replace("/(auth)/sign-in");
      });
      return;
    }

    if (profile === null) {
      return;
    }

    if (inAuthGroup) {
      void resolvePostAuthRoute(profile).then((targetRoute) => {
        router.replace(targetRoute as Parameters<typeof router.replace>[0]);
      });
      return;
    }

    if (inOnboarding) {
      const homeRoute =
        profile.role === "student" ? "/(student)" : "/(driver)";
      router.replace(homeRoute as Parameters<typeof router.replace>[0]);
      return;
    }

    if (profile.role === "student" && rootSegment === "(driver)") {
      router.replace("/(student)");
      return;
    }

    if (profile.role === "driver" && rootSegment === "(student)") {
      router.replace("/(driver)");
    }
  }, [
    session,
    profile,
    isInitialized,
    isAppReady,
    navigationState?.key,
    segments,
    router,
  ]);
}

function RootLayout() {
  const [fontsLoaded, fontError] = useAppFonts();
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const session = useAuthStore((state) => state.session);
  const initialize = useAuthStore((state) => state.initialize);
  const syncSession = useAuthStore((state) => state.syncSession);
  const fontsReady = fontsLoaded || fontError !== null;
  const isAppReady = fontsReady && isInitialized;

  useEffect(() => {
    assertRequiredEnv();
    initSentry();
    initAnalytics();
    trackEvent({ name: "app_opened" });
  }, []);

  useEffect(() => {
    setSentryUser(session?.user.id ?? null);
  }, [session?.user.id]);

  useEffect(() => {
    return setupNotificationHandlers();
  }, []);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isInitialized || session === null) {
      return;
    }

    void registerForPushNotifications();
  }, [isInitialized, session]);

  useEffect(() => {
    if (USE_MOCK_DATA) {
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [syncSession]);

  useEffect(() => {
    if (isAppReady) {
      void SplashScreen.hideAsync();
    }
  }, [isAppReady]);

  useAuthNavigationGuard(isAppReady);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.container}>
        <QueryClientProvider client={queryClient}>
          <BottomSheetModalProvider>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }} />
          </BottomSheetModalProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

export default Sentry.wrap(RootLayout);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
