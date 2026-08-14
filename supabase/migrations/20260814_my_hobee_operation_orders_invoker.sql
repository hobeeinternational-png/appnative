-- The operation feed is read-only and all joined relations now have organization-aware RLS.
-- Keep writes in protected procedures, but let this selector run as the authenticated invoker.

CREATE OR REPLACE FUNCTION public.list_my_hobee_operation_orders()
RETURNS TABLE (
  id uuid,
  order_number text,
  subtotal numeric,
  shipping_fee numeric,
  discount_amount numeric,
  total numeric,
  currency char(3),
  status text,
  payment_status text,
  created_at timestamptz,
  organization_id uuid,
  has_ready_event boolean
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO public, private, pg_catalog
AS $function$
  SELECT DISTINCT ON (o.id)
    o.id, o.order_number, o.subtotal, o.shipping_fee, o.discount_amount, o.total, o.currency,
    o.status, o.payment_status, o.created_at, osl.organization_id,
    EXISTS (SELECT 1 FROM public.order_operation_events event WHERE event.order_id = o.id AND event.action = 'READY')
  FROM public.orders o
  JOIN public.order_items oi ON oi.order_id = o.id
  JOIN public.organization_shop_links osl ON osl.shop_id = oi.shop_id
  WHERE private.organization_has_permission(osl.organization_id, 'MANAGE_ORDERS')
  ORDER BY o.id, o.created_at DESC;
$function$;

REVOKE ALL ON FUNCTION public.list_my_hobee_operation_orders() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_my_hobee_operation_orders() TO authenticated;
