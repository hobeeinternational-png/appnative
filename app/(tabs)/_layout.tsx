import { Platform } from "react-native";
import { Tabs } from "expo-router";
import { useLocale } from "@/contexts/locale-context";
import { FloatingTabBar } from "@/components/hobee/floating-tab-bar";

export default function TabLayout() {
  const { t } = useLocale();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          height: 0,
          borderTopWidth: 0,
          backgroundColor: "transparent",
          elevation: 0,
        },
      }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: t("tab.home") }} />
      <Tabs.Screen name="shop" options={{ title: t("tab.shop") }} />
      <Tabs.Screen name="discover" options={{ title: t("tab.discover") }} />
      <Tabs.Screen name="account" options={{ title: t("tab.account") }} />
    </Tabs>
  );
}
