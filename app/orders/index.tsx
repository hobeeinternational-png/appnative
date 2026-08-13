import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { HOBEE } from "@/components/hobee/design-tokens";
import { BackHeader, StatusChip } from "@/components/hobee/commerce-ui";
import { EmptyState } from "@/components/hobee/shared-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { useOrders } from "@/hooks/use-orders";
import { formatThaiBaht } from "@/lib/hobee-data";
import { orderStatusLabel } from "@/lib/orders";

export default function OrdersScreen() {
  const { status } = useLocalSearchParams<{ status?: string }>();
  const { user } = useSupabaseAuth();
  const { orders, loading, error, refresh } = useOrders();
  const filteredOrders = status === "processing" ? orders.filter((order) => ["pending", "confirmed", "processing"].includes(order.status)) : status === "refunded" ? orders.filter((order) => ["cancelled", "refunded"].includes(order.status)) : status ? orders.filter((order) => order.status === status) : orders;
  const filterTitle = ({ processing: "กำลังดำเนินการ", shipped: "จัดส่งแล้ว", refunded: "รอตรวจสอบ / คืนเงิน" } as Record<string, string>)[status ?? ""];
  const emptyContent = loading ? <ActivityIndicator color={HOBEE.colors.gold} /> : <EmptyState title={filterTitle ? `ยังไม่มีรายการ${filterTitle}` : "ยังไม่มีคำสั่งซื้อ"} description={error ?? "เมื่อสั่งซื้อสินค้า รายการจะปรากฏที่นี่"} />;

  if (!user) {
    return <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-[#F8F7F5]" className="items-center justify-center px-6"><EmptyState title="เข้าสู่ระบบเพื่อดูคำสั่งซื้อ" description="ประวัติการซื้อและสถานะจัดส่งของคุณจะแสดงอยู่ที่นี่" onAction={() => router.push("/auth")} actionLabel="เข้าสู่ระบบ" /></ScreenContainer>;
  }

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-[#F8F7F5]" className="px-5" safeAreaClassName="pt-3">
      <BackHeader title="คำสั่งซื้อของฉัน" subtitle={filterTitle ? `แสดงสถานะ: ${filterTitle}` : "ติดตามการชำระเงินและการจัดส่ง"} onBack={() => router.back()} />
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={() => void refresh()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: "/orders/[id]", params: { id: item.id } })}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <View style={styles.cardTop}>
              <View><Text style={styles.number}>{item.order_number}</Text><Text style={styles.date}>{new Date(item.created_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}</Text></View>
              <StatusChip status={item.status} label={orderStatusLabel(item.status)} />
            </View>
            <View style={styles.cardMiddle}>
              <View style={styles.previewIcon}><MaterialIcons name="shopping-bag" size={22} color={HOBEE.colors.botanical} /></View>
              <View style={styles.previewCopy}><Text style={styles.previewTitle}>รายการสินค้าในคำสั่งซื้อ</Text><Text style={styles.previewDetail}>แตะเพื่อดูรายละเอียดและการจัดส่ง</Text></View>
              <MaterialIcons name="chevron-right" size={23} color={HOBEE.colors.muted} />
            </View>
            <View style={styles.cardBottom}><Text style={styles.totalLabel}>ยอดรวม</Text><Text style={styles.total}>{formatThaiBaht(item.total)}</Text></View>
          </Pressable>
        )}
        ListEmptyComponent={emptyContent}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ list: { gap: 13, paddingBottom: 28 }, card: { borderRadius: 23, borderWidth: 1, borderColor: HOBEE.colors.border, backgroundColor: HOBEE.colors.surface, padding: 15, ...HOBEE.shadow }, cardTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }, number: { color: HOBEE.colors.ink, fontSize: 15, fontWeight: "900" }, date: { marginTop: 3, color: HOBEE.colors.muted, fontSize: 12, fontWeight: "600" }, cardMiddle: { flexDirection: "row", alignItems: "center", gap: 11, marginTop: 15 }, previewIcon: { width: 43, height: 43, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "#E2F7EE" }, previewCopy: { flex: 1 }, previewTitle: { color: HOBEE.colors.ink, fontSize: 13, fontWeight: "900" }, previewDetail: { marginTop: 3, color: HOBEE.colors.muted, fontSize: 11, fontWeight: "600" }, cardBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 14, borderTopWidth: 1, borderTopColor: HOBEE.colors.border, paddingTop: 12 }, totalLabel: { color: HOBEE.colors.muted, fontSize: 12, fontWeight: "700" }, total: { color: HOBEE.colors.ink, fontSize: 18, fontWeight: "900" }, pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] } });
