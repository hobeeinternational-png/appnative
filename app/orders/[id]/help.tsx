import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { BackHeader } from "@/components/hobee/commerce-ui";
import { HOBEE } from "@/components/hobee/design-tokens";
import { ScreenContainer } from "@/components/screen-container";
import { listOrderItemsForAfterSales, type OrderItemForAfterSales } from "@/lib/after-sales";

const reasons = [
  ["damaged", "สินค้าเสียหายหรือรั่ว", "refund, partial refund หรือ replacement"],
  ["missing_item", "สินค้าไม่ครบ", "ส่งสินค้าเพิ่มหรือคืนเงินบางส่วน"],
  ["wrong_item", "ได้รับสินค้าผิด", "replacement หรือ return and refund"],
  ["delivery_missing", "พัสดุไม่ถึง / สถานะผิดปกติ", "ตรวจสอบการจัดส่ง"],
  ["return_request", "ต้องการคืนสินค้า", "ตรวจสอบเงื่อนไขการคืนสินค้า"],
  ["other", "เรื่องอื่น ๆ", "บอกเราเพิ่มเติมได้"],
] as const;

export default function OrderHelpScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); const [items, setItems] = useState<OrderItemForAfterSales[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { void listOrderItemsForAfterSales(id).then(setItems).catch(() => setItems([])).finally(() => setLoading(false)); }, [id]);
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-[#F8F7F5]" className="px-5" safeAreaClassName="pt-3"><BackHeader title="ช่วยเหลือคำสั่งซื้อ" subtitle="เลือกปัญหาที่ต้องการแจ้ง" onBack={() => router.back()} />{loading ? <View style={styles.center}><ActivityIndicator color={HOBEE.colors.gold} size="large" /></View> : <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><View style={styles.notice}><MaterialIcons name="support-agent" size={23} color={HOBEE.colors.botanical} /><Text style={styles.noticeText}>ทีม HOBEE จะตรวจสอบคำร้องจากข้อมูลคำสั่งซื้อและหลักฐานที่คุณส่ง</Text></View><Text style={styles.label}>เลือกสินค้า</Text>{items.map((item) => <View key={item.id} style={styles.item}><Text style={styles.itemName}>{item.product_name}</Text><Text style={styles.itemDetail}>จำนวน {item.quantity} ชิ้น</Text>{reasons.map(([type, title, detail]) => <Pressable key={type} onPress={() => router.push({ pathname: "/claims/new" as never, params: { orderId: id, itemId: item.id, type } } as never)} style={({ pressed }) => [styles.reason, pressed && styles.pressed]}><View style={styles.reasonCopy}><Text style={styles.reasonTitle}>{title}</Text><Text style={styles.reasonDetail}>{detail}</Text></View><MaterialIcons name="chevron-right" size={22} color={HOBEE.colors.muted} /></Pressable>)}</View>)}{!items.length ? <Text style={styles.empty}>ไม่พบรายการสินค้าในคำสั่งซื้อนี้</Text> : null}<Pressable onPress={() => router.push("/claims" as never)} style={({ pressed }) => [styles.cases, pressed && styles.pressed]}><MaterialIcons name="assignment" size={20} color={HOBEE.colors.botanical} /><Text style={styles.casesText}>ติดตามคำร้องของฉัน</Text></Pressable></ScrollView>}</ScreenContainer>;
}
const styles = StyleSheet.create({ center: { flex: 1, alignItems: "center", justifyContent: "center" }, content: { paddingBottom: 30 }, notice: { flexDirection: "row", gap: 10, borderRadius: 19, backgroundColor: "#E2F7EE", padding: 14 }, noticeText: { flex: 1, color: HOBEE.colors.botanical, fontSize: 13, lineHeight: 19, fontWeight: "700" }, label: { marginTop: 22, color: HOBEE.colors.ink, fontSize: 18, fontWeight: "900" }, item: { marginTop: 10, borderRadius: 22, borderWidth: 1, borderColor: HOBEE.colors.border, backgroundColor: HOBEE.colors.surface, padding: 14 }, itemName: { color: HOBEE.colors.ink, fontSize: 15, fontWeight: "900" }, itemDetail: { marginTop: 3, marginBottom: 6, color: HOBEE.colors.muted, fontSize: 12, fontWeight: "600" }, reason: { flexDirection: "row", alignItems: "center", gap: 8, borderTopWidth: 1, borderTopColor: HOBEE.colors.border, paddingVertical: 12 }, reasonCopy: { flex: 1 }, reasonTitle: { color: HOBEE.colors.ink, fontSize: 13, fontWeight: "800" }, reasonDetail: { marginTop: 2, color: HOBEE.colors.muted, fontSize: 11, lineHeight: 15 }, cases: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 20, borderRadius: 17, borderWidth: 1, borderColor: HOBEE.colors.border, backgroundColor: HOBEE.colors.surface, paddingVertical: 14 }, casesText: { color: HOBEE.colors.botanical, fontSize: 14, fontWeight: "900" }, empty: { marginTop: 20, color: HOBEE.colors.muted, textAlign: "center" }, pressed: { opacity: 0.8 } });
