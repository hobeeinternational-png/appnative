import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AdminCard, AdminCardTitle, AdminPortalShell, type AdminWorkspace } from "@/components/admin/admin-portal-ui";
import { HOBEE } from "@/components/hobee/design-tokens";
import { ScreenContainer } from "@/components/screen-container";
import { useToast } from "@/contexts/toast-context";
import { useAdmin } from "@/hooks/use-admin";
import { updateAdminOrderStatus } from "@/lib/admin";
import { formatThaiBaht } from "@/lib/hobee-data";
import { orderStatusLabel, paymentStatusLabel } from "@/lib/orders";

function navigate(workspace: AdminWorkspace) {
  if (workspace === "overview") router.push("/admin");
  else if (workspace === "products") router.push("/admin/products" as any);
  else if (workspace === "travel") router.push("/admin/travel" as any);
  else if (workspace === "orders") router.replace("/admin/orders");
  else router.push({ pathname: "/admin/products" as any, params: { filter: "low-stock" } });
}

const transition: Record<string, { label: string; next: "confirmed" | "processing" | "shipped" | "delivered" } | undefined> = {
  pending: { label: "ยืนยันคำสั่งซื้อ", next: "confirmed" },
  confirmed: { label: "เริ่มเตรียมสินค้า", next: "processing" },
  processing: { label: "ยืนยันการจัดส่ง", next: "shipped" },
  shipped: { label: "ส่งสำเร็จ", next: "delivered" },
};

export default function AdminOrdersScreen() {
  const { orders, refresh, allowed, loading, error } = useAdmin();
  const { showToast } = useToast();
  const nextStatus = async (id: string, status: "confirmed" | "processing" | "shipped" | "delivered") => { try { await updateAdminOrderStatus(id, status); showToast("อัปเดตสถานะคำสั่งซื้อแล้ว"); await refresh(); } catch (cause) { showToast(cause instanceof Error ? cause.message : "อัปเดตสถานะไม่ได้", "error"); } };
  if (loading) return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="items-center justify-center"><ActivityIndicator color={HOBEE.colors.goldDark} size="large" /></ScreenContainer>;
  if (!allowed) return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="items-center justify-center"><Text className="text-sm font-bold text-muted">บัญชีนี้ไม่มีสิทธิ์เข้าถึง HOBEE Admin Portal</Text></ScreenContainer>;
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-[#F3F4F2]"><AdminPortalShell active="orders" title="คำสั่งซื้อ" subtitle="ยืนยัน เตรียมสินค้า และติดตามสถานะจัดส่งผ่าน flow เดิมของ HOBEE" onNavigate={navigate}><AdminCard style={styles.card}><AdminCardTitle title={`รายการล่าสุด · ${orders.length}`} /><ScrollView horizontal showsHorizontalScrollIndicator={false}><View style={styles.table}><View style={[styles.row, styles.head]}><Text style={[styles.headText, styles.no]}>เลขที่คำสั่งซื้อ</Text><Text style={[styles.headText, styles.customer]}>ลูกค้า</Text><Text style={[styles.headText, styles.total]}>ยอดรวม</Text><Text style={[styles.headText, styles.payment]}>การชำระเงิน</Text><Text style={[styles.headText, styles.status]}>สถานะ</Text><Text style={styles.action}> </Text></View>{orders.map((order) => { const action = transition[order.status]; return <View key={order.id} style={styles.row}><Text style={[styles.cellStrong, styles.no]}>{order.order_number}</Text><View style={styles.customer}><Text style={styles.customerName}>{order.profiles?.display_name ?? "ลูกค้า HOBEE"}</Text><Text style={styles.customerPhone}>{order.profiles?.phone ?? "—"}</Text></View><Text style={[styles.cellStrong, styles.total]}>{formatThaiBaht(order.total)}</Text><Text style={[styles.cell, styles.payment]}>{paymentStatusLabel(order.payment_status)}</Text><Text style={[styles.statusText, styles.status]}>{orderStatusLabel(order.status)}</Text><View style={styles.action}>{action ? <Pressable onPress={() => void nextStatus(order.id, action.next)} style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}><Text style={styles.actionText}>{action.label}</Text><MaterialIcons name="arrow-forward" size={14} color={HOBEE.colors.ink} /></Pressable> : <Text style={styles.complete}>เสร็จสิ้น</Text>}</View></View>; })}</View></ScrollView>{!orders.length ? <Text style={styles.empty}>{error ?? "ยังไม่มีคำสั่งซื้อ"}</Text> : null}</AdminCard></AdminPortalShell></ScreenContainer>;
}

const styles = StyleSheet.create({ card: { padding: 0, overflow: "hidden" }, table: { minWidth: 1020 }, row: { flexDirection: "row", alignItems: "center", minHeight: 68, borderTopWidth: 1, borderTopColor: "#EFF0EE", paddingHorizontal: 20 }, head: { minHeight: 45, borderTopWidth: 0, backgroundColor: "#F9FAF8" }, headText: { color: HOBEE.colors.muted, fontSize: 10, fontWeight: "900", letterSpacing: 0.4 }, no: { width: 165 }, customer: { width: 190 }, total: { width: 115 }, payment: { width: 145 }, status: { width: 155 }, action: { width: 190 }, cell: { color: HOBEE.colors.muted, fontSize: 12, fontWeight: "700" }, cellStrong: { color: HOBEE.colors.ink, fontSize: 12, fontWeight: "900" }, customerName: { color: HOBEE.colors.ink, fontSize: 12, fontWeight: "900" }, customerPhone: { marginTop: 3, color: HOBEE.colors.muted, fontSize: 10, fontWeight: "600" }, statusText: { color: HOBEE.colors.travelTeal, fontSize: 11, fontWeight: "900" }, actionButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, alignSelf: "flex-start", borderRadius: 10, backgroundColor: HOBEE.colors.gold, paddingHorizontal: 10, paddingVertical: 8 }, actionText: { color: HOBEE.colors.ink, fontSize: 10, fontWeight: "900" }, complete: { color: HOBEE.colors.muted, fontSize: 11, fontWeight: "800" }, empty: { padding: 24, color: HOBEE.colors.muted, fontSize: 12, fontWeight: "700" }, pressed: { opacity: 0.74 },
});
