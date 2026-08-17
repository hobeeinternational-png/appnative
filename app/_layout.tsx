import "@/global.css";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { Platform } from "react-native";
import "@/lib/_core/nativewind-pressable";
import { ThemeProvider } from "@/lib/theme-provider";
import {
  SafeAreaFrameContext,
  SafeAreaInsetsContext,
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import type { EdgeInsets, Metrics, Rect } from "react-native-safe-area-context";

import { trpc, createTRPCClient } from "@/lib/trpc";
import { initManusRuntime, subscribeSafeAreaInsets } from "@/lib/_core/manus-runtime";
import { CartProvider } from "@/contexts/cart-context";
import { FoodCartProvider } from "../contexts/food-cart-context";
import { FoodPreferencesProvider } from "../contexts/food-preferences-context";
import { LearningLibraryProvider } from "../contexts/learning-library-context";
import { CommunityPreferencesProvider } from "../contexts/community-preferences-context";
import { LocaleProvider } from "@/contexts/locale-context";
import { ToastProvider } from "@/contexts/toast-context";
import { SupabaseAuthProvider } from "@/contexts/supabase-auth-context";
import { NotificationBootstrap } from "@/components/notification-bootstrap";
import { BackHeader, shouldShowBackHeader } from "@/components/hobee/back-header";

const DEFAULT_WEB_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };
const DEFAULT_WEB_FRAME: Rect = { x: 0, y: 0, width: 0, height: 0 };

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const [iconFontLoaded, iconFontError] = useFonts(MaterialIcons.font);
  const initialInsets = initialWindowMetrics?.insets ?? DEFAULT_WEB_INSETS;
  const initialFrame = initialWindowMetrics?.frame ?? DEFAULT_WEB_FRAME;

  const [insets, setInsets] = useState<EdgeInsets>(initialInsets);
  const [frame, setFrame] = useState<Rect>(initialFrame);

  // Initialize Manus runtime for cookie injection from parent container
  useEffect(() => {
    initManusRuntime();
  }, []);

  const handleSafeAreaUpdate = useCallback((metrics: Metrics) => {
    setInsets((current) => current.top === metrics.insets.top && current.right === metrics.insets.right && current.bottom === metrics.insets.bottom && current.left === metrics.insets.left ? current : metrics.insets);
    setFrame((current) => current.x === metrics.frame.x && current.y === metrics.frame.y && current.width === metrics.frame.width && current.height === metrics.frame.height ? current : metrics.frame);
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const unsubscribe = subscribeSafeAreaInsets(handleSafeAreaUpdate);
    return () => unsubscribe();
  }, [handleSafeAreaUpdate]);

  // Create clients once and reuse them
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Disable automatic refetching on window focus for mobile
            refetchOnWindowFocus: false,
            // Retry failed requests once
            retry: 1,
          },
        },
      }),
  );
  const [trpcClient] = useState(() => createTRPCClient());

  // Ensure minimum 8px padding for top and bottom on mobile
  const providerInitialMetrics = useMemo(() => {
    const metrics = initialWindowMetrics ?? { insets: initialInsets, frame: initialFrame };
    return {
      ...metrics,
      insets: {
        ...metrics.insets,
        top: Math.max(metrics.insets.top, 16),
        bottom: Math.max(metrics.insets.bottom, 12),
      },
    };
  }, [initialInsets, initialFrame]);

  const content = (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <LocaleProvider>
            <SupabaseAuthProvider>
              <NotificationBootstrap>
                <ToastProvider>
                  <CartProvider>
                  <FoodCartProvider>
                  <FoodPreferencesProvider>
                  <LearningLibraryProvider>
                  <CommunityPreferencesProvider>
                <Stack screenOptions={({ route }) => ({ headerShown: shouldShowBackHeader(route.name), header: () => <BackHeader routeName={route.name} /> })}>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="auth" options={{ headerShown: false }} />
                  <Stack.Screen name="auth/forgot-password" options={{ headerShown: false }} />
                  <Stack.Screen name="auth/reset-password" options={{ headerShown: false }} />
                  <Stack.Screen name="oauth/callback" options={{ headerShown: false }} />
                  <Stack.Screen name="payment/callback" options={{ headerShown: false }} />
                  <Stack.Screen name="my-hobee" options={{ headerShown: false }} />
                  <Stack.Screen name="my-hobee/after-sales" options={{ headerShown: false }} />
                  <Stack.Screen name="my-hobee/notifications" options={{ headerShown: false }} />
                  <Stack.Screen name="my-hobee/notification-preferences" options={{ headerShown: false }} />
                  <Stack.Screen name="my-hobee/earnings" options={{ headerShown: false }} />
                  <Stack.Screen name="my-hobee/workspaces" options={{ headerShown: false }} />
                  <Stack.Screen name="workspace" options={{ headerShown: false }} />
                  <Stack.Screen name="organization" options={{ headerShown: false }} />
                  <Stack.Screen name="seller" options={{ headerShown: false }} />
                  <Stack.Screen name="hospitality" options={{ headerShown: false }} />
                  <Stack.Screen name="creative" options={{ headerShown: false }} />
                  <Stack.Screen name="field-service" options={{ headerShown: false }} />
                  <Stack.Screen name="employee" options={{ headerShown: false }} />
                  <Stack.Screen name="support" options={{ headerShown: false }} />
                  <Stack.Screen name="community" options={{ headerShown: false }} />
                  <Stack.Screen name="community/search" options={{ headerShown: false }} />
                  <Stack.Screen name="community/topics/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="community/stories" options={{ headerShown: false }} />
                  <Stack.Screen name="community/create" options={{ headerShown: false }} />
                  <Stack.Screen name="community/clubs" options={{ headerShown: false }} />
                  <Stack.Screen name="community/clubs/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="community/clubs/create" options={{ headerShown: false }} />
                  <Stack.Screen name="community/activities" options={{ headerShown: false }} />
                  <Stack.Screen name="community/activities/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="community/activities/create" options={{ headerShown: false }} />
                  <Stack.Screen name="community/my-activities" options={{ headerShown: false }} />
                  <Stack.Screen name="community/jobs" options={{ headerShown: false }} />
                  <Stack.Screen name="community/jobs/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="community/trips" options={{ headerShown: false }} />
                  <Stack.Screen name="community/people/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="community/profile" options={{ headerShown: false }} />
                  <Stack.Screen name="community/profile/network" options={{ headerShown: false }} />
                  <Stack.Screen name="community/profile/privacy" options={{ headerShown: false }} />
                  <Stack.Screen name="community/moderation" options={{ headerShown: false }} />
                  <Stack.Screen name="stores" options={{ headerShown: false }} />
                  <Stack.Screen name="stores/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="stores/saved" options={{ headerShown: false }} />
                  <Stack.Screen name="stores/[id]/preorder" options={{ headerShown: false }} />
                  <Stack.Screen name="stores/orders/[reference]" options={{ headerShown: false }} />
                  <Stack.Screen name="stores/orders/[reference]/review" options={{ headerShown: false }} />
                  <Stack.Screen name="travel/my-trips" options={{ headerShown: false }} />
                  <Stack.Screen name="travel/bookings/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="travel/review/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="travel/visitor" options={{ headerShown: false }} />
                  <Stack.Screen name="travel/search" options={{ headerShown: false }} />
                  <Stack.Screen name="travel/safety" options={{ headerShown: false }} />
                  <Stack.Screen name="travel/food/cart" options={{ headerShown: false }} />
                  <Stack.Screen name="travel/food/review/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="travel/food/reservation/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="travel/food/reservation/success/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="travel/food/queue/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="travel/food/orders" options={{ headerShown: false }} />
                  <Stack.Screen name="travel/food/orders/[reference]" options={{ headerShown: false }} />
                  <Stack.Screen name="travel/food/reservations" options={{ headerShown: false }} />
                  <Stack.Screen name="travel/food/saved" options={{ headerShown: false }} />
                  <Stack.Screen name="travel/food/map" options={{ headerShown: false }} />
                  <Stack.Screen name="travel/food/search" options={{ headerShown: false }} />
                  <Stack.Screen name="travel/food/collections" options={{ headerShown: false }} />
                  <Stack.Screen name="travel/food/safety" options={{ headerShown: false }} />
                  <Stack.Screen name="restaurant-merchant" options={{ headerShown: false }} />
                  <Stack.Screen name="learning/catalogue" options={{ headerShown: false }} />
                  <Stack.Screen name="learning/search" options={{ headerShown: false }} />
                  <Stack.Screen name="learning/category/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="learning/membership" options={{ headerShown: false }} />
                  <Stack.Screen name="learning/teacher/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="learning/events" options={{ headerShown: false }} />
                  <Stack.Screen name="learning/events/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="learning/events/booking/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="learning/events/success/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="learning/events/ticket/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="learning/calendar" options={{ headerShown: false }} />
                  <Stack.Screen name="learning/live/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="learning/sessions/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="notification/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="admin/workspace/[workspace]" options={{ headerShown: false }} />
                  <Stack.Screen name="admin/role-approvals" options={{ headerShown: false }} />
                  <Stack.Screen name="admin/after-sales" options={{ headerShown: false }} />
                  <Stack.Screen name="admin/after-sales/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="orders/[id]/delivery" options={{ headerShown: false }} />
                  <Stack.Screen name="orders/[id]/buy-again" options={{ headerShown: false }} />
                  <Stack.Screen name="orders/[id]/help" options={{ headerShown: false }} />
                  <Stack.Screen name="claims" options={{ headerShown: false }} />
                  <Stack.Screen name="claims/[id]" options={{ headerShown: false }} />
                </Stack>
                <StatusBar style="dark" translucent backgroundColor="#F6F6F4" />
                  </CommunityPreferencesProvider>
                  </LearningLibraryProvider>
                  </FoodPreferencesProvider>
                  </FoodCartProvider>
                  </CartProvider>
                </ToastProvider>
              </NotificationBootstrap>
            </SupabaseAuthProvider>
          </LocaleProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </GestureHandlerRootView>
  );

  const shouldOverrideSafeArea = Platform.OS === "web";

  // Keep vector icons from rendering as empty glyphs while the font is being restored after a Metro reload.
  if (!iconFontLoaded && !iconFontError) return null;

  if (shouldOverrideSafeArea) {
    return (
      <ThemeProvider>
        <SafeAreaProvider initialMetrics={providerInitialMetrics}>
          <SafeAreaFrameContext.Provider value={frame}>
            <SafeAreaInsetsContext.Provider value={insets}>
              {content}
            </SafeAreaInsetsContext.Provider>
          </SafeAreaFrameContext.Provider>
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider initialMetrics={providerInitialMetrics}>{content}</SafeAreaProvider>
    </ThemeProvider>
  );
}
