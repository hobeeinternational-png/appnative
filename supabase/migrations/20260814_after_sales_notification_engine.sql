-- Notification engine: preference-aware in-app records and best-effort push outbox.

CREATE OR REPLACE FUNCTION private.notification_category(p_notification_type text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path TO pg_catalog
AS $function$
  SELECT CASE
    WHEN p_notification_type LIKE 'CASE_%' OR p_notification_type LIKE 'REFUND_%' OR p_notification_type LIKE 'RETURN_%' OR p_notification_type LIKE 'REPLACEMENT_%' THEN 'claims'
    WHEN p_notification_type LIKE 'SHIPMENT_%' THEN 'shipping'
    WHEN p_notification_type LIKE 'PAYMENT_%' THEN 'payments'
    WHEN p_notification_type LIKE 'EARNING_%' THEN 'earnings'
    WHEN p_notification_type LIKE 'ORDER_%' THEN 'orders'
    WHEN p_notification_type LIKE 'WORK_%' OR p_notification_type LIKE 'ROLE_%' THEN 'work'
    ELSE 'work'
  END;
$function$;

CREATE OR REPLACE FUNCTION private.is_critical_hobee_notification(p_notification_type text)
RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path TO pg_catalog
AS $function$
  SELECT p_notification_type LIKE 'REFUND_%'
    OR p_notification_type IN ('CASE_APPROVED', 'CASE_REJECTED', 'PAYMENT_FAILED', 'PAYMENT_PAID', 'SHIPMENT_DELIVERED')
    OR p_notification_type LIKE 'SECURITY_%';
$function$;

CREATE OR REPLACE FUNCTION private.upsert_my_hobee_notification(
  p_user_id uuid, p_notification_type text, p_title text, p_body text, p_route text,
  p_source_type text, p_source_id uuid, p_source_key text
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
DECLARE v_notification_id uuid; v_category text; v_in_app boolean := true; v_push boolean := true; v_critical boolean;
BEGIN
  v_category := private.notification_category(p_notification_type);
  v_critical := private.is_critical_hobee_notification(p_notification_type);
  SELECT in_app_enabled, push_enabled INTO v_in_app, v_push
  FROM public.user_notification_preferences WHERE user_id = p_user_id AND category = v_category;
  v_in_app := COALESCE(v_in_app, true);
  v_push := COALESCE(v_push, true);
  IF NOT v_in_app AND NOT v_critical THEN RETURN; END IF;
  INSERT INTO public.user_notifications (user_id, notification_type, title, body, route, source_type, source_id, source_key)
  VALUES (p_user_id, p_notification_type, p_title, p_body, p_route, p_source_type, p_source_id, p_source_key)
  ON CONFLICT (user_id, source_key) DO UPDATE
    SET title = EXCLUDED.title, body = EXCLUDED.body, route = EXCLUDED.route, is_read = false, read_at = NULL
  RETURNING id INTO v_notification_id;
  INSERT INTO public.notification_delivery_outbox (notification_id, user_id, category, delivery_status)
  VALUES (v_notification_id, p_user_id, v_category, CASE WHEN v_push OR v_critical THEN 'queued' ELSE 'suppressed' END)
  ON CONFLICT (notification_id) DO UPDATE
    SET delivery_status = CASE WHEN v_push OR v_critical THEN 'queued' ELSE 'suppressed' END, updated_at = timezone('utc', now());
END;
$function$;
