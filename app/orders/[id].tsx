import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";

import { HOBEE } from "@/components/hobee/design-tokens";
import { BackHeader, InfoRow, OrderTimeline, StatusChip, StickyBottomCTA, SummaryRow } from "@/components/hobee/commerce-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useToast } from "@/contexts/toast-context";
import { confirmOrderReceived } from "@/lib/after-sales";
import { customerLifecycleLabel, getCustomerOrderActions, resolveCustomerLifecycle } from "@/lib/customer-journey";
import { formatThaiBaht } from "@/lib/hobee-data";
import { getMyOrder, listOrderShipments, paymentStatusLabel, type HobeeOrder, type Shipment } from "@/lib/orders";

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { showToast } = useToast();
  const [order, setOrder] = useState<HobeeOrder | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    void Promise.all([getMyOrder(id), listOrderShipments(id)])
      .then(([nextOrder, nextShipments]) => { setOrder(nextOrder); setShipments(nextShipments); })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "ไม่สามารถอ่านคำสั่งซื้อได้"));
  }, [id]);

  const journey = useMemo(() => order ? resolveCustomerLifecycle({ orderStatus: order.status, paymentStatus: order.payment_status, customerReceivedAt: order.customer_received_at, shipmentStatuses: shipments.map((shipment) => shipment.status), hasOpenCase: false }) : null, [order, shipments]);
  const actions = useMemo(() => order ? getCustomerOrderActions({ orderStatus: order.status, paymentStatus: order.payment_status, customerReceivedAt: order.customer_received_at, shipmentStatuses: shipments.map((shipment) => shipment.status), hasOpenCase: false }) : [], [order, shipments]);

  const confirmReceived = () => Alert.alert("ยืนยันว่าได้รับสินค้าแล้ว", "คุณได้รับสินค้าเรียบร้อยแล้วใช่หรือไม่? หลังยืนยัน คุณสามารถเขียนรีวิวหรือซื้อซ้ำได้", [
    { text: "ยังไม่ยืนยัน", style: "cancel" },
    { text: "ยืนยันได้รับสินค้า", onPress: () => { void (async () => { setConfirming(true); try { const receivedAt = await confirmOrderReceived(id); setOrder((current) => current ? { ...current, customer_received_at: receivedAt } : current); showToast("บันทึกการยืนยันรับสินค้าแล้ว"); } catch (cause) { showToast(cause instanceof Error ? cause.message : "ไม่สามารถยืนยันรับสินค้าได้", "error"); } finally { setConfirming(false); } })(); } },
  ]);

  if (!order && !error) return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="items-center justify-center"><ActivityIndicator color={HOBEE.colors.gold} size="large" /></ScreenContainer>;
  if (error) return <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-[#F8F7F5]" className="px-5" safeAreaClassName="pt-3"><BackHeader title="รายละเอียดคำสั่งซื้อ" onBack={() => router.back()} /><View style={styles.error}><Text style={styles.errorText}>{error}</Text></View></ScreenContainer>;
  if (!order) return null;
  const deliveryActive = ["shipped", "in_transit", "out_for_delivery", "delivered", "completed"].includes(journey!);

  return <View style={styles.root}><ScreenContainer edges={["top", "left", "right"]} containerClassName="bg-[#F8F7F5]" className="px-5" safeAreaClassName="pt-3"><BackHeader title="รายละเอียดคำสั่งซื้อ" subtitle={order.order_number} onBack={() => router.back()} /><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
    <View style={styles.hero}><View><Text style={styles.heroLabel}>ยอดคำสั่งซื้อ</Text><Text style={styles.heroTotal}>{formatThaiBaht(order.total)}</Text><Text style={styles.heroDate}>{new Date(order.created_at).toLocaleString("th-TH")}</Text></View><StatusChip status={journey!} label={customerLifecycleLabel(journey!)} /></View>
    <Section title="สถานะคำสั่งซื้อ"><OrderTimeline steps={[{ label: "สร้างคำสั่งซื้อ", value: "รับคำสั่งซื้อแล้ว", active: true }, { label: "การชำระเงิน", value: paymentStatusLabel(order.payment_status), active: order.payment_status === "paid" }, { label: "กำลังเตรียมสินค้า", value: journey === "processing" ? "กำลังจัดเตรียม" : "รอการดำเนินการ", active: ["processing", "shipped", "in_transit", "out_for_delivery", "delivered", "completed"].includes(journey!) }, { label: "การจัดส่ง", value: deliveryActive ? customerLifecycleLabel(journey!) : "รอผู้ขายจัดส่ง", active: deliveryActive, last: true }]} /></Section>
    <Section title="การจัดส่ง"><View style={styles.card}><InfoRow icon="local-shipping" label={shipments.length ? `${shipments.length} รายการจัดส่ง` : "พัสดุ"} value={shipments.length ? "ดูเลขติดตามและสถานะล่าสุด" : "ผู้ขายจะเพิ่มเลขติดตามหลังส่งสินค้า"} onPress={shipments.length ? () => router.push(`/orders/${id}/delivery` as never) : undefined} /></View></Section>
    {journey === "completed" ? <Section title="ได้รับสินค้าแล้ว"><View style={styles.actionGrid}><Action icon="rate-review" title="ให้คะแนนสินค้า" detail="รีวิวแยกตามสินค้า" onPress={() => showToast("เลือกสินค้าที่ต้องการรีวิวจากคำสั่งซื้อนี้", "info")} /><Action icon="shopping-bag" title="ซื้ออีกครั้ง" detail="ตรวจราคาและสต็อกปัจจุบัน" onPress={() => router.push(`/orders/${id}/buy-again` as never)} /><Action icon="help-outline" title="แจ้งปัญหา" detail="ติดตามคำร้องได้ในแอป" onPress={() => router.push(`/orders/${id}/help` as never)} /><Action icon="storefront" title="ดูร้านค้า" detail="เข้าดูสินค้าล่าสุด" onPress={() => showToast("เลือกสินค้าในคำสั่งซื้อเพื่อดูร้านค้า", "info")} /></View></Section> : null}
    <Section title="สรุปการชำระเงิน"><View style={styles.summary}><SummaryRow label="ยอดคำสั่งซื้อ" value={formatThaiBaht(order.total)} emphasis /><SummaryRow label="สถานะการชำระเงิน" value={paymentStatusLabel(order.payment_status)} /></View></Section>
  </ScrollView></ScreenContainer>
  {actions.includes("confirm_received") ? <StickyBottomCTA primaryLabel={confirming ? "กำลังบันทึก…" : "ยืนยันว่าได้รับสินค้าแล้ว"} primaryDisabled={confirming} onPrimary={confirmReceived} secondaryLabel="แจ้งปัญหา" onSecondary={() => router.push(`/orders/${id}/help` as never)} /> : actions.includes("track") ? <StickyBottomCTA primaryLabel="ติดตามพัสดุ" onPrimary={() => router.push(`/orders/${id}/delivery` as never)} secondaryLabel="แจ้งปัญหา" onSecondary={() => router.push(`/orders/${id}/help` as never)} /> : actions.includes("get_help") ? <StickyBottomCTA primaryLabel="ต้องการความช่วยเหลือ" onPrimary={() => router.push(`/orders/${id}/help` as never)} /> : null}</View>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) { return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>; }
function Action({ icon, title, detail, onPress }: { icon: keyof typeof MaterialIcons.glyphMap; title: string; detail: string; onPress: () => void }) { return <Pressable onPress={onPress} style={({ pressed }) => [styles.action, pressed && styles.pressed]}><MaterialIcons name={icon} size={22} color={HOBEE.colors.botanical} /><Text style={styles.actionTitle}>{title}</Text><Text style={styles.actionDetail}>{detail}</Text></Pressable>; }
const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: HOBEE.colors.canvas }, content: { paddingBottom: 136 }, hero: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", borderRadius: 24, backgroundColor: HOBEE.colors.nav, padding: 19 }, heroLabel: { color: "#D8D4CF", fontSize: 12, fontWeight: "700" }, heroTotal: { marginTop: 5, color: "#FFFFFF", fontSize: 29, fontWeight: "900" }, heroDate: { marginTop: 6, color: "#D8D4CF", fontSize: 11, fontWeight: "600" }, section: { marginTop: 24 }, sectionTitle: { marginBottom: 10, color: HOBEE.colors.ink, fontSize: 18, fontWeight: "900" }, card: { borderRadius: 22, borderWidth: 1, borderColor: HOBEE.colors.border, backgroundColor: HOBEE.colors.surface, paddingHorizontal: 14 }, summary: { borderRadius: 22, borderWidth: 1, borderColor: HOBEE.colors.border, backgroundColor: HOBEE.colors.surface, padding: 16 }, actionGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 }, action: { width: "48.5%", minHeight: 110, borderRadius: 20, borderWidth: 1, borderColor: HOBEE.colors.border, backgroundColor: HOBEE.colors.surface, padding: 13 }, actionTitle: { marginTop: 9, color: HOBEE.colors.ink, fontSize: 14, fontWeight: "900" }, actionDetail: { marginTop: 3, color: HOBEE.colors.muted, fontSize: 11, lineHeight: 15, fontWeight: "600" }, error: { borderRadius: 22, backgroundColor: "#FFE8E4", padding: 16 }, errorText: { color: "#B65045", fontWeight: "900" }, pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] } });
