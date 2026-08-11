import { MaterialIcons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type NavItem = {
  key: "index" | "discover" | "shop" | "orders" | "account";
  icon: keyof typeof MaterialIcons.glyphMap;
  center?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { key: "index", icon: "home" },
  { key: "discover", icon: "explore" },
  { key: "shop", icon: "storefront", center: true },
  { key: "orders", icon: "calendar-today" },
  { key: "account", icon: "person-outline" },
];

export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const currentRoute = state.routes[state.index]?.name;

  const navigate = (key: NavItem["key"]) => {
    if (key === "orders") {
      router.push("/orders");
      return;
    }

    const route = state.routes.find((item) => item.name === key);
    if (!route) return;
    const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
    if (!event.defaultPrevented) navigation.navigate(key);
  };

  return (
    <View pointerEvents="box-none" style={[styles.container, { bottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.bar}>
        {NAV_ITEMS.map((item) => {
          const isActive = currentRoute === item.key;
          if (item.center) {
            return (
              <Pressable
                key={item.key}
                accessibilityRole="button"
                accessibilityLabel="เปิดร้าน HOBEE"
                onPress={() => navigate(item.key)}
                style={({ pressed }) => [styles.centerButton, pressed && styles.pressed]}
              >
                <Text style={styles.centerText}>HOBEE</Text>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityLabel={`เปิด ${item.key}`}
              onPress={() => navigate(item.key)}
              style={({ pressed }) => [styles.iconButton, isActive && styles.activeButton, pressed && styles.pressed]}
            >
              <MaterialIcons name={item.icon} size={28} color={isActive ? "#D6AC48" : "#D9D6D2"} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: "absolute", left: 20, right: 20, zIndex: 20 },
  bar: {
    height: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 38,
    paddingHorizontal: 10,
    backgroundColor: "#292725",
    shadowColor: "#161412",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 12,
  },
  iconButton: { width: 54, height: 54, alignItems: "center", justifyContent: "center", borderRadius: 27 },
  activeButton: { backgroundColor: "rgba(214, 172, 72, 0.18)" },
  centerButton: {
    width: 88,
    height: 88,
    marginTop: -32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 44,
    borderWidth: 5,
    borderColor: "#171513",
    backgroundColor: "#D6AC48",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  centerText: { color: "#1D1A18", fontSize: 17, fontWeight: "900", letterSpacing: -0.7 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.96 }] },
});
