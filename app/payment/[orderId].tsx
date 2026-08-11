import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { PrimaryButton } from "@/components/hobee/primary-button";
import { ScreenContainer } from "@/components/screen-container";
import { useToast } from "@/contexts/toast-context";
import { hobeeApi, type PaymentAction } from "@/lib/hobee-api";

export default function PaymentScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<PaymentAction | null>(null);

  const startPromptPay = async () => {
    if (!hobeeApi.isConfigured()) { showToast("ยังไม่ได้ตั้งค่า Vercel payment API", "info"); return; }
    setLoading(true);
    try {
      const result = await hobeeApi.createPaymentIntent({ orderId, method: "opn_promptpay" });
      setAction(result.action);
      showToast(result.action.testMode ? "สร้าง PromptPay sandbox QR แล้ว" : "สร้าง PromptPay QR แล้ว");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "ไม่สามารถเริ่มการชำระเงินได้", "error");
    } finally { setLoading(false); }
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5" safeAreaClassName="pt-3">
      <View className="mb-5 flex-row items-center gap-3"><Pressable accessibilityRole="button" onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={22} color="#17352A" /></Pressable><View><Text className="text-2xl font-black text-foreground">ชำระเงิน</Text><Text className="mt-0.5 text-sm text-muted">เลือกช่องทางที่ปลอดภัยสำหรับคำสั่งซื้อของคุณ</Text></View></View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {action?.type === "promptpay_qr" ? <View className="rounded-3xl border border-primary bg-[#FFF9ED] p-5"><Text className="text-center text-lg font-black text-foreground">สแกนเพื่อชำระผ่าน PromptPay</Text><Text className="mt-2 text-center text-sm leading-5 text-muted">เปิดแอปธนาคาร เลือกสแกน QR และยืนยันยอดเงิน จากนั้นระบบจะอัปเดตสถานะอัตโนมัติ</Text>{action.qrImageUrl ? <Image source={{ uri: action.qrImageUrl }} className="mx-auto mt-5 h-64 w-64 rounded-2xl bg-white" /> : <View className="mx-auto mt-5 h-64 w-64 items-center justify-center rounded-2xl bg-white"><MaterialIcons name="qr-code-2" size={120} color="#17352A" /><Text className="mt-2 text-center text-xs text-muted">QR จะปรากฏเมื่อเชื่อม Opn sandbox/live แล้ว</Text></View>}<Text className="mt-5 text-center text-xs text-muted">{action.testMode ? "โหมด sandbox — ไม่มีการเรียกเก็บเงินจริง" : "รอการยืนยันจากผู้ให้บริการชำระเงิน"}</Text><PrimaryButton label="ดูสถานะคำสั่งซื้อ" icon="receipt-long" variant="outline" onPress={() => router.replace("/(tabs)/account")} style={styles.methodButton} /></View> : <><View className="rounded-2xl border border-border bg-surface p-4"><View className="flex-row gap-3"><View className="h-11 w-11 items-center justify-center rounded-xl bg-[#F5EBCF]"><MaterialIcons name="qr-code-2" size={24} color="#C98716" /></View><View className="flex-1"><Text className="font-black text-foreground">PromptPay QR</Text><Text className="mt-1 text-sm leading-5 text-muted">สร้าง QR และชำระผ่านแอปธนาคารของคุณ</Text></View></View><PrimaryButton label="ชำระด้วย PromptPay" icon="arrow-forward" loading={loading} onPress={() => void startPromptPay()} style={styles.methodButton} /></View><View className="mt-4 rounded-2xl border border-border bg-surface p-4"><View className="flex-row gap-3"><View className="h-11 w-11 items-center justify-center rounded-xl bg-[#F5EBCF]"><MaterialIcons name="credit-card" size={24} color="#C98716" /></View><View className="flex-1"><Text className="font-black text-foreground">บัตรเครดิต / เดบิต</Text><Text className="mt-1 text-sm leading-5 text-muted">จะเปิด secure card entry ของผู้ให้บริการ โดยไม่ส่งข้อมูลบัตรเข้า HOBEE</Text></View></View><PrimaryButton label="เตรียมชำระด้วยบัตร" icon="lock-outline" variant="outline" onPress={() => showToast("ช่องกรอกบัตรจะเปิดหลังตั้งค่า Opn public key และ development build", "info")} style={styles.methodButton} /></View></>}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ content: { paddingBottom: 28 }, back: { height: 42, width: 42, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E8E0D0", borderRadius: 21, backgroundColor: "#FFFFFF" }, methodButton: { marginTop: 16 }, pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] } });
