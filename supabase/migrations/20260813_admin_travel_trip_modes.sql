ALTER TABLE public.travel_listings
  ADD COLUMN IF NOT EXISTS trip_modes jsonb NOT NULL DEFAULT '["join","private"]'::jsonb;

UPDATE public.travel_listings
SET trip_modes = '["join","private"]'::jsonb
WHERE listing_type = 'trip' AND trip_modes = '[]'::jsonb;
