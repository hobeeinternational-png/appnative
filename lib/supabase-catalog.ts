import type { HobeeProduct } from "./hobee-data";

type ProductImageRow = { storage_path: string; sort_order: number };
type ShopRow = { name: string | null } | { name: string | null }[] | null;
type CategoryRow = { name: string | null } | { name: string | null }[] | null;

export type SupabaseProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | string;
  compare_at_price: number | string | null;
  stock_quantity: number;
  origin: string | null;
  rating: number | string;
  review_count: number;
  shops: ShopRow;
  product_categories: CategoryRow;
  product_images: ProductImageRow[] | null;
};

function firstRelation<T>(relation: T | T[] | null): T | null {
  return Array.isArray(relation) ? relation[0] ?? null : relation;
}

/** Converts a public Supabase row into the shared native product model. */
export function mapSupabaseProduct(row: SupabaseProductRow, fallbackImage: string): HobeeProduct {
  const image = [...(row.product_images ?? [])]
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((item) => item.storage_path)
    .find(Boolean) ?? fallbackImage;
  const shop = firstRelation(row.shops);
  const category = firstRelation(row.product_categories);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortName: row.name,
    description: row.description ?? "",
    price: Number(row.price),
    compareAtPrice: row.compare_at_price === null ? undefined : Number(row.compare_at_price),
    image,
    category: category?.name ?? "สินค้า HOBEE",
    shopName: shop?.name ?? "HOBEE Marketplace",
    origin: row.origin ?? "เครือข่ายชุมชน HOBEE",
    rating: Number(row.rating ?? 0),
    reviewsCount: row.review_count ?? 0,
    stock: row.stock_quantity,
    badge: "HOBEE SELECT",
  };
}

