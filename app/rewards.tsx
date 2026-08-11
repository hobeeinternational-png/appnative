import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { PrimaryButton } from "@/components/hobee/primary-button";
import { ScreenContainer } from "@/components/screen-container";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { formatThaiBaht } from "@/lib/hobee-data";
import { loadRewards, type UserCoupon } from "@/lib/loyalty";

export default function RewardsScreen() {
  const { user } = useSupabaseAuth(); const [points, setPoints] = useState(0); const [coupons, setCoupons] = useState<UserCoupon[]>([]); const [loading, setLoading] = useState(Boolean(user));
  useEffect(() => { if (!user) return; void loadRewards(user.id).then((data) => { setPoints(data.points); setCoupons(data.coupons); }).finally(() => setLoading(false)); }, [user]);
  if (!user) return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="items-center justify-center px-6"><View className="items-center rounded-3xl border border-border bg-surface p-7"><MaterialIcons name="card-giftcard" size={38} color="#C98716" /><Text className="mt-4 text-xl font-black text-foreground">สิทธิพิเศษสำหรับสมาชิก</Text><Text className="mt-2 text-center text-sm leading-5 text-muted">เข้าสู่ระบบเพื่อสะสมคะแนนและรับคูปอง HOBEE</Text><PrimaryButton label="เข้าสู่ระบบ" icon="arrow-forward" onPress={() => router.push("/auth")} style={styles.button} /></View></ScreenContainer>;
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5" safeAreaClassName="pt-3"><View className="mb-5 flex-row items-center gap-3"><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={22} color="#17352A" /></Pressable><View><Text className="text-2xl font-black text-foreground">HOBEE Rewards</Text><Text className="mt-0.5 text-sm text-muted">คะแนนและสิทธิพิเศษของคุณ</Text></View></View><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}><View className="rounded-[24px] bg-[#17352A] p-5"><Text className="text-sm text-white/70">คะแนนสะสมของคุณ</Text><Text className="mt-2 text-4xl font-black text-white">{points.toLocaleString("th-TH")}</Text><Text className="mt-2 text-sm text-white/70">คะแนนจะสะสมเมื่อคำสั่งซื้อได้รับการยืนยัน</Text></View><Text className="mt-6 text-base font-black text-foreground">คูปองของฉัน</Text>{loading ? <ActivityIndicator className="mt-5" color="#C98716" /> : coupons.length ? coupons.map((coupon) => <CouponCard key={coupon.id} coupon={coupon} />) : <View className="mt-3 rounded-2xl border border-dashed border-border bg-surface p-6"><Text className="text-center font-bold text-foreground">ยังไม่มีคูปองที่ใช้ได้</Text><Text className="mt-1 text-center text-sm leading-5 text-muted">คูปองและข้อเสนอจะปรากฏที่นี่เมื่อได้รับสิทธิ์</Text></View>}</ScrollView></ScreenContainer>;
}

function CouponCard({ coupon }: { coupon: UserCoupon }) { const discount = coupon.discount_type === "percentage" ? `ลด ${coupon.discount_value}%` : `ลด ${formatThaiBaht(coupon.discount_value)}`; return <View className="mt-3 overflow-hidden rounded-2xl border border-primary bg-[#FFF9ED]"><View className="border-b border-primary/20 px-4 py-3"><Text className="text-xs font-black tracking-[1px] text-primary">{coupon.code}</Text></View><View className="p-4"><Text className="text-lg font-black text-foreground">{discount}</Text><Text className="mt-1 text-sm text-muted">{coupon.name}</Text><Text className="mt-2 text-xs text-muted">ขั้นต่ำ {formatThaiBaht(coupon.minimum_subtotal)} {coupon.ends_at ? `· ใช้ได้ถึง ${new Date(coupon.ends_at).toLocaleDateString("th-TH")}` : ""}</Text></View></View>; }
const styles = StyleSheet.create({ content: { paddingBottom: 28 }, back: { height: 42, width: 42, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E8E0D0", borderRadius: 21, backgroundColor: "#FFFFFF" }, button: { marginTop: 20 }, pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] } });

