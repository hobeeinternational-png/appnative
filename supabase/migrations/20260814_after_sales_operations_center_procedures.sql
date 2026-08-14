-- Trusted operational procedures and event dispatch for After-Sales Operations Center.

ALTER TABLE public.after_sales_case_events DROP CONSTRAINT IF EXISTS after_sales_case_events_event_type_check;
ALTER TABLE public.after_sales_case_events ADD CONSTRAINT after_sales_case_events_event_type_check CHECK (event_type IN (
  'draft_created', 'submitted', 'under_review', 'need_more_info', 'approved', 'rejected', 'in_progress', 'resolved', 'closed', 'cancelled',
  'evidence_added', 'message_added', 'internal_note_added', 'assigned', 'priority_changed', 'escalated',
  'return_tracking_added', 'return_received', 'return_inspected',
  'refund_requested', 'refund_processing', 'refund_completed', 'refund_failed',
  'replacement_created', 'replacement_shipped', 'replacement_delivered'
));

CREATE OR REPLACE FUNCTION private.initialize_after_sales_case_sla()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
DECLARE v_hours integer;
BEGIN
  IF NEW.status <> 'submitted' OR NEW.first_response_due_at IS NOT NULL THEN RETURN NEW; END IF;
  SELECT COALESCE(shop_policy.first_response_hours, default_policy.first_response_hours)
  INTO v_hours
  FROM public.after_sales_policies default_policy
  LEFT JOIN public.after_sales_policies shop_policy ON shop_policy.shop_id = NEW.shop_id AND shop_policy.is_active
  WHERE default_policy.policy_key = 'default' LIMIT 1;
  IF v_hours IS NOT NULL THEN NEW.first_response_due_at := COALESCE(NEW.submitted_at, timezone('utc', now())) + make_interval(hours => v_hours); END IF;
  NEW.last_customer_activity_at := COALESCE(NEW.last_customer_activity_at, NEW.submitted_at, timezone('utc', now()));
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS initialize_after_sales_case_sla ON public.after_sales_cases;
CREATE TRIGGER initialize_after_sales_case_sla BEFORE INSERT ON public.after_sales_cases
  FOR EACH ROW EXECUTE FUNCTION private.initialize_after_sales_case_sla();

CREATE OR REPLACE FUNCTION private.emit_hobee_domain_event(
  p_event_key text, p_event_type text, p_actor_id uuid, p_entity_type text, p_entity_id uuid,
  p_organization_id uuid DEFAULT NULL, p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
BEGIN
  INSERT INTO public.hobee_domain_events (event_key, event_type, actor_id, entity_type, entity_id, organization_id, metadata)
  VALUES (p_event_key, p_event_type, p_actor_id, p_entity_type, p_entity_id, p_organization_id, COALESCE(p_metadata, '{}'::jsonb))
  ON CONFLICT (event_key) DO NOTHING;
  RETURN FOUND;
END;
$function$;

CREATE OR REPLACE FUNCTION private.dispatch_after_sales_work(
  p_case_id uuid, p_event_type text, p_actor_id uuid, p_event_key text, p_title text, p_body text,
  p_urgency text DEFAULT 'normal', p_requires_admin boolean DEFAULT false
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
DECLARE v_org_id uuid; v_due_at timestamptz; r record;
BEGIN
  SELECT osl.organization_id, c.first_response_due_at INTO v_org_id, v_due_at
  FROM public.after_sales_cases c LEFT JOIN public.organization_shop_links osl ON osl.shop_id = c.shop_id
  WHERE c.id = p_case_id LIMIT 1;
  IF v_org_id IS NULL THEN RETURN; END IF;
  FOR r IN
    SELECT DISTINCT m.user_id
    FROM public.organization_memberships m
    LEFT JOIN public.organization_member_permissions claim_permission ON claim_permission.membership_id = m.id AND claim_permission.permission = 'MANAGE_CLAIMS'
    WHERE m.organization_id = v_org_id AND m.status = 'active' AND (m.member_role IN ('owner', 'admin') OR claim_permission.permission IS NOT NULL)
  LOOP
    PERFORM private.upsert_my_hobee_work_item(r.user_id, v_org_id, 'seller', 'CASE', 'AFTER_SALES_CASE', p_case_id,
      p_event_key || ':SELLER:' || r.user_id::text, p_title, p_body, p_urgency, v_due_at);
  END LOOP;
  IF p_requires_admin THEN
    FOR r IN SELECT DISTINCT user_id FROM public.user_roles WHERE role = 'admin'
    LOOP
      PERFORM private.upsert_my_hobee_work_item(r.user_id, NULL, 'employee', 'CASE', 'AFTER_SALES_CASE', p_case_id,
        p_event_key || ':ADMIN:' || r.user_id::text, p_title, p_body, 'urgent', v_due_at);
    END LOOP;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION private.emit_after_sales_case_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
DECLARE v_event_type text; v_event_key text; v_title text; v_urgency text := 'normal'; v_requires_admin boolean := false;
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN RETURN NEW; END IF;
  v_event_type := CASE NEW.status
    WHEN 'submitted' THEN 'CLAIM_SUBMITTED' WHEN 'under_review' THEN 'CLAIM_UPDATED' WHEN 'need_more_info' THEN 'CLAIM_NEED_INFO'
    WHEN 'approved' THEN 'CLAIM_APPROVED' WHEN 'rejected' THEN 'CLAIM_REJECTED' ELSE 'CLAIM_UPDATED' END;
  v_event_key := 'CASE_STATUS:' || NEW.id::text || ':' || NEW.status || ':' || NEW.updated_at::text;
  v_title := 'อัปเดตเคส ' || NEW.case_number;
  IF NEW.priority IN ('high', 'urgent') OR NEW.status IN ('approved', 'rejected') THEN v_requires_admin := true; END IF;
  IF NEW.priority = 'urgent' THEN v_urgency := 'urgent'; END IF;
  IF private.emit_hobee_domain_event(v_event_key, v_event_type, auth.uid(), 'AFTER_SALES_CASE', NEW.id, (SELECT organization_id FROM public.organization_shop_links WHERE shop_id = NEW.shop_id LIMIT 1), jsonb_build_object('status', NEW.status, 'priority', NEW.priority)) THEN
    PERFORM private.dispatch_after_sales_work(NEW.id, v_event_type, auth.uid(), v_event_key, v_title, 'สถานะ: ' || NEW.status, v_urgency, v_requires_admin);
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS after_sales_case_status_dispatch ON public.after_sales_cases;
CREATE TRIGGER after_sales_case_status_dispatch AFTER UPDATE OF status ON public.after_sales_cases
  FOR EACH ROW EXECUTE FUNCTION private.emit_after_sales_case_update();

CREATE OR REPLACE FUNCTION private.emit_after_sales_evidence_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
DECLARE v_case_number text; v_event_key text;
BEGIN
  SELECT case_number INTO v_case_number FROM public.after_sales_cases WHERE id = NEW.case_id;
  v_event_key := 'CASE_EVIDENCE:' || NEW.id::text;
  IF private.emit_hobee_domain_event(v_event_key, 'CLAIM_UPDATED', NEW.uploaded_by, 'AFTER_SALES_EVIDENCE', NEW.id, NULL, jsonb_build_object('case_id', NEW.case_id, 'media_type', NEW.media_type)) THEN
    PERFORM private.dispatch_after_sales_work(NEW.case_id, 'CLAIM_UPDATED', NEW.uploaded_by, v_event_key, 'ลูกค้าส่งหลักฐานเพิ่ม', COALESCE(v_case_number, 'After-sales case'), 'normal', false);
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS after_sales_evidence_dispatch ON public.after_sales_evidence;
CREATE TRIGGER after_sales_evidence_dispatch AFTER INSERT ON public.after_sales_evidence
  FOR EACH ROW EXECUTE FUNCTION private.emit_after_sales_evidence_update();

CREATE OR REPLACE FUNCTION public.assign_my_after_sales_case(p_case_id uuid, p_assignee_id uuid, p_priority text DEFAULT NULL, p_note text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
DECLARE v_before jsonb; v_org_id uuid; v_case_number text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;
  SELECT jsonb_build_object('assigned_to', assigned_to, 'priority', priority), case_number,
    (SELECT organization_id FROM public.organization_shop_links WHERE shop_id = c.shop_id LIMIT 1)
  INTO v_before, v_case_number, v_org_id FROM public.after_sales_cases c WHERE id = p_case_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'case not found'; END IF;
  IF NOT private.is_platform_admin() AND (v_org_id IS NULL OR NOT private.organization_has_permission(v_org_id, 'MANAGE_ASSIGNMENT')) THEN RAISE EXCEPTION 'assignment permission required'; END IF;
  IF NOT private.is_platform_admin() AND NOT EXISTS (SELECT 1 FROM public.organization_memberships WHERE organization_id = v_org_id AND user_id = p_assignee_id AND status = 'active') THEN RAISE EXCEPTION 'assignee must be an active organization member'; END IF;
  UPDATE public.after_sales_cases SET assigned_to = p_assignee_id, priority = COALESCE(NULLIF(p_priority, ''), priority) WHERE id = p_case_id;
  INSERT INTO public.after_sales_case_audit_logs (case_id, actor_id, action_type, previous_state, next_state, reason, source_key)
  SELECT p_case_id, auth.uid(), 'assignment', v_before, jsonb_build_object('assigned_to', assigned_to, 'priority', priority), NULLIF(trim(p_note), ''), 'CASE_ASSIGNMENT:' || p_case_id::text || ':' || p_assignee_id::text || ':' || extract(epoch FROM timezone('utc', now()))::text
  FROM public.after_sales_cases WHERE id = p_case_id;
  PERFORM private.append_after_sales_case_event(p_case_id, 'assigned', auth.uid(), COALESCE(NULLIF(trim(p_note), ''), 'มอบหมายเคสแล้ว'), NULL, jsonb_build_object('assignee_id', p_assignee_id));
  PERFORM private.upsert_my_hobee_work_item(p_assignee_id, v_org_id, 'seller', 'CASE', 'AFTER_SALES_CASE', p_case_id, 'CASE_ASSIGNED:' || p_case_id::text || ':' || p_assignee_id::text, 'มีการมอบหมายเคสให้คุณ', v_case_number, 'normal');
END;
$function$;

CREATE OR REPLACE FUNCTION public.add_my_after_sales_message(p_case_id uuid, p_body text, p_visibility text DEFAULT 'customer')
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
DECLARE v_id uuid; v_is_customer boolean; v_is_manager boolean;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;
  SELECT user_id = auth.uid() INTO v_is_customer FROM public.after_sales_cases WHERE id = p_case_id;
  v_is_manager := private.can_manage_after_sales_case(p_case_id);
  IF COALESCE(v_is_customer, false) AND p_visibility <> 'customer' THEN RAISE EXCEPTION 'customers may only post customer messages'; END IF;
  IF NOT COALESCE(v_is_customer, false) AND NOT v_is_manager THEN RAISE EXCEPTION 'case management permission required'; END IF;
  IF p_visibility = 'internal' AND NOT private.can_view_after_sales_internal_notes(p_case_id) THEN RAISE EXCEPTION 'internal-note permission required'; END IF;
  IF p_visibility NOT IN ('customer', 'seller', 'support', 'internal') THEN RAISE EXCEPTION 'invalid message visibility'; END IF;
  INSERT INTO public.after_sales_case_messages (case_id, author_id, visibility, body) VALUES (p_case_id, auth.uid(), p_visibility, trim(p_body)) RETURNING id INTO v_id;
  PERFORM private.append_after_sales_case_event(p_case_id, CASE WHEN p_visibility = 'internal' THEN 'internal_note_added' ELSE 'message_added' END, auth.uid(), 'มีข้อความใหม่', 'CASE_MESSAGE:' || v_id::text);
  RETURN v_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.assign_my_after_sales_case(uuid, uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.assign_my_after_sales_case(uuid, uuid, text, text) TO authenticated;
