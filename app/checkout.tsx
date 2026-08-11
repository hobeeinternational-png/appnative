import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { PrimaryButton } from "@/components/hobee/primary-button";
import { ScreenContainer } from "@/components/screen-container";
import { useCart } from "@/contexts/cart-context";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { useToast } from "@/contexts/toast-context";
import { useAddresses } from "@/hooks/use-addresses";
import { formatShippingAddress } from "@/lib/addresses";
import { hobeeApi } from "@/lib/hobee-api";
import { formatThaiBaht } from "@/lib/hobee-data";

export default function CheckoutScreen() {
  const { addressId } = useLocalSearchParams<{ addressId?: string }>();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useSupabaseAuth();
  const { addresses, loading } = useAddresses();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const selectedAddress = useMemo(
    () => addresses.find((address) => address.id === addressId) ?? addresses.find((address) => address.is_default) ?? null,
    [addressId, addresses],
  );

  const submitOrder = async () => {
    if (!user) { router.push("/auth"); return; }
    if (!selectedAddress) { router.push("/checkout/address"); return; }
    if (!items.length) { showToast("ตะกร้าสินค้าว่างอยู่", "error"); return; }
    if (!hobeeApi.isConfigured()) { showToast("ยังไม่ได้ตั้งค่า Vercel API สำหรับสร้างคำสั่งซื้อ", "info"); return; }
    setSubmitting(true);
    try {
      const response = await hobeeApi.createOrder({
        addressId: selectedAddress.id,
        items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
      });
      clearCart();
      showToast(`สร้างคำสั่งซื้อ ${response.order.order_number} แล้ว`);
      router.replace({ pathname: "/payment/[orderId]", params: { orderId: response.order.id } });
    } catch (error) {
      showToast(error instanceof Error ? error.message : "ไม่สามารถสร้างคำสั่งซื้อได้", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5" safeAreaClassName="pt-3">
      <View className="mb-5 flex-row items-center gap-3">
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={22} color="#17352A" /></Pressable>
        <View><Text className="text-2xl font-black text-foreground">สรุปคำสั่งซื้อ</Text><Text className="mt-0.5 text-sm text-muted">ตรวจสอบสินค้าและที่อยู่จัดส่ง</Text></View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <StepIndicator step={selectedAddress ? 2 : 1} />
        <Text className="mt-6 text-base font-black text-foreground">ที่อยู่จัดส่ง</Text>
        {loading ? (
          <View className="mt-3 items-center rounded-2xl border border-border bg-surface p-5"><ActivityIndicator color="#C98716" /></View>
        ) : selectedAddress ? (
          <View className="mt-3 rounded-2xl border border-border bg-surface p-4">
            <View className="flex-row gap-3"><View className="h-10 w-10 items-center justify-center rounded-xl bg-[#F5EBCF]"><MaterialIcons name="location-on" size={21} color="#17352A" /></View><View className="flex-1"><Text className="font-black text-foreground">{selectedAddress.recipient_name} · {selectedAddress.phone}</Text><Text className="mt-1 text-sm leading-5 text-muted">{formatShippingAddress(selectedAddress)}</Text></View></View>
            <Pressable onPress={() => router.push("/checkout/address")} style={({ pressed }) => [styles.changeAddress, pressed && styles.pressed]}><Text className="text-sm font-bold text-primary">เปลี่ยน/เพิ่มที่อยู่</Text><MaterialIcons name="chevron-right" size={18} color="#C98716" /></Pressable>
          </View>
        ) : (
          <Pressable onPress={() => router.push("/checkout/address")} style={({ pressed }) => [styles.addAddress, pressed && styles.pressed]}><MaterialIcons name="add-location-alt" size={22} color="#C98716" /><View className="flex-1"><Text className="font-black text-foreground">เพิ่มที่อยู่จัดส่ง</Text><Text className="mt-0.5 text-sm text-muted">จำเป็นก่อนสร้างคำสั่งซื้อ</Text></View><MaterialIcons name="chevron-right" size={22} color="#17352A" /></Pressable>
        )}
        <Text className="mt-6 text-base font-black text-foreground">รายการสินค้า</Text>
        <View className="mt-3 overflow-hidden rounded-2xl border border-border bg-surface">
          {items.map((item, index) => <View key={item.product.id} className={`flex-row items-center justify-between gap-3 p-4 ${index < items.length - 1 ? "border-b border-border" : ""}`}><View className="flex-1"><Text numberOfLines={2} className="font-bold text-foreground">{item.product.shortName}</Text><Text className="mt-1 text-xs text-muted">{item.quantity} × {formatThaiBaht(item.product.price)}</Text></View><Text className="font-black text-foreground">{formatThaiBaht(item.product.price * item.quantity)}</Text></View>)}
          {!items.length ? <Text className="p-4 text-sm text-muted">ยังไม่มีสินค้าในตะกร้า</Text> : null}
        </View>
        <View className="mt-5 rounded-2xl bg-[#17352A] p-5"><Text className="text-sm text-white/70">ยอดรวมสินค้า</Text><Text className="mt-1 text-3xl font-black text-white">{formatThaiBaht(subtotal)}</Text><Text className="mt-2 text-xs leading-5 text-white/65">ยอดชำระจริงจะคำนวณใหม่จากราคาและสต็อกในระบบเมื่อสร้างคำสั่งซื้อ</Text></View>
        <PrimaryButton label={user ? "สร้างคำสั่งซื้อ" : "เข้าสู่ระบบเพื่อสั่งซื้อ"} icon="arrow-forward" loading={submitting} disabled={!items.length} onPress={() => void submitOrder()} style={styles.button} />
      </ScrollView>
    </ScreenContainer>
  );
}

function StepIndicator({ step }: { step: number }) {
  return <View className="rounded-2xl border border-border bg-surface p-4"><Text className="text-sm font-black text-foreground">ขั้นตอนคำสั่งซื้อ</Text><View className="mt-4 flex-row">{["สินค้า", "จัดส่ง", "ชำระเงิน"].map((title, index) => <View key={title} className="flex-1 items-center"><View className={`h-8 w-8 items-center justify-center rounded-full ${index + 1 <= step ? "bg-primary" : "bg-[#F3F0E8]"}`}><Text className={`text-xs font-black ${index + 1 <= step ? "text-white" : "text-muted"}`}>{index + 1}</Text></View><Text className={`mt-2 text-xs font-bold ${index + 1 <= step ? "text-foreground" : "text-muted"}`}>{title}</Text></View>)}</View></View>;
}

const styles = StyleSheet.create({ content: { paddingBottom: 28 }, back: { height: 42, width: 42, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E8E0D0", borderRadius: 21, backgroundColor: "#FFFFFF" }, addAddress: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12, borderWidth: 1, borderStyle: "dashed", borderColor: "#C98716", borderRadius: 16, backgroundColor: "#FFF9ED", padding: 16 }, changeAddress: { flexDirection: "row", alignSelf: "flex-start", alignItems: "center", marginTop: 14 }, button: { marginTop: 18 }, pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] } });
