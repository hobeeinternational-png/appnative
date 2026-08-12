export type NavMode = "normal" | "collapsing" | "floating" | "expanding";
export type FloatingPosition = { x: number; y: number };

export const FLOATING_NAV_STORAGE_KEY = "hobee_bottom_nav_state_v1";
export const FLOATING_NAV_CONFIG = { doubleTapWindowMs: 340, dragThreshold: 8, edgeSnapMargin: 16, floatSize: 68, animationDurationMs: 390 } as const;

export function snapFloatingPosition(position: FloatingPosition, viewport: { width: number; height: number }, insets: { top: number; bottom: number }) {
  const half = FLOATING_NAV_CONFIG.floatSize / 2;
  const minY = insets.top + half + FLOATING_NAV_CONFIG.edgeSnapMargin;
  const maxY = Math.max(minY, viewport.height - insets.bottom - half - FLOATING_NAV_CONFIG.edgeSnapMargin);
  const leftX = half + FLOATING_NAV_CONFIG.edgeSnapMargin;
  const rightX = Math.max(leftX, viewport.width - half - FLOATING_NAV_CONFIG.edgeSnapMargin);
  return { x: position.x < viewport.width / 2 ? leftX : rightX, y: Math.max(minY, Math.min(maxY, position.y)) };
}

export function nextNavMode(mode: NavMode): NavMode { return mode === "normal" ? "collapsing" : "expanding"; }

export function settledNavMode(mode: NavMode): NavMode { return mode === "collapsing" ? "floating" : mode === "expanding" ? "normal" : mode; }

export function movedEnough(start: FloatingPosition, current: FloatingPosition) { return Math.hypot(current.x - start.x, current.y - start.y) > FLOATING_NAV_CONFIG.dragThreshold; }
