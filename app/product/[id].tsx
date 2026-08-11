import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { ScreenContainer } from "@/components/screen-container";
import { formatThaiBaht, hobeeProducts } from "@/lib/hobee-data";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/contexts/toast-context";
import { PrimaryButton } from "@/components/hobee/primary-button";
import { QuantityStepper } from "@/components/hobee/quantity-stepper";
import { useFavorites } from "@/hooks/use-favorites";
import { useCatalog } from "@/hooks/use-catalog";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { listProductReviews, submitProductReview, type ProductReview } from "@/lib/reviews";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products } = useCatalog();
  const product = products.find((item) => item.id === id) ?? hobeeProducts.find((item) => item.id === id) ?? hobeeProducts[0];
  const { addProduct } = useCart();
  const { showToast } = useToast();
  const { favoriteIds, toggle, signedIn } = useFavorites();
  const { user } = useSupabaseAuth();
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const favorite = favoriteIds.has(product.id);
  const recommendations = products.filter((item) => item.id !== product.id && item.category === product.category).slice(0, 3);
  useEffect(() => { void listProductReviews(product.id).then(setReviews).catch(() => setReviews([])); }, [product.id]);
  const submitReview = async () => { if (!user) { router.push("/auth"); return; } setReviewSubmitting(true); try { await submitProductReview({ productId: product.id, userId: user.id, rating: reviewRating, comment: reviewComment }); setReviewOpen(false); setReviewComment(""); showToast("ส่งรีวิวแล้ว รอการตรวจสอบก่อนเผยแพร่", "success"); } catch (error) { showToast(error instanceof Error ? error.message : "ไม่สามารถส่งรีวิวได้", "error"); } finally { setReviewSubmitting(false); } };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View className="relative">
          <Image source={{ uri: product.image }} className="h-[360px] w-full bg-[#EEE6D6]" resizeMode="cover" />
          <View className="absolute left-5 right-5 top-4 flex-row justify-between">
            <Pressable accessibilityRole="button" accessibilityLabel="ย้อนกลับ" onPress={() => router.back()} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
              <MaterialIcons name="arrow-back" size={23} color="#17352A" />
            </Pressable>
            <View className="flex-row gap-2">
              <Pressable accessibilityRole="button" accessibilityLabel="บันทึกสินค้าชื่นชอบ" onPress={() => { if (!signedIn) { showToast("เข้าสู่ระบบเพื่อบันทึกสินค้าชื่นชอบ", "info"); router.push("/auth"); return; } void toggle(product.id).then((next) => showToast(next ? "บันทึกสินค้าชื่นชอบแล้ว" : "ลบออกจากสินค้าชื่นชอบแล้ว")).catch(() => showToast("ไม่สามารถบันทึกสินค้าชื่นชอบได้", "error")); }} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
                <MaterialIcons name={favorite ? "favorite" : "favorite-border"} size={22} color={favorite ? "#C13F36" : "#17352A"} />
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="เปิดตะกร้า" onPress={() => router.push("/cart")} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
                <MaterialIcons name="shopping-bag" size={22} color="#17352A" />
              </Pressable>
            </View>
          </View>
        </View>
        <View className="-mt-5 rounded-t-[28px] bg-background px-5 pb-8 pt-6">
          <View className="flex-row items-center justify-between">
            <Text className="text-[10px] font-bold tracking-[1.1px] text-primary">{product.badge ?? "HOBEE SELECT"}</Text>
            <View className="flex-row items-center gap-1">
              <MaterialIcons name="star" size={16} color="#C98716" />
              <Text className="text-sm font-bold text-foreground">{product.rating.toFixed(1)}</Text>
              <Text className="text-xs text-muted">({product.reviewsCount})</Text>
            </View>
          </View>
          <Text className="mt-2 text-2xl font-black leading-8 text-foreground">{product.name}</Text>
          <Text className="mt-2 text-sm font-medium text-muted">โดย {product.shopName}</Text>
          <View className="mt-5 flex-row items-baseline gap-2">
            <Text className="text-2xl font-black text-foreground">{formatThaiBaht(product.price)}</Text>
            {product.compareAtPrice ? <Text className="text-sm text-muted line-through">{formatThaiBaht(product.compareAtPrice)}</Text> : null}
          </View>

          <View className="mt-6 rounded-2xl border border-border bg-surface p-4">
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="location-on" size={19} color="#317A50" />
              <Text className="font-bold text-foreground">ส่งจาก {product.origin}</Text>
            </View>
            <Text className="mt-2 text-sm leading-6 text-muted">{product.description}</Text>
          </View>

          <View className="mt-5 flex-row gap-3">
            <View className="flex-1 rounded-2xl border border-border bg-surface px-4 py-3">
              <Text className="text-xs text-muted">คงเหลือ</Text>
              <Text className="mt-1 font-black text-foreground">{product.stock} ชิ้น</Text>
            </View>
            <View className="flex-1 rounded-2xl border border-border bg-surface px-4 py-3">
              <Text className="text-xs text-muted">การจัดส่ง</Text>
              <Text className="mt-1 font-black text-foreground">ทั่วประเทศ</Text>
            </View>
          </View>
          <View className="mt-5 flex-row items-center justify-between rounded-2xl border border-border bg-surface p-3">
            <View>
              <Text className="font-bold text-foreground">จำนวนที่ต้องการ</Text>
              <Text className="mt-0.5 text-xs text-muted">เลือกได้สูงสุด {product.stock} ชิ้น</Text>
            </View>
            <QuantityStepper value={quantity} onChange={setQuantity} max={product.stock} />
          </View>
          <View className="mt-7">
            <View className="flex-row items-center justify-between"><Text className="text-base font-black text-foreground">รีวิวจากลูกค้า</Text><Pressable onPress={() => { if (!user) { showToast("เข้าสู่ระบบก่อนเขียนรีวิว", "info"); router.push("/auth"); return; } setReviewOpen((open) => !open); }}><Text className="text-sm font-bold text-primary">{reviewOpen ? "ปิด" : "เขียนรีวิว"}</Text></Pressable></View>
            {reviewOpen ? <View className="mt-3 rounded-2xl border border-border bg-surface p-4"><Text className="font-bold text-foreground">ให้คะแนนสินค้า</Text><View className="mt-2 flex-row gap-1">{[1, 2, 3, 4, 5].map((rating) => <Pressable key={rating} onPress={() => setReviewRating(rating)}><MaterialIcons name={rating <= reviewRating ? "star" : "star-border"} size={28} color="#C98716" /></Pressable>)}</View><TextInput value={reviewComment} onChangeText={setReviewComment} multiline maxLength={1000} placeholder="แบ่งปันประสบการณ์ของคุณ (ไม่บังคับ)" placeholderTextColor="#8A978E" className="mt-3 min-h-24 rounded-xl border border-border bg-background p-3 text-sm text-foreground" /><PrimaryButton label="ส่งรีวิว" icon="send" loading={reviewSubmitting} onPress={() => void submitReview()} style={styles.reviewButton} /></View> : null}
            {reviews.length ? reviews.slice(0, 3).map((review) => <View key={review.id} className="mt-3 rounded-2xl border border-border bg-surface p-4"><View className="flex-row items-center gap-1">{[1, 2, 3, 4, 5].map((rating) => <MaterialIcons key={rating} name={rating <= review.rating ? "star" : "star-border"} size={15} color="#C98716" />)}</View>{review.comment ? <Text className="mt-2 text-sm leading-5 text-muted">{review.comment}</Text> : null}</View>) : <Text className="mt-3 text-sm text-muted">ยังไม่มีรีวิวที่ผ่านการเผยแพร่</Text>}
          </View>
          {recommendations.length ? <View className="mt-7"><Text className="text-base font-black text-foreground">คุณอาจชอบ</Text><View className="mt-3 gap-2">{recommendations.map((item) => <Pressable key={item.id} onPress={() => router.replace({ pathname: "/product/[id]", params: { id: item.id } })} style={({ pressed }) => [styles.recommendation, pressed && styles.pressed]}><View className="flex-1"><Text numberOfLines={1} className="font-bold text-foreground">{item.shortName}</Text><Text className="mt-1 text-sm text-primary">{formatThaiBaht(item.price)}</Text></View><MaterialIcons name="chevron-right" size={22} color="#8A978E" /></Pressable>)}</View></View> : null}
        </View>
      </ScrollView>
      <View className="border-t border-border bg-background px-5 pb-3 pt-3">
        <PrimaryButton
          label={`เพิ่ม ${quantity} ชิ้นลงตะกร้า`}
          icon="add-shopping-cart"
          onPress={() => {
            addProduct(product, quantity);
            showToast(`เพิ่ม ${product.shortName} ลงตะกร้าแล้ว`);
          }}
        />
        <Pressable accessibilityRole="button" onPress={() => router.push("/cart")} style={({ pressed }) => [styles.cartLink, pressed && styles.pressed]}>
          <Text className="text-sm font-bold text-primary">ดูตะกร้าสินค้า</Text>
          <MaterialIcons name="arrow-forward" size={17} color="#C98716" />
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 12 },
  iconButton: { height: 44, width: 44, alignItems: "center", justifyContent: "center", borderRadius: 22, backgroundColor: "rgba(255,255,255,0.94)" },
  cartLink: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 3, paddingTop: 10, paddingBottom: 1 },
  reviewButton: { marginTop: 12 },
  recommendation: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#E8E0D0", borderRadius: 14, backgroundColor: "#FFFFFF", padding: 12 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});
