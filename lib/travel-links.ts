const CANONICAL_BASE_URL = "https://hobee.app";
const APP_SCHEME = "manushobeemobile";

export function buildTravelCanonicalLink(slug: string, referralCode?: string) {
  const url = new URL(`/travel/${encodeURIComponent(slug)}`, CANONICAL_BASE_URL);
  if (referralCode?.trim()) url.searchParams.set("ref", referralCode.trim());
  return url.toString();
}

export function buildTravelDeepLink(id: string) {
  return `${APP_SCHEME}://travel/${encodeURIComponent(id)}`;
}

export function buildTravelMapLink(lat: number, lng: number) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error("Travel map coordinates must be finite");
  const url = new URL("https://www.google.com/maps/search/");
  url.searchParams.set("api", "1");
  url.searchParams.set("query", `${lat},${lng}`);
  return url.toString();
}

export function travelShareMessage(title: string, slug: string, referralCode?: string) {
  return `${title}\n${buildTravelCanonicalLink(slug, referralCode)}`;
}
