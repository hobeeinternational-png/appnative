import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { AdminCard, AdminPortalShell, type AdminWorkspace } from "@/components/admin/admin-portal-ui";
import { HOBEE } from "@/components/hobee/design-tokens";
import { ScreenContainer } from "@/components/screen-container";
import { useToast } from "@/contexts/toast-context";
import { useAdmin } from "@/hooks/use-admin";
import { createAdminTravelListing, type AdminContentStatus, type AdminTravelListingType } from "@/lib/admin-travel";
import { slugifyProductName } from "@/lib/admin";

const PROVINCES = [{ id: "satun", name: "สตูล" }, { id: "yala", name: "ยะลา / เบตง" }, { id: "pattani", name: "ปัตตานี" }, { id: "songkhla", name: "สงขลา" }, { id: "narathiwat", name: "นราธิวาส" }] as const;

function navigate(workspace: AdminWorkspace) {
  if (workspace === "overview") router.push("/admin");
  else if (workspace === "products") router.push("/admin/products" as any);
  else if (workspace === "travel") router.replace("/admin/travel" as any);
  else if (workspace === "orders") router.push("/admin/orders");
  else router.push({ pathname: "/admin/products" as any, params: { filter: "low-stock" } });
}

export default function AdminNewTravelScreen() {
  const { allowed, loading } = useAdmin();
  const { showToast } = useToast();
  const [listingType, setListingType] = useState<AdminTravelListingType>("trip");
  const [provinceId, setProvinceId] = useState<(typeof PROVINCES)[number]["id"]>("satun");
  const [title, setTitle] = useState(""); const [slug, setSlug] = useState(""); const [shortDescription, setShortDescription] = useState(""); const [fullDescription, setFullDescription] = useState("");
  const [location, setLocation] = useState(""); const [latitude, setLatitude] = useState(""); const [longitude, setLongitude] = useState(""); const [priceFrom, setPriceFrom] = useState(""); const [operatorName, setOperatorName] = useState(""); const [propertyType, setPropertyType] = useState("");
  const [status, setStatus] = useState<AdminContentStatus>("draft"); const [halal, setHalal] = useState(false); const [saving, setSaving] = useState(false);
  const province = PROVINCES.find((entry) => entry.id === provinceId) ?? PROVINCES[0];
  const save = async () => {
    setSaving(true);
    try {
      const record = await createAdminTravelListing({ slug: slug || slugifyProductName(title), listing_type: listingType, province_id: provinceId, province_name: province.name, title, short_description: shortDescription || title, full_description: fullDescription || shortDescription || title, location, latitude: Number(latitude), longitude: Number(longitude), price_from: Number(priceFrom), rating: 0, reviews_count: 0, property_type: listingType === "accommodation" ? propertyType || null : null, operator_name: operatorName || "HOBEE Local Partner", is_halal_certified: halal, included: [], excluded: [], trip_modes: ["join", "private"], status, is_visible: true });
      showToast("สร้างรายการแล้ว เพิ่มรูปภาพและห้องพักได้ในหน้าถัดไป");
      router.replace({ pathname: "/admin/travel/[id]" as any, params: { id: record.id } });
    } catch (error) { showToast(error instanceof Error ? error.message : "สร้างรายการไม่สำเร็จ", "error"); }
    finally { setSaving(false); }
  };
  if (loading) return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="items-center justify-center"><ActivityIndicator color={HOBEE.colors.goldDark} size="large" /></ScreenContainer>;
  if (!allowed) return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="items-center justify-center"><Text className="text-sm font-bold text-muted">บัญชีนี้ไม่มีสิทธิ์เข้าถึง HOBEE Admin Portal</Text></ScreenContainer>;
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-[#F3F4F2]"><AdminPortalShell active="travel" title="เพิ่มทริปหรือที่พัก" subtitle="เริ่มจากข้อมูลสำคัญ แล้วจัดการห้องพัก รูปภาพ และรายละเอียดเพิ่มได้ในหน้ารายการ" onNavigate={navigate}><ScrollView contentContainerStyle={styles.content}><View style={styles.column}><AdminCard><Section title="ประเภทและชื่อรายการ" /><Text style={styles.label}>ประเภท</Text><View style={styles.choices}><Choice label="ทริป" active={listingType === "trip"} onPress={() => setListingType("trip")} /><Choice label="ที่พัก" active={listingType === "accommodation"} onPress={() => setListingType("accommodation")} /></View><Field label="ชื่อรายการ" value={title} onChangeText={(value) => { setTitle(value); if (!slug) setSlug(slugifyProductName(value)); }} placeholder="เช่น ทริปหลีเป๊ะ 3 วัน 2 คืน" /><Field label="Slug" value={slug} onChangeText={setSlug} autoCapitalize="none" placeholder="lipe-islands-3d2n" /><Field label="คำอธิบายสั้น" value={shortDescription} onChangeText={setShortDescription} placeholder="ข้อความที่แสดงบนการ์ด" multiline /><Field label="รายละเอียดเต็ม" value={fullDescription} onChangeText={setFullDescription} placeholder="รายละเอียดเพื่อการตัดสินใจจอง" multiline /></AdminCard><AdminCard><Section title="ผู้ประกอบการและการเผยแพร่" /><Field label="ชื่อผู้ประกอบการ" value={operatorName} onChangeText={setOperatorName} placeholder="HOBEE Local Partner" />{listingType === "accommodation" ? <Field label="ประเภทที่พัก" value={propertyType} onChangeText={setPropertyType} placeholder="โรงแรม, รีสอร์ต หรือโฮมสเตย์ชุมชน" /> : null}<Text style={styles.label}>สถานะเริ่มต้น</Text><View style={styles.choices}>{(["draft", "published"] as const).map((value) => <Choice key={value} label={value === "draft" ? "ฉบับร่าง" : "เผยแพร่"} active={status === value} onPress={() => setStatus(value)} />)}</View><Choice label="ได้รับรองฮาลาล" active={halal} onPress={() => setHalal((current) => !current)} /></AdminCard></View><View style={styles.column}><AdminCard><Section title="ตำแหน่งและราคา" /><Text style={styles.label}>จังหวัด</Text><View style={styles.provinces}>{PROVINCES.map((entry) => <Choice key={entry.id} label={entry.name} active={provinceId === entry.id} onPress={() => setProvinceId(entry.id)} />)}</View><Field label="สถานที่ / ที่อยู่โดยย่อ" value={location} onChangeText={setLocation} placeholder="เกาะหลีเป๊ะ, สตูล" /><View style={styles.row}><View style={styles.half}><Field label="Latitude" value={latitude} onChangeText={setLatitude} keyboardType="decimal-pad" placeholder="6.489" /></View><View style={styles.half}><Field label="Longitude" value={longitude} onChangeText={setLongitude} keyboardType="decimal-pad" placeholder="99.302" /></View></View><Field label="ราคาเริ่มต้น (บาท)" value={priceFrom} onChangeText={setPriceFrom} keyboardType="decimal-pad" placeholder="0" /></AdminCard><AdminCard><Section title="ขั้นตอนถัดไป" /><Text style={styles.helper}>หลังบันทึก คุณจะเพิ่มหรือเปลี่ยนรูปภาพได้สูงสุด 5 รูป และหากเป็นที่พัก สามารถเพิ่มหลายประเภทห้อง ราคา จำนวนห้อง และรูปภาพของแต่ละห้องได้</Text></AdminCard><Pressable disabled={saving} onPress={() => void save()} style={({ pressed }) => [styles.save, (pressed || saving) && styles.pressed]}>{saving ? <ActivityIndicator color={HOBEE.colors.ink} /> : <Text style={styles.saveText}>{status === "published" ? "สร้างและเผยแพร่" : "สร้างฉบับร่าง"}</Text>}</Pressable></View></ScrollView></AdminPortalShell></ScreenContainer>;
}

function Section({ title }: { title: string }) { return <Text style={styles.section}>{title}</Text>; }
function Field({ label, multiline, ...props }: { label: string; multiline?: boolean } & React.ComponentProps<typeof TextInput>) { return <View style={styles.fieldWrap}><Text style={styles.label}>{label}</Text><TextInput {...props} multiline={multiline} textAlignVertical={multiline ? "top" : "center"} style={[styles.input, multiline && styles.textarea]} placeholderTextColor="#A8AAA8" /></View>; }
function Choice({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) { return <Pressable onPress={onPress} style={[styles.choice, active && styles.choiceActive]}><Text style={[styles.choiceText, active && styles.choiceTextActive]}>{active && label === "ได้รับรองฮาลาล" ? "✓ " : ""}{label}</Text></Pressable>; }

const styles = StyleSheet.create({ content: { flexDirection: "row", alignItems: "flex-start", gap: 18, paddingBottom: 34 }, column: { flex: 1, gap: 18 }, section: { marginBottom: 16, color: HOBEE.colors.ink, fontSize: 16, fontWeight: "900" }, fieldWrap: { marginTop: 14 }, label: { marginBottom: 7, color: HOBEE.colors.muted, fontSize: 11, fontWeight: "900" }, input: { minHeight: 43, borderWidth: 1, borderColor: "#E5E7E4", borderRadius: 11, backgroundColor: "#FBFCFA", paddingHorizontal: 12, color: HOBEE.colors.ink, fontSize: 13, fontWeight: "700" }, textarea: { minHeight: 84, paddingTop: 11 }, choices: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, provinces: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, choice: { borderRadius: 10, backgroundColor: "#EEF0ED", paddingHorizontal: 11, paddingVertical: 9 }, choiceActive: { backgroundColor: HOBEE.colors.darkCard }, choiceText: { color: HOBEE.colors.muted, fontSize: 11, fontWeight: "800" }, choiceTextActive: { color: "#FFFFFF" }, row: { flexDirection: "row", gap: 11 }, half: { flex: 1 }, helper: { color: HOBEE.colors.muted, fontSize: 12, fontWeight: "600", lineHeight: 18 }, save: { alignItems: "center", justifyContent: "center", minHeight: 50, borderRadius: 14, backgroundColor: HOBEE.colors.gold, paddingHorizontal: 16 }, saveText: { color: HOBEE.colors.ink, fontSize: 13, fontWeight: "900" }, pressed: { opacity: 0.75 } });
