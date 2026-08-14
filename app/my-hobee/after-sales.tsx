import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router as expoRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import { HOBEE } from "@/components/hobee/design-tokens";
import { AtmosphericCanvas } from "@/components/hobee/layered-ui";
import { MyHobeeEmptyState, MyHobeeHeader } from "@/components/hobee/my-hobee-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { useToast } from "@/contexts/toast-context";
import { haptic } from "@/lib/haptics";
import { listAfterSalesOperationsQueue, reviewAfterSalesCase, type AfterSalesOperationCase } from "@/lib/after-sales";

const router = expoRouter as { push: (href: string) => void; replace: (href: string) => void };
type QueueFilter = "all" | "new" | "review" | "return" | "refund" | "replacement" | "risk";

export default function MyHobeeAfterSalesScreen() {
  const { user } = useSupabaseAuth();
  const { showToast } = useToast();
  const [cases, setCases] = useState<AfterSalesOperationCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<QueueFilter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (refresh = false) => {
    if (!user) { setCases([]); setLoading(false); return; }
    refresh ? setRefreshing(true) : setLoading(true);
    try { setCases(await listAfterSalesOperationsQueue()); }
    catch { showToast("ยังโหลดเคสหลังการขายไม่สำเร็จ", "error"); }
    finally { setLoading(false); setRefreshing(false); }
  }, [showToast, user]);
  useEffect(() => { void load(); }, [load]);

  const summary = useMemo(() => ({
    fresh: cases.filter((item) => item.status === "submitted").length,
    reply: cases.filter((item) => item.status === "need_more_info").length,
    returns: cases.filter((item) => item.queueLabel === "รอคืนสินค้า").length,
    refunds: cases.filter((item) => item.queueLabel === "รอคืนเงิน").length,
    replacements: cases.filter((item) => item.queueLabel === "รอเปลี่ยนสินค้า").length,
    risks: cases.filter((item) => item.slaState === "at_risk" || item.slaState === "breached").length,
  }), [cases]);
  const shownCases = useMemo(() => cases.filter((item) => {
    if (filter === "all") return true;
    if (filter === "new") return item.status === "submitted";
    if (filter === "review") return ["under_review", "need_more_info"].includes(item.status);
    if (filter === "return") return item.queueLabel === "รอคืนสินค้า";
    if (filter === "refund") return item.queueLabel === "รอคืนเงิน";
    if (filter === "replacement") return item.queueLabel === "รอเปลี่ยนสินค้า";
    return item.slaState === "at_risk" || item.slaState === "breached";
  }), [cases, filter]);

  const quickUpdate = (record: AfterSalesOperationCase, nextStatus: "under_review" | "need_more_info") => {
    const title = nextStatus === "under_review" ? "รับเรื่องและเริ่มตรวจสอบ" : "ขอข้อมูลเพิ่มเติม";
    Alert.alert(title, `อัปเดตเคส ${record.case_number} ใช่หรือไม่`, [
      { text: "ยกเลิก", style: "cancel" },
      { text: "ยืนยัน", onPress: () => void (async () => {
        setBusyId(record.id);
        try { await reviewAfterSalesCase(record.id, nextStatus); haptic.success(); showToast("อัปเดตเคสแล้ว"); await load(true); }
        catch (cause) { haptic.error(); showToast(cause instanceof Error ? cause.message : "อัปเดตเคสไม่สำเร็จ", "error"); }
        finally { setBusyId(null); }
      })() },
    ]);
  };

  return <ScreenContainer containerClassName="bg-[#F6F3ED]" edges={["top", "left", "right"]}>
    <AtmosphericCanvas mood="account">
      <View style={styles.top}><MyHobeeHeader title="AFTER-SALES" onBack={() => router.replace("/my-hobee/work")} /><Text style={styles.title}>บริการหลังการขาย</Text><Text style={styles.subtitle}>จัดการคำร้อง ลูกค้ารอคำตอบ และงานที่มีความเร่งด่วนจากองค์กรของคุณ</Text></View>
      {!user ? <View style={styles.guest}><MyHobeeEmptyState icon="lock-outline" title="เข้าสู่ระบบเพื่อเปิด After-Sales" description="เฉพาะสมาชิกองค์กรที่มีสิทธิ์จัดการเคสจะเห็นรายการในหน้านี้" actionLabel="เข้าสู่ระบบ" onAction={() => router.push("/auth")} /></View> : <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={HOBEE.colors.goldDark} />}>
        {loading ? <View style={styles.loading}><ActivityIndicator color={HOBEE.colors.goldDark} /><Text style={styles.loadingText}>กำลังโหลด After-Sales</Text></View> : <>
          <View style={styles.summaryGrid}><SummaryCard icon="fiber-new" value={summary.fresh} label="เคสใหม่" tone="gold" /><SummaryCard icon="reply" value={summary.reply} label="รอตอบ" tone="teal" /><SummaryCard icon="assignment-return" value={summary.returns} label="รอคืนสินค้า" tone="blue" /><SummaryCard icon="account-balance-wallet" value={summary.refunds} label="Refund" tone="rose" /><SummaryCard icon="autorenew" value={summary.replacements} label="Replacement" tone="purple" /><SummaryCard icon="priority-high" value={summary.risks} label="SLA Risk" tone="red" /></View>
          <Text style={styles.sectionTitle}>เคสที่ต้องจัดการก่อน</Text><Text style={styles.sectionSub}>เรียงตาม SLA, ความเร่งด่วน และการอัปเดตล่าสุด</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{([ ["all", "ทั้งหมด"], ["new", "เคสใหม่"], ["review", "รอตรวจ"], ["return", "Return"], ["refund", "Refund"], ["replacement", "Replacement"], ["risk", "SLA Risk"] ] as Array<[QueueFilter, string]>).map(([key, text]) => <Pressable key={key} onPress={() => setFilter(key)} style={({ pressed }) => [styles.filter, filter === key && styles.filterActive, pressed && styles.pressed]}><Text style={[styles.filterText, filter === key && styles.filterTextActive]}>{text}</Text></Pressable>)}</ScrollView>
          {shownCases.length ? <View style={styles.caseList}>{shownCases.map((record) => <CaseCard key={record.id} record={record} busy={busyId === record.id} onOpen={() => router.push(`/claims/${record.id}`)} onQuick={() => quickUpdate(record, record.status === "submitted" ? "under_review" : "need_more_info")} />)}</View> : <MyHobeeEmptyState icon="support-agent" title="ไม่มีเคสตามตัวกรองนี้" description="เมื่อมีคำร้องในร้านที่คุณมีสิทธิ์จัดการ รายการจะมาอยู่ในคิวเดียวกัน" />}
        </>}
      </ScrollView>}
    </AtmosphericCanvas>
  </ScreenContainer>;
}

function SummaryCard({ icon, value, label, tone }: { icon: keyof typeof MaterialIcons.glyphMap; value: number; label: string; tone: string }) { return <View style={[styles.summaryCard, styles[`tone_${tone}` as keyof typeof styles] as object]}><MaterialIcons name={icon} size={18} color={HOBEE.colors.ink} /><Text style={styles.summaryValue}>{value}</Text><Text style={styles.summaryLabel}>{label}</Text></View>; }
function CaseCard({ record, busy, onOpen, onQuick }: { record: AfterSalesOperationCase; busy: boolean; onOpen: () => void; onQuick: () => void }) { const action = record.status === "submitted" ? "รับเรื่อง" : record.status === "under_review" ? "ขอข้อมูล" : null; return <View style={[styles.caseCard, record.slaState === "breached" && styles.caseCardBreach]}><Pressable onPress={onOpen} style={({ pressed }) => [styles.caseMain, pressed && styles.pressed]}><View style={styles.caseTop}><View style={styles.caseCopy}><Text style={styles.caseNumber}>{record.case_number}</Text><Text numberOfLines={1} style={styles.caseDescription}>{record.description}</Text></View><View style={[styles.slaBadge, record.slaState === "breached" && styles.slaBreach, record.slaState === "at_risk" && styles.slaRisk]}><Text style={styles.slaText}>{record.slaState === "breached" ? "เกิน SLA" : record.slaState === "at_risk" ? "ใกล้ SLA" : record.queueLabel}</Text></View></View><View style={styles.caseMeta}><Text style={styles.caseMetaText}>{record.queueLabel}</Text><Text style={styles.caseMetaText}>{record.priority === "urgent" ? "เร่งด่วน" : record.priority}</Text></View></Pressable><View style={styles.caseActions}>{action ? <Pressable disabled={busy} onPress={onQuick} style={({ pressed }) => [styles.quickButton, (busy || pressed) && styles.pressed]}>{busy ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.quickText}>{action}</Text>}</Pressable> : null}<Pressable onPress={onOpen} style={({ pressed }) => [styles.detailButton, pressed && styles.pressed]}><Text style={styles.detailText}>รายละเอียด</Text><MaterialIcons name="chevron-right" size={17} color={HOBEE.colors.travelTeal} /></Pressable></View></View>; }

const styles = StyleSheet.create({ top: { backgroundColor: HOBEE.colors.darkBase, paddingBottom: 18, ...HOBEE.elevation.featured }, title: { marginTop: 12, paddingHorizontal: HOBEE.space.page, color: "#FFFFFF", fontSize: 23, fontWeight: "900" }, subtitle: { marginTop: 5, paddingHorizontal: HOBEE.space.page, color: "rgba(255,255,255,0.74)", fontSize: 12, fontWeight: "600", lineHeight: 18 }, guest: { flex: 1, justifyContent: "center", padding: HOBEE.space.page }, content: { gap: 12, padding: HOBEE.space.page, paddingBottom: 155 }, loading: { alignItems: "center", gap: 10, paddingVertical: 44 }, loadingText: { color: HOBEE.colors.muted, fontSize: 13, fontWeight: "700" }, summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9 }, summaryCard: { width: "31.8%", alignItems: "center", borderRadius: 15, paddingVertical: 12, ...HOBEE.elevation.surface }, tone_gold: { backgroundColor: "#F9E7A6" }, tone_teal: { backgroundColor: "#D8EEE8" }, tone_blue: { backgroundColor: "#DFEAFE" }, tone_rose: { backgroundColor: "#FCE1E8" }, tone_purple: { backgroundColor: "#EDE2FD" }, tone_red: { backgroundColor: "#FFE3DD" }, summaryValue: { marginTop: 3, color: HOBEE.colors.ink, fontSize: 21, fontWeight: "900" }, summaryLabel: { marginTop: 2, color: HOBEE.colors.ink, fontSize: 9, fontWeight: "800", textAlign: "center" }, sectionTitle: { marginTop: 7, color: HOBEE.colors.ink, fontSize: 19, fontWeight: "900" }, sectionSub: { marginTop: -8, color: HOBEE.colors.muted, fontSize: 11, fontWeight: "600" }, filters: { gap: 6, paddingVertical: 3 }, filter: { borderRadius: 12, backgroundColor: "#EAE8E4", paddingHorizontal: 11, paddingVertical: 8 }, filterActive: { backgroundColor: HOBEE.colors.darkBase }, filterText: { color: HOBEE.colors.muted, fontSize: 11, fontWeight: "800" }, filterTextActive: { color: "#FFFFFF" }, caseList: { gap: 10 }, caseCard: { borderRadius: HOBEE.radius.card, borderWidth: 1, borderColor: "#E2E7E2", backgroundColor: "rgba(255,255,255,0.88)", padding: 13, ...HOBEE.elevation.card }, caseCardBreach: { borderColor: "#F0B7A8", backgroundColor: "#FFF9F7" }, caseMain: { gap: 9 }, caseTop: { flexDirection: "row", justifyContent: "space-between", gap: 10 }, caseCopy: { flex: 1 }, caseNumber: { color: HOBEE.colors.ink, fontSize: 14, fontWeight: "900" }, caseDescription: { marginTop: 3, color: HOBEE.colors.muted, fontSize: 11, fontWeight: "600" }, slaBadge: { alignSelf: "flex-start", borderRadius: 8, backgroundColor: "#E5F3E6", paddingHorizontal: 7, paddingVertical: 4 }, slaRisk: { backgroundColor: "#FFF0C7" }, slaBreach: { backgroundColor: "#FFE1D9" }, slaText: { color: HOBEE.colors.ink, fontSize: 9, fontWeight: "900" }, caseMeta: { flexDirection: "row", gap: 8 }, caseMetaText: { color: HOBEE.colors.travelTeal, fontSize: 10, fontWeight: "800" }, caseActions: { flexDirection: "row", gap: 8, marginTop: 12 }, quickButton: { flex: 1, alignItems: "center", borderRadius: 10, backgroundColor: HOBEE.colors.travelTeal, paddingVertical: 10 }, quickText: { color: "#FFFFFF", fontSize: 11, fontWeight: "900" }, detailButton: { flexDirection: "row", flex: 1, alignItems: "center", justifyContent: "center", gap: 3, borderRadius: 10, borderWidth: 1, borderColor: "#BFDED3", paddingVertical: 9 }, detailText: { color: HOBEE.colors.travelTeal, fontSize: 11, fontWeight: "900" }, pressed: { opacity: 0.78, transform: [{ scale: HOBEE.motion.pressScale }] } });
