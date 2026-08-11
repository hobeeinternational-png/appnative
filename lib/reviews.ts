import { supabase } from "@/lib/supabase";

export type ProductReview = { id: string; rating: number; comment: string | null; is_verified_purchase: boolean; created_at: string };

export async function listProductReviews(productId: string) {
  const { data, error } = await supabase.from("product_reviews").select("id,rating,comment,is_verified_purchase,created_at").eq("product_id", productId).eq("status", "approved").order("created_at", { ascending: false }).limit(20);
  if (error) throw error;
  return (data ?? []) as ProductReview[];
}

export async function submitProductReview(input: { productId: string; userId: string; rating: number; comment: string }) {
  const { error } = await supabase.from("product_reviews").insert({ product_id: input.productId, user_id: input.userId, rating: input.rating, comment: input.comment.trim() || null });
  if (error) throw error;
}
