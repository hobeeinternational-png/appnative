import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { type HobeeProduct, formatThaiBaht } from "@/lib/hobee-data";

export function ProductCard({ product, compact = false }: { product: HobeeProduct; compact?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`ดูสินค้า ${product.name}`}
      onPress={() => router.push({ pathname: "/product/[id]", params: { id: product.id } })}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
    >
      <View className={compact ? "w-44 overflow-hidden rounded-2xl bg-surface border border-border" : "flex-row overflow-hidden rounded-2xl bg-surface border border-border"}>
        <Image
          source={{ uri: product.image }}
          className={compact ? "h-40 w-44 bg-[#EEE6D6]" : "h-28 w-28 bg-[#EEE6D6]"}
          resizeMode="cover"
        />
        <View className={compact ? "gap-1 p-3" : "flex-1 justify-center gap-1 p-3"}>
          {product.badge ? (
            <Text className="text-[9px] font-bold tracking-[1px] text-primary">{product.badge}</Text>
          ) : null}
          <Text numberOfLines={2} className="text-sm font-bold leading-5 text-foreground">
            {product.shortName}
          </Text>
          <View className="flex-row items-center gap-1">
            <MaterialIcons name="star" size={13} color="#C98716" />
            <Text className="text-xs font-medium text-muted">
              {product.rating.toFixed(1)} ({product.reviewsCount})
            </Text>
          </View>
          <View className="mt-1 flex-row items-center gap-1.5">
            <Text className="text-sm font-extrabold text-foreground">{formatThaiBaht(product.price)}</Text>
            {product.compareAtPrice ? (
              <Text className="text-[10px] text-muted line-through">{formatThaiBaht(product.compareAtPrice)}</Text>
            ) : null}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: { opacity: 1 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.985 }] },
});

