import { FlatList, StyleSheet } from "react-native";
import { router } from "expo-router";
import { BackHeader } from "@/components/hobee/commerce-ui";
import { EmptyState, ProductCard, ProductSkeleton } from "@/components/hobee/shared-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { useToast } from "@/contexts/toast-context";
import { useCatalog } from "@/hooks/use-catalog";
import { useFavorites } from "@/hooks/use-favorites";

export default function FavoritesScreen() {
  const { user } = useSupabaseAuth(); const { products, loading: catalogLoading, refresh: refreshCatalog } = useCatalog(); const { favoriteIds, loading: favoriteLoading, toggle, refresh: refreshFavorites } = useFavorites(); const { showToast } = useToast(); const productsSaved = products.filter((product) => favoriteIds.has(product.id));
  const refresh = () => Promise.all([refreshCatalog(), refreshFavorites()]);
  if (!user) return <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-[#F8F7F5]" className="items-center justify-center px-6"><EmptyState title="เข้าสู่ระบบเพื่อดูสินค้าโปรด" description="บันทึกสินค้าที่สนใจ แล้วกลับมาติดตามได้ทุกเมื่อ" onAction={() => router.push("/auth")} actionLabel="เข้าสู่ระบบ" /></ScreenContainer>;
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-[#F8F7F5]" className="px-5" safeAreaClassName="pt-3"><BackHeader title="สินค้าโปรด" subtitle="รายการที่คุณบันทึกไว้" onBack={() => router.back()} />{catalogLoading || favoriteLoading ? <ProductSkeleton /> : <FlatList data={productsSaved} numColumns={2} keyExtractor={(item) => item.id} columnWrapperStyle={styles.row} contentContainerStyle={styles.list} refreshing={catalogLoading || favoriteLoading} onRefresh={() => void refresh()} renderItem={({ item }) => <ProductCard product={item} favorite onFavorite={() => void toggle(item.id).then((value) => showToast(value ? "บันทึกสินค้าโปรดแล้ว" : "นำออกจากสินค้าโปรดแล้ว")).catch(() => showToast("ไม่สามารถอัปเดตสินค้าโปรดได้", "error"))} />} ListEmptyComponent={<EmptyState title="ยังไม่มีสินค้าโปรด" description="แตะไอคอนหัวใจบนสินค้าเพื่อบันทึกรายการที่สนใจ" onAction={() => router.replace("/(tabs)/shop")} actionLabel="เลือกชมสินค้า" />} />}</ScreenContainer>;
}
const styles = StyleSheet.create({ list: { gap: 14, paddingBottom: 30 }, row: { justifyContent: "space-between" } });
