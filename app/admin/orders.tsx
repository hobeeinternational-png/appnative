import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { ScreenContainer } from "@/components/screen-container";
import { useAdmin } from "@/hooks/use-admin";
import { updateAdminOrderStatus } from "@/lib/admin";
import { formatThaiBaht } from "@/lib/hobee-data";
import { orderStatusLabel, paymentStatusLabel } from "@/lib/orders";
import { useToast } from "@/contexts/toast-context";

export default function AdminOrdersScreen() {
  const { orders, refresh } = useAdmin(); const { showToast } = useToast();
  const nextStatus = async (id: string, status: "confirmed" | "processing" | "shipped" | "delivered") => { try { await updateAdminOrderStatus(id, status); showToast("อัปเดตสถานะคำสั่งซื้อแล้ว"); await refresh(); } catch (error) { showToast(error instanceof Error ? error.message : "อัปเดตสถานะไม่ได้", "error"); } };
  return <ScreenContainer className="px-5" safeAreaClassName="pt-3"><View className="mb-5 flex-row items-center gap-3"><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={22} color="#17352A" /></Pressable><View><Text className="text-2xl font-black text-foreground">จัดการคำสั่งซื้อ</Text><Text className="mt-0.5 text-sm text-muted">ยืนยัน เตรียม และอัปเดตการจัดส่ง</Text></View></View><FlatList data={orders} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} renderItem={({ item }) => <View className="mb-3 rounded-2xl border border-border bg-surface p-4"><View className="flex-row justify-between"><View><Text className="font-black text-foreground">{item.order_number}</Text><Text className="mt-1 text-xs text-muted">{item.profiles?.display_name ?? item.profiles?.phone ?? "ลูกค้า HOBEE"}</Text></View><Text className="font-black text-foreground">{formatThaiBaht(item.total)}</Text></View><Text className="mt-3 text-sm text-muted">{orderStatusLabel(item.status)} · {paymentStatusLabel(item.payment_status)}</Text><View className="mt-3 flex-row gap-2">{item.status === "pending" ? <Action label="ยืนยัน" onPress={() => void nextStatus(item.id, "confirmed")} /> : null}{item.status === "confirmed" ? <Action label="กำลังเตรียม" onPress={() => void nextStatus(item.id, "processing")} /> : null}{item.status === "processing" ? <Action label="จัดส่งแล้ว" onPress={() => void nextStatus(item.id, "shipped")} /> : null}{item.status === "shipped" ? <Action label="ส่งสำเร็จ" onPress={() => void nextStatus(item.id, "delivered")} /> : null}</View></View>} ListEmptyComponent={<Text className="text-sm text-muted">ยังไม่มีคำสั่งซื้อ</Text>} /></ScreenContainer>;
}
function Action({ label, onPress }: { label: string; onPress: () => void }) { return <Pressable onPress={onPress} style={({ pressed }) => [styles.action, pressed && styles.pressed]}><Text className="text-xs font-bold text-white">{label}</Text></Pressable>; }
const styles = StyleSheet.create({ list: { paddingBottom: 28 }, back: { height: 42, width: 42, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E8E0D0", borderRadius: 21, backgroundColor: "#FFFFFF" }, action: { borderRadius: 10, backgroundColor: "#17352A", paddingHorizontal: 12, paddingVertical: 9 }, pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] } });

