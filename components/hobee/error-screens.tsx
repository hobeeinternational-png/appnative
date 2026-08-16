import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { HOBEE } from "@/components/hobee/design-tokens";

type ErrorStateProps = { title: string; description: string; actionLabel?: string; onAction?: () => void };

export function AppStatusState({ title, description, actionLabel, onAction, icon = "info-outline", tone = "blue" }: ErrorStateProps & { icon?: keyof typeof MaterialIcons.glyphMap; tone?: "blue" | "gold" | "green" | "rose" }) {
  const background = tone === "gold" ? HOBEE.atmosphere.warmCream : tone === "green" ? HOBEE.atmosphere.botanicalMist : tone === "rose" ? HOBEE.atmosphere.peachMist : HOBEE.atmosphere.skyMist;
  const color = tone === "gold" ? HOBEE.colors.goldDark : tone === "green" ? HOBEE.colors.botanical : tone === "rose" ? HOBEE.colors.error : HOBEE.colors.info;
  return <View style={styles.wrap}><View style={[styles.iconWrap, { backgroundColor: background }]}><MaterialIcons name={icon} size={30} color={color} /></View><Text style={styles.title}>{title}</Text><Text style={styles.description}>{description}</Text>{actionLabel && onAction ? <Pressable onPress={onAction} style={({ pressed }) => [styles.action, { backgroundColor: color }, pressed && styles.pressed]}><Text style={styles.actionText}>{actionLabel}</Text></Pressable> : null}</View>;
}

export function OfflineState(props: Omit<ErrorStateProps, "title" | "description">) { return <AppStatusState icon="wifi-off" tone="blue" title="คุณกำลังออฟไลน์" description="ตรวจสอบการเชื่อมต่อ แล้วลองโหลดข้อมูลอีกครั้งเมื่อพร้อม" {...props} />; }
export function MaintenanceState(props: Omit<ErrorStateProps, "title" | "description">) { return <AppStatusState icon="engineering" tone="gold" title="กำลังปรับปรุงระบบ" description="บางบริการของ HOBEE ยังใช้งานไม่ได้ชั่วคราว กรุณาลองใหม่ภายหลัง" {...props} />; }
export function PermissionDeniedState(props: Omit<ErrorStateProps, "title" | "description">) { return <AppStatusState icon="lock-outline" tone="rose" title="คุณยังไม่มีสิทธิ์เข้าถึง" description="บัญชีหรือบทบาทปัจจุบันยังไม่สามารถเปิดข้อมูลในส่วนนี้ได้" {...props} />; }
export function GlobalErrorState(props: Omit<ErrorStateProps, "title" | "description">) { return <AppStatusState icon="error-outline" tone="rose" title="ไม่สามารถดำเนินการได้" description="เกิดปัญหาชั่วคราวโดยข้อมูลของคุณยังปลอดภัย ลองใหม่อีกครั้งได้" {...props} />; }

const styles = StyleSheet.create({ wrap: { alignItems: "center", alignSelf: "center", maxWidth: 330, gap: 10, padding: HOBEE.space.page }, iconWrap: { width: 74, height: 74, alignItems: "center", justifyContent: "center", borderRadius: 37, marginBottom: 4 }, title: { color: HOBEE.colors.ink, fontSize: 18, fontWeight: "900", textAlign: "center" }, description: { color: HOBEE.colors.muted, fontSize: 12, fontWeight: "600", lineHeight: 18, textAlign: "center" }, action: { marginTop: 6, borderRadius: HOBEE.radius.pill, paddingHorizontal: 18, paddingVertical: 11 }, actionText: { color: HOBEE.colors.surface, fontSize: 12, fontWeight: "900" }, pressed: { opacity: 0.78, transform: [{ scale: HOBEE.motion.pressScale }] } });
