import { type ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

import { HOBEE } from "@/components/hobee/design-tokens";

export type AtmosphereMood = "home" | "shop" | "discover" | "account";

export function AtmosphericCanvas({ mood, children }: { mood: AtmosphereMood; children: ReactNode }) {
  const colors = moodColors[mood];
  return <View style={[styles.canvas, { backgroundColor: colors.base }]}><View pointerEvents="none" style={[styles.glow, styles.glowTop, { backgroundColor: colors.glow }]} /><View pointerEvents="none" style={[styles.glow, styles.glowBottom, { backgroundColor: colors.mist }]} /><View pointerEvents="none" style={[styles.leaf, styles.leafOne, { backgroundColor: colors.mist }]} /><View pointerEvents="none" style={[styles.leaf, styles.leafTwo, { backgroundColor: colors.glow }]} />{children}</View>;
}

export function LayeredSection({ children, tone = "surface", style }: { children: ReactNode; tone?: "surface" | "cream" | "botanical" | "honey" | "community"; style?: ViewStyle }) {
  return <View style={[styles.section, toneStyles[tone], style]}>{children}</View>;
}

const moodColors = {
  home: { base: HOBEE.atmosphere.canvas, glow: HOBEE.atmosphere.honeyGlow, mist: HOBEE.atmosphere.botanicalMist },
  shop: { base: HOBEE.atmosphere.canvas, glow: HOBEE.atmosphere.honeyGlow, mist: HOBEE.atmosphere.skyMist },
  discover: { base: HOBEE.atmosphere.canvas, glow: HOBEE.atmosphere.skyMist, mist: HOBEE.atmosphere.botanicalMist },
  account: { base: "#F5F4F1", glow: HOBEE.atmosphere.honeyGlow, mist: HOBEE.atmosphere.skyMist },
} as const;

const toneStyles = StyleSheet.create({ surface: { backgroundColor: HOBEE.atmosphere.recentlyViewed }, cream: { backgroundColor: HOBEE.atmosphere.recommended }, botanical: { backgroundColor: HOBEE.atmosphere.nearby }, honey: { backgroundColor: HOBEE.atmosphere.opportunity }, community: { backgroundColor: HOBEE.atmosphere.community } });
const styles = StyleSheet.create({ canvas: { flex: 1, overflow: "hidden" }, glow: { position: "absolute", width: 280, height: 280, borderRadius: 140, opacity: 0.18 }, glowTop: { right: -130, top: 52 }, glowBottom: { left: -154, top: 480, opacity: 0.22 }, leaf: { position: "absolute", width: 150, height: 220, borderRadius: 120, opacity: 0.14, transform: [{ rotate: "-28deg" }] }, leafOne: { right: -74, top: 330 }, leafTwo: { left: -90, top: 810, opacity: 0.1, transform: [{ rotate: "31deg" }] }, section: { overflow: "hidden", borderRadius: HOBEE.radius.hero, paddingVertical: HOBEE.space.loose, ...HOBEE.elevation.surface } });
