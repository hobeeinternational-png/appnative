-- HOBEE After-Sales Operations Center foundation.
-- Reuses the existing case, work inbox, notification and organization models.

ALTER TABLE public.organization_member_permissions DROP CONSTRAINT IF EXISTS organization_member_permissions_permission_check;
ALTER TABLE public.organization_member_permissions
  ADD CONSTRAINT organization_member_permissions_permission_check CHECK (permission = ANY (ARRAY[
    'VIEW_ORDERS', 'MANAGE_ORDERS', 'VIEW_BOOKINGS', 'MANAGE_BOOKINGS',
    'VIEW_EARNINGS', 'MANAGE_STAFF', 'MANAGE_PRODUCTS', 'MANAGE_ROOMS', 'APPROVE_ACTIONS',
    'VIEW_CLAIMS', 'MANAGE_CLAIMS', 'VIEW_INTERNAL_NOTES', 'MANAGE_ASSIGNMENT',
    'APPROVE_RETURN', 'APPROVE_REPLACEMENT', 'APPROVE_REFUND'
  ]));

ALTER TABLE public.after_sales_policies
  ADD COLUMN IF NOT EXISTS first_response_hours integer CHECK (first_response_hours IS NULL OR first_response_hours > 0),
  ADD COLUMN IF NOT EXISTS customer_response_hours integer CHECK (customer_response_hours IS NULL OR customer_response_hours > 0),
  ADD COLUMN IF NOT EXISTS refund_processing_hours integer CHECK (refund_processing_hours IS NULL OR refund_processing_hours > 0),
  ADD COLUMN IF NOT EXISTS return_inspection_hours integer CHECK (return_inspection_hours IS NULL OR return_inspection_hours > 0);

ALTER TABLE public.after_sales_cases
  ADD COLUMN IF NOT EXISTS response_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS first_response_due_at timestamptz,
  ADD COLUMN IF NOT EXISTS customer_response_due_at timestamptz,
  ADD COLUMN IF NOT EXISTS refund_due_at timestamptz,
  ADD COLUMN IF NOT EXISTS return_inspection_due_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_customer_activity_at timestamptz,
  ADD COLUMN IF NOT EXISTS escalated_at timestamptz,
  ADD COLUMN IF NOT EXISTS escalation_reason text CHECK (escalation_reason IS NULL OR char_length(escalation_reason) <= 2000);

CREATE INDEX IF NOT EXISTS after_sales_cases_sla_queue_idx
  ON public.after_sales_cases (shop_id, priority, first_response_due_at, updated_at DESC)
  WHERE status NOT IN ('resolved', 'closed', 'cancelled', 'rejected');

ALTER TABLE public.return_shipments
  ADD COLUMN IF NOT EXISTS inspected_at timestamptz,
  ADD COLUMN IF NOT EXISTS inspected_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS inspection_result text CHECK (inspection_result IS NULL OR inspection_result IN ('accepted', 'rejected', 'partial', 'needs_review')),
  ADD COLUMN IF NOT EXISTS inspection_note text CHECK (inspection_note IS NULL OR char_length(inspection_note) <= 2000);

CREATE TABLE IF NOT EXISTS public.after_sales_case_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.after_sales_cases(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_type text NOT NULL,
  previous_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  next_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  reason text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_key text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);
CREATE INDEX IF NOT EXISTS after_sales_case_audit_logs_case_created_idx
  ON public.after_sales_case_audit_logs (case_id, created_at ASC);

CREATE TABLE IF NOT EXISTS public.hobee_domain_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_key text NOT NULL UNIQUE,
  event_type text NOT NULL CHECK (event_type = ANY (ARRAY[
    'ORDER_CREATED', 'PAYMENT_PAID', 'ORDER_ACCEPTED', 'ORDER_SHIPPED', 'SHIPMENT_UPDATED', 'DELIVERED', 'CUSTOMER_RECEIVED',
    'CLAIM_SUBMITTED', 'CLAIM_UPDATED', 'CLAIM_NEED_INFO', 'CLAIM_APPROVED', 'CLAIM_REJECTED', 'CLAIM_ESCALATED',
    'RETURN_SHIPPED', 'RETURN_RECEIVED', 'RETURN_INSPECTED',
    'REFUND_APPROVED', 'REFUND_PROCESSING', 'REFUND_COMPLETED', 'REFUND_FAILED',
    'REPLACEMENT_CREATED', 'REPLACEMENT_SHIPPED', 'REPLACEMENT_DELIVERED', 'ROLE_APPROVED', 'WORK_ASSIGNED'
  ])),
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);
CREATE INDEX IF NOT EXISTS hobee_domain_events_entity_created_idx
  ON public.hobee_domain_events (entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS hobee_domain_events_organization_created_idx
  ON public.hobee_domain_events (organization_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.user_notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('orders', 'claims', 'payments', 'shipping', 'earnings', 'work', 'marketing')),
  in_app_enabled boolean NOT NULL DEFAULT true,
  push_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (user_id, category)
);

CREATE TABLE IF NOT EXISTS public.notification_delivery_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid NOT NULL UNIQUE REFERENCES public.user_notifications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category text NOT NULL,
  delivery_status text NOT NULL DEFAULT 'queued' CHECK (delivery_status IN ('queued', 'sent', 'failed', 'suppressed')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  last_error text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);
CREATE INDEX IF NOT EXISTS notification_delivery_outbox_queue_idx
  ON public.notification_delivery_outbox (delivery_status, created_at ASC);

DROP TRIGGER IF EXISTS set_user_notification_preferences_updated_at ON public.user_notification_preferences;
CREATE TRIGGER set_user_notification_preferences_updated_at BEFORE UPDATE ON public.user_notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_notification_delivery_outbox_updated_at ON public.notification_delivery_outbox;
CREATE TRIGGER set_notification_delivery_outbox_updated_at BEFORE UPDATE ON public.notification_delivery_outbox
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION private.can_view_after_sales_internal_notes(p_case_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
  SELECT private.is_platform_admin() OR EXISTS (
    SELECT 1
    FROM public.after_sales_cases c
    JOIN public.organization_shop_links osl ON osl.shop_id = c.shop_id
    WHERE c.id = p_case_id
      AND private.organization_has_permission(osl.organization_id, 'VIEW_INTERNAL_NOTES')
  );
$function$;

ALTER TABLE public.after_sales_case_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hobee_domain_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_delivery_outbox ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS after_sales_case_audit_access_read ON public.after_sales_case_audit_logs;
CREATE POLICY after_sales_case_audit_access_read ON public.after_sales_case_audit_logs FOR SELECT TO authenticated
  USING (private.can_manage_after_sales_case(case_id) OR private.is_platform_admin());

DROP POLICY IF EXISTS hobee_domain_events_org_or_admin_read ON public.hobee_domain_events;
CREATE POLICY hobee_domain_events_org_or_admin_read ON public.hobee_domain_events FOR SELECT TO authenticated
  USING (private.is_platform_admin() OR (organization_id IS NOT NULL AND private.organization_has_permission(organization_id, 'VIEW_CLAIMS')));

DROP POLICY IF EXISTS user_notification_preferences_own_manage ON public.user_notification_preferences;
CREATE POLICY user_notification_preferences_own_manage ON public.user_notification_preferences FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS notification_delivery_outbox_admin_read ON public.notification_delivery_outbox;
CREATE POLICY notification_delivery_outbox_admin_read ON public.notification_delivery_outbox FOR SELECT TO authenticated
  USING (private.is_platform_admin());

DROP POLICY IF EXISTS after_sales_case_messages_access_read ON public.after_sales_case_messages;
CREATE POLICY after_sales_case_messages_access_read ON public.after_sales_case_messages FOR SELECT TO authenticated USING (
  private.can_access_after_sales_case(case_id)
  AND (visibility <> 'internal' OR private.can_view_after_sales_internal_notes(case_id))
);
