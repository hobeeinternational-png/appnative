-- Generated from the authorized HOBEE PLATFORM1 schema on 2026-08-13.

-- This migration creates schema, helpers, RLS policies, and product image storage only; it does not copy customer data.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS private;

CREATE TABLE IF NOT EXISTS "public"."profiles" (
  "id" uuid NOT NULL,
  "display_name" text,
  "phone" text,
  "avatar_url" text,
  "created_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updated_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."user_roles" (
  "user_id" uuid NOT NULL,
  "role" text NOT NULL CHECK (role = ANY (ARRAY['customer'::text, 'seller'::text, 'admin'::text])),
  "created_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY ("user_id", "role")
);

CREATE TABLE IF NOT EXISTS "public"."shops" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "owner_id" uuid,
  "name" text NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "description" text,
  "logo_url" text,
  "status" text DEFAULT 'pending'::text NOT NULL CHECK (status = ANY (ARRAY['pending'::text, 'active'::text, 'suspended'::text])),
  "created_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updated_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."product_categories" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "image_url" text,
  "is_visible" boolean DEFAULT true NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updated_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."products" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "shop_id" uuid NOT NULL,
  "category_id" uuid,
  "name" text NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "description" text,
  "price" numeric NOT NULL CHECK (price >= 0::numeric),
  "compare_at_price" numeric,
  "currency" char(3) DEFAULT 'THB'::bpchar NOT NULL,
  "sku" text,
  "stock_quantity" integer DEFAULT 0 NOT NULL CHECK (stock_quantity >= 0),
  "status" text DEFAULT 'draft'::text NOT NULL CHECK (status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text])),
  "origin" text,
  "rating" numeric DEFAULT 0 NOT NULL CHECK (rating >= 0::numeric AND rating <= 5::numeric),
  "review_count" integer DEFAULT 0 NOT NULL CHECK (review_count >= 0),
  "created_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updated_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."product_variants" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "product_id" uuid NOT NULL,
  "name" text NOT NULL,
  "sku" text,
  "price" numeric CHECK (price IS NULL OR price >= 0::numeric),
  "stock_quantity" integer DEFAULT 0 NOT NULL CHECK (stock_quantity >= 0),
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updated_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."product_images" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "product_id" uuid NOT NULL,
  "storage_path" text NOT NULL,
  "alt_text" text,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."stories" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "title" text NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "summary" text,
  "body" text,
  "cover_image_path" text,
  "category" text,
  "status" text DEFAULT 'draft'::text NOT NULL CHECK (status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text])),
  "published_at" timestamptz,
  "created_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updated_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."addresses" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "recipient_name" text NOT NULL,
  "phone" text NOT NULL,
  "line1" text NOT NULL,
  "line2" text,
  "subdistrict" text,
  "district" text,
  "province" text NOT NULL,
  "postal_code" text NOT NULL,
  "country_code" char(2) DEFAULT 'TH'::bpchar NOT NULL,
  "is_default" boolean DEFAULT false NOT NULL,
  "created_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updated_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."carts" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL UNIQUE,
  "currency" char(3) DEFAULT 'THB'::bpchar NOT NULL,
  "created_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updated_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."cart_items" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "cart_id" uuid NOT NULL,
  "product_id" uuid NOT NULL,
  "variant_id" uuid,
  "quantity" integer NOT NULL CHECK (quantity > 0),
  "created_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updated_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."orders" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "order_number" text DEFAULT ('HB-'::text || upper(encode(extensions.gen_random_bytes(6), 'hex'::text))) NOT NULL UNIQUE,
  "buyer_id" uuid NOT NULL,
  "shipping_address" jsonb NOT NULL,
  "currency" char(3) DEFAULT 'THB'::bpchar NOT NULL,
  "subtotal" numeric NOT NULL CHECK (subtotal >= 0::numeric),
  "shipping_fee" numeric DEFAULT 0 NOT NULL CHECK (shipping_fee >= 0::numeric),
  "discount_amount" numeric DEFAULT 0 NOT NULL CHECK (discount_amount >= 0::numeric),
  "total" numeric NOT NULL CHECK (total >= 0::numeric),
  "status" text DEFAULT 'pending'::text NOT NULL CHECK (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'processing'::text, 'shipped'::text, 'delivered'::text, 'cancelled'::text, 'refunded'::text])),
  "payment_status" text DEFAULT 'pending'::text NOT NULL CHECK (payment_status = ANY (ARRAY['pending'::text, 'authorized'::text, 'paid'::text, 'failed'::text, 'refunded'::text])),
  "created_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updated_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."order_items" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "order_id" uuid NOT NULL,
  "shop_id" uuid NOT NULL,
  "product_id" uuid,
  "variant_id" uuid,
  "product_name" text NOT NULL,
  "sku" text,
  "unit_price" numeric NOT NULL CHECK (unit_price >= 0::numeric),
  "quantity" integer NOT NULL CHECK (quantity > 0),
  "line_total" numeric NOT NULL CHECK (line_total >= 0::numeric),
  "created_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."payments" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "order_id" uuid NOT NULL,
  "provider" text NOT NULL,
  "provider_reference" text UNIQUE,
  "amount" numeric NOT NULL CHECK (amount >= 0::numeric),
  "currency" char(3) DEFAULT 'THB'::bpchar NOT NULL,
  "status" text DEFAULT 'pending'::text NOT NULL CHECK (status = ANY (ARRAY['pending'::text, 'authorized'::text, 'paid'::text, 'failed'::text, 'refunded'::text])),
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updated_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."payment_webhook_events" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "event_id" text NOT NULL UNIQUE,
  "payment_id" uuid NOT NULL,
  "provider" text NOT NULL,
  "status" text NOT NULL CHECK (status = ANY (ARRAY['authorized'::text, 'paid'::text, 'failed'::text, 'refunded'::text])),
  "raw_payload" jsonb NOT NULL,
  "created_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."device_push_tokens" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "expo_push_token" text NOT NULL UNIQUE,
  "platform" text NOT NULL CHECK (platform = ANY (ARRAY['ios'::text, 'android'::text])),
  "created_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updated_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."shipments" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "order_id" uuid NOT NULL,
  "shop_id" uuid,
  "provider" text NOT NULL,
  "tracking_number" text NOT NULL UNIQUE,
  "tracking_url" text,
  "status" text DEFAULT 'label_created'::text NOT NULL CHECK (status = ANY (ARRAY['label_created'::text, 'pickup_scheduled'::text, 'in_transit'::text, 'out_for_delivery'::text, 'delivered'::text, 'failed'::text, 'returned'::text])),
  "label_url" text,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "shipped_at" timestamptz,
  "delivered_at" timestamptz,
  "created_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updated_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."favorites" (
  "user_id" uuid NOT NULL,
  "product_id" uuid NOT NULL,
  "created_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY ("user_id", "product_id")
);

CREATE TABLE IF NOT EXISTS "public"."coupons" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "code" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "description" text,
  "discount_type" text NOT NULL CHECK (discount_type = ANY (ARRAY['fixed'::text, 'percentage'::text])),
  "discount_value" numeric NOT NULL CHECK (discount_value > 0::numeric),
  "minimum_subtotal" numeric DEFAULT 0 NOT NULL CHECK (minimum_subtotal >= 0::numeric),
  "maximum_discount" numeric,
  "starts_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  "ends_at" timestamptz,
  "usage_limit" integer,
  "usage_count" integer DEFAULT 0 NOT NULL CHECK (usage_count >= 0),
  "status" text DEFAULT 'active'::text NOT NULL CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text, 'archived'::text])),
  "created_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updated_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."user_coupons" (
  "user_id" uuid NOT NULL,
  "coupon_id" uuid NOT NULL,
  "claimed_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  "used_at" timestamptz,
  "order_id" uuid,
  PRIMARY KEY ("user_id", "coupon_id")
);

CREATE TABLE IF NOT EXISTS "public"."loyalty_transactions" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "order_id" uuid,
  "points" integer NOT NULL CHECK (points <> 0),
  "type" text NOT NULL CHECK (type = ANY (ARRAY['earn'::text, 'redeem'::text, 'adjust'::text, 'expire'::text])),
  "note" text,
  "created_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."product_reviews" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "product_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "order_id" uuid,
  "rating" smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  "comment" text CHECK (char_length(comment) <= 1000),
  "status" text DEFAULT 'pending'::text NOT NULL CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  "is_verified_purchase" boolean DEFAULT false NOT NULL,
  "created_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updated_at" timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "public"."loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles" ("id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."user_coupons" ADD CONSTRAINT "user_coupons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles" ("id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."favorites" ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles" ("id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."device_push_tokens" ADD CONSTRAINT "device_push_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles" ("id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "public"."profiles" ("id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."carts" ADD CONSTRAINT "carts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles" ("id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."addresses" ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles" ("id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users" ("id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles" ("id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."shops" ADD CONSTRAINT "shops_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."profiles" ("id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."product_reviews" ADD CONSTRAINT "product_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles" ("id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."shipments" ADD CONSTRAINT "shipments_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "public"."shops" ("id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."products" ADD CONSTRAINT "products_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "public"."shops" ("id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "public"."shops" ("id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories" ("id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."product_reviews" ADD CONSTRAINT "product_reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products" ("id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."favorites" ADD CONSTRAINT "favorites_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products" ("id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products" ("id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."cart_items" ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products" ("id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products" ("id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products" ("id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants" ("id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."cart_items" ADD CONSTRAINT "cart_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants" ("id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."cart_items" ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "public"."carts" ("id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders" ("id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders" ("id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders" ("id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."shipments" ADD CONSTRAINT "shipments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders" ("id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."user_coupons" ADD CONSTRAINT "user_coupons_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders" ("id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."product_reviews" ADD CONSTRAINT "product_reviews_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders" ("id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."payment_webhook_events" ADD CONSTRAINT "payment_webhook_events_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "public"."payments" ("id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."user_coupons" ADD CONSTRAINT "user_coupons_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons" ("id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION private.create_order_from_items(p_buyer_id uuid, p_address_id uuid, p_items jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'private', 'pg_catalog'
AS $function$ declare v_address jsonb; v_order_id uuid; v_subtotal numeric(12,2) := 0; v_item jsonb; v_product record; v_variant record; v_quantity integer; v_unit_price numeric(12,2); v_line_total numeric(12,2); begin if p_buyer_id is null then raise exception 'buyer is required'; end if; if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'items are required'; end if; select jsonb_build_object('recipient_name', recipient_name, 'phone', phone, 'line1', line1, 'line2', line2, 'subdistrict', subdistrict, 'district', district, 'province', province, 'postal_code', postal_code, 'country_code', country_code) into v_address from public.addresses where id = p_address_id and user_id = p_buyer_id; if v_address is null then raise exception 'address not found'; end if; for v_item in select value from jsonb_array_elements(p_items) loop v_quantity := (v_item ->> 'quantity')::integer; if v_quantity is null or v_quantity < 1 or v_quantity > 99 then raise exception 'invalid quantity'; end if; select id, shop_id, name, sku, price, stock_quantity into v_product from public.products where id = (v_item ->> 'productId')::uuid and status = 'published' for update; if not found then raise exception 'product not found or unavailable'; end if; v_unit_price := v_product.price; if v_item ? 'variantId' and nullif(v_item ->> 'variantId', '') is not null then select id, sku, price, stock_quantity into v_variant from public.product_variants where id = (v_item ->> 'variantId')::uuid and product_id = v_product.id and is_active = true for update; if not found then raise exception 'variant not found or unavailable'; end if; if v_variant.stock_quantity < v_quantity then raise exception 'insufficient variant stock'; end if; v_unit_price := coalesce(v_variant.price, v_product.price); update public.product_variants set stock_quantity = stock_quantity - v_quantity where id = v_variant.id; elsif v_product.stock_quantity < v_quantity then raise exception 'insufficient product stock'; end if; update public.products set stock_quantity = stock_quantity - v_quantity where id = v_product.id; v_line_total := round(v_unit_price * v_quantity, 2); v_subtotal := v_subtotal + v_line_total; if v_order_id is null then insert into public.orders (buyer_id, shipping_address, subtotal, shipping_fee, discount_amount, total, status, payment_status) values (p_buyer_id, v_address, 0, 0, 0, 0, 'pending', 'pending') returning id into v_order_id; end if; insert into public.order_items (order_id, shop_id, product_id, variant_id, product_name, sku, unit_price, quantity, line_total) values (v_order_id, v_product.shop_id, v_product.id, v_variant.id, v_product.name, coalesce(v_variant.sku, v_product.sku), v_unit_price, v_quantity, v_line_total); end loop; update public.orders set subtotal = v_subtotal, total = v_subtotal, updated_at = timezone('utc', now()) where id = v_order_id; return v_order_id; end; $function$;

CREATE OR REPLACE FUNCTION private.has_role(target_role text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ select exists (select 1 from public.user_roles where user_id = (select auth.uid()) and role = target_role); $function$;

CREATE OR REPLACE FUNCTION private.is_platform_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ select private.has_role('admin'); $function$;

CREATE OR REPLACE FUNCTION private.owns_shop(target_shop_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ select exists (select 1 from public.shops where id = target_shop_id and owner_id = (select auth.uid())); $function$;

CREATE OR REPLACE FUNCTION public.create_order_from_items(p_buyer_id uuid, p_address_id uuid, p_items jsonb)
 RETURNS uuid
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'private', 'pg_catalog'
AS $function$ select private.create_order_from_items(p_buyer_id, p_address_id, p_items); $function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ begin insert into public.profiles(id, display_name) values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')) on conflict (id) do nothing; insert into public.user_roles(user_id, role) values (new.id, 'customer') on conflict do nothing; return new; end; $function$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$ begin new.updated_at = timezone('utc', now()); return new; end; $function$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS "set_profiles_updated_at" ON "public"."profiles";

CREATE TRIGGER "set_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS "set_shops_updated_at" ON "public"."shops";

CREATE TRIGGER "set_shops_updated_at" BEFORE UPDATE ON "public"."shops" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS "set_product_categories_updated_at" ON "public"."product_categories";

CREATE TRIGGER "set_product_categories_updated_at" BEFORE UPDATE ON "public"."product_categories" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS "set_products_updated_at" ON "public"."products";

CREATE TRIGGER "set_products_updated_at" BEFORE UPDATE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS "set_product_variants_updated_at" ON "public"."product_variants";

CREATE TRIGGER "set_product_variants_updated_at" BEFORE UPDATE ON "public"."product_variants" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS "set_stories_updated_at" ON "public"."stories";

CREATE TRIGGER "set_stories_updated_at" BEFORE UPDATE ON "public"."stories" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS "set_addresses_updated_at" ON "public"."addresses";

CREATE TRIGGER "set_addresses_updated_at" BEFORE UPDATE ON "public"."addresses" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS "set_carts_updated_at" ON "public"."carts";

CREATE TRIGGER "set_carts_updated_at" BEFORE UPDATE ON "public"."carts" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS "set_cart_items_updated_at" ON "public"."cart_items";

CREATE TRIGGER "set_cart_items_updated_at" BEFORE UPDATE ON "public"."cart_items" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS "set_orders_updated_at" ON "public"."orders";

CREATE TRIGGER "set_orders_updated_at" BEFORE UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS "set_payments_updated_at" ON "public"."payments";

CREATE TRIGGER "set_payments_updated_at" BEFORE UPDATE ON "public"."payments" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS "set_device_push_tokens_updated_at" ON "public"."device_push_tokens";

CREATE TRIGGER "set_device_push_tokens_updated_at" BEFORE UPDATE ON "public"."device_push_tokens" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS "set_shipments_updated_at" ON "public"."shipments";

CREATE TRIGGER "set_shipments_updated_at" BEFORE UPDATE ON "public"."shipments" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS "set_coupons_updated_at" ON "public"."coupons";

CREATE TRIGGER "set_coupons_updated_at" BEFORE UPDATE ON "public"."coupons" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS "set_product_reviews_updated_at" ON "public"."product_reviews";

CREATE TRIGGER "set_product_reviews_updated_at" BEFORE UPDATE ON "public"."product_reviews" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."shops" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."product_categories" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."product_variants" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."product_images" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."stories" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."addresses" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."carts" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."cart_items" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."payment_webhook_events" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."device_push_tokens" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."shipments" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."favorites" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."coupons" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_coupons" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."loyalty_transactions" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."product_reviews" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "addresses_own_manage" ON public."addresses";

CREATE POLICY "addresses_own_manage" ON public."addresses" AS PERMISSIVE FOR ALL TO authenticated USING ((( SELECT auth.uid() AS uid) = user_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

DROP POLICY IF EXISTS "cart_items_own_manage" ON public."cart_items";

CREATE POLICY "cart_items_own_manage" ON public."cart_items" AS PERMISSIVE FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM carts
  WHERE ((carts.id = cart_items.cart_id) AND (carts.user_id = ( SELECT auth.uid() AS uid)))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM carts
  WHERE ((carts.id = cart_items.cart_id) AND (carts.user_id = ( SELECT auth.uid() AS uid))))));

DROP POLICY IF EXISTS "carts_own_manage" ON public."carts";

CREATE POLICY "carts_own_manage" ON public."carts" AS PERMISSIVE FOR ALL TO authenticated USING ((( SELECT auth.uid() AS uid) = user_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

DROP POLICY IF EXISTS "coupons_public_active_select" ON public."coupons";

CREATE POLICY "coupons_public_active_select" ON public."coupons" AS PERMISSIVE FOR SELECT TO public USING (((status = 'active'::text) AND (starts_at <= timezone('utc'::text, now())) AND ((ends_at IS NULL) OR (ends_at >= timezone('utc'::text, now())))));

DROP POLICY IF EXISTS "device_push_tokens_own_delete" ON public."device_push_tokens";

CREATE POLICY "device_push_tokens_own_delete" ON public."device_push_tokens" AS PERMISSIVE FOR DELETE TO public USING ((( SELECT auth.uid() AS uid) = user_id));

DROP POLICY IF EXISTS "device_push_tokens_own_insert" ON public."device_push_tokens";

CREATE POLICY "device_push_tokens_own_insert" ON public."device_push_tokens" AS PERMISSIVE FOR INSERT TO public WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

DROP POLICY IF EXISTS "device_push_tokens_own_select" ON public."device_push_tokens";

CREATE POLICY "device_push_tokens_own_select" ON public."device_push_tokens" AS PERMISSIVE FOR SELECT TO public USING ((( SELECT auth.uid() AS uid) = user_id));

DROP POLICY IF EXISTS "device_push_tokens_own_update" ON public."device_push_tokens";

CREATE POLICY "device_push_tokens_own_update" ON public."device_push_tokens" AS PERMISSIVE FOR UPDATE TO public USING ((( SELECT auth.uid() AS uid) = user_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

DROP POLICY IF EXISTS "favorites_own_all" ON public."favorites";

CREATE POLICY "favorites_own_all" ON public."favorites" AS PERMISSIVE FOR ALL TO public USING ((( SELECT auth.uid() AS uid) = user_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

DROP POLICY IF EXISTS "loyalty_transactions_own_select" ON public."loyalty_transactions";

CREATE POLICY "loyalty_transactions_own_select" ON public."loyalty_transactions" AS PERMISSIVE FOR SELECT TO public USING ((( SELECT auth.uid() AS uid) = user_id));

DROP POLICY IF EXISTS "order_items_buyer_read" ON public."order_items";

CREATE POLICY "order_items_buyer_read" ON public."order_items" AS PERMISSIVE FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = order_items.order_id) AND (orders.buyer_id = ( SELECT auth.uid() AS uid))))));

DROP POLICY IF EXISTS "orders_buyer_read" ON public."orders";

CREATE POLICY "orders_buyer_read" ON public."orders" AS PERMISSIVE FOR SELECT TO authenticated USING ((( SELECT auth.uid() AS uid) = buyer_id));

DROP POLICY IF EXISTS "payment_webhook_events_service_role_only" ON public."payment_webhook_events";

CREATE POLICY "payment_webhook_events_service_role_only" ON public."payment_webhook_events" AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "payments_buyer_read" ON public."payments";

CREATE POLICY "payments_buyer_read" ON public."payments" AS PERMISSIVE FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = payments.order_id) AND (orders.buyer_id = ( SELECT auth.uid() AS uid))))));

DROP POLICY IF EXISTS "categories_admin_manage" ON public."product_categories";

CREATE POLICY "categories_admin_manage" ON public."product_categories" AS PERMISSIVE FOR ALL TO authenticated USING (( SELECT private.is_platform_admin() AS is_platform_admin)) WITH CHECK (( SELECT private.is_platform_admin() AS is_platform_admin));

DROP POLICY IF EXISTS "categories_public_read" ON public."product_categories";

CREATE POLICY "categories_public_read" ON public."product_categories" AS PERMISSIVE FOR SELECT TO anon, authenticated USING (is_visible);

DROP POLICY IF EXISTS "images_public_read" ON public."product_images";

CREATE POLICY "images_public_read" ON public."product_images" AS PERMISSIVE FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "images_seller_manage" ON public."product_images";

CREATE POLICY "images_seller_manage" ON public."product_images" AS PERMISSIVE FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM products
  WHERE ((products.id = product_images.product_id) AND (( SELECT private.owns_shop(products.shop_id) AS owns_shop) OR ( SELECT private.is_platform_admin() AS is_platform_admin)))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM products
  WHERE ((products.id = product_images.product_id) AND (( SELECT private.owns_shop(products.shop_id) AS owns_shop) OR ( SELECT private.is_platform_admin() AS is_platform_admin))))));

DROP POLICY IF EXISTS "product_reviews_own_insert" ON public."product_reviews";

CREATE POLICY "product_reviews_own_insert" ON public."product_reviews" AS PERMISSIVE FOR INSERT TO public WITH CHECK (((( SELECT auth.uid() AS uid) = user_id) AND (status = 'pending'::text) AND (is_verified_purchase = false)));

DROP POLICY IF EXISTS "product_reviews_own_update" ON public."product_reviews";

CREATE POLICY "product_reviews_own_update" ON public."product_reviews" AS PERMISSIVE FOR UPDATE TO public USING (((( SELECT auth.uid() AS uid) = user_id) AND (status = 'pending'::text))) WITH CHECK (((( SELECT auth.uid() AS uid) = user_id) AND (status = 'pending'::text) AND (is_verified_purchase = false)));

DROP POLICY IF EXISTS "product_reviews_public_approved_select" ON public."product_reviews";

CREATE POLICY "product_reviews_public_approved_select" ON public."product_reviews" AS PERMISSIVE FOR SELECT TO public USING (((status = 'approved'::text) OR (( SELECT auth.uid() AS uid) = user_id)));

DROP POLICY IF EXISTS "variants_public_read" ON public."product_variants";

CREATE POLICY "variants_public_read" ON public."product_variants" AS PERMISSIVE FOR SELECT TO anon, authenticated USING (is_active);

DROP POLICY IF EXISTS "variants_seller_manage" ON public."product_variants";

CREATE POLICY "variants_seller_manage" ON public."product_variants" AS PERMISSIVE FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM products
  WHERE ((products.id = product_variants.product_id) AND (( SELECT private.owns_shop(products.shop_id) AS owns_shop) OR ( SELECT private.is_platform_admin() AS is_platform_admin)))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM products
  WHERE ((products.id = product_variants.product_id) AND (( SELECT private.owns_shop(products.shop_id) AS owns_shop) OR ( SELECT private.is_platform_admin() AS is_platform_admin))))));

DROP POLICY IF EXISTS "products_public_read" ON public."products";

CREATE POLICY "products_public_read" ON public."products" AS PERMISSIVE FOR SELECT TO anon, authenticated USING ((status = 'published'::text));

DROP POLICY IF EXISTS "products_seller_manage" ON public."products";

CREATE POLICY "products_seller_manage" ON public."products" AS PERMISSIVE FOR ALL TO authenticated USING ((( SELECT private.owns_shop(products.shop_id) AS owns_shop) OR ( SELECT private.is_platform_admin() AS is_platform_admin))) WITH CHECK ((( SELECT private.owns_shop(products.shop_id) AS owns_shop) OR ( SELECT private.is_platform_admin() AS is_platform_admin)));

DROP POLICY IF EXISTS "profiles_select_own" ON public."profiles";

CREATE POLICY "profiles_select_own" ON public."profiles" AS PERMISSIVE FOR SELECT TO authenticated USING ((( SELECT auth.uid() AS uid) = id));

DROP POLICY IF EXISTS "profiles_update_own" ON public."profiles";

CREATE POLICY "profiles_update_own" ON public."profiles" AS PERMISSIVE FOR UPDATE TO authenticated USING ((( SELECT auth.uid() AS uid) = id)) WITH CHECK ((( SELECT auth.uid() AS uid) = id));

DROP POLICY IF EXISTS "shipments_buyer_select" ON public."shipments";

CREATE POLICY "shipments_buyer_select" ON public."shipments" AS PERMISSIVE FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM orders o
  WHERE ((o.id = shipments.order_id) AND (o.buyer_id = ( SELECT auth.uid() AS uid))))));

DROP POLICY IF EXISTS "shops_public_read" ON public."shops";

CREATE POLICY "shops_public_read" ON public."shops" AS PERMISSIVE FOR SELECT TO anon, authenticated USING ((status = 'active'::text));

DROP POLICY IF EXISTS "shops_seller_manage" ON public."shops";

CREATE POLICY "shops_seller_manage" ON public."shops" AS PERMISSIVE FOR ALL TO authenticated USING ((( SELECT private.owns_shop(shops.id) AS owns_shop) OR ( SELECT private.is_platform_admin() AS is_platform_admin))) WITH CHECK ((( SELECT private.is_platform_admin() AS is_platform_admin) OR (( SELECT private.has_role('seller'::text) AS has_role) AND (owner_id = ( SELECT auth.uid() AS uid)))));

DROP POLICY IF EXISTS "stories_admin_manage" ON public."stories";

CREATE POLICY "stories_admin_manage" ON public."stories" AS PERMISSIVE FOR ALL TO authenticated USING (( SELECT private.is_platform_admin() AS is_platform_admin)) WITH CHECK (( SELECT private.is_platform_admin() AS is_platform_admin));

DROP POLICY IF EXISTS "stories_public_read" ON public."stories";

CREATE POLICY "stories_public_read" ON public."stories" AS PERMISSIVE FOR SELECT TO anon, authenticated USING ((status = 'published'::text));

DROP POLICY IF EXISTS "user_coupons_own_select" ON public."user_coupons";

CREATE POLICY "user_coupons_own_select" ON public."user_coupons" AS PERMISSIVE FOR SELECT TO public USING ((( SELECT auth.uid() AS uid) = user_id));

DROP POLICY IF EXISTS "roles_select_own" ON public."user_roles";

CREATE POLICY "roles_select_own" ON public."user_roles" AS PERMISSIVE FOR SELECT TO authenticated USING ((( SELECT auth.uid() AS uid) = user_id));

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']) ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS product_images_public_read ON storage.objects;

CREATE POLICY product_images_public_read ON storage.objects FOR SELECT TO public USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS product_images_admin_insert ON storage.objects;

CREATE POLICY product_images_admin_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images' AND private.is_platform_admin());

DROP POLICY IF EXISTS product_images_admin_update ON storage.objects;

CREATE POLICY product_images_admin_update ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images' AND private.is_platform_admin()) WITH CHECK (bucket_id = 'product-images' AND private.is_platform_admin());

DROP POLICY IF EXISTS product_images_admin_delete ON storage.objects;

CREATE POLICY product_images_admin_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images' AND private.is_platform_admin());

REVOKE ALL ON FUNCTION public.create_order_from_items(uuid, uuid, jsonb) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_order_from_items(uuid, uuid, jsonb) TO service_role;
