import { Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export const HOBEE_LOGIN_HERO_URL = "/manus-storage/hobee-login-hero_b8bbfc32.png";

export function AuthHero({ onHome }: { onHome: () => void }) {
  return (
    <View style={styles.hero}>
      <Image source={{ uri: HOBEE_LOGIN_HERO_URL }} resizeMode="cover" style={styles.image} />
      <View style={styles.wash} />
      <View style={styles.controls}>
        <Pressable accessibilityRole="button" accessibilityLabel="ภาษาไทย" style={({ pressed }) => [styles.language, pressed && styles.pressed]}>
          <Text style={styles.flag}>🇹🇭</Text><Text style={styles.languageText}>TH</Text><MaterialIcons name="keyboard-arrow-down" size={18} color="#315132" />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="กลับหน้าหลัก" onPress={onHome} style={({ pressed }) => [styles.home, pressed && styles.pressed]}>
          <MaterialIcons name="home" size={22} color="#315132" />
        </Pressable>
      </View>
      <View style={styles.curve} />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: 352, backgroundColor: "#F3DFC3", overflow: "hidden" }, image: { ...StyleSheet.absoluteFillObject, height: "100%", width: "100%" }, wash: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(255,246,230,0.12)" }, controls: { position: "absolute", top: Platform.OS === "web" ? 24 : 56, left: 25, right: 25, flexDirection: "row", justifyContent: "space-between" }, language: { height: 47, paddingHorizontal: 13, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.94)", flexDirection: "row", alignItems: "center", gap: 6, shadowColor: "#6B5130", shadowOpacity: 0.12, shadowRadius: 11, shadowOffset: { width: 0, height: 5 }, elevation: 3 }, flag: { fontSize: 20 }, languageText: { fontSize: 15, color: "#315132", fontWeight: "800" }, home: { height: 47, width: 47, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.94)", alignItems: "center", justifyContent: "center", shadowColor: "#6B5130", shadowOpacity: 0.12, shadowRadius: 11, shadowOffset: { width: 0, height: 5 }, elevation: 3 }, curve: { height: 68, position: "absolute", bottom: -38, left: -36, right: -36, backgroundColor: "#FFFDFC", borderTopLeftRadius: 220, borderTopRightRadius: 220 }, pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});
