import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";

import { BackHeader, StickyBottomCTA } from "@/components/hobee/commerce-ui";
import { HOBEE } from "@/components/hobee/design-tokens";
import { ScreenContainer } from "@/components/screen-container";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/contexts/toast-context";
import { useCatalog } from "@/hooks/use-catalog";
import { listOrderItemsForAfterSales, type OrderItemForAfterSales } from "@/lib/after-sales";
import { buildBuyAgainPlan } from "@/lib/customer-journey";
import { formatThaiBaht } from "@/lib/hobee-data";

export default function BuyAgainScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products, loading: catalogLoading } = useCatalog();
  const { addProduct } = useCart();
  const { showToast } = useToast();
  const [items, setItems] = useState<OrderItemForAfterSales[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  useEffect(() => { void listOrderItemsForAfterSales(id).then(setItems).catch((cause) => setError(cause instanceof Error ? cause.message : "ไม่สามารถอ่านสินค้าในคำสั่งซื้อได้")).finally(() => setLoading(false)); }, [id]);
  const plan = useMemo(() => buildBuyAgainPlan(items, products), [items, products]);
  const available = plan.filter((entry) => entry.product && entry.quantityToAdd > 0);
  const addAll = () => { available.forEach((entry) => addProduct(entry.product!, entry.quantityToAdd)); showToast(`เพิ่มสินค้า ${available.length} รายการลงตะกร้าแล้ว`); router.push("/cart"); };
  if (loading || catalogLoading) return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="items-center justify-center"><ActivityIndicator size="large" color={HOBEE.colors.gold} /></ScreenContainer>;
  return <View style={styles.root}><ScreenContainer edges={["top", "left", "right"]} containerClassName="bg-[#F8F7F5]" className="px-5" safeAreaClassName="pt-3"><BackHeader title="ซื้ออีกครั้ง" subtitle="ตรวจราคาและสต็อกปัจจุบัน" onBack={() => router.back()} />{error ? <View style={styles.error}><Text style={styles.errorText}>{error}</Text></View> : <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><View style={styles.notice}><MaterialIcons name="verified" size={20} color={HOBEE.colors.botanical} /><Text style={styles.noticeText}>ระบบใช้ราคาและสต็อกปัจจุบัน ไม่ใช้ราคาจากคำสั่งซื้อเดิม</Text></View>{plan.map((entry) => <View key={entry.product_id} style={[styles.row, !entry.product && styles.rowUnavailable]}><View style={styles.icon}><MaterialIcons name={entry.product ? "shopping-bag" : "remove-shopping-cart"} size={21} color={entry.product ? HOBEE.colors.botanical : HOBEE.colors.muted} /></View><View style={styles.copy}><Text style={styles.name}>{entry.product?.shortName ?? entry.product_name}</Text>{entry.product ? <><Text style={styles.price}>{formatThaiBaht(entry.product.price)}</Text><Text style={styles.detail}>เพิ่มได้ {entry.quantityToAdd} ชิ้น · คงเหลือ {entry.product.stock} ชิ้น</Text></> : <Text style={styles.unavailable}>{entry.unavailableReason}</Text>}</View></View>)}</ScrollView>}</ScreenContainer><StickyBottomCTA primaryLabel={available.length ? `เพิ่ม ${available.length} รายการลงตะกร้า` : "ไม่มีสินค้าที่พร้อมซื้อ"} primaryDisabled={!available.length} onPrimary={addAll} /></View>;
}
const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: HOBEE.colors.canvas }, content: { paddingBottom: 100 }, notice: { flexDirection: "row", gap: 10, borderRadius: 18, backgroundColor: "#E2F7EE", padding: 14 }, noticeText: { flex: 1, color: HOBEE.colors.botanical, fontSize: 13, lineHeight: 19, fontWeight: "700" }, row: { flexDirection: "row", gap: 12, marginTop: 12, borderRadius: 20, borderWidth: 1, borderColor: HOBEE.colors.border, backgroundColor: HOBEE.colors.surface, padding: 14 }, rowUnavailable: { opacity: 0.7 }, icon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: HOBEE.colors.canvas }, copy: { flex: 1 }, name: { color: HOBEE.colors.ink, fontSize: 15, fontWeight: "900" }, price: { marginTop: 4, color: HOBEE.colors.botanical, fontSize: 17, fontWeight: "900" }, detail: { marginTop: 4, color: HOBEE.colors.muted, fontSize: 12, fontWeight: "600" }, unavailable: { marginTop: 5, color: "#B65045", fontSize: 12, fontWeight: "700" }, error: { borderRadius: 22, backgroundColor: "#FFE8E4", padding: 16 }, errorText: { color: "#B65045", fontWeight: "900" } });
