import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppStatusState } from "@/components/hobee/error-screens";
import { HOBEE } from "@/components/hobee/design-tokens";
import { MyHobeeHeader } from "@/components/hobee/my-hobee-ui";
import { ScreenContainer } from "@/components/screen-container";
import { goBackOr } from "@/lib/back-navigation";

const HELP_TOPICS = [
  { icon: "local-shipping", title: "คำสั่งซื้อและการจัดส่ง", detail: "ติดตามสถานะ การรับสินค้า และขอความช่วยเหลือหลังการขาย", route: "/orders" },
  { icon: "support-agent", title: "คืนสินค้า คืนเงิน และเคส", detail: "เปิดเคสหรือติดตามคำขอที่ส่งไว้", route: "/claims" },
  { icon: "account-balance-wallet", title: "การชำระเงินและ Rewards", detail: "ดูข้อมูลการชำระเงิน คะแนน คูปอง และสิทธิประโยชน์", route: "/rewards" },
  { icon: "person-outline", title: "บัญชีและความเป็นส่วนตัว", detail: "จัดการข้อมูลส่วนตัว การเข้าสู่ระบบ และสิทธิ์", route: "/(tabs)/account" },
];

export default function SupportCenterScreen() {
  return <ScreenContainer edges={["top", "left", "right", "bottom"]} containerClassName="bg-background"><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><MyHobeeHeader title="HELP CENTER" onBack={() => goBackOr(router, "/(tabs)/account")} /><View style={styles.hero}><Text style={styles.title}>เราช่วยอะไรคุณได้บ้าง?</Text><Text style={styles.subtitle}>เลือกหัวข้อเพื่อไปยังส่วนที่เกี่ยวข้อง หรือเปิดเคสหลังการขายจากคำสั่งซื้อของคุณ</Text></View><View style={styles.topicList}>{HELP_TOPICS.map((item) => <Pressable key={item.title} onPress={() => router.push(item.route as never)} style={({ pressed }) => [styles.topic, pressed && styles.pressed]}><View style={styles.topicIcon}><MaterialIcons name={item.icon as keyof typeof MaterialIcons.glyphMap} size={21} color={HOBEE.colors.goldDark} /></View><View style={styles.topicCopy}><Text style={styles.topicTitle}>{item.title}</Text><Text style={styles.topicDetail}>{item.detail}</Text></View><MaterialIcons name="chevron-right" size={22} color={HOBEE.colors.muted} /></Pressable>)}</View><View style={styles.contact}><AppStatusState icon="forum" tone="green" title="ช่องทางติดต่อ" description="Live chat และช่องทางติดต่อโดยเจ้าหน้าที่จะแสดงที่นี่เมื่อ Support integration ได้รับการเปิดใช้" /></View></ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { gap: HOBEE.space.loose, paddingBottom: 42 }, hero: { gap: 7, marginHorizontal: HOBEE.space.page, borderRadius: HOBEE.radius.hero, backgroundColor: HOBEE.atmosphere.warmCream, padding: HOBEE.space.page }, title: { color: HOBEE.colors.ink, fontSize: 22, fontWeight: "900" }, subtitle: { color: HOBEE.colors.muted, fontSize: 12, fontWeight: "600", lineHeight: 18 }, topicList: { gap: 9, paddingHorizontal: HOBEE.space.page }, topic: { flexDirection: "row", alignItems: "center", gap: 11, borderRadius: HOBEE.radius.card, backgroundColor: HOBEE.colors.surface, padding: 13, ...HOBEE.elevation.surface }, topicIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: HOBEE.atmosphere.warmCream }, topicCopy: { flex: 1, gap: 3 }, topicTitle: { color: HOBEE.colors.ink, fontSize: 13, fontWeight: "900" }, topicDetail: { color: HOBEE.colors.muted, fontSize: 10, fontWeight: "600", lineHeight: 15 }, contact: { marginTop: 6, marginHorizontal: HOBEE.space.page, borderRadius: HOBEE.radius.hero, backgroundColor: HOBEE.atmosphere.botanicalMist }, pressed: { opacity: 0.78, transform: [{ scale: HOBEE.motion.pressScale }] } });
