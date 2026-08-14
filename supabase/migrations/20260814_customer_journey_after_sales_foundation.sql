-- HOBEE Complete Customer Commerce Journey & After-Sales foundation.
-- Existing orders, payments, shipments, product reviews and organization contracts remain the source of truth.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_received_at timestamptz;

CREATE TABLE IF NOT EXISTS public.after_sales_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_key text NOT NULL UNIQUE,
  shop_id uuid REFERENCES public.shops(id) ON DELETE CASCADE,
  claim_window_days integer CHECK (claim_window_days IS NULL OR claim_window_days >= 0),
  return_window_days integer CHECK (return_window_days IS NULL OR return_window_days >= 0),
  damaged_goods_window_days integer CHECK (damaged_goods_window_days IS NULL OR damaged_goods_window_days >= 0),
  auto_complete_enabled boolean NOT NULL DEFAULT false,
  auto_complete_after_days integer CHECK (auto_complete_after_days IS NULL OR auto_complete_after_days > 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

INSERT INTO public.after_sales_policies (policy_key, auto_complete_enabled)
VALUES ('default', false)
ON CONFLICT (policy_key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.order_lifecycle_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN (
    'shipment_updated', 'shipment_delivered', 'customer_received', 'auto_completed',
    'review_invited', 'cancel_requested', 'cancelled'
  )),
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  source_key text UNIQUE,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS order_lifecycle_events_order_occurred_idx
  ON public.order_lifecycle_events (order_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS public.after_sales_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number text NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
  order_item_id uuid REFERENCES public.order_items(id) ON DELETE SET NULL,
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE RESTRICT,
  case_type text NOT NULL CHECK (case_type IN (
    'missing_item', 'wrong_item', 'damaged', 'leaking_or_broken', 'quality_issue',
    'delivery_missing', 'tracking_issue', 'return_request', 'refund_request', 'other'
  )),
  reason_code text,
  description text NOT NULL CHECK (char_length(description) BETWEEN 1 AND 2000),
  requested_resolution text NOT NULL CHECK (requested_resolution IN (
    'refund', 'partial_refund', 'replacement', 'reship_missing_item',
    'return_and_refund', 'store_credit', 'other'
  )),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'submitted', 'under_review', 'need_more_info', 'approved', 'rejected',
    'in_progress', 'resolved', 'closed', 'cancelled'
  )),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  decision_note text CHECK (decision_note IS NULL OR char_length(decision_note) <= 2000),
  submitted_at timestamptz,
  resolved_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE UNIQUE INDEX IF NOT EXISTS after_sales_cases_active_scope_unique
  ON public.after_sales_cases (user_id, order_id, COALESCE(order_item_id, '00000000-0000-0000-0000-000000000000'::uuid), case_type)
  WHERE status NOT IN ('resolved', 'closed', 'cancelled', 'rejected');
CREATE INDEX IF NOT EXISTS after_sales_cases_customer_status_idx
  ON public.after_sales_cases (user_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS after_sales_cases_shop_status_idx
  ON public.after_sales_cases (shop_id, status, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.after_sales_case_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.after_sales_cases(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN (
    'draft_created', 'submitted', 'under_review', 'need_more_info', 'approved', 'rejected',
    'in_progress', 'resolved', 'closed', 'cancelled', 'evidence_added', 'message_added',
    'return_tracking_added', 'return_received', 'refund_requested', 'refund_processing',
    'refund_completed', 'replacement_shipped'
  )),
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  description text,
  source_key text UNIQUE,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS after_sales_case_events_case_created_idx
  ON public.after_sales_case_events (case_id, created_at ASC);

CREATE TABLE IF NOT EXISTS public.after_sales_case_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.after_sales_cases(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  visibility text NOT NULL DEFAULT 'customer' CHECK (visibility IN ('customer', 'seller', 'support', 'internal')),
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS after_sales_case_messages_case_created_idx
  ON public.after_sales_case_messages (case_id, created_at ASC);

CREATE TABLE IF NOT EXISTS public.after_sales_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.after_sales_cases(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  storage_path text NOT NULL UNIQUE,
  media_type text NOT NULL CHECK (media_type IN ('image', 'video', 'file')),
  file_name text NOT NULL CHECK (char_length(file_name) BETWEEN 1 AND 255),
  file_size_bytes bigint CHECK (file_size_bytes IS NULL OR file_size_bytes >= 0),
  note text CHECK (note IS NULL OR char_length(note) <= 1000),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS after_sales_evidence_case_created_idx
  ON public.after_sales_evidence (case_id, created_at ASC);

CREATE TABLE IF NOT EXISTS public.after_sales_refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.after_sales_cases(id) ON DELETE RESTRICT,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'processing', 'completed', 'failed', 'rejected')),
  refund_method text,
  amount numeric NOT NULL CHECK (amount >= 0),
  currency char(3) NOT NULL DEFAULT 'THB',
  provider_reference text,
  requested_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  approved_at timestamptz,
  completed_at timestamptz,
  approved_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS after_sales_refunds_case_status_idx
  ON public.after_sales_refunds (case_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS after_sales_refunds_order_status_idx
  ON public.after_sales_refunds (order_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS public.after_sales_refund_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  refund_id uuid NOT NULL REFERENCES public.after_sales_refunds(id) ON DELETE CASCADE,
  order_item_id uuid NOT NULL REFERENCES public.order_items(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  amount numeric NOT NULL CHECK (amount >= 0),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE UNIQUE INDEX IF NOT EXISTS after_sales_refund_items_unique
  ON public.after_sales_refund_items (refund_id, order_item_id);

CREATE TABLE IF NOT EXISTS public.return_shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL UNIQUE REFERENCES public.after_sales_cases(id) ON DELETE CASCADE,
  carrier text,
  tracking_number text,
  tracking_url text,
  return_address jsonb,
  status text NOT NULL DEFAULT 'instructions_pending' CHECK (status IN (
    'instructions_pending', 'awaiting_customer_shipment', 'shipped', 'in_transit',
    'received', 'inspection', 'completed', 'failed'
  )),
  shipped_at timestamptz,
  received_at timestamptz,
  receipt_storage_path text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.replacement_shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL UNIQUE REFERENCES public.after_sales_cases(id) ON DELETE CASCADE,
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE RESTRICT,
  provider text,
  tracking_number text,
  tracking_url text,
  status text NOT NULL DEFAULT 'preparing' CHECK (status IN ('preparing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'received', 'failed')),
  shipped_at timestamptz,
  delivered_at timestamptz,
  received_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS replacement_shipments_shop_status_idx
  ON public.replacement_shipments (shop_id, status, updated_at DESC);

DROP TRIGGER IF EXISTS set_after_sales_policies_updated_at ON public.after_sales_policies;
CREATE TRIGGER set_after_sales_policies_updated_at BEFORE UPDATE ON public.after_sales_policies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_after_sales_cases_updated_at ON public.after_sales_cases;
CREATE TRIGGER set_after_sales_cases_updated_at BEFORE UPDATE ON public.after_sales_cases
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_after_sales_refunds_updated_at ON public.after_sales_refunds;
CREATE TRIGGER set_after_sales_refunds_updated_at BEFORE UPDATE ON public.after_sales_refunds
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_return_shipments_updated_at ON public.return_shipments;
CREATE TRIGGER set_return_shipments_updated_at BEFORE UPDATE ON public.return_shipments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_replacement_shipments_updated_at ON public.replacement_shipments;
CREATE TRIGGER set_replacement_shipments_updated_at BEFORE UPDATE ON public.replacement_shipments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION private.can_access_after_sales_case(p_case_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.after_sales_cases c
    WHERE c.id = p_case_id AND (
      c.user_id = auth.uid()
      OR private.is_platform_admin()
      OR EXISTS (
        SELECT 1 FROM public.organization_shop_links osl
        WHERE osl.shop_id = c.shop_id
          AND (private.organization_has_permission(osl.organization_id, 'VIEW_ORDERS') OR private.organization_has_permission(osl.organization_id, 'MANAGE_ORDERS'))
      )
    )
  );
$function$;

CREATE OR REPLACE FUNCTION private.can_manage_after_sales_case(p_case_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.after_sales_cases c
    WHERE c.id = p_case_id AND (
      private.is_platform_admin()
      OR EXISTS (
        SELECT 1 FROM public.organization_shop_links osl
        WHERE osl.shop_id = c.shop_id AND private.organization_has_permission(osl.organization_id, 'MANAGE_ORDERS')
      )
    )
  );
$function$;

CREATE OR REPLACE FUNCTION private.emit_after_sales_shipment_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
DECLARE v_buyer_id uuid; v_event_type text; v_title text; v_body text; v_route text;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status IS NOT DISTINCT FROM OLD.status THEN RETURN NEW; END IF;
  SELECT buyer_id INTO v_buyer_id FROM public.orders WHERE id = NEW.order_id;
  IF v_buyer_id IS NULL THEN RETURN NEW; END IF;
  v_event_type := CASE WHEN NEW.status = 'delivered' THEN 'shipment_delivered' ELSE 'shipment_updated' END;
  INSERT INTO public.order_lifecycle_events (order_id, event_type, source_key, metadata)
  VALUES (NEW.order_id, v_event_type, 'SHIPMENT:' || NEW.id::text || ':' || NEW.status, jsonb_build_object('shipment_id', NEW.id, 'status', NEW.status))
  ON CONFLICT (source_key) DO NOTHING;
  IF NEW.status = 'out_for_delivery' THEN v_title := 'พัสดุกำลังนำส่ง'; v_body := 'คำสั่งซื้อของคุณกำลังอยู่ระหว่างนำจ่าย';
  ELSIF NEW.status = 'delivered' THEN v_title := 'พัสดุจัดส่งสำเร็จ'; v_body := 'โปรดยืนยันเมื่อได้รับสินค้าเรียบร้อยแล้ว';
  ELSE v_title := 'สถานะพัสดุอัปเดต'; v_body := 'สถานะล่าสุด: ' || NEW.status; END IF;
  v_route := '/orders/' || NEW.order_id::text || '/delivery';
  PERFORM private.upsert_my_hobee_notification(v_buyer_id, 'SHIPMENT_' || upper(NEW.status), v_title, v_body, v_route, 'SHIPMENT', NEW.id, 'SHIPMENT_NOTIFICATION:' || NEW.id::text || ':' || NEW.status);
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS after_sales_shipment_events ON public.shipments;
CREATE TRIGGER after_sales_shipment_events
  AFTER INSERT OR UPDATE OF status ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION private.emit_after_sales_shipment_event();

ALTER TABLE public.after_sales_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_lifecycle_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.after_sales_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.after_sales_case_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.after_sales_case_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.after_sales_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.after_sales_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.after_sales_refund_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.replacement_shipments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS after_sales_policies_authenticated_read ON public.after_sales_policies;
CREATE POLICY after_sales_policies_authenticated_read ON public.after_sales_policies FOR SELECT TO authenticated USING (is_active OR private.is_platform_admin());
DROP POLICY IF EXISTS after_sales_policies_admin_manage ON public.after_sales_policies;
CREATE POLICY after_sales_policies_admin_manage ON public.after_sales_policies FOR ALL TO authenticated USING (private.is_platform_admin()) WITH CHECK (private.is_platform_admin());

DROP POLICY IF EXISTS order_lifecycle_events_access_read ON public.order_lifecycle_events;
CREATE POLICY order_lifecycle_events_access_read ON public.order_lifecycle_events FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.buyer_id = auth.uid())
  OR private.is_platform_admin()
  OR EXISTS (SELECT 1 FROM public.order_items oi JOIN public.organization_shop_links osl ON osl.shop_id = oi.shop_id WHERE oi.order_id = order_id AND (private.organization_has_permission(osl.organization_id, 'VIEW_ORDERS') OR private.organization_has_permission(osl.organization_id, 'MANAGE_ORDERS')))
);

DROP POLICY IF EXISTS after_sales_cases_access_read ON public.after_sales_cases;
CREATE POLICY after_sales_cases_access_read ON public.after_sales_cases FOR SELECT TO authenticated USING (private.can_access_after_sales_case(id));
DROP POLICY IF EXISTS after_sales_case_events_access_read ON public.after_sales_case_events;
CREATE POLICY after_sales_case_events_access_read ON public.after_sales_case_events FOR SELECT TO authenticated USING (private.can_access_after_sales_case(case_id));
DROP POLICY IF EXISTS after_sales_case_messages_access_read ON public.after_sales_case_messages;
CREATE POLICY after_sales_case_messages_access_read ON public.after_sales_case_messages FOR SELECT TO authenticated USING (
  private.can_access_after_sales_case(case_id) AND (visibility <> 'internal' OR private.is_platform_admin())
);
DROP POLICY IF EXISTS after_sales_evidence_access_read ON public.after_sales_evidence;
CREATE POLICY after_sales_evidence_access_read ON public.after_sales_evidence FOR SELECT TO authenticated USING (private.can_access_after_sales_case(case_id));
DROP POLICY IF EXISTS after_sales_refunds_access_read ON public.after_sales_refunds;
CREATE POLICY after_sales_refunds_access_read ON public.after_sales_refunds FOR SELECT TO authenticated USING (private.can_access_after_sales_case(case_id));
DROP POLICY IF EXISTS after_sales_refund_items_access_read ON public.after_sales_refund_items;
CREATE POLICY after_sales_refund_items_access_read ON public.after_sales_refund_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.after_sales_refunds r WHERE r.id = refund_id AND private.can_access_after_sales_case(r.case_id)));
DROP POLICY IF EXISTS return_shipments_access_read ON public.return_shipments;
CREATE POLICY return_shipments_access_read ON public.return_shipments FOR SELECT TO authenticated USING (private.can_access_after_sales_case(case_id));
DROP POLICY IF EXISTS replacement_shipments_access_read ON public.replacement_shipments;
CREATE POLICY replacement_shipments_access_read ON public.replacement_shipments FOR SELECT TO authenticated USING (private.can_access_after_sales_case(case_id));

INSERT INTO storage.buckets (id, name, public)
VALUES ('after-sales-evidence', 'after-sales-evidence', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS after_sales_evidence_owner_upload ON storage.objects;
CREATE POLICY after_sales_evidence_owner_upload ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'after-sales-evidence' AND owner_id = auth.uid()::text AND (storage.foldername(name))[1] = auth.uid()::text
);
DROP POLICY IF EXISTS after_sales_evidence_case_read ON storage.objects;
CREATE POLICY after_sales_evidence_case_read ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'after-sales-evidence' AND EXISTS (SELECT 1 FROM public.after_sales_evidence e WHERE e.storage_path = name AND private.can_access_after_sales_case(e.case_id))
);
DROP POLICY IF EXISTS after_sales_evidence_owner_delete ON storage.objects;
CREATE POLICY after_sales_evidence_owner_delete ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'after-sales-evidence' AND owner_id = auth.uid()::text AND (storage.foldername(name))[1] = auth.uid()::text
);
