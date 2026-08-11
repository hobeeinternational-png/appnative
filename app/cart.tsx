import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { ScreenContainer } from "@/components/screen-container";
import { useCart } from "@/contexts/cart-context";
import { formatThaiBaht } from "@/lib/hobee-data";
import { QuantityStepper } from "@/components/hobee/quantity-stepper";

export default function CartScreen() {
  const { items, itemCount, subtotal, hydrated, updateQuantity } = useCart();

  if (!hydrated) {
    return (
      <ScreenContainer edges={["top", "bottom", "left", "right"]} className="items-center justify-center px-6">
        <Text className="text-sm text-muted">กำลังเตรียมตะกร้าของคุณ…</Text>
      </ScreenContainer>
    );
  }

  if (items.length > 0) {
    return (
      <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5" safeAreaClassName="pt-3">
        <View className="mb-5 flex-row items-center gap-3">
          <Pressable accessibilityRole="button" accessibilityLabel="ย้อนกลับ" onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
            <MaterialIcons name="arrow-back" size={22} color="#17352A" />
          </Pressable>
          <View>
            <Text className="text-2xl font-black text-foreground">ตะกร้าของคุณ</Text>
            <Text className="mt-0.5 text-sm text-muted">{itemCount} ชิ้น</Text>
          </View>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.cartContent}>
          {items.map((item) => (
            <View key={item.product.id} className="flex-row gap-3 rounded-2xl border border-border bg-surface p-3">
              <Image source={{ uri: item.product.image }} className="h-20 w-20 rounded-xl bg-[#EEE6D6]" />
              <View className="flex-1 justify-between">
                <View>
                  <Text numberOfLines={2} className="font-bold leading-5 text-foreground">{item.product.shortName}</Text>
                  <Text className="mt-1 text-sm font-black text-foreground">{formatThaiBaht(item.product.price)}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs text-muted">จาก {item.product.shopName}</Text>
                  <QuantityStepper value={item.quantity} onChange={(quantity) => updateQuantity(item.product.id, quantity)} min={0} max={item.product.stock} size="compact" />
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
        <View className="border-t border-border pb-3 pt-4">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-sm text-muted">ยอดรวมสินค้า</Text>
            <Text className="text-xl font-black text-foreground">{formatThaiBaht(subtotal)}</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={() => router.push("/checkout" as Href)} style={({ pressed }) => [styles.checkoutButton, pressed && styles.pressed]}>
            <Text className="text-base font-black text-white">ดำเนินการสั่งซื้อ</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
          </Pressable>
          <Text className="mt-2 text-center text-[11px] leading-4 text-muted">ดูสถานะความพร้อมของคำสั่งซื้อก่อนเปิดรับชำระเงินจริง</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="items-center justify-center px-6">
      <View className="w-full max-w-sm items-center rounded-[28px] border border-border bg-surface px-6 py-9">
        <View className="h-16 w-16 items-center justify-center rounded-3xl bg-[#F5EBCF]">
          <MaterialIcons name="shopping-bag" size={32} color="#C98716" />
        </View>
        <Text className="mt-5 text-xl font-black text-foreground">ตะกร้าของคุณยังว่าง</Text>
        <Text className="mt-2 text-center text-sm leading-6 text-muted">เลือกสินค้า HOBEE ที่คุณชอบ แล้วกลับมาสรุปคำสั่งซื้อได้ที่นี่</Text>
        <Pressable accessibilityRole="button" onPress={() => router.replace("/(tabs)/shop")} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <Text className="font-black text-white">เลือกชมสินค้า</Text>
          <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  button: { marginTop: 24, flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 999, backgroundColor: "#17352A", paddingHorizontal: 18, paddingVertical: 12 },
  back: { height: 42, width: 42, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E8E0D0", borderRadius: 21, backgroundColor: "#FFFFFF" },
  cartContent: { gap: 12, paddingBottom: 20 },
  checkoutButton: { height: 52, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, borderRadius: 16, backgroundColor: "#17352A" },
  pressed: { opacity: 0.76, transform: [{ scale: 0.98 }] },
});
