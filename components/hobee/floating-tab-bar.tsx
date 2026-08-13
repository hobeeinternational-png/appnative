import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, PanResponder, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HOBEE } from "@/components/hobee/design-tokens";
import { FLOATING_NAV_CONFIG, FLOATING_NAV_STORAGE_KEY, movedEnough, snapFloatingPosition, type FloatingPosition, type NavMode } from "@/lib/floating-nav";

export type HobeeNavKey = "index" | "discover" | "shop" | "orders" | "account";

type NavItem = { key: HobeeNavKey; icon: keyof typeof MaterialIcons.glyphMap; center?: boolean; label: string };
const NAV_ITEMS: NavItem[] = [
  { key: "index", icon: "home", label: "หน้าแรก" },
  { key: "discover", icon: "explore", label: "สำรวจ" },
  { key: "shop", icon: "auto-awesome", center: true, label: "HOBEE" },
  { key: "orders", icon: "calendar-today", label: "ปฏิทิน" },
  { key: "account", icon: "person-outline", label: "บัญชี" },
];

const FLOAT_SIZE = FLOATING_NAV_CONFIG.floatSize;

export function FloatingBottomNav({ activeKey, onNavigate, notificationCount = 0 }: { activeKey: HobeeNavKey; onNavigate?: (key: HobeeNavKey) => void; notificationCount?: number }) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [mode, setMode] = useState<NavMode>("normal");
  const [ready, setReady] = useState(false);
  const [quickMenuVisible, setQuickMenuVisible] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const floatPosition = useRef(new Animated.ValueXY({ x: width / 2, y: height - Math.max(insets.bottom, 12) - 58 })).current;
  const positionRef = useRef<FloatingPosition>({ x: width / 2, y: height - Math.max(insets.bottom, 12) - 58 });
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragStart = useRef<FloatingPosition>({ x: 0, y: 0 });

  const defaultPosition = () => ({ x: width / 2, y: Math.max(insets.top + FLOAT_SIZE / 2 + 16, height - Math.max(insets.bottom, 12) - 58) });
  const persist = (nextMode: "normal" | "floating", position: FloatingPosition) => AsyncStorage.setItem(FLOATING_NAV_STORAGE_KEY, JSON.stringify({ mode: nextMode, position })).catch(() => undefined);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(FLOATING_NAV_STORAGE_KEY).then((raw) => {
      if (!active) return;
      const fallback = defaultPosition();
      if (!raw) { positionRef.current = fallback; floatPosition.setValue(fallback); setReady(true); return; }
      try {
        const stored = JSON.parse(raw) as { mode?: "normal" | "floating"; position?: FloatingPosition };
        const position = stored.position ? snapFloatingPosition(stored.position, { width, height }, insets) : fallback;
        positionRef.current = position;
        floatPosition.setValue(position);
        if (stored.mode === "floating") { progress.setValue(1); setMode("floating"); }
      } catch { positionRef.current = fallback; floatPosition.setValue(fallback); }
      setReady(true);
    }).catch(() => setReady(true));
    return () => { active = false; };
  }, []);

  useEffect(() => () => { if (tapTimer.current) clearTimeout(tapTimer.current); if (menuTimer.current) clearTimeout(menuTimer.current); }, []);

  const navigate = (key: HobeeNavKey) => {
    if (onNavigate) { onNavigate(key); return; }
    if (key === "orders") { router.push("/orders"); return; }
    if (key === "discover") { router.push("/travel"); return; }
    if (key === "index") router.replace("/(tabs)");
    else router.replace(`/(tabs)/${key}`);
  };

  const showQuickMenu = () => {
    setQuickMenuVisible(true);
    if (menuTimer.current) clearTimeout(menuTimer.current);
    menuTimer.current = setTimeout(() => setQuickMenuVisible(false), 2200);
  };
  const toggleMode = () => {
    if (mode === "normal") {
      setMode("collapsing");
      Animated.timing(progress, { toValue: 1, duration: FLOATING_NAV_CONFIG.animationDurationMs, useNativeDriver: true }).start(() => { setMode("floating"); persist("floating", positionRef.current); });
    } else if (mode === "floating") {
      setMode("expanding");
      Animated.timing(progress, { toValue: 0, duration: FLOATING_NAV_CONFIG.animationDurationMs, useNativeDriver: true }).start(() => { setMode("normal"); persist("normal", positionRef.current); });
    }
  };
  const handleCenterPress = () => {
    if (tapTimer.current) { clearTimeout(tapTimer.current); tapTimer.current = null; toggleMode(); return; }
    tapTimer.current = setTimeout(() => { tapTimer.current = null; showQuickMenu(); }, FLOATING_NAV_CONFIG.doubleTapWindowMs);
  };
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => mode === "floating",
    onMoveShouldSetPanResponder: (_, gesture) => mode === "floating" && movedEnough({ x: 0, y: 0 }, { x: gesture.dx, y: gesture.dy }),
    onPanResponderGrant: () => { dragStart.current = positionRef.current; },
    onPanResponderMove: (_, gesture) => { const next = { x: dragStart.current.x + gesture.dx, y: dragStart.current.y + gesture.dy }; floatPosition.setValue(next); },
    onPanResponderRelease: (_, gesture) => {
      const released = { x: dragStart.current.x + gesture.dx, y: dragStart.current.y + gesture.dy };
      const snapped = snapFloatingPosition(released, { width, height }, insets);
      positionRef.current = snapped;
      Animated.spring(floatPosition, { toValue: snapped, useNativeDriver: false, friction: 7, tension: 90 }).start();
      persist("floating", snapped);
    },
    onPanResponderTerminate: () => floatPosition.setValue(positionRef.current),
  }), [mode, width, height, insets.top, insets.bottom]);

  const barScaleX = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.14] });
  const iconOpacity = progress.interpolate({ inputRange: [0, 0.72, 1], outputRange: [1, 0, 0] });
  const centerScale = progress.interpolate({ inputRange: [0, 0.48, 1], outputRange: [1, 1.18, 1] });
  if (!ready) return null;
  const normalVisible = mode !== "floating";
  const floatingVisible = mode !== "normal";

  return <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>{normalVisible ? <View pointerEvents="box-none" style={[styles.normalContainer, { bottom: Math.max(insets.bottom, 8) }]}><Animated.View style={[styles.barShell, { transform: [{ scaleX: barScaleX }] }]}><BlurView intensity={28} tint="dark" experimentalBlurMethod="dimezisBlurView" style={[styles.bar, { shadowColor: HOBEE.colors.darkBase }]}>{NAV_ITEMS.filter((item) => !item.center).map((item) => <Animated.View key={item.key} style={{ opacity: iconOpacity }}><NavButton item={item} active={activeKey === item.key} notificationCount={item.key === "account" ? notificationCount : 0} onPress={() => navigate(item.key)} /></Animated.View>)}</BlurView><Animated.View style={[styles.centerOverlay, { transform: [{ scale: centerScale }] }]}><CenterButton onPress={handleCenterPress} /></Animated.View></Animated.View></View> : null}{floatingVisible ? <Animated.View {...panResponder.panHandlers} style={[styles.floating, { left: floatPosition.x, top: floatPosition.y, transform: [{ translateX: -FLOAT_SIZE / 2 }, { translateY: -FLOAT_SIZE / 2 }] }]}><CenterButton onPress={handleCenterPress} compact /></Animated.View> : null}{quickMenuVisible ? <BlurView pointerEvents="none" intensity={24} tint="dark" experimentalBlurMethod="dimezisBlurView" style={[styles.quickMenu, { bottom: Math.max(insets.bottom, 8) + 74 }]}><MaterialIcons name="auto-awesome" size={15} color="#FFFFFF" /><Text style={styles.quickMenuText}>HOBEE Quick Menu พร้อมเชื่อม Assistant</Text></BlurView> : null}</View>;
}

function NavButton({ item, active, notificationCount, onPress }: { item: NavItem; active: boolean; notificationCount: number; onPress: () => void }) { return <Pressable accessibilityRole="button" accessibilityLabel={`เปิด ${item.label}`} onPress={onPress} style={({ pressed }) => [styles.iconButton, active && styles.activeButton, pressed && styles.pressed]}><MaterialIcons name={item.icon} size={23} color={active ? HOBEE.colors.gold : "rgba(255,255,255,0.82)"} />{notificationCount > 0 ? <View style={[styles.badge, { backgroundColor: HOBEE.colors.error }]}><Text style={styles.badgeText}>{Math.min(notificationCount, 99)}</Text></View> : null}</Pressable>; }
function CenterButton({ onPress, compact = false }: { onPress: () => void; compact?: boolean }) { return <Pressable accessibilityRole="button" accessibilityLabel={compact ? "เปิด HOBEE Float" : "เปิด HOBEE Assistant หรือแตะสองครั้งเพื่อย่อเมนู"} onPress={onPress} style={({ pressed }) => [styles.centerButton, { backgroundColor: HOBEE.colors.gold, borderColor: "rgba(255,255,255,0.3)" }, compact && styles.centerButtonCompact, pressed && styles.pressed]}><MaterialIcons name="auto-awesome" size={compact ? 18 : 15} color={HOBEE.colors.darkBase} /><Text style={[styles.centerText, { color: HOBEE.colors.darkBase }, compact && styles.centerTextCompact]}>HOBEE</Text></Pressable>; }
export function FloatingTabBar({ state, navigation }: BottomTabBarProps) { const currentRoute = state.routes[state.index]?.name as HobeeNavKey; return <FloatingBottomNav activeKey={currentRoute} onNavigate={(key) => { if (key === "discover") { router.push("/travel"); return; } if (key === "orders") { router.push("/orders"); return; } const route = state.routes.find((item) => item.name === key); if (!route) return; const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true }); if (!event.defaultPrevented) navigation.navigate(key); }} />; }

const styles = StyleSheet.create({ normalContainer: { position: "absolute", left: 22, right: 22, zIndex: 20, alignItems: "center" }, barShell: { width: "100%", height: 58, position: "relative" }, bar: { width: "100%", height: 58, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: 29, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", paddingHorizontal: 7, backgroundColor: "rgba(20,20,18,0.72)", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 14, elevation: 10 }, centerOverlay: { position: "absolute", zIndex: 3, left: "50%", top: -24, marginLeft: -37 }, iconButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 22 }, activeButton: { backgroundColor: "rgba(255,255,255,0.12)" }, centerButton: { width: 74, height: 74, alignItems: "center", justifyContent: "center", gap: 0, borderRadius: 37, borderWidth: 4, backgroundColor: "#D6AC48", shadowColor: "#000000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.24, shadowRadius: 8, elevation: 8 }, centerButtonCompact: { width: FLOAT_SIZE, height: FLOAT_SIZE, marginTop: 0, borderRadius: FLOAT_SIZE / 2, borderWidth: 3 }, centerText: { color: "#1D1A18", fontSize: 11, fontWeight: "900", letterSpacing: -0.5 }, centerTextCompact: { fontSize: 10 }, floating: { position: "absolute", zIndex: 35 }, pressed: { opacity: 0.78, transform: [{ scale: 0.96 }] }, quickMenu: { position: "absolute", right: 22, left: 22, zIndex: 40, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, borderRadius: 15, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.13)", backgroundColor: "rgba(20,20,18,0.74)", padding: 11, shadowColor: "#0A1F18", shadowOffset: { width: 0, height: 7 }, shadowOpacity: 0.18, shadowRadius: 12, elevation: 9 }, quickMenuText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" }, badge: { position: "absolute", top: 4, right: 4, minWidth: 14, height: 14, alignItems: "center", justifyContent: "center", borderRadius: 7, backgroundColor: "#DE4A47", paddingHorizontal: 3 }, badgeText: { color: "#FFFFFF", fontSize: 7, fontWeight: "900" } });
