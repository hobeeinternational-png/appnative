import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";

import { ProductCard } from "@/components/hobee/product-card";
import { ScreenHeader } from "@/components/hobee/screen-header";
import { ScreenContainer } from "@/components/screen-container";
import { useCatalog } from "@/hooks/use-catalog";

const categories = ["ทั้งหมด", "น้ำผึ้ง", "อาหารและเครื่องดื่ม", "ของดีชุมชน"];

export default function ShopScreen() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");
  const { products, source, loading, refresh } = useCatalog();

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return products.filter((product) => {
      const queryMatch = !normalizedQuery || [product.name, product.shortName, product.category, product.origin]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
      const categoryMatch = activeCategory === "ทั้งหมด"
        || (activeCategory === "น้ำผึ้ง" && product.name.includes("น้ำผึ้ง"))
        || (activeCategory === "ของดีชุมชน" && product.badge === "LOCAL")
        || product.category === activeCategory;
      return queryMatch && categoryMatch;
    });
  }, [activeCategory, products, query]);

  return (
    <ScreenContainer className="px-5" safeAreaClassName="pt-3">
      <FlatList
        data={filteredProducts}
        keyExtractor={(product) => product.id}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={() => void refresh()}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <ScreenHeader title="ร้านค้า" subtitle="เลือกของดีจากผู้ผลิตและชุมชน" />
            <View className="mb-4 flex-row items-center rounded-2xl border border-border bg-surface px-3">
              <MaterialIcons name="search" size={21} color="#617266" />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="ค้นหาสินค้า"
                placeholderTextColor="#8A978E"
                returnKeyType="search"
                className="h-12 flex-1 px-3 text-base text-foreground"
              />
              {query ? (
                <Pressable accessibilityRole="button" accessibilityLabel="ล้างการค้นหา" onPress={() => setQuery("")} style={({ pressed }) => pressed && styles.textPressed}>
                  <MaterialIcons name="close" size={20} color="#617266" />
                </Pressable>
              ) : null}
            </View>
            <FlatList
              horizontal
              data={categories}
              keyExtractor={(category) => category}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categories}
              renderItem={({ item }) => {
                const active = item === activeCategory;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => setActiveCategory(item)}
                    style={({ pressed }) => [styles.category, active && styles.categoryActive, pressed && styles.textPressed]}
                  >
                    <Text className={`text-sm font-bold ${active ? "text-white" : "text-foreground"}`}>{item}</Text>
                  </Pressable>
                );
              }}
            />
            {source === "local" ? (
              <View className="mb-4 flex-row items-center gap-2 rounded-xl bg-[#F5EBCF] px-3 py-2.5">
                <MaterialIcons name="cloud-off" size={17} color="#B96E0A" />
                <Text className="flex-1 text-xs leading-4 text-[#617266]">กำลังแสดงแค็ตตาล็อกเริ่มต้น สามารถปัดลงเพื่อรีเฟรชเมื่อเชื่อม API แล้ว</Text>
              </View>
            ) : null}
            <Pressable accessibilityRole="button" onPress={() => router.push("/auth")} style={({ pressed }) => [styles.memberBanner, pressed && styles.textPressed]}>
              <View className="h-8 w-8 items-center justify-center rounded-lg bg-[#F5EBCF]">
                <MaterialIcons name="person-outline" size={18} color="#17352A" />
              </View>
              <Text className="flex-1 text-sm font-bold text-foreground">มีบัญชี HOBEE อยู่แล้ว?</Text>
              <Text className="text-sm font-black text-primary">เข้าสู่ระบบ</Text>
            </Pressable>
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-base font-black text-foreground">สินค้าทั้งหมด</Text>
              {loading ? <ActivityIndicator color="#C98716" size="small" /> : <Text className="text-sm text-muted">{filteredProducts.length} รายการ</Text>}
            </View>
          </>
        }
        renderItem={({ item }) => <View className="mb-3"><ProductCard product={item} /></View>}
        ListEmptyComponent={
          <View className="items-center rounded-2xl border border-dashed border-border bg-surface px-6 py-12">
            <MaterialIcons name="search-off" size={32} color="#617266" />
            <Text className="mt-3 text-base font-bold text-foreground">ไม่พบสินค้าที่ค้นหา</Text>
            <Text className="mt-1 text-center text-sm leading-5 text-muted">ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่น</Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 32 },
  categories: { gap: 8, paddingBottom: 18 },
  category: { borderWidth: 1, borderColor: "#E8E0D0", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9, backgroundColor: "#FFFFFF" },
  categoryActive: { borderColor: "#17352A", backgroundColor: "#17352A" },
  memberBanner: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 18, borderRadius: 14, borderWidth: 1, borderColor: "#E8E0D0", backgroundColor: "#FFFFFF", padding: 10 },
  textPressed: { opacity: 0.65 },
});
