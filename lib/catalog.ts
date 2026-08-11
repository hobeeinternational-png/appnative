import { hobeeApi } from "./hobee-api";
import { hobeeProducts, type HobeeProduct } from "./hobee-data";
import { mapRemoteProduct } from "./catalog-map";
import { isSupabaseConfigured, supabase } from "./supabase";
import { mapSupabaseProduct, type SupabaseProductRow } from "./supabase-catalog";

export async function loadCatalog(): Promise<{ products: HobeeProduct[]; source: "supabase" | "api" | "local" }> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from("products")
      .select("id,name,slug,description,price,compare_at_price,stock_quantity,origin,rating,review_count,shops(name),product_categories(name),product_images(storage_path,sort_order)")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      const products = (data as SupabaseProductRow[]).map((row, index) =>
        mapSupabaseProduct(row, hobeeProducts[index % hobeeProducts.length].image),
      );
      return { products, source: "supabase" };
    }
  }

  if (!hobeeApi.isConfigured()) return { products: hobeeProducts, source: "local" };

  try {
    const payload = await hobeeApi.products();
    const items = Array.isArray(payload) ? payload : payload.items;
    const products = items.map(mapRemoteProduct).filter((product): product is HobeeProduct => product !== null);
    return products.length ? { products, source: "api" } : { products: hobeeProducts, source: "local" };
  } catch {
    return { products: hobeeProducts, source: "local" };
  }
}

export { mapRemoteProduct } from "./catalog-map";
