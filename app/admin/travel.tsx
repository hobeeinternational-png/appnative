import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { AdminCard, AdminCardTitle, AdminPortalShell, type AdminWorkspace } from "@/components/admin/admin-portal-ui";
import { HOBEE } from "@/components/hobee/design-tokens";
import { ScreenContainer } from "@/components/screen-container";
import { useToast } from "@/contexts/toast-context";
import { useAdmin } from "@/hooks/use-admin";
import { getAdminTravelListings, updateAdminTravelListing, type AdminContentStatus, type AdminTravelListing } from "@/lib/admin-travel";
import { formatThaiBaht } from "@/lib/hobee-data";

function navigate(workspace: AdminWorkspace) {
  if (workspace === "overview") router.push("/admin");
  else if (workspace === "products") router.push("/admin/products" as any);
  else if (workspace === "travel") router.replace("/admin/travel" as any);
  else if (workspace === "orders") router.push("/admin/orders");
  else router.push({ pathname: "/admin/products" as any, params: { filter: "low-stock" } });
}

export default function AdminTravelScreen() {
  const { allowed, loading: authLoading } = useAdmin();
  const { showToast } = useToast();
  const [listings, setListings] = useState<AdminTravelListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | "trip" | "accommodation">("all");
  const [status, setStatus] = useState<"all" | AdminContentStatus>("all");

  const load = useCallback(async () => {
    if (!allowed) { setLoading(false); return; }
    setLoading(true);
    try { setListings(await getAdminTravelListings()); }
    catch (error) { showToast(error instanceof Error ? error.message : "ไม่สามารถโหลดทริปและที่พักได้", "error"); }
    finally { setLoading(false); }
  }, [allowed, showToast]);
  useEffect(() => { void load(); }, [load]);

  const visible = useMemo(() => listings.filter((listing) => {
    const matchesText = `${listing.title} ${listing.operator_name} ${listing.province_name}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesText && (type === "all" || listing.listing_type === type) && (status === "all" || listing.status === status);
  }), [listings, query, status, type]);

  const toggleVisibility = async (listing: AdminTravelListing) => {
    try {
      await updateAdminTravelListing(listing.id, { is_visible: !listing.is_visible });
      showToast(listing.is_visible ? "ซ่อนรายการจากหน้าลูกค้าแล้ว" : "แสดงรายการบนหน้าลูกค้าแล้ว");
      await load();
    } catch (error) { showToast(error instanceof Error ? error.message : "อัปเดตการแสดงผลไม่สำเร็จ", "error"); }
  };

  if (authLoading || loading) return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="items-center justify-center"><ActivityIndicator color={HOBEE.colors.goldDark} size="large" /></ScreenContainer>;
  if (!allowed) return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="items-center justify-center"><Text className="text-sm font-bold text-muted">บัญชีนี้ไม่มีสิทธิ์เข้าถึง HOBEE Admin Portal</Text></ScreenContainer>;

  return <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-[#F3F4F2]"><AdminPortalShell active="travel" title="ทริปและที่พัก" subtitle="จัดการรายละเอียด ราคา ห้องพัก การเผยแพร่ และรูปภาพจากข้อมูล Supabase ชุดเดียว" onNavigate={navigate}>
    <View style={styles.toolbar}><View style={styles.search}><MaterialIcons name="search" size={20} color={HOBEE.colors.muted} /><TextInput value={query} onChangeText={setQuery} placeholder="ค้นหาทริป ที่พัก จังหวัด หรือผู้ประกอบการ" placeholderTextColor={HOBEE.colors.muted} style={styles.searchInput} /></View><View style={styles.filters}>{(["all", "trip", "accommodation"] as const).map((value) => <Filter key={value} label={value === "all" ? "ทั้งหมด" : value === "trip" ? "ทริป" : "ที่พัก"} active={type === value} onPress={() => setType(value)} />)}</View><Pressable onPress={() => router.push("/admin/travel/new" as any)} style={styles.add}><MaterialIcons name="add" size={18} color={HOBEE.colors.ink} /><Text style={styles.addText}>เพิ่มทริป/ที่พัก</Text></Pressable></View>
    <View style={styles.statusFilters}>{(["all", "published", "draft", "archived"] as const).map((value) => <Filter key={value} label={value === "all" ? "ทุกสถานะ" : value === "published" ? "เผยแพร่" : value === "draft" ? "ฉบับร่าง" : "เก็บถาวร"} active={status === value} onPress={() => setStatus(value)} />)}</View>
    <AdminCard style={styles.card}><AdminCardTitle title={`รายการจัดการ · ${visible.length}`} action="รีเฟรช" onAction={() => void load()} /><ScrollView horizontal showsHorizontalScrollIndicator={false}><View style={styles.table}><View style={[styles.row, styles.head]}><Text style={[styles.headText, styles.titleColumn]}>รายการ</Text><Text style={[styles.headText, styles.typeColumn]}>ประเภท</Text><Text style={[styles.headText, styles.priceColumn]}>ราคาเริ่มต้น</Text><Text style={[styles.headText, styles.roomColumn]}>ห้องพัก</Text><Text style={[styles.headText, styles.stateColumn]}>สถานะ</Text><Text style={styles.actionColumn}> </Text></View>{visible.map((listing) => <View key={listing.id} style={styles.row}><View style={styles.titleColumn}><Text numberOfLines={1} style={styles.title}>{listing.title}</Text><Text numberOfLines={1} style={styles.meta}>{listing.province_name} · {listing.operator_name}</Text></View><Text style={[styles.cell, styles.typeColumn]}>{listing.listing_type === "trip" ? "ทริป" : "ที่พัก"}</Text><Text style={[styles.cellStrong, styles.priceColumn]}>{formatThaiBaht(listing.price_from)}</Text><Text style={[styles.cell, styles.roomColumn]}>{listing.rooms.length ? `${listing.rooms.length} ประเภท` : "—"}</Text><View style={styles.stateColumn}><Text style={[styles.statusPill, listing.status === "published" && styles.published]}>{listing.status === "published" ? "เผยแพร่" : listing.status === "draft" ? "ฉบับร่าง" : "เก็บถาวร"}</Text><Text style={[styles.visibility, !listing.is_visible && styles.hidden]}>{listing.is_visible ? "แสดง" : "ซ่อน"}</Text></View><View style={styles.actionColumn}><Pressable onPress={() => void toggleVisibility(listing)} style={styles.iconAction}><MaterialIcons name={listing.is_visible ? "visibility-off" : "visibility"} size={17} color={HOBEE.colors.goldDark} /></Pressable><Pressable onPress={() => router.push({ pathname: "/admin/travel/[id]" as any, params: { id: listing.id } })} style={styles.edit}><Text style={styles.editText}>จัดการ</Text><MaterialIcons name="arrow-forward" size={15} color={HOBEE.colors.goldDark} /></Pressable></View></View>)}</View></ScrollView>{!visible.length ? <Text style={styles.empty}>ไม่พบรายการที่ตรงกับตัวกรอง</Text> : null}</AdminCard>
  </AdminPortalShell></ScreenContainer>;
}

function Filter({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) { return <Pressable onPress={onPress} style={[styles.filter, active && styles.filterActive]}><Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text></Pressable>; }

const styles = StyleSheet.create({ toolbar: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 }, search: { flex: 1, maxWidth: 410, flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 13, backgroundColor: "#FFFFFF", paddingHorizontal: 13, paddingVertical: 11 }, searchInput: { flex: 1, color: HOBEE.colors.ink, fontSize: 13, fontWeight: "700" }, filters: { flexDirection: "row", gap: 6 }, statusFilters: { flexDirection: "row", gap: 6, marginBottom: 18 }, filter: { borderRadius: 10, backgroundColor: "#E8E9E7", paddingHorizontal: 10, paddingVertical: 8 }, filterActive: { backgroundColor: HOBEE.colors.darkCard }, filterText: { color: HOBEE.colors.muted, fontSize: 11, fontWeight: "800" }, filterTextActive: { color: "#FFFFFF" }, add: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 11, backgroundColor: HOBEE.colors.gold, paddingHorizontal: 12, paddingVertical: 10 }, addText: { color: HOBEE.colors.ink, fontSize: 11, fontWeight: "900" }, card: { padding: 0, overflow: "hidden" }, table: { minWidth: 1000 }, row: { flexDirection: "row", alignItems: "center", minHeight: 73, borderTopWidth: 1, borderTopColor: "#EFF0EE", paddingHorizontal: 20 }, head: { minHeight: 46, borderTopWidth: 0, backgroundColor: "#F9FAF8" }, headText: { color: HOBEE.colors.muted, fontSize: 10, fontWeight: "900", letterSpacing: 0.5 }, titleColumn: { width: 330 }, typeColumn: { width: 100 }, priceColumn: { width: 125 }, roomColumn: { width: 105 }, stateColumn: { width: 150 }, actionColumn: { width: 180, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 10 }, title: { color: HOBEE.colors.ink, fontSize: 13, fontWeight: "900" }, meta: { marginTop: 4, color: HOBEE.colors.muted, fontSize: 10, fontWeight: "600" }, cell: { color: HOBEE.colors.muted, fontSize: 12, fontWeight: "700" }, cellStrong: { color: HOBEE.colors.ink, fontSize: 12, fontWeight: "900" }, statusPill: { alignSelf: "flex-start", borderRadius: 9, backgroundColor: "#ECEDEC", color: HOBEE.colors.muted, fontSize: 10, fontWeight: "900", paddingHorizontal: 8, paddingVertical: 5 }, published: { backgroundColor: "#E8F7F1", color: "#22765D" }, visibility: { marginTop: 4, color: "#22765D", fontSize: 10, fontWeight: "800" }, hidden: { color: HOBEE.colors.error }, iconAction: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "#FFF7E5" }, edit: { flexDirection: "row", alignItems: "center", gap: 3 }, editText: { color: HOBEE.colors.goldDark, fontSize: 11, fontWeight: "900" }, empty: { padding: 26, color: HOBEE.colors.muted, fontSize: 13, fontWeight: "700" } });
