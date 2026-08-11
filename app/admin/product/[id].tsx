import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { PrimaryButton } from "@/components/hobee/primary-button";
import { ScreenContainer } from "@/components/screen-container";
import { useToast } from "@/contexts/toast-context";
import { getAdminProduct, updateAdminProduct } from "@/lib/admin";

export default function AdminProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { showToast } = useToast();
  const [product, setProduct] = useState<Awaited<ReturnType<typeof getAdminProduct>> | null>(null);
  const [price, setPrice] = useState(""); const [stock, setStock] = useState(""); const [status, setStatus] = useState<"draft" | "published" | "archived">("draft"); const [saving, setSaving] = useState(false);
  useEffect(() => { void getAdminProduct(id).then((data) => { setProduct(data); setPrice(String(data.price)); setStock(String(data.stock_quantity)); setStatus(data.status); }).catch((error) => showToast(error instanceof Error ? error.message : "ไม่สามารถอ่านสินค้าได้", "error")); }, [id, showToast]);
  const save = async () => { const priceNumber = Number(price); const stockNumber = Number(stock); if (!Number.isFinite(priceNumber) || priceNumber < 0 || !Number.isInteger(stockNumber) || stockNumber < 0) { showToast("กรอกราคาและสต็อกให้ถูกต้อง", "error"); return; } setSaving(true); try { await updateAdminProduct(id, { price: priceNumber, stock_quantity: stockNumber, status }); showToast("บันทึกสินค้าแล้ว"); router.back(); } catch (error) { showToast(error instanceof Error ? error.message : "ไม่สามารถบันทึกสินค้าได้", "error"); } finally { setSaving(false); } };
  if (!product) return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="items-center justify-center"><ActivityIndicator color="#C98716" size="large" /></ScreenContainer>;
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5" safeAreaClassName="pt-3"><View className="mb-5 flex-row items-center gap-3"><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={22} color="#17352A" /></Pressable><View className="flex-1"><Text numberOfLines={1} className="text-xl font-black text-foreground">{product.name}</Text><Text className="mt-0.5 text-sm text-muted">แก้ไขราคา สต็อก และสถานะสินค้า</Text></View></View><ScrollView showsVerticalScrollIndicator={false}><View className="rounded-2xl border border-border bg-surface p-4"><Text className="text-sm font-bold text-foreground">ราคา (บาท)</Text><TextInput value={price} onChangeText={setPrice} keyboardType="decimal-pad" className="mt-2 h-12 rounded-xl border border-border bg-background px-4 text-base text-foreground" /><Text className="mt-5 text-sm font-bold text-foreground">จำนวนคงเหลือ</Text><TextInput value={stock} onChangeText={setStock} keyboardType="number-pad" className="mt-2 h-12 rounded-xl border border-border bg-background px-4 text-base text-foreground" /><Text className="mt-5 text-sm font-bold text-foreground">สถานะสินค้า</Text><View className="mt-2 flex-row gap-2">{(["draft", "published", "archived"] as const).map((option) => <Pressable key={option} onPress={() => setStatus(option)} style={({ pressed }) => [styles.status, status === option && styles.statusActive, pressed && styles.pressed]}><Text className={`text-xs font-bold ${status === option ? "text-white" : "text-foreground"}`}>{option}</Text></Pressable>)}</View></View><PrimaryButton label="บันทึกการเปลี่ยนแปลง" icon="save" loading={saving} onPress={() => void save()} style={styles.button} /></ScrollView></ScreenContainer>;
}
const styles = StyleSheet.create({ back: { height: 42, width: 42, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E8E0D0", borderRadius: 21, backgroundColor: "#FFFFFF" }, status: { flex: 1, alignItems: "center", borderWidth: 1, borderColor: "#E8E0D0", borderRadius: 10, paddingVertical: 10 }, statusActive: { borderColor: "#17352A", backgroundColor: "#17352A" }, button: { marginTop: 18, marginBottom: 28 }, pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] } });

