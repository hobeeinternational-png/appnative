export const RECENTLY_VIEWED_LIMIT = 12;

export type RecentlyViewedKind = "product" | "travel" | "content";

export type RecentlyViewedItem = {
  key: string;
  kind: RecentlyViewedKind;
  contentId: string;
  title: string;
  image: string;
  detail: string;
  price?: string;
  route: string;
  params?: Record<string, string>;
  viewedAt: string;
};

export function mergeRecentView(items: RecentlyViewedItem[], next: Omit<RecentlyViewedItem, "key" | "viewedAt">, now = new Date().toISOString(), limit = RECENTLY_VIEWED_LIMIT): RecentlyViewedItem[] {
  const viewed: RecentlyViewedItem = { ...next, key: `${next.kind}:${next.contentId}`, viewedAt: now };
  return [viewed, ...items.filter((item) => item.key !== viewed.key)].slice(0, limit);
}

export function sanitizeRecentViews(value: unknown): RecentlyViewedItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is RecentlyViewedItem => Boolean(item && typeof item === "object" && typeof item.key === "string" && typeof item.title === "string" && typeof item.image === "string" && typeof item.route === "string" && typeof item.viewedAt === "string")).sort((a, b) => b.viewedAt.localeCompare(a.viewedAt)).slice(0, RECENTLY_VIEWED_LIMIT);
}
