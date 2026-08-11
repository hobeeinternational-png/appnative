import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { FloatingBottomNav } from "@/components/hobee/floating-tab-bar";
import { PrimaryButton } from "@/components/hobee/primary-button";
import { ScreenContainer } from "@/components/screen-container";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { useOrders } from "@/hooks/use-orders";
import { formatThaiBaht } from "@/lib/hobee-data";
import { orderStatusLabel, paymentStatusLabel } from "@/lib/orders";

export default function OrdersScreen() {
  const { user } = useSupabaseAuth();
  const { orders, loading, error, refresh } = useOrders();
  if (!user) return <View className="flex-1"><ScreenContainer edges={["top", "bottom", "left", "right"]} className="items-center justify-center px-6"><View className="items-center rounded-3xl border border-border bg-surface p-7"><MaterialIcons name="receipt-long" size={36} color="#C98716" /><Text className="mt-4 text-xl font-black text-foreground">เข้าสู่ระบบเพื่อดูคำสั่งซื้อ</Text><Text className="mt-2 text-center text-sm leading-5 text-muted">ประวัติการซื้อและสถานะจัดส่งจะแสดงอยู่ที่นี่</Text><PrimaryButton label="เข้าสู่ระบบ" icon="arrow-forward" onPress={() => router.push("/auth")} style={styles.button} /></View></ScreenContainer><FloatingBottomNav activeKey="orders" /></View>;
  return <View className="flex-1"><ScreenContainer className="px-5" safeAreaClassName="pt-3"><View className="mb-5 flex-row items-center gap-3"><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={22} color="#17352A" /></Pressable><View><Text className="text-2xl font-black text-foreground">คำสั่งซื้อของฉัน</Text><Text className="mt-0.5 text-sm text-muted">ติดตามการชำระเงินและการจัดส่ง</Text></View></View><FlatList data={orders} keyExtractor={(item) => item.id} refreshing={loading} onRefresh={() => void refresh()} contentContainerStyle={styles.list} renderItem={({ item }) => <Pressable onPress={() => router.push({ pathname: "/orders/[id]", params: { id: item.id } })} style={({ pressed }) => [styles.card, pressed && styles.pressed]}><View className="flex-row items-center justify-between"><Text className="font-black text-foreground">{item.order_number}</Text><Text className="rounded-full bg-[#F5EBCF] px-2.5 py-1 text-xs font-bold text-[#B96E0A]">{orderStatusLabel(item.status)}</Text></View><View className="mt-3 flex-row items-end justify-between"><View><Text className="text-xs text-muted">{new Date(item.created_at).toLocaleDateString("th-TH")}</Text><Text className="mt-1 text-sm text-muted">{paymentStatusLabel(item.payment_status)}</Text></View><Text className="text-lg font-black text-foreground">{formatThaiBaht(item.total)}</Text></View></Pressable>} ListEmptyComponent={loading ? <ActivityIndicator color="#C98716" /> : <View className="items-center rounded-2xl border border-dashed border-border bg-surface p-8"><MaterialIcons name="shopping-bag" size={32} color="#617266" /><Text className="mt-3 font-black text-foreground">ยังไม่มีคำสั่งซื้อ</Text><Text className="mt-1 text-center text-sm text-muted">เมื่อสั่งซื้อสินค้า รายการจะปรากฏที่นี่</Text>{error ? <Text className="mt-3 text-xs text-error">{error}</Text> : null}</View>} /></ScreenContainer><FloatingBottomNav activeKey="orders" /></View>;
}

const styles = StyleSheet.create({ list: { gap: 12, paddingBottom: 146 }, back: { height: 42, width: 42, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E8E0D0", borderRadius: 21, backgroundColor: "#FFFFFF" }, card: { borderWidth: 1, borderColor: "#E8E0D0", borderRadius: 18, backgroundColor: "#FFFFFF", padding: 16 }, button: { marginTop: 20 }, pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] } });
