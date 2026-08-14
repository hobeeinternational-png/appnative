import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router as expoRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { HOBEE } from "@/components/hobee/design-tokens";
import { AtmosphericCanvas } from "@/components/hobee/layered-ui";
import { MyHobeeEmptyState, MyHobeeHeader, MyHobeeSegments, formatHobeeCurrency } from "@/components/hobee/my-hobee-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { useToast } from "@/contexts/toast-context";
import { haptic } from "@/lib/haptics";
import { loadMyHobeeSnapshot, setWorkInboxItemRead, workItemTypeLabel, type MyHobeeSnapshot, type MyHobeeWorkInboxItem } from "@/lib/my-hobee";
import { loadMyHobeeOperationOrders, performMyHobeeOrderOperation, shipMyHobeeOrder, type MyHobeeOperationOrder, type MyHobeeOrderOperation } from "@/lib/my-hobee-phase2";
import { ORDER_OPERATION_DETAILS, nextOrderOperation } from "@/lib/my-hobee-phase2-summary";
import { orderStatusLabel, paymentStatusLabel } from "@/lib/orders";

const router = expoRouter as { push: (href: string) => void; replace: (href: string) => void };
type InboxFilter = "all" | "orders" | "bookings" | "tasks" | "unread";
type OrderFilter = "active" | "shipped" | "all";

export default function MyHobeeWorkScreen() {
  const { user } = useSupabaseAuth();
  const { showToast } = useToast();
  const [snapshot, setSnapshot] = useState<MyHobeeSnapshot | null>(null);
  const [operationOrders, setOperationOrders] = useState<MyHobeeOperationOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inboxFilter, setInboxFilter] = useState<InboxFilter>("all");
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("active");
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [operatingOrderId, setOperatingOrderId] = useState<string | null>(null);
  const [confirmOperation, setConfirmOperation] = useState<{ order: MyHobeeOperationOrder; action: MyHobeeOrderOperation } | null>(null);
  const [shippingOrder, setShippingOrder] = useState<MyHobeeOperationOrder | null>(null);
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");

  const load = useCallback(async (isRefresh = false) => {
    if (!user) { setSnapshot(null); setOperationOrders([]); setLoading(false); return; }
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const [nextSnapshot, nextOperationOrders] = await Promise.all([loadMyHobeeSnapshot(user.id), loadMyHobeeOperationOrders()]);
      setSnapshot(nextSnapshot); setOperationOrders(nextOperationOrders);
    } catch { showToast("ยังโหลด Work Center ไม่สำเร็จ กรุณาลองใหม่", "error"); }
    finally { setLoading(false); setRefreshing(false); }
  }, [showToast, user]);
  useEffect(() => { void load(); }, [load]);

  const inbox = useMemo(() => (snapshot?.inbox ?? []).filter((item) => inboxFilter === "all" || (inboxFilter === "unread" ? !item.is_read : inboxFilter === "orders" ? item.item_type === "ORDER" : inboxFilter === "bookings" ? item.item_type === "BOOKING" : !["ORDER", "BOOKING"].includes(item.item_type))), [inboxFilter, snapshot?.inbox]);
  const customerOrders = useMemo(() => (snapshot?.orders ?? []).filter((order) => orderFilter === "all" || (orderFilter === "shipped" ? order.status === "shipped" : ["pending", "confirmed", "processing"].includes(order.status))), [orderFilter, snapshot?.orders]);

  const markRead = async (item: MyHobeeWorkInboxItem) => {
    if (item.is_read || updatingItemId) return;
    setUpdatingItemId(item.id);
    try {
      await setWorkInboxItemRead(item.id);
      setSnapshot((current) => current ? { ...current, inbox: current.inbox.map((candidate) => candidate.id === item.id ? { ...candidate, is_read: true } : candidate), customer: { ...current.customer, unreadWorkItems: Math.max(0, current.customer.unreadWorkItems - 1), urgentWorkItems: item.urgency_level === "urgent" ? Math.max(0, current.customer.urgentWorkItems - 1) : current.customer.urgentWorkItems } } : current);
    } catch { showToast("อัปเดตสถานะงานไม่สำเร็จ", "error"); }
    finally { setUpdatingItemId(null); }
  };
  const runOperation = async (order: MyHobeeOperationOrder, action: MyHobeeOrderOperation) => {
    if (operatingOrderId) return;
    setOperatingOrderId(order.id);
    try { await performMyHobeeOrderOperation(order.id, action); haptic.success(); showToast(ORDER_OPERATION_DETAILS[action].success); setConfirmOperation(null); await load(true); }
    catch (cause) { haptic.error(); showToast(cause instanceof Error ? cause.message : "อัปเดตสถานะออเดอร์ไม่สำเร็จ", "error"); }
    finally { setOperatingOrderId(null); }
  };
  const startOperation = (order: MyHobeeOperationOrder) => {
    const action = nextOrderOperation(order.status, order.has_ready_event);
    if (!action) return;
    haptic.light();
    if (action === "SHIPPED") { setCarrier(""); setTrackingNumber(""); setTrackingUrl(""); setShippingOrder(order); return; }
    if (ORDER_OPERATION_DETAILS[action].confirm) { setConfirmOperation({ order, action }); return; }
    void runOperation(order, action);
  };
  const submitShipment = async () => {
    if (!shippingOrder) return;
    if (!carrier.trim() || !trackingNumber.trim()) { haptic.error(); showToast("กรุณาระบุ carrier และ tracking number", "error"); return; }
    setOperatingOrderId(shippingOrder.id);
    try { await shipMyHobeeOrder(shippingOrder.id, carrier, trackingNumber, trackingUrl); haptic.success(); showToast("บันทึกการจัดส่งและ tracking แล้ว"); setShippingOrder(null); await load(true); }
    catch (cause) { haptic.error(); showToast(cause instanceof Error ? cause.message : "บันทึกการจัดส่งไม่สำเร็จ", "error"); }
    finally { setOperatingOrderId(null); }
  };

  return (
    <ScreenContainer containerClassName="bg-[#F6F3ED]" edges={["top", "left", "right"]}>
      <AtmosphericCanvas mood="account">
        <View style={styles.top}><MyHobeeHeader title="WORK CENTER" onBack={() => router.replace("/my-hobee")} notificationCount={snapshot?.customer.unreadWorkItems ?? 0} /><Text style={styles.title}>งานและออเดอร์ของฉัน</Text><Text style={styles.subtitle}>ติดตามสิ่งที่ต้องทำจากทุกบทบาทโดยไม่ต้องสลับหลาย workspace</Text><MyHobeeSegments active="work" /></View>
        {!user ? <View style={styles.guest}><MyHobeeEmptyState icon="lock-outline" title="เข้าสู่ระบบเพื่อเปิด Work Center" description="เมื่อคุณมีบัญชี งาน ออเดอร์ และกิจกรรมที่เกี่ยวข้องจะแสดงที่นี่" actionLabel="เข้าสู่ระบบ" onAction={() => router.push("/auth")} /></View> : <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={HOBEE.colors.goldDark} />} contentContainerStyle={styles.content}>
          {loading && !snapshot ? <View style={styles.loading}><ActivityIndicator color={HOBEE.colors.goldDark} /><Text style={styles.loadingText}>กำลังโหลด Work Center</Text></View> : null}
          {snapshot ? <>
            <View style={styles.summary}><SummaryCell icon="mark-email-unread" value={snapshot.customer.unreadWorkItems} label="ยังไม่อ่าน" /><View style={styles.summaryDivider} /><SummaryCell icon="priority-high" value={snapshot.customer.urgentWorkItems} label="เร่งด่วน" /><View style={styles.summaryDivider} /><SummaryCell icon="inventory-2" value={snapshot.customer.activeCustomerOrders} label="ออเดอร์ลูกค้า" /></View>
            <SectionHeading title="Work Inbox" label="รายการจากบทบาทและองค์กรของคุณ" /><SegmentControl items={[{ key: "all", label: "All Work" }, { key: "orders", label: "Orders" }, { key: "bookings", label: "Bookings" }, { key: "tasks", label: "Tasks" }, { key: "unread", label: "ยังไม่อ่าน" }]} value={inboxFilter} onChange={(next) => setInboxFilter(next as InboxFilter)} />
            {inbox.length ? <View style={styles.inboxList}>{inbox.map((item) => <InboxRow key={item.id} item={item} isUpdating={updatingItemId === item.id} onPress={() => void markRead(item)} />)}</View> : <MyHobeeEmptyState icon="inbox" title={inboxFilter === "unread" ? "ไม่มีงานที่ยังไม่อ่าน" : "Work Inbox ยังว่างอยู่"} description={inboxFilter === "unread" ? "คุณติดตามรายการที่เข้ามาแล้วทั้งหมด" : "เมื่องานหรือการอนุมัติถูกส่งถึงบทบาทของคุณ จะแสดงในพื้นที่นี้"} />}
            <SectionHeading title="Mobile Order Center" label="ออเดอร์จากบัญชีของคุณ" /><SegmentControl items={[{ key: "active", label: "กำลังดำเนินการ" }, { key: "shipped", label: "จัดส่งแล้ว" }, { key: "all", label: "ทั้งหมด" }]} value={orderFilter} onChange={(next) => setOrderFilter(next as OrderFilter)} />
            {customerOrders.length ? <View style={styles.orderList}>{customerOrders.map((order) => <Pressable key={order.id} onPress={() => router.push(`/orders/${order.id}`)} style={({ pressed }) => [styles.orderCard, pressed && styles.pressed]}><OrderCopy order={order} /><MaterialIcons name="chevron-right" size={21} color={HOBEE.colors.muted} /></Pressable>)}</View> : <MyHobeeEmptyState icon="inventory-2" title="ไม่มีออเดอร์ตามตัวกรองนี้" description="คำสั่งซื้อที่เชื่อมกับบัญชีจะปรากฏพร้อมสถานะจริงที่นี่" />}
            <SectionHeading title="Mobile Order Operations" label="ออเดอร์ธุรกิจที่คุณมีสิทธิ์ดำเนินการ" />
            {operationOrders.length ? <View style={styles.operationList}>{operationOrders.map((order) => <OperationOrderCard key={order.id} order={order} busy={operatingOrderId === order.id} onAction={() => startOperation(order)} />)}</View> : <MyHobeeEmptyState icon="manage-accounts" title="ยังไม่มีออเดอร์ธุรกิจที่คุณจัดการได้" description="เมื่อคุณมีสิทธิ์ MANAGE_ORDERS ในองค์กร ออเดอร์ที่เกี่ยวข้องจะแสดงพร้อม quick actions ที่นี่" />}
          </> : null}
        </ScrollView>}
      </AtmosphericCanvas>
      <ShipmentModal visible={!!shippingOrder} orderNumber={shippingOrder?.order_number ?? ""} carrier={carrier} trackingNumber={trackingNumber} trackingUrl={trackingUrl} busy={!!operatingOrderId} onCarrier={setCarrier} onTracking={setTrackingNumber} onUrl={setTrackingUrl} onClose={() => setShippingOrder(null)} onSubmit={() => void submitShipment()} />
      <ConfirmOperationModal visible={!!confirmOperation} orderNumber={confirmOperation?.order.order_number ?? ""} action={confirmOperation?.action ?? "COMPLETED"} busy={!!operatingOrderId} onClose={() => setConfirmOperation(null)} onConfirm={() => confirmOperation && void runOperation(confirmOperation.order, confirmOperation.action)} />
    </ScreenContainer>
  );
}

function SectionHeading({ title, label }: { title: string; label: string }) { return <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>{title}</Text><Text style={styles.sectionLabel}>{label}</Text></View>; }
function SegmentControl({ items, value, onChange }: { items: Array<{ key: string; label: string }>; value: string; onChange: (value: string) => void }) { return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.control}>{items.map((item) => <Pressable key={item.key} onPress={() => onChange(item.key)} style={({ pressed }) => [styles.controlItem, value === item.key && styles.controlItemActive, pressed && styles.pressed]}><Text style={[styles.controlText, value === item.key && styles.controlTextActive]}>{item.label}</Text></Pressable>)}</ScrollView>; }
function SummaryCell({ icon, value, label }: { icon: keyof typeof MaterialIcons.glyphMap; value: number; label: string }) { return <View style={styles.summaryCell}><MaterialIcons name={icon} size={19} color={HOBEE.colors.travelTeal} /><Text style={styles.summaryValue}>{new Intl.NumberFormat("th-TH").format(value)}</Text><Text style={styles.summaryLabel}>{label}</Text></View>; }
function InboxRow({ item, isUpdating, onPress }: { item: MyHobeeWorkInboxItem; isUpdating: boolean; onPress: () => void }) { const urgent = item.urgency_level === "urgent"; return <Pressable onPress={onPress} style={({ pressed }) => [styles.inboxRow, !item.is_read && styles.inboxRowUnread, pressed && styles.pressed]}><View style={[styles.inboxIcon, urgent && styles.inboxIconUrgent]}>{isUpdating ? <ActivityIndicator size="small" color={HOBEE.colors.goldDark} /> : <MaterialIcons name={urgent ? "priority-high" : "work-outline"} size={20} color={urgent ? HOBEE.colors.error : HOBEE.colors.travelTeal} />}</View><View style={styles.inboxCopy}><View style={styles.inboxTitleRow}><Text numberOfLines={1} style={[styles.inboxTitle, !item.is_read && styles.inboxTitleUnread]}>{item.title}</Text>{!item.is_read ? <View style={styles.unreadDot} /> : null}</View><Text numberOfLines={1} style={styles.inboxBody}>{item.body ?? workItemTypeLabel(item.item_type)}</Text><Text style={styles.inboxMeta}>{workItemTypeLabel(item.item_type)}{item.due_at ? ` · ครบกำหนด ${formatWorkDate(item.due_at)}` : ""}</Text></View><MaterialIcons name="chevron-right" size={21} color={HOBEE.colors.muted} /></Pressable>; }
function OrderCopy({ order }: { order: { order_number: string; created_at: string; status: string; payment_status: string; total: number } }) { return <View style={styles.orderCopy}><View style={styles.orderTop}><View><Text style={styles.orderNumber}>{order.order_number}</Text><Text style={styles.orderDate}>{formatWorkDate(order.created_at)}</Text></View><View style={styles.orderStatus}><Text style={styles.orderStatusText}>{orderStatusLabel(order.status)}</Text></View></View><View style={styles.orderBottom}><Text style={styles.orderPayment}>{paymentStatusLabel(order.payment_status)}</Text><Text style={styles.orderAmount}>{formatHobeeCurrency(Number(order.total))}</Text></View></View>; }
function OperationOrderCard({ order, busy, onAction }: { order: MyHobeeOperationOrder; busy: boolean; onAction: () => void }) { const action = nextOrderOperation(order.status, order.has_ready_event); return <View style={styles.operationCard}><OrderCopy order={order} />{action ? <Pressable disabled={busy} onPress={onAction} style={({ pressed }) => [styles.operationAction, (pressed || busy) && styles.pressed]}>{busy ? <ActivityIndicator size="small" color="#FFFFFF" /> : <><Text style={styles.operationActionText}>{ORDER_OPERATION_DETAILS[action].label}</Text><MaterialIcons name="arrow-forward" size={16} color="#FFFFFF" /></>}</Pressable> : <Text style={styles.operationComplete}>การดำเนินการเสร็จสิ้น</Text>}</View>; }
function ShipmentModal({ visible, orderNumber, carrier, trackingNumber, trackingUrl, busy, onCarrier, onTracking, onUrl, onClose, onSubmit }: { visible: boolean; orderNumber: string; carrier: string; trackingNumber: string; trackingUrl: string; busy: boolean; onCarrier: (value: string) => void; onTracking: (value: string) => void; onUrl: (value: string) => void; onClose: () => void; onSubmit: () => void }) { return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}><View style={styles.backdrop}><View style={styles.sheet}><Text style={styles.sheetTitle}>บันทึกการจัดส่ง</Text><Text style={styles.sheetSub}>{orderNumber} · ต้องมี carrier และ tracking number ก่อนเปลี่ยนสถานะ</Text><TextInput value={carrier} onChangeText={onCarrier} placeholder="Carrier เช่น Thailand Post, Flash Express" placeholderTextColor={HOBEE.colors.muted} style={styles.input} /><TextInput value={trackingNumber} onChangeText={onTracking} placeholder="Tracking number" placeholderTextColor={HOBEE.colors.muted} autoCapitalize="characters" style={styles.input} /><TextInput value={trackingUrl} onChangeText={onUrl} placeholder="Tracking URL (ไม่บังคับ)" placeholderTextColor={HOBEE.colors.muted} autoCapitalize="none" keyboardType="url" style={styles.input} /><View style={styles.sheetActions}><Pressable disabled={busy} onPress={onClose} style={styles.cancel}><Text style={styles.cancelText}>ยกเลิก</Text></Pressable><Pressable disabled={busy} onPress={onSubmit} style={styles.shipButton}><Text style={styles.shipButtonText}>{busy ? "กำลังบันทึก" : "ยืนยันการจัดส่ง"}</Text></Pressable></View></View></View></Modal>; }
function ConfirmOperationModal({ visible, orderNumber, action, busy, onClose, onConfirm }: { visible: boolean; orderNumber: string; action: MyHobeeOrderOperation; busy: boolean; onClose: () => void; onConfirm: () => void }) { return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}><View style={styles.backdrop}><View style={styles.confirmCard}><View style={styles.confirmIcon}><MaterialIcons name="verified" size={25} color={HOBEE.colors.travelTeal} /></View><Text style={styles.confirmTitle}>ยืนยันการดำเนินการ?</Text><Text style={styles.confirmText}>คุณกำลัง{ORDER_OPERATION_DETAILS[action].label}สำหรับ {orderNumber}</Text><View style={styles.sheetActions}><Pressable disabled={busy} onPress={onClose} style={styles.cancel}><Text style={styles.cancelText}>ย้อนกลับ</Text></Pressable><Pressable disabled={busy} onPress={onConfirm} style={styles.shipButton}><Text style={styles.shipButtonText}>{busy ? "กำลังบันทึก" : "ยืนยัน"}</Text></Pressable></View></View></View></Modal>; }
function formatWorkDate(value: string) { try { return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)); } catch { return ""; } }

const styles = StyleSheet.create({
  top: { overflow: "hidden", paddingBottom: 17, backgroundColor: HOBEE.colors.darkBase, ...HOBEE.elevation.featured }, title: { marginTop: 12, paddingHorizontal: HOBEE.space.page, color: "#FFFFFF", fontSize: 23, fontWeight: "900" }, subtitle: { marginTop: 5, paddingHorizontal: HOBEE.space.page, color: "rgba(255,255,255,0.74)", fontSize: 12, fontWeight: "600", lineHeight: 18 }, guest: { flex: 1, justifyContent: "center", padding: HOBEE.space.page }, content: { gap: 14, padding: HOBEE.space.page, paddingBottom: 160 }, loading: { alignItems: "center", gap: 11, paddingVertical: 44 }, loadingText: { color: HOBEE.colors.muted, fontSize: 13, fontWeight: "700" }, summary: { flexDirection: "row", alignItems: "stretch", borderRadius: HOBEE.radius.hero, backgroundColor: HOBEE.overlay.glass, paddingVertical: 13, ...HOBEE.elevation.card }, summaryCell: { flex: 1, alignItems: "center", gap: 3 }, summaryDivider: { width: 1, marginVertical: 6, backgroundColor: HOBEE.colors.border }, summaryValue: { color: HOBEE.colors.ink, fontSize: 19, fontWeight: "900" }, summaryLabel: { color: HOBEE.colors.muted, fontSize: 10, fontWeight: "700" }, sectionHeading: { marginTop: 5 }, sectionTitle: { color: HOBEE.colors.ink, fontSize: 19, fontWeight: "900" }, sectionLabel: { marginTop: 2, color: HOBEE.colors.muted, fontSize: 11, fontWeight: "600" }, control: { gap: 5, borderRadius: 13, backgroundColor: "#ECE9E3", padding: 4 }, controlItem: { alignItems: "center", borderRadius: 9, paddingHorizontal: 11, paddingVertical: 7 }, controlItemActive: { backgroundColor: "#FFFFFF", ...HOBEE.elevation.surface }, controlText: { color: HOBEE.colors.muted, fontSize: 11, fontWeight: "800" }, controlTextActive: { color: HOBEE.colors.ink }, inboxList: { gap: 9 }, inboxRow: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: HOBEE.radius.card, backgroundColor: "rgba(255,255,255,0.7)", padding: 13 }, inboxRowUnread: { backgroundColor: HOBEE.overlay.glass, ...HOBEE.elevation.card }, inboxIcon: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "#E4F2EE" }, inboxIconUrgent: { backgroundColor: "#FDE8EF" }, inboxCopy: { flex: 1 }, inboxTitleRow: { flexDirection: "row", alignItems: "center", gap: 5 }, inboxTitle: { flexShrink: 1, color: HOBEE.colors.ink, fontSize: 14, fontWeight: "700" }, inboxTitleUnread: { fontWeight: "900" }, unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: HOBEE.colors.gold }, inboxBody: { marginTop: 2, color: HOBEE.colors.muted, fontSize: 11, fontWeight: "600" }, inboxMeta: { marginTop: 4, color: HOBEE.colors.goldDark, fontSize: 9, fontWeight: "800" }, orderList: { gap: 9 }, orderCard: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: HOBEE.radius.card, backgroundColor: HOBEE.overlay.glass, padding: 14, ...HOBEE.elevation.card }, orderCopy: { flex: 1 }, orderTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }, orderNumber: { color: HOBEE.colors.ink, fontSize: 14, fontWeight: "900" }, orderDate: { marginTop: 3, color: HOBEE.colors.muted, fontSize: 10, fontWeight: "600" }, orderStatus: { borderRadius: 8, backgroundColor: "#E4F2EE", paddingHorizontal: 7, paddingVertical: 4 }, orderStatusText: { color: HOBEE.colors.travelTeal, fontSize: 10, fontWeight: "900" }, orderBottom: { flexDirection: "row", alignItems: "center", marginTop: 13 }, orderPayment: { flex: 1, color: HOBEE.colors.muted, fontSize: 11, fontWeight: "700" }, orderAmount: { color: HOBEE.colors.ink, fontSize: 15, fontWeight: "900" }, operationList: { gap: 10 }, operationCard: { borderWidth: 1, borderColor: "#D8E9E1", borderRadius: HOBEE.radius.card, backgroundColor: "#F7FCF9", padding: 14, ...HOBEE.elevation.surface }, operationAction: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 13, borderRadius: 10, backgroundColor: HOBEE.colors.travelTeal, paddingVertical: 10 }, operationActionText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" }, operationComplete: { marginTop: 13, color: HOBEE.colors.muted, fontSize: 11, fontWeight: "800", textAlign: "center" }, backdrop: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(12,18,14,0.46)", padding: 18 }, sheet: { width: "100%", maxWidth: 410, borderRadius: 18, backgroundColor: "#FFFFFF", padding: 19 }, sheetTitle: { color: HOBEE.colors.ink, fontSize: 18, fontWeight: "900" }, sheetSub: { marginTop: 5, color: HOBEE.colors.muted, fontSize: 11, fontWeight: "600", lineHeight: 17 }, input: { marginTop: 11, borderWidth: 1, borderColor: "#E0E4E0", borderRadius: 10, color: HOBEE.colors.ink, fontSize: 12, fontWeight: "600", paddingHorizontal: 11, paddingVertical: 11 }, sheetActions: { flexDirection: "row", gap: 9, marginTop: 16 }, cancel: { flex: 1, alignItems: "center", borderWidth: 1, borderColor: "#E0E4E0", borderRadius: 10, paddingVertical: 11 }, cancelText: { color: HOBEE.colors.muted, fontSize: 12, fontWeight: "900" }, shipButton: { flex: 1, alignItems: "center", borderRadius: 10, backgroundColor: HOBEE.colors.travelTeal, paddingVertical: 11 }, shipButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" }, confirmCard: { width: "100%", maxWidth: 360, alignItems: "center", borderRadius: 18, backgroundColor: "#FFFFFF", padding: 22 }, confirmIcon: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 24, backgroundColor: "#E4F2EE" }, confirmTitle: { marginTop: 13, color: HOBEE.colors.ink, fontSize: 18, fontWeight: "900" }, confirmText: { marginTop: 8, color: HOBEE.colors.muted, fontSize: 12, fontWeight: "600", lineHeight: 18, textAlign: "center" }, pressed: { opacity: 0.78, transform: [{ scale: HOBEE.motion.pressScale }] },
});
