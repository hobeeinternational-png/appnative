import { Platform } from "react-native";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useLocale } from "@/contexts/locale-context";

export default function TabLayout() {
  const colors = useColors();
  const { t } = useLocale();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 8);
  const tabBarHeight = 58 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.muted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarLabelStyle: { fontWeight: "700", fontSize: 11 },
        tabBarStyle: {
          paddingTop: 7,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t("tab.home"), tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} /> }} />
      <Tabs.Screen name="shop" options={{ title: t("tab.shop"), tabBarIcon: ({ color }) => <IconSymbol size={24} name="bag.fill" color={color} /> }} />
      <Tabs.Screen name="discover" options={{ title: t("tab.discover"), tabBarIcon: ({ color }) => <IconSymbol size={24} name="safari.fill" color={color} /> }} />
      <Tabs.Screen name="account" options={{ title: t("tab.account"), tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.crop.circle" color={color} /> }} />
    </Tabs>
  );
}
