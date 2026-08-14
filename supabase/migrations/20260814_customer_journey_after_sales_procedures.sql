-- Protected after-sales operations. Mobile clients request actions; this migration owns authorization and financial boundaries.

ALTER TABLE public.work_inbox_items DROP CONSTRAINT IF EXISTS work_inbox_items_item_type_check;
ALTER TABLE public.work_inbox_items ADD CONSTRAINT work_inbox_items_item_type_check CHECK (item_type = ANY (ARRAY[
  'ORDER', 'BOOKING', 'CREATOR_JOB', 'TEACHING', 'SERVICE_JOB', 'EMPLOYEE_TASK', 'MESSAGE', 'APPROVAL', 'CASE'
]));

CREATE OR REPLACE FUNCTION private.append_after_sales_case_event(
  p_case_id uuid,
  p_event_type text,
  p_actor_id uuid,
  p_description text DEFAULT NULL,
  p_source_key text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
BEGIN
  INSERT INTO public.after_sales_case_events (case_id, event_type, actor_id, description, source_key, metadata)
  VALUES (p_case_id, p_event_type, p_actor_id, p_description, p_source_key, COALESCE(p_metadata, '{}'::jsonb))
  ON CONFLICT (source_key) DO NOTHING;
END;
$function$;

CREATE OR REPLACE FUNCTION private.notify_after_sales_customer(
  p_case_id uuid,
  p_notification_type text,
  p_title text,
  p_body text,
  p_source_key text
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
DECLARE v_user_id uuid;
BEGIN
  SELECT user_id INTO v_user_id FROM public.after_sales_cases WHERE id = p_case_id;
  IF v_user_id IS NULL THEN RETURN; END IF;
  PERFORM private.upsert_my_hobee_notification(v_user_id, p_notification_type, p_title, p_body, '/claims/' || p_case_id::text, 'AFTER_SALES_CASE', p_case_id, p_source_key);
END;
$function$;

CREATE OR REPLACE FUNCTION public.confirm_my_hobee_order_received(p_order_id uuid)
RETURNS timestamptz LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
DECLARE v_received_at timestamptz; v_order_number text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;
  SELECT customer_received_at, order_number INTO v_received_at, v_order_number
  FROM public.orders WHERE id = p_order_id AND buyer_id = auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'order not found'; END IF;
  IF v_received_at IS NOT NULL THEN RETURN v_received_at; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.shipments WHERE order_id = p_order_id AND status = 'delivered') THEN
    RAISE EXCEPTION 'a delivered shipment is required before customer confirmation';
  END IF;
  UPDATE public.orders SET customer_received_at = timezone('utc', now()) WHERE id = p_order_id RETURNING customer_received_at INTO v_received_at;
  INSERT INTO public.order_lifecycle_events (order_id, event_type, actor_id, source_key, metadata)
  VALUES (p_order_id, 'customer_received', auth.uid(), 'CUSTOMER_RECEIVED:' || p_order_id::text, jsonb_build_object('order_number', v_order_number))
  ON CONFLICT (source_key) DO NOTHING;
  INSERT INTO public.order_lifecycle_events (order_id, event_type, actor_id, source_key)
  VALUES (p_order_id, 'review_invited', auth.uid(), 'REVIEW_INVITED:' || p_order_id::text)
  ON CONFLICT (source_key) DO NOTHING;
  PERFORM private.upsert_my_hobee_notification(auth.uid(), 'REVIEW_INVITATION', 'ได้รับสินค้าแล้ว', 'คุณสามารถให้คะแนนและเขียนรีวิวสินค้าที่สั่งซื้อได้', '/orders/' || p_order_id::text, 'ORDER', p_order_id, 'REVIEW_INVITATION:' || p_order_id::text);
  RETURN v_received_at;
END;
$function$;

CREATE OR REPLACE FUNCTION public.submit_my_after_sales_case(
  p_order_id uuid,
  p_order_item_id uuid,
  p_case_type text,
  p_description text,
  p_requested_resolution text,
  p_reason_code text DEFAULT NULL
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
DECLARE
  v_case_id uuid; v_shop_id uuid; v_order_created_at timestamptz; v_received_at timestamptz;
  v_claim_window integer; v_case_number text; r record;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;
  SELECT created_at, customer_received_at INTO v_order_created_at, v_received_at
  FROM public.orders WHERE id = p_order_id AND buyer_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'order not found'; END IF;
  SELECT shop_id INTO v_shop_id FROM public.order_items WHERE id = p_order_item_id AND order_id = p_order_id;
  IF v_shop_id IS NULL THEN RAISE EXCEPTION 'order item not found'; END IF;
  SELECT COALESCE(shop_policy.claim_window_days, default_policy.claim_window_days)
  INTO v_claim_window
  FROM public.after_sales_policies default_policy
  LEFT JOIN public.after_sales_policies shop_policy ON shop_policy.shop_id = v_shop_id AND shop_policy.is_active
  WHERE default_policy.policy_key = 'default'
  LIMIT 1;
  IF v_claim_window IS NOT NULL AND timezone('utc', now()) > COALESCE(v_received_at, v_order_created_at) + make_interval(days => v_claim_window) THEN
    RAISE EXCEPTION 'claim window has ended';
  END IF;
  v_case_number := 'HB-CS-' || to_char(timezone('utc', now()), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  INSERT INTO public.after_sales_cases (case_number, user_id, order_id, order_item_id, shop_id, case_type, reason_code, description, requested_resolution, status, submitted_at)
  VALUES (v_case_number, auth.uid(), p_order_id, p_order_item_id, v_shop_id, p_case_type, NULLIF(trim(p_reason_code), ''), trim(p_description), p_requested_resolution, 'submitted', timezone('utc', now()))
  RETURNING id INTO v_case_id;
  PERFORM private.append_after_sales_case_event(v_case_id, 'submitted', auth.uid(), 'ส่งคำร้องแล้ว', 'CASE_SUBMITTED:' || v_case_id::text);
  PERFORM private.notify_after_sales_customer(v_case_id, 'CASE_SUBMITTED', 'รับคำร้องแล้ว', 'คำร้อง ' || v_case_number || ' อยู่ระหว่างรอตรวจสอบ', 'CASE_SUBMITTED_NOTIFICATION:' || v_case_id::text);
  FOR r IN
    SELECT DISTINCT m.user_id, osl.organization_id
    FROM public.organization_shop_links osl
    JOIN public.organization_memberships m ON m.organization_id = osl.organization_id AND m.status = 'active'
    LEFT JOIN public.organization_member_permissions permission ON permission.membership_id = m.id AND permission.permission = 'MANAGE_ORDERS'
    WHERE osl.shop_id = v_shop_id AND (m.member_role IN ('owner', 'admin') OR permission.permission IS NOT NULL)
  LOOP
    PERFORM private.upsert_my_hobee_work_item(r.user_id, r.organization_id, 'seller', 'CASE', 'AFTER_SALES_CASE', v_case_id, 'CASE_SUBMITTED:' || v_case_id::text || ':' || r.user_id::text, 'มีคำร้องหลังการขายใหม่', v_case_number, 'normal');
  END LOOP;
  RETURN v_case_id;
EXCEPTION WHEN unique_violation THEN
  RAISE EXCEPTION 'an active case for this order item and issue already exists';
END;
$function$;

CREATE OR REPLACE FUNCTION public.attach_my_after_sales_evidence(
  p_case_id uuid,
  p_storage_path text,
  p_media_type text,
  p_file_name text,
  p_file_size_bytes bigint DEFAULT NULL,
  p_note text DEFAULT NULL
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public, private, storage, pg_catalog
AS $function$
DECLARE v_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.after_sales_cases WHERE id = p_case_id AND user_id = auth.uid() AND status NOT IN ('closed', 'cancelled', 'rejected')) THEN
    RAISE EXCEPTION 'case is not available for evidence upload';
  END IF;
  IF left(p_storage_path, char_length(auth.uid()::text) + 1) <> auth.uid()::text || '/' THEN RAISE EXCEPTION 'invalid evidence path'; END IF;
  IF NOT EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'after-sales-evidence' AND name = p_storage_path AND owner_id = auth.uid()::text) THEN
    RAISE EXCEPTION 'evidence file was not uploaded by this user';
  END IF;
  INSERT INTO public.after_sales_evidence (case_id, uploaded_by, storage_path, media_type, file_name, file_size_bytes, note)
  VALUES (p_case_id, auth.uid(), p_storage_path, p_media_type, trim(p_file_name), p_file_size_bytes, NULLIF(trim(p_note), ''))
  RETURNING id INTO v_id;
  PERFORM private.append_after_sales_case_event(p_case_id, 'evidence_added', auth.uid(), 'เพิ่มหลักฐานแล้ว', 'CASE_EVIDENCE:' || v_id::text);
  RETURN v_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.add_my_after_sales_message(
  p_case_id uuid,
  p_body text,
  p_visibility text DEFAULT 'customer'
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
DECLARE v_id uuid; v_is_customer boolean; v_is_manager boolean;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;
  SELECT user_id = auth.uid() INTO v_is_customer FROM public.after_sales_cases WHERE id = p_case_id;
  v_is_manager := private.can_manage_after_sales_case(p_case_id);
  IF COALESCE(v_is_customer, false) AND p_visibility <> 'customer' THEN RAISE EXCEPTION 'customers may only post customer messages'; END IF;
  IF NOT COALESCE(v_is_customer, false) AND NOT v_is_manager THEN RAISE EXCEPTION 'not allowed to post in this case'; END IF;
  IF p_visibility = 'internal' AND NOT private.is_platform_admin() THEN RAISE EXCEPTION 'internal messages require platform admin'; END IF;
  IF p_visibility NOT IN ('customer', 'seller', 'support', 'internal') THEN RAISE EXCEPTION 'invalid message visibility'; END IF;
  INSERT INTO public.after_sales_case_messages (case_id, author_id, visibility, body) VALUES (p_case_id, auth.uid(), p_visibility, trim(p_body)) RETURNING id INTO v_id;
  PERFORM private.append_after_sales_case_event(p_case_id, 'message_added', auth.uid(), 'มีข้อความใหม่', 'CASE_MESSAGE:' || v_id::text);
  RETURN v_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.review_my_after_sales_case(
  p_case_id uuid,
  p_next_status text,
  p_decision_note text DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
DECLARE v_current_status text; v_case_number text; v_customer_id uuid; v_event_type text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;
  IF NOT private.can_manage_after_sales_case(p_case_id) THEN RAISE EXCEPTION 'case management permission required'; END IF;
  SELECT status, case_number, user_id INTO v_current_status, v_case_number, v_customer_id FROM public.after_sales_cases WHERE id = p_case_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'case not found'; END IF;
  IF p_next_status NOT IN ('under_review', 'need_more_info', 'approved', 'rejected', 'in_progress', 'resolved', 'closed') THEN RAISE EXCEPTION 'invalid case status'; END IF;
  IF p_next_status IN ('approved', 'rejected', 'closed') AND NOT private.is_platform_admin() THEN RAISE EXCEPTION 'platform admin approval required'; END IF;
  UPDATE public.after_sales_cases
  SET status = p_next_status,
      assigned_to = COALESCE(assigned_to, auth.uid()),
      decision_note = CASE WHEN p_next_status IN ('approved', 'rejected') THEN NULLIF(trim(p_decision_note), '') ELSE decision_note END,
      resolved_at = CASE WHEN p_next_status = 'resolved' THEN timezone('utc', now()) ELSE resolved_at END,
      closed_at = CASE WHEN p_next_status = 'closed' THEN timezone('utc', now()) ELSE closed_at END
  WHERE id = p_case_id;
  v_event_type := p_next_status;
  PERFORM private.append_after_sales_case_event(p_case_id, v_event_type, auth.uid(), NULLIF(trim(p_decision_note), ''), 'CASE_STATUS:' || p_case_id::text || ':' || p_next_status || ':' || extract(epoch FROM timezone('utc', now()))::text);
  PERFORM private.upsert_my_hobee_notification(v_customer_id, 'CASE_' || upper(p_next_status), 'คำร้อง ' || v_case_number || ' อัปเดต', 'สถานะล่าสุด: ' || p_next_status, '/claims/' || p_case_id::text, 'AFTER_SALES_CASE', p_case_id, 'CASE_STATUS_NOTIFICATION:' || p_case_id::text || ':' || p_next_status || ':' || extract(epoch FROM timezone('utc', now()))::text);
END;
$function$;

CREATE OR REPLACE FUNCTION public.submit_my_return_tracking(
  p_case_id uuid,
  p_carrier text,
  p_tracking_number text,
  p_tracking_url text DEFAULT NULL,
  p_receipt_storage_path text DEFAULT NULL
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
DECLARE v_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.after_sales_cases WHERE id = p_case_id AND user_id = auth.uid() AND requested_resolution = 'return_and_refund' AND status IN ('approved', 'in_progress')) THEN
    RAISE EXCEPTION 'return tracking is not available for this case';
  END IF;
  INSERT INTO public.return_shipments (case_id, carrier, tracking_number, tracking_url, receipt_storage_path, status, shipped_at)
  VALUES (p_case_id, trim(p_carrier), trim(p_tracking_number), NULLIF(trim(p_tracking_url), ''), NULLIF(trim(p_receipt_storage_path), ''), 'shipped', timezone('utc', now()))
  ON CONFLICT (case_id) DO UPDATE SET carrier = EXCLUDED.carrier, tracking_number = EXCLUDED.tracking_number, tracking_url = EXCLUDED.tracking_url, receipt_storage_path = EXCLUDED.receipt_storage_path, status = 'shipped', shipped_at = COALESCE(public.return_shipments.shipped_at, EXCLUDED.shipped_at), updated_at = timezone('utc', now())
  RETURNING id INTO v_id;
  PERFORM private.append_after_sales_case_event(p_case_id, 'return_tracking_added', auth.uid(), 'เพิ่มเลขติดตามการคืนสินค้าแล้ว', 'RETURN_TRACKING:' || p_case_id::text);
  RETURN v_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.authorize_my_after_sales_refund(
  p_case_id uuid,
  p_amount numeric,
  p_refund_method text,
  p_items jsonb
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
DECLARE v_refund_id uuid; v_order_id uuid; v_paid_amount numeric; v_reserved_amount numeric; v_line_total numeric; v_item_quantity integer; v_prior_item_amount numeric; r record;
BEGIN
  IF auth.uid() IS NULL OR NOT private.is_platform_admin() THEN RAISE EXCEPTION 'platform admin approval required'; END IF;
  IF p_amount <= 0 OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN RAISE EXCEPTION 'valid refund amount and items are required'; END IF;
  SELECT order_id INTO v_order_id FROM public.after_sales_cases WHERE id = p_case_id AND status IN ('approved', 'in_progress') FOR UPDATE;
  IF v_order_id IS NULL THEN RAISE EXCEPTION 'case is not approved for refund'; END IF;
  SELECT COALESCE(SUM(amount), 0) INTO v_paid_amount FROM public.payments WHERE order_id = v_order_id AND status = 'paid';
  SELECT COALESCE(SUM(amount), 0) INTO v_reserved_amount FROM public.after_sales_refunds WHERE order_id = v_order_id AND status IN ('requested', 'approved', 'processing', 'completed');
  IF p_amount > v_paid_amount - v_reserved_amount THEN RAISE EXCEPTION 'refund cannot exceed paid amount remaining'; END IF;
  IF (SELECT COALESCE(SUM((value->>'amount')::numeric), 0) FROM jsonb_array_elements(p_items)) <> p_amount THEN RAISE EXCEPTION 'refund lines must equal refund amount'; END IF;
  INSERT INTO public.after_sales_refunds (case_id, order_id, status, refund_method, amount, currency, approved_at, approved_by)
  SELECT p_case_id, v_order_id, 'approved', NULLIF(trim(p_refund_method), ''), p_amount, currency, timezone('utc', now()), auth.uid()
  FROM public.orders WHERE id = v_order_id RETURNING id INTO v_refund_id;
  FOR r IN SELECT * FROM jsonb_to_recordset(p_items) AS item(order_item_id uuid, quantity integer, amount numeric)
  LOOP
    SELECT line_total, quantity INTO v_line_total, v_item_quantity FROM public.order_items WHERE id = r.order_item_id AND order_id = v_order_id;
    SELECT COALESCE(SUM(refund_item.amount), 0) INTO v_prior_item_amount
    FROM public.after_sales_refund_items refund_item
    JOIN public.after_sales_refunds refund ON refund.id = refund_item.refund_id
    WHERE refund_item.order_item_id = r.order_item_id AND refund.status IN ('requested', 'approved', 'processing', 'completed');
    IF v_line_total IS NULL OR r.quantity <= 0 OR r.quantity > v_item_quantity OR r.amount < 0 OR r.amount > v_line_total - v_prior_item_amount THEN RAISE EXCEPTION 'invalid refund order item allocation'; END IF;
    INSERT INTO public.after_sales_refund_items (refund_id, order_item_id, quantity, amount) VALUES (v_refund_id, r.order_item_id, r.quantity, r.amount);
  END LOOP;
  UPDATE public.after_sales_cases SET status = 'in_progress' WHERE id = p_case_id;
  PERFORM private.append_after_sales_case_event(p_case_id, 'refund_requested', auth.uid(), 'อนุมัติการคืนเงินแล้ว', 'REFUND_APPROVED:' || v_refund_id::text, jsonb_build_object('refund_id', v_refund_id, 'amount', p_amount));
  PERFORM private.notify_after_sales_customer(p_case_id, 'REFUND_APPROVED', 'อนุมัติการคืนเงินแล้ว', 'ระบบกำลังเตรียมดำเนินการคืนเงิน', 'REFUND_APPROVED_NOTIFICATION:' || v_refund_id::text);
  RETURN v_refund_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.ship_my_after_sales_replacement(
  p_case_id uuid,
  p_provider text,
  p_tracking_number text,
  p_tracking_url text DEFAULT NULL
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
DECLARE v_id uuid; v_shop_id uuid;
BEGIN
  IF auth.uid() IS NULL OR NOT private.can_manage_after_sales_case(p_case_id) THEN RAISE EXCEPTION 'case management permission required'; END IF;
  SELECT shop_id INTO v_shop_id FROM public.after_sales_cases WHERE id = p_case_id AND requested_resolution IN ('replacement', 'reship_missing_item') AND status IN ('approved', 'in_progress');
  IF v_shop_id IS NULL THEN RAISE EXCEPTION 'replacement is not approved for this case'; END IF;
  INSERT INTO public.replacement_shipments (case_id, shop_id, provider, tracking_number, tracking_url, status, shipped_at)
  VALUES (p_case_id, v_shop_id, NULLIF(trim(p_provider), ''), NULLIF(trim(p_tracking_number), ''), NULLIF(trim(p_tracking_url), ''), 'shipped', timezone('utc', now()))
  ON CONFLICT (case_id) DO UPDATE SET provider = EXCLUDED.provider, tracking_number = EXCLUDED.tracking_number, tracking_url = EXCLUDED.tracking_url, status = 'shipped', shipped_at = COALESCE(public.replacement_shipments.shipped_at, EXCLUDED.shipped_at), updated_at = timezone('utc', now())
  RETURNING id INTO v_id;
  PERFORM private.append_after_sales_case_event(p_case_id, 'replacement_shipped', auth.uid(), 'ส่งสินค้าทดแทนแล้ว', 'REPLACEMENT_SHIPPED:' || p_case_id::text);
  PERFORM private.notify_after_sales_customer(p_case_id, 'REPLACEMENT_SHIPPED', 'ส่งสินค้าทดแทนแล้ว', 'คุณสามารถติดตามเลขพัสดุสินค้าทดแทนได้', 'REPLACEMENT_SHIPPED_NOTIFICATION:' || p_case_id::text);
  RETURN v_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cancel_my_pending_order(p_order_id uuid, p_reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;
  UPDATE public.orders SET status = 'cancelled'
  WHERE id = p_order_id AND buyer_id = auth.uid() AND status = 'pending' AND payment_status IN ('pending', 'failed');
  IF NOT FOUND THEN RAISE EXCEPTION 'this order cannot be cancelled in its current state'; END IF;
  INSERT INTO public.order_lifecycle_events (order_id, event_type, actor_id, source_key, metadata)
  VALUES (p_order_id, 'cancelled', auth.uid(), 'CUSTOMER_CANCELLED:' || p_order_id::text, jsonb_build_object('reason', NULLIF(trim(p_reason), '')))
  ON CONFLICT (source_key) DO NOTHING;
END;
$function$;

REVOKE ALL ON FUNCTION public.confirm_my_hobee_order_received(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.submit_my_after_sales_case(uuid, uuid, text, text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.attach_my_after_sales_evidence(uuid, text, text, text, bigint, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.add_my_after_sales_message(uuid, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.review_my_after_sales_case(uuid, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.submit_my_return_tracking(uuid, text, text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.authorize_my_after_sales_refund(uuid, numeric, text, jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.ship_my_after_sales_replacement(uuid, text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.cancel_my_pending_order(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.confirm_my_hobee_order_received(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_my_after_sales_case(uuid, uuid, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.attach_my_after_sales_evidence(uuid, text, text, text, bigint, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_my_after_sales_message(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_my_after_sales_case(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_my_return_tracking(uuid, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.authorize_my_after_sales_refund(uuid, numeric, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ship_my_after_sales_replacement(uuid, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_my_pending_order(uuid, text) TO authenticated;
