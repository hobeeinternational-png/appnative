-- HOBEE Travel management: listings, room types, galleries and publish controls.
-- Existing customer/order/payment contracts remain unchanged.

CREATE TABLE IF NOT EXISTS public.travel_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  listing_type text NOT NULL CHECK (listing_type IN ('trip', 'accommodation')),
  province_id text NOT NULL CHECK (province_id IN ('satun', 'yala', 'pattani', 'songkhla', 'narathiwat')),
  province_name text NOT NULL,
  title text NOT NULL,
  short_description text NOT NULL,
  full_description text NOT NULL,
  location text NOT NULL,
  latitude numeric(9,6) NOT NULL,
  longitude numeric(9,6) NOT NULL,
  price_from numeric NOT NULL CHECK (price_from >= 0),
  currency char(3) NOT NULL DEFAULT 'THB',
  rating numeric NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  reviews_count integer NOT NULL DEFAULT 0 CHECK (reviews_count >= 0),
  property_type text,
  operator_name text NOT NULL,
  is_halal_certified boolean NOT NULL DEFAULT false,
  included jsonb NOT NULL DEFAULT '[]'::jsonb,
  excluded jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.travel_listing_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.travel_listings(id) ON DELETE CASCADE,
  storage_path text,
  external_url text,
  alt_text text,
  sort_order integer NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT travel_listing_images_source_check CHECK (num_nonnulls(storage_path, external_url) = 1),
  CONSTRAINT travel_listing_images_listing_sort_unique UNIQUE (listing_id, sort_order)
);

CREATE TABLE IF NOT EXISTS public.travel_room_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.travel_listings(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price_per_night numeric NOT NULL CHECK (price_per_night >= 0),
  capacity_adults integer NOT NULL DEFAULT 1 CHECK (capacity_adults >= 1),
  capacity_children integer NOT NULL DEFAULT 0 CHECK (capacity_children >= 0),
  room_size_sqm numeric NOT NULL DEFAULT 0 CHECK (room_size_sqm >= 0),
  bed_type text NOT NULL DEFAULT '',
  amenities jsonb NOT NULL DEFAULT '[]'::jsonb,
  available_count integer NOT NULL DEFAULT 0 CHECK (available_count >= 0),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT travel_room_types_listing_name_unique UNIQUE (listing_id, name)
);

CREATE TABLE IF NOT EXISTS public.travel_room_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_type_id uuid NOT NULL REFERENCES public.travel_room_types(id) ON DELETE CASCADE,
  storage_path text,
  external_url text,
  alt_text text,
  sort_order integer NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT travel_room_images_source_check CHECK (num_nonnulls(storage_path, external_url) = 1),
  CONSTRAINT travel_room_images_room_sort_unique UNIQUE (room_type_id, sort_order)
);

CREATE TABLE IF NOT EXISTS public.travel_itinerary_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.travel_listings(id) ON DELETE CASCADE,
  day_number integer NOT NULL CHECK (day_number >= 1),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT travel_itinerary_days_listing_day_unique UNIQUE (listing_id, day_number)
);

CREATE TABLE IF NOT EXISTS public.travel_departure_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.travel_listings(id) ON DELETE CASCADE,
  departure_date date NOT NULL,
  capacity integer CHECK (capacity IS NULL OR capacity > 0),
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT travel_departure_dates_listing_date_unique UNIQUE (listing_id, departure_date)
);

CREATE TABLE IF NOT EXISTS public.travel_add_ons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.travel_listings(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0 CHECK (price >= 0),
  icon text NOT NULL DEFAULT 'add-circle-outline',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT travel_add_ons_listing_title_unique UNIQUE (listing_id, title)
);

CREATE INDEX IF NOT EXISTS travel_listings_admin_order_idx ON public.travel_listings (updated_at DESC);
CREATE INDEX IF NOT EXISTS travel_listings_public_idx ON public.travel_listings (listing_type, province_id, status, is_visible);
CREATE INDEX IF NOT EXISTS travel_listing_images_listing_idx ON public.travel_listing_images (listing_id, sort_order);
CREATE INDEX IF NOT EXISTS travel_room_types_listing_idx ON public.travel_room_types (listing_id, status, is_visible);

DROP TRIGGER IF EXISTS set_travel_listings_updated_at ON public.travel_listings;
CREATE TRIGGER set_travel_listings_updated_at BEFORE UPDATE ON public.travel_listings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_travel_room_types_updated_at ON public.travel_room_types;
CREATE TRIGGER set_travel_room_types_updated_at BEFORE UPDATE ON public.travel_room_types FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_travel_itinerary_days_updated_at ON public.travel_itinerary_days;
CREATE TRIGGER set_travel_itinerary_days_updated_at BEFORE UPDATE ON public.travel_itinerary_days FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_travel_departure_dates_updated_at ON public.travel_departure_dates;
CREATE TRIGGER set_travel_departure_dates_updated_at BEFORE UPDATE ON public.travel_departure_dates FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_travel_add_ons_updated_at ON public.travel_add_ons;
CREATE TRIGGER set_travel_add_ons_updated_at BEFORE UPDATE ON public.travel_add_ons FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.travel_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_room_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_departure_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_add_ons ENABLE ROW LEVEL SECURITY;

CREATE POLICY travel_listings_public_read ON public.travel_listings FOR SELECT TO anon, authenticated USING (status = 'published' AND is_visible);
CREATE POLICY travel_listings_admin_manage ON public.travel_listings FOR ALL TO authenticated USING (private.is_platform_admin()) WITH CHECK (private.is_platform_admin());
CREATE POLICY travel_listing_images_public_read ON public.travel_listing_images FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.travel_listings t WHERE t.id = listing_id AND t.status = 'published' AND t.is_visible));
CREATE POLICY travel_listing_images_admin_manage ON public.travel_listing_images FOR ALL TO authenticated USING (private.is_platform_admin()) WITH CHECK (private.is_platform_admin());
CREATE POLICY travel_room_types_public_read ON public.travel_room_types FOR SELECT TO anon, authenticated USING (status = 'published' AND is_visible AND EXISTS (SELECT 1 FROM public.travel_listings t WHERE t.id = listing_id AND t.status = 'published' AND t.is_visible));
CREATE POLICY travel_room_types_admin_manage ON public.travel_room_types FOR ALL TO authenticated USING (private.is_platform_admin()) WITH CHECK (private.is_platform_admin());
CREATE POLICY travel_room_images_public_read ON public.travel_room_images FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.travel_room_types r JOIN public.travel_listings t ON t.id = r.listing_id WHERE r.id = room_type_id AND r.status = 'published' AND r.is_visible AND t.status = 'published' AND t.is_visible));
CREATE POLICY travel_room_images_admin_manage ON public.travel_room_images FOR ALL TO authenticated USING (private.is_platform_admin()) WITH CHECK (private.is_platform_admin());
CREATE POLICY travel_itinerary_days_public_read ON public.travel_itinerary_days FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.travel_listings t WHERE t.id = listing_id AND t.status = 'published' AND t.is_visible));
CREATE POLICY travel_itinerary_days_admin_manage ON public.travel_itinerary_days FOR ALL TO authenticated USING (private.is_platform_admin()) WITH CHECK (private.is_platform_admin());
CREATE POLICY travel_departure_dates_public_read ON public.travel_departure_dates FOR SELECT TO anon, authenticated USING (is_available AND EXISTS (SELECT 1 FROM public.travel_listings t WHERE t.id = listing_id AND t.status = 'published' AND t.is_visible));
CREATE POLICY travel_departure_dates_admin_manage ON public.travel_departure_dates FOR ALL TO authenticated USING (private.is_platform_admin()) WITH CHECK (private.is_platform_admin());
CREATE POLICY travel_add_ons_public_read ON public.travel_add_ons FOR SELECT TO anon, authenticated USING (status = 'published' AND is_visible AND EXISTS (SELECT 1 FROM public.travel_listings t WHERE t.id = listing_id AND t.status = 'published' AND t.is_visible));
CREATE POLICY travel_add_ons_admin_manage ON public.travel_add_ons FOR ALL TO authenticated USING (private.is_platform_admin()) WITH CHECK (private.is_platform_admin());

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('travel-images', 'travel-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY travel_images_public_read ON storage.objects FOR SELECT TO public USING (bucket_id = 'travel-images');
CREATE POLICY travel_images_admin_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'travel-images' AND private.is_platform_admin());
CREATE POLICY travel_images_admin_update ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'travel-images' AND private.is_platform_admin()) WITH CHECK (bucket_id = 'travel-images' AND private.is_platform_admin());
CREATE POLICY travel_images_admin_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'travel-images' AND private.is_platform_admin());

INSERT INTO public.travel_listings (slug, listing_type, province_id, province_name, title, short_description, full_description, location, latitude, longitude, price_from, rating, reviews_count, property_type, operator_name, is_halal_certified, included, excluded, status)
VALUES
  ('lipe-islands-3d2n', 'trip', 'satun', 'สตูล', 'ดำน้ำเกาะหลีเป๊ะ 3 วัน 2 คืน', 'ทะเลใส เกาะสวย และวิถีชุมชนอันดามัน', 'แพ็กเกจทริปตัวอย่างสำหรับออกแบบประสบการณ์ Travel ของ HOBEE โปรดตรวจสอบวันว่างและราคาจริงกับผู้ประกอบการก่อนยืนยันการจอง', 'เกาะหลีเป๊ะ, สตูล', 6.489000, 99.302000, 8900, 4.9, 128, NULL, 'HOBEE Andaman Local', true, '["รถรับส่งตามโปรแกรม","ที่พัก 2 คืน","อาหารฮาลาล","อุปกรณ์ดำน้ำ","ประกันอุบัติเหตุ"]', '["ตั๋วเครื่องบิน","ค่าใช้จ่ายส่วนตัว"]', 'published'),
  ('betong-garden-homestay', 'accommodation', 'yala', 'ยะลา / เบตง', 'เบตง การ์เดน โฮมสเตย์', 'พักใกล้หมอกเช้าและวิถีชุมชนเบตง', 'ที่พักตัวอย่างในเครือข่ายชุมชนสำหรับแสดงการเลือกห้องพัก สิ่งอำนวยความสะดวก และการจองรายคืน', 'เบตง, ยะลา', 5.774000, 101.072000, 1590, 4.8, 74, 'โฮมสเตย์ชุมชน', 'Betong Community Stay', true, '["อาหารเช้าฮาลาล","น้ำดื่ม","ที่จอดรถ"]', '["รถรับส่งสนามบิน","อาหารมื้ออื่น"]', 'published'),
  ('pattani-local-heritage', 'trip', 'pattani', 'ปัตตานี', 'พหุวัฒนธรรมปัตตานี 2 วัน 1 คืน', 'อาหาร ฮาลาล ศิลปะ และวิถีชุมชนชายแดนใต้', 'ทริปตัวอย่างสำหรับ Local Life Hub ที่เน้นอาหารท้องถิ่น สถานที่สำคัญ และ Creator ชุมชน', 'เมืองปัตตานี', 6.869000, 101.250000, 3490, 4.7, 41, NULL, 'Pattani Local Collective', true, '["รถตู้ท้องถิ่น","มื้ออาหารตามโปรแกรม","ไกด์ชุมชน","ประกันอุบัติเหตุ"]', '["ตั๋วเดินทางมายังปัตตานี","ค่าใช้จ่ายส่วนตัว"]', 'published')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.travel_listing_images (listing_id, external_url, alt_text, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=85&w=1200', 'ทะเลเกาะหลีเป๊ะ', 0 FROM public.travel_listings WHERE slug = 'lipe-islands-3d2n'
ON CONFLICT (listing_id, sort_order) DO NOTHING;
INSERT INTO public.travel_listing_images (listing_id, external_url, alt_text, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&q=85&w=1200', 'ทริปอันดามัน', 1 FROM public.travel_listings WHERE slug = 'lipe-islands-3d2n'
ON CONFLICT (listing_id, sort_order) DO NOTHING;
INSERT INTO public.travel_listing_images (listing_id, external_url, alt_text, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=85&w=1200', 'เบตง การ์เดน โฮมสเตย์', 0 FROM public.travel_listings WHERE slug = 'betong-garden-homestay'
ON CONFLICT (listing_id, sort_order) DO NOTHING;
INSERT INTO public.travel_listing_images (listing_id, external_url, alt_text, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?auto=format&fit=crop&q=85&w=1200', 'ที่พักชุมชนเบตง', 1 FROM public.travel_listings WHERE slug = 'betong-garden-homestay'
ON CONFLICT (listing_id, sort_order) DO NOTHING;
INSERT INTO public.travel_listing_images (listing_id, external_url, alt_text, sort_order)
SELECT id, 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=85&w=1200', 'พหุวัฒนธรรมปัตตานี', 0 FROM public.travel_listings WHERE slug = 'pattani-local-heritage'
ON CONFLICT (listing_id, sort_order) DO NOTHING;

INSERT INTO public.travel_room_types (listing_id, name, description, price_per_night, capacity_adults, capacity_children, room_size_sqm, bed_type, amenities, available_count, status)
SELECT id, 'Deluxe Garden View', 'ห้องพักวิวสวนสำหรับคู่รักหรือครอบครัวเล็ก', 1590, 2, 1, 32, '1 King Bed', '["Free Wi‑Fi","เครื่องปรับอากาศ","อาหารเช้าฮาลาล","ที่จอดรถ"]', 3, 'published' FROM public.travel_listings WHERE slug = 'betong-garden-homestay'
ON CONFLICT (listing_id, name) DO NOTHING;
INSERT INTO public.travel_room_types (listing_id, name, description, price_per_night, capacity_adults, capacity_children, room_size_sqm, bed_type, amenities, available_count, status)
SELECT id, 'Cozy Mountain View Suite', 'ห้องสวีทพร้อมพื้นที่พักผ่อนและวิวภูเขา', 2290, 3, 1, 46, '1 King Bed + Sofa Bed', '["Free Wi‑Fi","อาหารเช้าฮาลาล","เครื่องทำน้ำอุ่น","ระเบียงส่วนตัว"]', 2, 'published' FROM public.travel_listings WHERE slug = 'betong-garden-homestay'
ON CONFLICT (listing_id, name) DO NOTHING;

INSERT INTO public.travel_room_images (room_type_id, external_url, alt_text, sort_order)
SELECT r.id, 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=85&w=800', 'Deluxe Garden View' , 0 FROM public.travel_room_types r JOIN public.travel_listings t ON t.id = r.listing_id WHERE t.slug = 'betong-garden-homestay' AND r.name = 'Deluxe Garden View'
ON CONFLICT (room_type_id, sort_order) DO NOTHING;
INSERT INTO public.travel_room_images (room_type_id, external_url, alt_text, sort_order)
SELECT r.id, 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=85&w=800', 'Cozy Mountain View Suite', 0 FROM public.travel_room_types r JOIN public.travel_listings t ON t.id = r.listing_id WHERE t.slug = 'betong-garden-homestay' AND r.name = 'Cozy Mountain View Suite'
ON CONFLICT (room_type_id, sort_order) DO NOTHING;

INSERT INTO public.travel_itinerary_days (listing_id, day_number, title, description)
SELECT id, 1, 'ถึงสตูลและเข้าสู่เกาะหลีเป๊ะ', 'พบไกด์ท้องถิ่น เดินทางโดยเรือ และเช็คอินที่พัก' FROM public.travel_listings WHERE slug = 'lipe-islands-3d2n'
ON CONFLICT (listing_id, day_number) DO NOTHING;
INSERT INTO public.travel_itinerary_days (listing_id, day_number, title, description)
SELECT id, 2, 'ดำน้ำชมปะการัง', 'ออกเรือไปยังจุดดำน้ำ พร้อมอาหารฮาลาล' FROM public.travel_listings WHERE slug = 'lipe-islands-3d2n'
ON CONFLICT (listing_id, day_number) DO NOTHING;
INSERT INTO public.travel_itinerary_days (listing_id, day_number, title, description)
SELECT id, 3, 'วิถีชุมชนและเดินทางกลับ', 'เลือกซื้อของดีท้องถิ่นก่อนเดินทางกลับ' FROM public.travel_listings WHERE slug = 'lipe-islands-3d2n'
ON CONFLICT (listing_id, day_number) DO NOTHING;
INSERT INTO public.travel_itinerary_days (listing_id, day_number, title, description)
SELECT id, 1, 'ชิมวิถีถิ่น', 'ตลาดเช้า อาหารฮาลาล และงานหัตถกรรม' FROM public.travel_listings WHERE slug = 'pattani-local-heritage'
ON CONFLICT (listing_id, day_number) DO NOTHING;
INSERT INTO public.travel_itinerary_days (listing_id, day_number, title, description)
SELECT id, 2, 'เรื่องเล่าชุมชน', 'พบ Creator และเลือกซื้อของดีท้องถิ่น' FROM public.travel_listings WHERE slug = 'pattani-local-heritage'
ON CONFLICT (listing_id, day_number) DO NOTHING;

INSERT INTO public.travel_departure_dates (listing_id, departure_date)
SELECT id, date '2026-08-22' FROM public.travel_listings WHERE slug = 'lipe-islands-3d2n' ON CONFLICT (listing_id, departure_date) DO NOTHING;
INSERT INTO public.travel_departure_dates (listing_id, departure_date)
SELECT id, date '2026-09-05' FROM public.travel_listings WHERE slug = 'lipe-islands-3d2n' ON CONFLICT (listing_id, departure_date) DO NOTHING;
INSERT INTO public.travel_departure_dates (listing_id, departure_date)
SELECT id, date '2026-09-19' FROM public.travel_listings WHERE slug = 'lipe-islands-3d2n' ON CONFLICT (listing_id, departure_date) DO NOTHING;
INSERT INTO public.travel_departure_dates (listing_id, departure_date)
SELECT id, date '2026-08-30' FROM public.travel_listings WHERE slug = 'pattani-local-heritage' ON CONFLICT (listing_id, departure_date) DO NOTHING;
INSERT INTO public.travel_departure_dates (listing_id, departure_date)
SELECT id, date '2026-09-13' FROM public.travel_listings WHERE slug = 'pattani-local-heritage' ON CONFLICT (listing_id, departure_date) DO NOTHING;

INSERT INTO public.travel_add_ons (listing_id, title, description, price, icon, status)
SELECT id, 'รถรับส่งสนามบิน', 'รับ-ส่งตามเวลาที่เลือก', 900, 'directions-car', 'published' FROM public.travel_listings
ON CONFLICT (listing_id, title) DO NOTHING;
INSERT INTO public.travel_add_ons (listing_id, title, description, price, icon, status)
SELECT id, 'eSIM เน็ต 5 วัน', 'สำหรับนักท่องเที่ยวต่างชาติ', 350, 'sim-card', 'published' FROM public.travel_listings
ON CONFLICT (listing_id, title) DO NOTHING;
INSERT INTO public.travel_add_ons (listing_id, title, description, price, icon, status)
SELECT id, 'เซ็ตอาหารฮาลาล', 'เลือกเมนูตามจำนวนผู้เดินทาง', 450, 'restaurant', 'published' FROM public.travel_listings
ON CONFLICT (listing_id, title) DO NOTHING;
