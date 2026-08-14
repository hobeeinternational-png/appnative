-- MY HOBEE mobile fulfillment quick action: requires a real carrier and tracking number before shipping.

CREATE OR REPLACE FUNCTION public.ship_my_hobee_order(
  p_order_id uuid,
  p_provider text,
  p_tracking_number text,
  p_tracking_url text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, private, pg_catalog
AS $function$
DECLARE
  v_shop_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;
  IF coalesce(trim(p_provider), '') = '' OR coalesce(trim(p_tracking_number), '') = '' THEN
    RAISE EXCEPTION 'carrier and tracking number are required';
  END IF;

  SELECT oi.shop_id INTO v_shop_id
  FROM public.order_items oi
  WHERE oi.order_id = p_order_id
  ORDER BY oi.created_at ASC
  LIMIT 1;
  IF v_shop_id IS NULL THEN RAISE EXCEPTION 'order has no fulfillment line'; END IF;

  -- Authorization and state validation are centralized in the operation procedure.
  PERFORM public.perform_my_hobee_order_operation(p_order_id, 'SHIPPED');

  UPDATE public.shipments
  SET provider = trim(p_provider), tracking_number = trim(p_tracking_number), tracking_url = nullif(trim(p_tracking_url), ''), status = 'shipped', shipped_at = coalesce(shipped_at, timezone('utc', now())), updated_at = timezone('utc', now())
  WHERE order_id = p_order_id AND status <> 'delivered';

  IF NOT FOUND THEN
    INSERT INTO public.shipments (order_id, shop_id, provider, tracking_number, tracking_url, status, metadata, shipped_at)
    VALUES (p_order_id, v_shop_id, trim(p_provider), trim(p_tracking_number), nullif(trim(p_tracking_url), ''), 'shipped', '{}'::jsonb, timezone('utc', now()));
  END IF;
END;
$function$;

REVOKE ALL ON FUNCTION public.ship_my_hobee_order(uuid, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ship_my_hobee_order(uuid, text, text, text) TO authenticated;
