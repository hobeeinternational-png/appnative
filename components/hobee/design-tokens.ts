export const HOBEE = {
  colors: {
    canvas: "#FAFAF9", surface: "#FFFFFF", ink: "#1C1917", muted: "#78716C", border: "#E7E5E4",
    gold: "#F59E0B", goldDark: "#D97706", goldStart: "#F59E0B", goldMiddle: "#FBBF24", goldEnd: "#FDE047", orangeSun: "#F2720C",
    darkBase: "#0C0A09", darkCard: "#1C1917", darkBorder: "#292524", nav: "#1C1917",
    success: "#10B981", error: "#F43F5E", info: "#3B82F6",
    botanical: "#1F8D70", shopTeal: "#078C76", shopDeep: "#06483F", shopSoft: "#E7F7F2", shopOrange: "#F59E0B", shopLocation: "#F43F5E", shopShipping: "#10B981", travelTeal: "#087B6E", travelDeep: "#063F3A",
  },
  atmosphere: {
    canvas: "#F8F5EE", warmCream: "#FFF7E3", honeyGlow: "#F7C85A", botanicalMist: "#DDF2E8", skyMist: "#E8F3FB", peachMist: "#FDE9D9",
    homeHero: "#F3E5BB", recentlyViewed: "#FFFFFF", recommended: "#FFF7E6", nearby: "#EAF7F0", opportunity: "#FFF1C7", community: "#E8F4F3", rewards: "#EAF0FF",
  },
  overlay: { imageTop: "rgba(9,45,33,0.05)", imageBottom: "rgba(9,45,33,0.28)", hero: "rgba(7,44,32,0.42)", glass: "rgba(255,255,255,0.88)" },
  space: { micro: 4, compact: 8, regular: 12, loose: 16, page: 20, section: 32, card: 12 },
  radius: { small: 12, medium: 16, tile: 22, card: 16, hero: 24, xlarge: 24, pill: 9999, nav: 38 },
  type: { hero: 32, h1: 24, h2: 20, h3: 16, bodyLarge: 16, bodySmall: 14, caption: 12, badge: 10 },
  image: { card: 154, hero: 303, profile: 77 },
  shadow: { shadowColor: "#292524", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.09, shadowRadius: 9, elevation: 3 },
  elevation: {
    surface: { shadowColor: "#274033", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.045, shadowRadius: 6, elevation: 1 },
    card: { shadowColor: "#274033", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.10, shadowRadius: 12, elevation: 4 },
    featured: { shadowColor: "#18362A", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.18, shadowRadius: 20, elevation: 8 },
    floating: { shadowColor: "#15271F", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.22, shadowRadius: 22, elevation: 12 },
  },
  nav: { itemGap: 20, centerBreathing: 94, barHeight: 56, outerInset: 14 },
  motion: { pressScale: 0.975, cardPressScale: 0.98, fast: 140, standard: 220, entrance: 300 },
} as const;
