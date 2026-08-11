import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { PrimaryButton } from "@/components/hobee/primary-button";
import { ScreenContainer } from "@/components/screen-container";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { useToast } from "@/contexts/toast-context";
import { supabase } from "@/lib/supabase";

export default function AddressFormScreen() {
  const { user } = useSupabaseAuth();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [isDefault, setIsDefault] = useState(true);
  const [form, setForm] = useState({ recipientName: "", phone: "", line1: "", district: "", province: "", postalCode: "" });

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async () => {
    if (!user) {
      router.replace("/auth");
      return;
    }
    if (!form.recipientName.trim() || !form.phone.trim() || !form.line1.trim() || !form.province.trim() || !/^\d{5}$/.test(form.postalCode)) {
      showToast("กรอกชื่อ โทรศัพท์ ที่อยู่ จังหวัด และรหัสไปรษณีย์ 5 หลักให้ครบ", "error");
      return;
    }
    setSaving(true);
    try {
      if (isDefault) await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
      const { data, error } = await supabase.from("addresses").insert({
        user_id: user.id,
        recipient_name: form.recipientName.trim(),
        phone: form.phone.trim(),
        line1: form.line1.trim(),
        district: form.district.trim() || null,
        province: form.province.trim(),
        postal_code: form.postalCode.trim(),
        country_code: "TH",
        is_default: isDefault,
      }).select("id").single();
      if (error || !data) throw error ?? new Error("ไม่สามารถบันทึกที่อยู่ได้");
      showToast("บันทึกที่อยู่จัดส่งแล้ว");
      router.replace({ pathname: "/checkout", params: { addressId: data.id } });
    } catch (error) {
      showToast(error instanceof Error ? error.message : "ไม่สามารถบันทึกที่อยู่ได้", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5" safeAreaClassName="pt-3">
      <View className="mb-5 flex-row items-center gap-3">
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={22} color="#17352A" /></Pressable>
        <View><Text className="text-2xl font-black text-foreground">เพิ่มที่อยู่จัดส่ง</Text><Text className="mt-0.5 text-sm text-muted">ใช้สำหรับสร้างคำสั่งซื้อ</Text></View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View className="rounded-2xl border border-border bg-surface p-4">
          <Text className="text-base font-black text-foreground">ข้อมูลผู้รับ</Text>
          <Field label="ชื่อผู้รับ" value={form.recipientName} onChangeText={(value) => update("recipientName", value)} />
          <Field label="เบอร์โทรศัพท์" keyboardType="phone-pad" value={form.phone} onChangeText={(value) => update("phone", value)} />
          <Text className="mt-5 text-base font-black text-foreground">ที่อยู่</Text>
          <Field label="บ้านเลขที่ / ถนน / หมู่บ้าน" value={form.line1} onChangeText={(value) => update("line1", value)} multiline />
          <Field label="อำเภอ / เขต (ไม่บังคับ)" value={form.district} onChangeText={(value) => update("district", value)} />
          <Field label="จังหวัด" value={form.province} onChangeText={(value) => update("province", value)} />
          <Field label="รหัสไปรษณีย์" keyboardType="number-pad" maxLength={5} value={form.postalCode} onChangeText={(value) => update("postalCode", value)} />
          <View className="mt-5 flex-row items-center justify-between rounded-xl bg-[#F5EBCF] p-3">
            <View className="flex-1 pr-3"><Text className="font-bold text-foreground">ตั้งเป็นที่อยู่หลัก</Text><Text className="mt-0.5 text-xs leading-4 text-muted">ใช้เป็นค่าเริ่มต้นในการสั่งซื้อครั้งต่อไป</Text></View>
            <Switch value={isDefault} onValueChange={setIsDefault} trackColor={{ false: "#D8D6D0", true: "#C98716" }} />
          </View>
        </View>
        <PrimaryButton label="บันทึกและใช้ที่อยู่นี้" icon="check" loading={saving} onPress={() => void submit()} style={styles.button} />
      </ScrollView>
    </ScreenContainer>
  );
}

function Field({ label, value, onChangeText, keyboardType, multiline, maxLength }: { label: string; value: string; onChangeText: (value: string) => void; keyboardType?: "default" | "phone-pad" | "number-pad"; multiline?: boolean; maxLength?: number }) {
  return <View className="mt-4"><Text className="mb-1.5 text-sm font-bold text-foreground">{label}</Text><TextInput value={value} onChangeText={onChangeText} keyboardType={keyboardType} multiline={multiline} maxLength={maxLength} placeholder={label} placeholderTextColor="#8A978E" className={`rounded-xl border border-border bg-background px-4 text-base text-foreground ${multiline ? "min-h-20 py-3" : "h-12"}`} /></View>;
}

const styles = StyleSheet.create({ content: { paddingBottom: 28 }, back: { height: 42, width: 42, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E8E0D0", borderRadius: 21, backgroundColor: "#FFFFFF" }, button: { marginTop: 18 }, pressed: { opacity: 0.72, transform: [{ scale: 0.97 }] } });
