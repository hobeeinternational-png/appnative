import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { BrandMark } from "@/components/hobee/brand-mark";
import { useCart } from "@/contexts/cart-context";

export function ScreenHeader({ title, subtitle, showCart = true }: { title?: string; subtitle?: string; showCart?: boolean }) {
  const { itemCount } = useCart();
  return (
    <View className="mb-5 flex-row items-center justify-between">
      {title ? (
        <View className="flex-1 pr-3">
          <Text className="text-2xl font-black tracking-tight text-foreground">{title}</Text>
          {subtitle ? <Text className="mt-1 text-sm leading-5 text-muted">{subtitle}</Text> : null}
        </View>
      ) : (
        <BrandMark />
      )}
      {showCart ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="เปิดตะกร้าสินค้า"
          onPress={() => router.push("/cart")}
          style={({ pressed }) => [styles.cartButton, pressed && styles.pressed]}
        >
          <MaterialIcons name="shopping-bag" size={21} color="#17352A" />
          {itemCount > 0 ? (
            <View className="absolute -right-1 -top-1 h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1">
              <Text className="text-[9px] font-black text-white">{itemCount > 9 ? "9+" : itemCount}</Text>
            </View>
          ) : null}
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E8E0D0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },
});
