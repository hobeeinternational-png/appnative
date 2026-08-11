import type { RemoteProduct } from "./hobee-api";
import { hobeeProducts, type HobeeProduct } from "./hobee-data";

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function firstImage(value: unknown, fallback: string): string {
  if (Array.isArray(value)) {
    const image = value.find((item): item is string => typeof item === "string" && item.length > 0);
    if (image) return image.startsWith("/") ? fallback : image;
  }
  return fallback;
}

export function mapRemoteProduct(remote: RemoteProduct, index: number): HobeeProduct | null {
  const id = asString(remote.id);
  const name = asString(remote.name, asString(remote.title));
  const price = asNumber(remote.price, -1);
  if (!id || !name || price < 0) return null;

  const fallback = hobeeProducts[index % hobeeProducts.length];
  return {
    id,
    slug: asString(remote.slug, id),
    name,
    shortName: asString(remote.shortName, name),
    description: asString(remote.description, fallback.description),
    price,
    compareAtPrice: asNumber(remote.compareAtPrice, 0) || undefined,
    image: firstImage(remote.images, fallback.image),
    category: asString(remote.category, fallback.category),
    shopName: asString(remote.shopName, "HOBEE Marketplace"),
    origin: asString(remote.communityOrigin, asString(remote.producerName, "เครือข่ายชุมชน HOBEE")),
    rating: asNumber(remote.rating, 0),
    reviewsCount: asNumber(remote.reviewsCount, 0),
    stock: asNumber(remote.stock, 0),
    badge: asString(remote.badge) || undefined,
  };
}

