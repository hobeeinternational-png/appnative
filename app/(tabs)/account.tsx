import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import { BrandMark } from "@/components/hobee/brand-mark";
import { ScreenContainer } from "@/components/screen-container";
import { useLocale } from "@/contexts/locale-context";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { useToast } from "@/contexts/toast-context";

const accountItems = [
  { icon: "receipt-long", title: "คำสั่งซื้อของฉัน", subtitle: "ติดตามสถานะและประวัติการสั่งซื้อ", route: "/orders" },
  { icon: "location-on", title: "ที่อยู่จัดส่ง", subtitle: "เพิ่มและจัดการที่อยู่ของคุณ", route: "/checkout/address" },
  { icon: "card-giftcard", title: "HOBEE Rewards", subtitle: "คูปองและสิทธิพิเศษสำหรับคุณ", route: "/rewards" },
  { icon: "help-outline", title: "ช่วยเหลือ", subtitle: "ติดต่อเราและคำถามที่พบบ่อย", route: "/auth" },
] as const;

export default function AccountScreen() {
  const { locale, setLocale, t } = useLocale();
  const { user, loading, signOut } = useSupabaseAuth();
  const { showToast } = useToast();

  const signOutUser = async () => {
    try {
      await signOut();
      showToast("ออกจากระบบแล้ว", "info");
    } catch {
      showToast("ไม่สามารถออกจากระบบได้ กรุณาลองอีกครั้ง", "error");
    }
  };
  return (
    <ScreenContainer className="px-5" safeAreaClassName="pt-3">
      <View className="mb-7">
        <BrandMark />
      </View>
      <View className="rounded-[26px] bg-[#17352A] p-5">
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary">
          <MaterialIcons name="person-outline" size={27} color="#FFFFFF" />
        </View>
        <Text className="mt-5 text-2xl font-black text-white">{user ? "ยินดีต้อนรับกลับ" : "สวัสดีครับ"}</Text>
        <Text className="mt-1 text-sm leading-5 text-white/70">{user?.email ?? "เข้าสู่ระบบเพื่อดูคำสั่งซื้อ สะสมคะแนน และรับสิทธิพิเศษจาก HOBEE"}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: loading }}
          disabled={loading}
          onPress={() => user ? void signOutUser() : router.push("/auth")}
          style={({ pressed }) => [styles.signIn, pressed && styles.pressed]}
        >
          <Text className="font-bold text-[#17352A]">{user ? "ออกจากระบบ" : "เข้าสู่ระบบ / สมัครสมาชิก"}</Text>
          <MaterialIcons name={user ? "logout" : "arrow-forward"} size={18} color="#17352A" />
        </Pressable>
      </View>

      <Text className="mb-3 mt-7 text-base font-black text-foreground">บัญชีและการช่วยเหลือ</Text>
      <View className="overflow-hidden rounded-2xl border border-border bg-surface">
        {accountItems.map((item, index) => (
          <Pressable
            key={item.title}
            accessibilityRole="button"
            onPress={() => router.push((user ? item.route : "/auth") as never)}
            style={({ pressed }) => [styles.row, index < accountItems.length - 1 && styles.rowBorder, pressed && styles.rowPressed]}
          >
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#F5EBCF]">
              <MaterialIcons name={item.icon} size={21} color="#17352A" />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-foreground">{item.title}</Text>
              <Text numberOfLines={1} className="mt-0.5 text-xs text-muted">{item.subtitle}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color="#8A978E" />
          </Pressable>
        ))}
      </View>
      <View className="mt-4 flex-row items-center justify-between rounded-2xl border border-border bg-surface p-3">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#F5EBCF]">
            <MaterialIcons name="language" size={21} color="#17352A" />
          </View>
          <Text className="font-bold text-foreground">{t("language.title")}</Text>
        </View>
        <View className="flex-row rounded-xl bg-[#F3F0E8] p-1">
          {(["th", "en"] as const).map((option) => {
            const active = option === locale;
            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={option === "th" ? "เลือกภาษาไทย" : "Choose English"}
                onPress={() => setLocale(option)}
                style={({ pressed }) => [styles.localeOption, active && styles.localeOptionActive, pressed && styles.rowPressed]}
              >
                <Text className={`text-xs font-bold ${active ? "text-white" : "text-muted"}`}>{t(`language.${option}`)}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <Text className="mt-6 text-center text-xs leading-5 text-muted">HOBEE Mobile รุ่นเริ่มต้นสำหรับการค้นพบและเลือกซื้อของดีจากชุมชน</Text>
      {user ? <Pressable onPress={() => router.push("/admin")} style={({ pressed }) => [styles.adminLink, pressed && styles.rowPressed]}><MaterialIcons name="admin-panel-settings" size={18} color="#617266" /><Text className="text-xs font-bold text-muted">HOBEE Admin Center</Text></Pressable> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  signIn: { flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 8, marginTop: 20, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#FFFFFF" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#E8E0D0" },
  pressed: { opacity: 0.8, transform: [{ scale: 0.985 }] },
  rowPressed: { opacity: 0.66 },
  localeOption: { borderRadius: 9, paddingHorizontal: 10, paddingVertical: 7 },
  localeOptionActive: { backgroundColor: "#17352A" },
  adminLink: { flexDirection: "row", alignSelf: "center", alignItems: "center", gap: 6, marginTop: 12, padding: 8 },
});
