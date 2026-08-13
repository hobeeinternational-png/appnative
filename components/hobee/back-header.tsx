import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, type Href } from "expo-router";
import { useEffect } from "react";
import { BackHandler, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { HOBEE } from "@/components/hobee/design-tokens";
import { getBackRule, shouldShowBackHeader } from "@/lib/back-navigation";

export { getBackRule, shouldShowBackHeader } from "@/lib/back-navigation";

export function BackHeader({ routeName }: { routeName: string }) {
  const rule = getBackRule(routeName);
  const goBack = () => { if (router.canGoBack()) router.back(); else router.replace(rule.fallback as Href); };

  useEffect(() => {
    if (Platform.OS === "web") return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (router.canGoBack()) return false;
      router.replace(rule.fallback as Href);
      return true;
    });
    return () => subscription.remove();
  }, [rule.fallback]);

  return <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel={`ย้อนกลับจาก ${rule.title}`} onPress={goBack} style={({ pressed }) => [styles.back, pressed && styles.pressed]}><MaterialIcons name="arrow-back-ios-new" size={18} color={HOBEE.colors.ink} /></Pressable><Text numberOfLines={1} style={styles.title}>{rule.title}</Text></View>;
}

const styles = StyleSheet.create({ header: { height: 56, flexDirection: "row", alignItems: "center", gap: 3, borderBottomWidth: 1, borderBottomColor: "rgba(223,218,209,0.84)", backgroundColor: HOBEE.overlay.glass, paddingHorizontal: 12, ...HOBEE.elevation.surface }, back: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 19, backgroundColor: "rgba(255,255,255,0.8)" }, title: { flex: 1, color: HOBEE.colors.ink, fontSize: 16, fontWeight: "900" }, pressed: { opacity: 0.72, transform: [{ scale: HOBEE.motion.pressScale }] } });
