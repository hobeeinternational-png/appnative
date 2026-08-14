-- MY HOBEE Phase 2 operating system.
-- Preserves existing Supabase auth, commerce, order/payment, shop and travel catalog contracts.

-- 1) Approval workflow: applications gain review states; the role profile remains on its existing status vocabulary.
ALTER TABLE public.role_applications DROP CONSTRAINT IF EXISTS role_applications_status_check;
ALTER TABLE public.role_applications
  ADD CONSTRAINT role_applications_status_check
  CHECK (status = ANY (ARRAY['pending', 'reviewing', 'needs_changes', 'approved', 'rejected', 'suspended', 'withdrawn']));

DROP INDEX IF EXISTS public.role_applications_one_open_per_role;
CREATE UNIQUE INDEX role_applications_one_open_per_role
  ON public.role_applications (user_id, role_type)
  WHERE status IN ('pending', 'reviewing', 'needs_changes');

CREATE TABLE IF NOT EXISTS public.role_application_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.role_applications(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  previous_status text,
  next_status text NOT NULL CHECK (next_status = ANY (ARRAY['pending', 'reviewing', 'needs_changes', 'approved', 'rejected', 'suspended', 'withdrawn'])),
  decision_note text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);
CREATE INDEX IF NOT EXISTS role_application_audit_logs_application_idx ON public.role_application_audit_logs (application_id, created_at DESC);

-- 2) Organizations: separate people from business entities while preserving shops and travel listings.
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  organization_type text NOT NULL CHECK (organization_type = ANY (ARRAY['store', 'hotel', 'tour_company', 'service_business', 'partner_company', 'hobee'])),
  name text NOT NULL CHECK (char_length(trim(name)) >= 2),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  legal_name text,
  description text,
  status text NOT NULL DEFAULT 'active' CHECK (status = ANY (ARRAY['active', 'suspended', 'archived'])),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.organization_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  member_role text NOT NULL CHECK (member_role = ANY (ARRAY['owner', 'manager', 'staff', 'fulfilment', 'reception', 'finance', 'admin'])),
  status text NOT NULL DEFAULT 'active' CHECK (status = ANY (ARRAY['active', 'suspended', 'left'])),
  title text,
  joined_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.organization_member_permissions (
  membership_id uuid NOT NULL REFERENCES public.organization_memberships(id) ON DELETE CASCADE,
  permission text NOT NULL CHECK (permission = ANY (ARRAY['VIEW_ORDERS', 'MANAGE_ORDERS', 'VIEW_BOOKINGS', 'MANAGE_BOOKINGS', 'VIEW_EARNINGS', 'MANAGE_STAFF', 'MANAGE_PRODUCTS', 'MANAGE_ROOMS', 'APPROVE_ACTIONS'])),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  PRIMARY KEY (membership_id, permission)
);

CREATE TABLE IF NOT EXISTS public.organization_shop_links (
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  PRIMARY KEY (organization_id, shop_id),
  UNIQUE (shop_id)
);

CREATE TABLE IF NOT EXISTS public.organization_travel_listing_links (
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES public.travel_listings(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  PRIMARY KEY (organization_id, listing_id),
  UNIQUE (listing_id)
);

CREATE INDEX IF NOT EXISTS organization_memberships_user_idx ON public.organization_memberships (user_id, status, organization_id);
CREATE INDEX IF NOT EXISTS organization_memberships_org_idx ON public.organization_memberships (organization_id, status, member_role);

-- Convert existing shop owners into their first organization/member record without changing shops.owner_id.
INSERT INTO public.organizations (owner_id, organization_type, name, slug, description, metadata)
SELECT s.owner_id, 'store', s.name, ('store-' || replace(s.id::text, '-', '')), s.description, jsonb_build_object('legacy_shop_id', s.id)
FROM public.shops s
WHERE NOT EXISTS (SELECT 1 FROM public.organization_shop_links l WHERE l.shop_id = s.id)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.organization_shop_links (organization_id, shop_id)
SELECT o.id, s.id
FROM public.shops s
JOIN public.organizations o ON o.owner_id = s.owner_id AND o.metadata ->> 'legacy_shop_id' = s.id::text
ON CONFLICT (shop_id) DO NOTHING;

INSERT INTO public.organization_memberships (organization_id, user_id, member_role, title)
SELECT o.id, o.owner_id, 'owner', 'Owner'
FROM public.organizations o
WHERE o.owner_id IS NOT NULL
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- 3) Work/notification/event foundation.
ALTER TABLE public.work_inbox_items ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.work_inbox_items ADD COLUMN IF NOT EXISTS role_type text;
ALTER TABLE public.work_inbox_items ADD COLUMN IF NOT EXISTS source_type text;
ALTER TABLE public.work_inbox_items ADD COLUMN IF NOT EXISTS source_id uuid;
ALTER TABLE public.work_inbox_items ADD COLUMN IF NOT EXISTS source_key text;
ALTER TABLE public.work_inbox_items ADD COLUMN IF NOT EXISTS workflow_status text NOT NULL DEFAULT 'open' CHECK (workflow_status = ANY (ARRAY['open', 'in_progress', 'done', 'cancelled']));
ALTER TABLE public.work_inbox_items ADD COLUMN IF NOT EXISTS completed_at timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS work_inbox_items_user_source_key_idx ON public.work_inbox_items (user_id, source_key) WHERE source_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS work_inbox_items_org_workflow_idx ON public.work_inbox_items (organization_id, workflow_status, created_at DESC);
CREATE INDEX IF NOT EXISTS work_inbox_items_user_source_type_idx ON public.work_inbox_items (user_id, source_type, created_at DESC);

CREATE TABLE IF NOT EXISTS public.user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notification_type text NOT NULL CHECK (notification_type = ANY (ARRAY['ROLE_APPROVED', 'ROLE_DECISION', 'ORDER_NEW', 'ORDER_STATUS', 'BOOKING_NEW', 'BOOKING_STATUS', 'WORK_DUE', 'EARNING_AVAILABLE'])),
  title text NOT NULL,
  body text,
  route text,
  source_type text,
  source_id uuid,
  source_key text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  read_at timestamptz,
  UNIQUE (user_id, source_key)
);
CREATE INDEX IF NOT EXISTS user_notifications_user_unread_idx ON public.user_notifications (user_id, is_read, created_at DESC);

CREATE TABLE IF NOT EXISTS public.order_operation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action = ANY (ARRAY['ACCEPTED', 'PREPARING', 'READY', 'SHIPPED', 'COMPLETED'])),
  actor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  previous_order_status text,
  next_order_status text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (order_id, action)
);
CREATE INDEX IF NOT EXISTS order_operation_events_order_idx ON public.order_operation_events (order_id, created_at DESC);

-- 4) Shared booking core for hotel, tour and service. Catalog remains in travel_* tables.
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number text NOT NULL UNIQUE,
  customer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  booking_type text NOT NULL CHECK (booking_type = ANY (ARRAY['hotel', 'tour', 'service'])),
  listing_id uuid REFERENCES public.travel_listings(id) ON DELETE SET NULL,
  room_type_id uuid REFERENCES public.travel_room_types(id) ON DELETE SET NULL,
  start_at timestamptz NOT NULL,
  end_at timestamptz,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  guest_count integer NOT NULL DEFAULT 1 CHECK (guest_count > 0),
  amount numeric NOT NULL CHECK (amount >= 0),
  currency char(3) NOT NULL DEFAULT 'THB',
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status = ANY (ARRAY['pending', 'authorized', 'paid', 'failed', 'refunded'])),
  status text NOT NULL DEFAULT 'requested' CHECK (status = ANY (ARRAY['requested', 'confirmed', 'in_progress', 'completed', 'cancelled'])),
  notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CHECK (end_at IS NULL OR end_at >= start_at)
);

CREATE TABLE IF NOT EXISTS public.booking_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  participant_type text NOT NULL DEFAULT 'guest' CHECK (participant_type = ANY (ARRAY['guest', 'passenger', 'customer'])),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);
CREATE INDEX IF NOT EXISTS bookings_customer_idx ON public.bookings (customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS bookings_org_status_idx ON public.bookings (organization_id, status, start_at);

-- 5) Unified immutable earnings ledger.
CREATE TABLE IF NOT EXISTS public.earnings_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  role_type text NOT NULL CHECK (role_type = ANY (ARRAY['creator', 'affiliate', 'seller', 'teacher', 'tour_operator', 'hotel', 'guide', 'service_provider', 'partner', 'employee'])),
  source_type text NOT NULL CHECK (source_type = ANY (ARRAY['SELLER_ORDER', 'AFFILIATE_COMMISSION', 'CREATOR_JOB', 'TEACHING', 'HOTEL_BOOKING', 'TOUR_BOOKING', 'GUIDE_JOB', 'SERVICE_JOB', 'PARTNER_SHARE'])),
  source_id uuid NOT NULL,
  gross_amount numeric NOT NULL CHECK (gross_amount >= 0),
  platform_fee numeric NOT NULL DEFAULT 0 CHECK (platform_fee >= 0),
  commission_amount numeric NOT NULL DEFAULT 0 CHECK (commission_amount >= 0),
  net_amount numeric NOT NULL CHECK (net_amount >= 0),
  currency char(3) NOT NULL DEFAULT 'THB',
  status text NOT NULL DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending', 'available', 'paid', 'cancelled', 'reversed'])),
  earned_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  available_at timestamptz,
  paid_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CHECK (net_amount = gross_amount - platform_fee + commission_amount),
  UNIQUE (user_id, organization_id, role_type, source_type, source_id)
);
CREATE INDEX IF NOT EXISTS earnings_ledger_user_status_idx ON public.earnings_ledger (user_id, status, earned_at DESC);
CREATE INDEX IF NOT EXISTS earnings_ledger_org_status_idx ON public.earnings_ledger (organization_id, status, earned_at DESC);

-- 6) Timestamp triggers.
DROP TRIGGER IF EXISTS set_organizations_updated_at ON public.organizations;
CREATE TRIGGER set_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_organization_memberships_updated_at ON public.organization_memberships;
CREATE TRIGGER set_organization_memberships_updated_at BEFORE UPDATE ON public.organization_memberships FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_bookings_updated_at ON public.bookings;
CREATE TRIGGER set_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7) Permission helpers used by both RLS and protected procedures.
CREATE OR REPLACE FUNCTION private.is_organization_member(p_organization_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_memberships m
    WHERE m.organization_id = p_organization_id AND m.user_id = auth.uid() AND m.status = 'active'
  );
$function$;

CREATE OR REPLACE FUNCTION private.organization_has_permission(p_organization_id uuid, p_permission text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
  SELECT private.is_platform_admin() OR EXISTS (
    SELECT 1
    FROM public.organization_memberships m
    LEFT JOIN public.organization_member_permissions p ON p.membership_id = m.id AND p.permission = p_permission
    WHERE m.organization_id = p_organization_id
      AND m.user_id = auth.uid()
      AND m.status = 'active'
      AND (m.member_role IN ('owner', 'admin') OR p.permission IS NOT NULL)
  );
$function$;

CREATE OR REPLACE FUNCTION private.upsert_my_hobee_notification(
  p_user_id uuid, p_notification_type text, p_title text, p_body text, p_route text,
  p_source_type text, p_source_id uuid, p_source_key text
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
BEGIN
  INSERT INTO public.user_notifications (user_id, notification_type, title, body, route, source_type, source_id, source_key)
  VALUES (p_user_id, p_notification_type, p_title, p_body, p_route, p_source_type, p_source_id, p_source_key)
  ON CONFLICT (user_id, source_key) DO UPDATE
    SET title = EXCLUDED.title, body = EXCLUDED.body, route = EXCLUDED.route, is_read = false, read_at = NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION private.upsert_my_hobee_work_item(
  p_user_id uuid, p_organization_id uuid, p_role_type text, p_item_type text, p_source_type text,
  p_source_id uuid, p_source_key text, p_title text, p_body text, p_urgency text DEFAULT 'normal', p_due_at timestamptz DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
BEGIN
  INSERT INTO public.work_inbox_items (user_id, organization_id, role_type, item_type, source_type, source_id, source_key, reference_id, title, body, urgency_level, due_at)
  VALUES (p_user_id, p_organization_id, p_role_type, p_item_type, p_source_type, p_source_id, p_source_key, p_source_id, p_title, p_body, p_urgency, p_due_at)
  ON CONFLICT (user_id, source_key) WHERE source_key IS NOT NULL DO UPDATE
    SET title = EXCLUDED.title, body = EXCLUDED.body, urgency_level = EXCLUDED.urgency_level, due_at = EXCLUDED.due_at, workflow_status = 'open', completed_at = NULL;
END;
$function$;

-- 8) Harden role synchronization and protected application review.
DROP POLICY IF EXISTS role_applications_own_edit_pending ON public.role_applications;
CREATE POLICY role_applications_own_edit_pending ON public.role_applications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND status IN ('pending', 'needs_changes'))
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'pending'
    AND reviewer_id IS NULL
    AND decision_note IS NULL
    AND reviewed_at IS NULL
  );

CREATE OR REPLACE FUNCTION private.sync_role_application_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
DECLARE v_profile_status text;
BEGIN
  v_profile_status := CASE NEW.status
    WHEN 'needs_changes' THEN 'pending'
    WHEN 'withdrawn' THEN 'rejected'
    ELSE NEW.status
  END;
  INSERT INTO public.user_role_profiles (user_id, role_type, status, application_data, approved_at)
  VALUES (NEW.user_id, NEW.role_type, v_profile_status, NEW.application_data, CASE WHEN NEW.status = 'approved' THEN COALESCE(NEW.reviewed_at, timezone('utc', now())) ELSE NULL END)
  ON CONFLICT (user_id, role_type) DO UPDATE SET
    status = EXCLUDED.status,
    application_data = EXCLUDED.application_data,
    approved_at = CASE WHEN EXCLUDED.status = 'approved' THEN COALESCE(public.user_role_profiles.approved_at, EXCLUDED.approved_at) ELSE NULL END,
    updated_at = timezone('utc', now());
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.apply_for_hobee_role(p_role_type text, p_application_data jsonb DEFAULT '{}'::jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path TO public, private, pg_catalog
AS $function$
DECLARE v_user_id uuid := auth.uid(); v_application_id uuid;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;
  IF p_role_type NOT IN ('creator', 'affiliate', 'seller', 'teacher', 'tour_operator', 'hotel', 'guide', 'service_provider', 'partner', 'employee') THEN RAISE EXCEPTION 'unsupported role type'; END IF;
  INSERT INTO public.role_applications (user_id, role_type, status, application_data)
  VALUES (v_user_id, p_role_type, 'pending', COALESCE(p_application_data, '{}'::jsonb))
  ON CONFLICT (user_id, role_type) WHERE status IN ('pending', 'reviewing', 'needs_changes') DO UPDATE SET
    application_data = EXCLUDED.application_data,
    status = CASE WHEN public.role_applications.status = 'needs_changes' THEN 'pending' ELSE public.role_applications.status END,
    reviewer_id = CASE WHEN public.role_applications.status = 'needs_changes' THEN NULL ELSE public.role_applications.reviewer_id END,
    decision_note = CASE WHEN public.role_applications.status = 'needs_changes' THEN NULL ELSE public.role_applications.decision_note END,
    reviewed_at = CASE WHEN public.role_applications.status = 'needs_changes' THEN NULL ELSE public.role_applications.reviewed_at END,
    updated_at = timezone('utc', now())
  RETURNING id INTO v_application_id;
  RETURN v_application_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.review_my_hobee_role_application(p_application_id uuid, p_next_status text, p_decision_note text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
DECLARE v_application public.role_applications%ROWTYPE; v_user_name text;
BEGIN
  IF NOT private.is_platform_admin() THEN RAISE EXCEPTION 'platform admin required'; END IF;
  IF p_next_status NOT IN ('reviewing', 'needs_changes', 'approved', 'rejected', 'suspended') THEN RAISE EXCEPTION 'unsupported review status'; END IF;
  IF p_next_status IN ('needs_changes', 'rejected', 'suspended') AND coalesce(trim(p_decision_note), '') = '' THEN RAISE EXCEPTION 'decision note required'; END IF;
  SELECT * INTO v_application FROM public.role_applications WHERE id = p_application_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'application not found'; END IF;
  INSERT INTO public.role_application_audit_logs (application_id, actor_id, previous_status, next_status, decision_note)
  VALUES (v_application.id, auth.uid(), v_application.status, p_next_status, nullif(trim(p_decision_note), ''));
  UPDATE public.role_applications
    SET status = p_next_status, reviewer_id = auth.uid(), decision_note = nullif(trim(p_decision_note), ''), reviewed_at = timezone('utc', now()), updated_at = timezone('utc', now())
  WHERE id = v_application.id;
  SELECT coalesce(display_name, 'สมาชิก HOBEE') INTO v_user_name FROM public.profiles WHERE id = v_application.user_id;
  PERFORM private.upsert_my_hobee_work_item(v_application.user_id, NULL, v_application.role_type, 'APPROVAL', 'ROLE_APPLICATION', v_application.id, 'ROLE_APPLICATION:' || v_application.id::text || ':' || p_next_status, 'สถานะบทบาท ' || v_application.role_type, coalesce(nullif(trim(p_decision_note), ''), 'สถานะคำขอของคุณได้รับการอัปเดตแล้ว'));
  PERFORM private.upsert_my_hobee_notification(v_application.user_id, CASE WHEN p_next_status = 'approved' THEN 'ROLE_APPROVED' ELSE 'ROLE_DECISION' END, CASE WHEN p_next_status = 'approved' THEN 'บทบาทของคุณได้รับการอนุมัติ' ELSE 'มีการอัปเดตคำขอบทบาท' END, coalesce(nullif(trim(p_decision_note), ''), 'ตรวจสอบรายละเอียดบทบาทใน My HOBEE'), '/my-hobee/roles', 'ROLE_APPLICATION', v_application.id, 'ROLE_NOTICE:' || v_application.id::text || ':' || p_next_status);
END;
$function$;

-- 9) Organization management through protected procedures, not mobile table writes.
CREATE OR REPLACE FUNCTION public.create_my_hobee_organization(p_name text, p_organization_type text, p_shop_id uuid DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
DECLARE v_org_id uuid; v_slug text; v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;
  IF p_organization_type NOT IN ('store', 'hotel', 'tour_company', 'service_business', 'partner_company', 'hobee') THEN RAISE EXCEPTION 'unsupported organization type'; END IF;
  IF p_shop_id IS NOT NULL AND NOT (private.is_platform_admin() OR EXISTS (SELECT 1 FROM public.shops WHERE id = p_shop_id AND owner_id = v_user_id)) THEN RAISE EXCEPTION 'shop ownership required'; END IF;
  v_slug := lower(regexp_replace(trim(p_name), '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);
  INSERT INTO public.organizations (owner_id, organization_type, name, slug) VALUES (v_user_id, p_organization_type, trim(p_name), v_slug) RETURNING id INTO v_org_id;
  INSERT INTO public.organization_memberships (organization_id, user_id, member_role, title) VALUES (v_org_id, v_user_id, 'owner', 'Owner');
  IF p_shop_id IS NOT NULL THEN INSERT INTO public.organization_shop_links (organization_id, shop_id) VALUES (v_org_id, p_shop_id); END IF;
  RETURN v_org_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_my_hobee_organization_member(p_organization_id uuid, p_user_id uuid, p_member_role text, p_permissions text[] DEFAULT ARRAY[]::text[], p_status text DEFAULT 'active')
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
DECLARE v_membership_id uuid;
BEGIN
  IF NOT private.organization_has_permission(p_organization_id, 'MANAGE_STAFF') THEN RAISE EXCEPTION 'manage staff permission required'; END IF;
  IF p_member_role NOT IN ('owner', 'manager', 'staff', 'fulfilment', 'reception', 'finance', 'admin') OR p_status NOT IN ('active', 'suspended', 'left') THEN RAISE EXCEPTION 'invalid membership values'; END IF;
  IF EXISTS (SELECT 1 FROM unnest(p_permissions) AS p WHERE p NOT IN ('VIEW_ORDERS', 'MANAGE_ORDERS', 'VIEW_BOOKINGS', 'MANAGE_BOOKINGS', 'VIEW_EARNINGS', 'MANAGE_STAFF', 'MANAGE_PRODUCTS', 'MANAGE_ROOMS', 'APPROVE_ACTIONS')) THEN RAISE EXCEPTION 'invalid permission'; END IF;
  INSERT INTO public.organization_memberships (organization_id, user_id, member_role, status)
  VALUES (p_organization_id, p_user_id, p_member_role, p_status)
  ON CONFLICT (organization_id, user_id) DO UPDATE SET member_role = EXCLUDED.member_role, status = EXCLUDED.status, updated_at = timezone('utc', now())
  RETURNING id INTO v_membership_id;
  DELETE FROM public.organization_member_permissions WHERE membership_id = v_membership_id;
  INSERT INTO public.organization_member_permissions (membership_id, permission) SELECT v_membership_id, p FROM unnest(p_permissions) AS p ON CONFLICT DO NOTHING;
  RETURN v_membership_id;
END;
$function$;

-- 10) Trusted order and booking event procedures/triggers.
CREATE OR REPLACE FUNCTION private.emit_order_work_items(p_order_id uuid, p_event_key text, p_title text, p_body text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT DISTINCT m.user_id, osl.organization_id
    FROM public.order_items oi
    JOIN public.organization_shop_links osl ON osl.shop_id = oi.shop_id
    JOIN public.organization_memberships m ON m.organization_id = osl.organization_id AND m.status = 'active'
    LEFT JOIN public.organization_member_permissions p1 ON p1.membership_id = m.id AND p1.permission = 'VIEW_ORDERS'
    LEFT JOIN public.organization_member_permissions p2 ON p2.membership_id = m.id AND p2.permission = 'MANAGE_ORDERS'
    WHERE oi.order_id = p_order_id AND (m.member_role IN ('owner', 'admin') OR p1.permission IS NOT NULL OR p2.permission IS NOT NULL)
  LOOP
    PERFORM private.upsert_my_hobee_work_item(r.user_id, r.organization_id, 'seller', 'ORDER', 'ORDER', p_order_id, p_event_key || ':' || r.user_id::text, p_title, p_body);
  END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION private.on_order_item_created_emit_work()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
DECLARE v_order_number text;
BEGIN
  SELECT order_number INTO v_order_number FROM public.orders WHERE id = NEW.order_id;
  PERFORM private.emit_order_work_items(NEW.order_id, 'ORDER_CREATED:' || NEW.order_id::text, 'มีออเดอร์ใหม่ ' || coalesce(v_order_number, ''), 'ตรวจสอบและดำเนินการตามขั้นตอน fulfilment');
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION private.on_order_status_changed_emit_events()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    PERFORM private.emit_order_work_items(NEW.id, 'ORDER_STATUS:' || NEW.id::text || ':' || NEW.status, 'ออเดอร์ ' || NEW.order_number || ' อัปเดตสถานะ', 'สถานะล่าสุด: ' || NEW.status);
    PERFORM private.upsert_my_hobee_notification(NEW.buyer_id, 'ORDER_STATUS', 'ออเดอร์ของคุณมีการอัปเดต', 'ออเดอร์ ' || NEW.order_number || ' อยู่ในสถานะ ' || NEW.status, '/orders/' || NEW.id::text, 'ORDER', NEW.id, 'ORDER_BUYER_STATUS:' || NEW.id::text || ':' || NEW.status);
  END IF;
  IF NEW.payment_status IS DISTINCT FROM OLD.payment_status AND NEW.payment_status = 'paid' THEN
    PERFORM private.create_my_hobee_order_earnings(NEW.id);
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.perform_my_hobee_order_operation(p_order_id uuid, p_action text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
DECLARE v_order public.orders%ROWTYPE; v_org_id uuid; v_next_status text;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'order not found'; END IF;
  SELECT osl.organization_id INTO v_org_id FROM public.order_items oi JOIN public.organization_shop_links osl ON osl.shop_id = oi.shop_id WHERE oi.order_id = p_order_id LIMIT 1;
  IF v_org_id IS NULL THEN RAISE EXCEPTION 'order is not linked to an organization'; END IF;
  IF EXISTS (SELECT 1 FROM public.order_items oi JOIN public.organization_shop_links osl ON osl.shop_id = oi.shop_id WHERE oi.order_id = p_order_id AND osl.organization_id <> v_org_id) THEN RAISE EXCEPTION 'multi-organization order operation is not supported'; END IF;
  IF NOT private.organization_has_permission(v_org_id, 'MANAGE_ORDERS') THEN RAISE EXCEPTION 'manage orders permission required'; END IF;
  IF p_action = 'ACCEPTED' AND v_order.status = 'pending' THEN v_next_status := 'confirmed';
  ELSIF p_action = 'PREPARING' AND v_order.status = 'confirmed' THEN v_next_status := 'processing';
  ELSIF p_action = 'READY' AND v_order.status = 'processing' THEN v_next_status := 'processing';
  ELSIF p_action = 'SHIPPED' AND v_order.status = 'processing' AND EXISTS (SELECT 1 FROM public.order_operation_events WHERE order_id = p_order_id AND action = 'READY') THEN v_next_status := 'shipped';
  ELSIF p_action = 'COMPLETED' AND v_order.status = 'shipped' THEN v_next_status := 'delivered';
  ELSE RAISE EXCEPTION 'invalid order operation transition'; END IF;
  INSERT INTO public.order_operation_events (organization_id, order_id, action, actor_id, previous_order_status, next_order_status)
  VALUES (v_org_id, p_order_id, p_action, auth.uid(), v_order.status, v_next_status)
  ON CONFLICT (order_id, action) DO NOTHING;
  IF p_action <> 'READY' THEN UPDATE public.orders SET status = v_next_status WHERE id = p_order_id; END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_my_hobee_booking(p_organization_id uuid, p_booking_type text, p_listing_id uuid, p_room_type_id uuid DEFAULT NULL, p_start_at timestamptz DEFAULT timezone('utc', now()), p_end_at timestamptz DEFAULT NULL, p_quantity integer DEFAULT 1, p_guest_count integer DEFAULT 1, p_notes text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
DECLARE v_id uuid; v_price numeric; v_amount numeric; v_days integer;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;
  IF p_booking_type NOT IN ('hotel', 'tour', 'service') OR p_quantity <= 0 OR p_guest_count <= 0 THEN RAISE EXCEPTION 'invalid booking request'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.organization_travel_listing_links WHERE organization_id = p_organization_id AND listing_id = p_listing_id) THEN RAISE EXCEPTION 'listing is not operated by organization'; END IF;
  IF p_room_type_id IS NOT NULL THEN SELECT price_per_night INTO v_price FROM public.travel_room_types WHERE id = p_room_type_id AND listing_id = p_listing_id AND is_visible; ELSE SELECT price_from INTO v_price FROM public.travel_listings WHERE id = p_listing_id AND status = 'published' AND is_visible; END IF;
  IF v_price IS NULL THEN RAISE EXCEPTION 'booking inventory is unavailable'; END IF;
  v_days := CASE WHEN p_booking_type = 'hotel' THEN greatest(1, coalesce((p_end_at::date - p_start_at::date), 1)) ELSE 1 END;
  v_amount := v_price * p_quantity * v_days;
  INSERT INTO public.bookings (booking_number, customer_id, organization_id, booking_type, listing_id, room_type_id, start_at, end_at, quantity, guest_count, amount, notes)
  VALUES ('HBK-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)), auth.uid(), p_organization_id, p_booking_type, p_listing_id, p_room_type_id, p_start_at, p_end_at, p_quantity, p_guest_count, v_amount, p_notes)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$function$;

CREATE OR REPLACE FUNCTION private.emit_booking_work_items()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
DECLARE r record; v_event text;
BEGIN
  v_event := CASE WHEN TG_OP = 'INSERT' THEN 'BOOKING_CREATED' ELSE 'BOOKING_STATUS:' || NEW.status END;
  FOR r IN SELECT DISTINCT m.user_id FROM public.organization_memberships m LEFT JOIN public.organization_member_permissions p1 ON p1.membership_id = m.id AND p1.permission = 'VIEW_BOOKINGS' LEFT JOIN public.organization_member_permissions p2 ON p2.membership_id = m.id AND p2.permission = 'MANAGE_BOOKINGS' WHERE m.organization_id = NEW.organization_id AND m.status = 'active' AND (m.member_role IN ('owner', 'admin') OR p1.permission IS NOT NULL OR p2.permission IS NOT NULL)
  LOOP
    PERFORM private.upsert_my_hobee_work_item(r.user_id, NEW.organization_id, CASE NEW.booking_type WHEN 'hotel' THEN 'hotel' WHEN 'tour' THEN 'tour_operator' ELSE 'service_provider' END, 'BOOKING', 'BOOKING', NEW.id, v_event || ':' || NEW.id::text || ':' || r.user_id::text, 'รายการจอง ' || NEW.booking_number, 'สถานะ: ' || NEW.status);
  END LOOP;
  IF TG_OP = 'INSERT' THEN PERFORM private.upsert_my_hobee_notification(NEW.customer_id, 'BOOKING_NEW', 'สร้างรายการจองแล้ว', 'เลขที่การจอง ' || NEW.booking_number, '/my-hobee/work', 'BOOKING', NEW.id, 'BOOKING_CUSTOMER_NEW:' || NEW.id::text); ELSE PERFORM private.upsert_my_hobee_notification(NEW.customer_id, 'BOOKING_STATUS', 'สถานะการจองอัปเดต', 'เลขที่การจอง ' || NEW.booking_number || ' · ' || NEW.status, '/my-hobee/work', 'BOOKING', NEW.id, 'BOOKING_CUSTOMER_STATUS:' || NEW.id::text || ':' || NEW.status); END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION private.create_my_hobee_order_earnings(p_order_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
DECLARE r record; o record;
BEGIN
  SELECT id, payment_status INTO o FROM public.orders WHERE id = p_order_id;
  IF NOT FOUND OR o.payment_status <> 'paid' THEN RETURN; END IF;
  FOR r IN SELECT osl.organization_id, m.user_id, sum(oi.line_total)::numeric AS gross FROM public.order_items oi JOIN public.organization_shop_links osl ON osl.shop_id = oi.shop_id JOIN public.organization_memberships m ON m.organization_id = osl.organization_id AND m.member_role = 'owner' AND m.status = 'active' WHERE oi.order_id = p_order_id GROUP BY osl.organization_id, m.user_id
  LOOP
    INSERT INTO public.earnings_ledger (user_id, organization_id, role_type, source_type, source_id, gross_amount, platform_fee, commission_amount, net_amount, status, earned_at, available_at)
    VALUES (r.user_id, r.organization_id, 'seller', 'SELLER_ORDER', p_order_id, r.gross, 0, 0, r.gross, 'available', timezone('utc', now()), timezone('utc', now()))
    ON CONFLICT (user_id, organization_id, role_type, source_type, source_id) DO NOTHING;
    PERFORM private.upsert_my_hobee_notification(r.user_id, 'EARNING_AVAILABLE', 'รายได้พร้อมติดตาม', 'มีรายได้จากคำสั่งซื้อที่ชำระแล้ว', '/my-hobee/work', 'EARNING', p_order_id, 'EARNING_SELLER_ORDER:' || p_order_id::text || ':' || r.user_id::text);
  END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION private.on_payment_paid_create_earnings()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
BEGIN
  IF NEW.status = 'paid' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN PERFORM private.create_my_hobee_order_earnings(NEW.order_id); END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS my_hobee_order_item_created ON public.order_items;
CREATE TRIGGER my_hobee_order_item_created AFTER INSERT ON public.order_items FOR EACH ROW EXECUTE FUNCTION private.on_order_item_created_emit_work();
DROP TRIGGER IF EXISTS my_hobee_order_status_changed ON public.orders;
CREATE TRIGGER my_hobee_order_status_changed AFTER UPDATE OF status, payment_status ON public.orders FOR EACH ROW EXECUTE FUNCTION private.on_order_status_changed_emit_events();
DROP TRIGGER IF EXISTS my_hobee_booking_events ON public.bookings;
CREATE TRIGGER my_hobee_booking_events AFTER INSERT OR UPDATE OF status ON public.bookings FOR EACH ROW EXECUTE FUNCTION private.emit_booking_work_items();
DROP TRIGGER IF EXISTS my_hobee_payment_paid ON public.payments;
CREATE TRIGGER my_hobee_payment_paid AFTER INSERT OR UPDATE OF status ON public.payments FOR EACH ROW EXECUTE FUNCTION private.on_payment_paid_create_earnings();

-- 11) RLS and least-privilege policies.
ALTER TABLE public.role_application_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_member_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_shop_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_travel_listing_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_operation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earnings_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS role_applications_admin_manage ON public.role_applications;
DROP POLICY IF EXISTS role_application_audit_own_or_admin_read ON public.role_application_audit_logs;
CREATE POLICY role_application_audit_own_or_admin_read ON public.role_application_audit_logs FOR SELECT TO authenticated USING (private.is_platform_admin() OR EXISTS (SELECT 1 FROM public.role_applications a WHERE a.id = application_id AND a.user_id = auth.uid()));
DROP POLICY IF EXISTS organizations_member_or_admin_read ON public.organizations;
CREATE POLICY organizations_member_or_admin_read ON public.organizations FOR SELECT TO authenticated USING (private.is_platform_admin() OR private.is_organization_member(id));
DROP POLICY IF EXISTS organizations_admin_manage ON public.organizations;
CREATE POLICY organizations_admin_manage ON public.organizations FOR ALL TO authenticated USING (private.is_platform_admin()) WITH CHECK (private.is_platform_admin());
DROP POLICY IF EXISTS organization_memberships_member_or_admin_read ON public.organization_memberships;
CREATE POLICY organization_memberships_member_or_admin_read ON public.organization_memberships FOR SELECT TO authenticated USING (private.is_platform_admin() OR user_id = auth.uid() OR private.is_organization_member(organization_id));
DROP POLICY IF EXISTS organization_member_permissions_member_or_admin_read ON public.organization_member_permissions;
CREATE POLICY organization_member_permissions_member_or_admin_read ON public.organization_member_permissions FOR SELECT TO authenticated USING (private.is_platform_admin() OR EXISTS (SELECT 1 FROM public.organization_memberships m WHERE m.id = membership_id AND (m.user_id = auth.uid() OR private.is_organization_member(m.organization_id))));
DROP POLICY IF EXISTS organization_shop_links_member_or_admin_read ON public.organization_shop_links;
CREATE POLICY organization_shop_links_member_or_admin_read ON public.organization_shop_links FOR SELECT TO authenticated USING (private.is_platform_admin() OR private.is_organization_member(organization_id));
DROP POLICY IF EXISTS organization_listing_links_member_or_admin_read ON public.organization_travel_listing_links;
CREATE POLICY organization_listing_links_member_or_admin_read ON public.organization_travel_listing_links FOR SELECT TO authenticated USING (private.is_platform_admin() OR private.is_organization_member(organization_id));
DROP POLICY IF EXISTS work_inbox_items_own_mark_read ON public.work_inbox_items;
DROP POLICY IF EXISTS work_inbox_items_admin_manage ON public.work_inbox_items;
DROP POLICY IF EXISTS work_inbox_items_own_or_admin_read ON public.work_inbox_items;
CREATE POLICY work_inbox_items_own_or_admin_read ON public.work_inbox_items FOR SELECT TO authenticated USING (user_id = auth.uid() OR private.is_platform_admin());
DROP POLICY IF EXISTS user_notifications_own_or_admin_read ON public.user_notifications;
CREATE POLICY user_notifications_own_or_admin_read ON public.user_notifications FOR SELECT TO authenticated USING (user_id = auth.uid() OR private.is_platform_admin());
DROP POLICY IF EXISTS order_operation_events_org_or_admin_read ON public.order_operation_events;
CREATE POLICY order_operation_events_org_or_admin_read ON public.order_operation_events FOR SELECT TO authenticated USING (private.is_platform_admin() OR private.organization_has_permission(organization_id, 'VIEW_ORDERS') OR private.organization_has_permission(organization_id, 'MANAGE_ORDERS'));
DROP POLICY IF EXISTS bookings_customer_org_or_admin_read ON public.bookings;
CREATE POLICY bookings_customer_org_or_admin_read ON public.bookings FOR SELECT TO authenticated USING (customer_id = auth.uid() OR private.is_platform_admin() OR private.organization_has_permission(organization_id, 'VIEW_BOOKINGS') OR private.organization_has_permission(organization_id, 'MANAGE_BOOKINGS'));
DROP POLICY IF EXISTS booking_participants_access_read ON public.booking_participants;
CREATE POLICY booking_participants_access_read ON public.booking_participants FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND (b.customer_id = auth.uid() OR private.is_platform_admin() OR private.organization_has_permission(b.organization_id, 'VIEW_BOOKINGS') OR private.organization_has_permission(b.organization_id, 'MANAGE_BOOKINGS'))));
DROP POLICY IF EXISTS earnings_ledger_recipient_org_or_admin_read ON public.earnings_ledger;
CREATE POLICY earnings_ledger_recipient_org_or_admin_read ON public.earnings_ledger FOR SELECT TO authenticated USING (user_id = auth.uid() OR private.is_platform_admin() OR (organization_id IS NOT NULL AND private.organization_has_permission(organization_id, 'VIEW_EARNINGS')));
DROP POLICY IF EXISTS orders_organization_member_read ON public.orders;
CREATE POLICY orders_organization_member_read ON public.orders FOR SELECT TO authenticated USING (private.is_platform_admin() OR EXISTS (SELECT 1 FROM public.order_items oi JOIN public.organization_shop_links osl ON osl.shop_id = oi.shop_id WHERE oi.order_id = orders.id AND (private.organization_has_permission(osl.organization_id, 'VIEW_ORDERS') OR private.organization_has_permission(osl.organization_id, 'MANAGE_ORDERS'))));
DROP POLICY IF EXISTS order_items_organization_member_read ON public.order_items;
CREATE POLICY order_items_organization_member_read ON public.order_items FOR SELECT TO authenticated USING (private.is_platform_admin() OR EXISTS (SELECT 1 FROM public.organization_shop_links osl WHERE osl.shop_id = order_items.shop_id AND (private.organization_has_permission(osl.organization_id, 'VIEW_ORDERS') OR private.organization_has_permission(osl.organization_id, 'MANAGE_ORDERS'))));

-- Secure RPC grants. No function is callable by anon; financial/approval writes are protected server procedures.
CREATE OR REPLACE FUNCTION public.mark_my_hobee_inbox_item_read(p_item_id uuid, p_is_read boolean DEFAULT true)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;
  UPDATE public.work_inbox_items SET is_read = p_is_read, updated_at = timezone('utc', now()) WHERE id = p_item_id AND user_id = auth.uid();
END;
$function$;

CREATE OR REPLACE FUNCTION public.mark_my_hobee_notification_read(p_notification_id uuid, p_is_read boolean DEFAULT true)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public, private, pg_catalog
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;
  UPDATE public.user_notifications SET is_read = p_is_read, read_at = CASE WHEN p_is_read THEN timezone('utc', now()) ELSE NULL END WHERE id = p_notification_id AND user_id = auth.uid();
END;
$function$;

CREATE OR REPLACE FUNCTION public.my_hobee_earnings_summary()
RETURNS TABLE (paid_amount numeric, paid_order_count bigint, pending_amount numeric, pending_order_count bigint, period_started_at timestamptz)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path TO public, private, pg_catalog
AS $function$
  WITH period AS (SELECT date_trunc('month', timezone('utc', now())) AT TIME ZONE 'utc' AS started_at)
  SELECT COALESCE(SUM(e.net_amount) FILTER (WHERE e.status IN ('available', 'paid')), 0)::numeric, COUNT(*) FILTER (WHERE e.status IN ('available', 'paid'))::bigint, COALESCE(SUM(e.net_amount) FILTER (WHERE e.status = 'pending'), 0)::numeric, COUNT(*) FILTER (WHERE e.status = 'pending')::bigint, (SELECT started_at FROM period)
  FROM public.earnings_ledger e CROSS JOIN period p
  WHERE e.user_id = auth.uid() AND e.earned_at >= p.started_at;
$function$;

REVOKE ALL ON FUNCTION public.apply_for_hobee_role(text, jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.review_my_hobee_role_application(uuid, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.create_my_hobee_organization(text, text, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.set_my_hobee_organization_member(uuid, uuid, text, text[], text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.perform_my_hobee_order_operation(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.create_my_hobee_booking(uuid, text, uuid, uuid, timestamptz, timestamptz, integer, integer, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.mark_my_hobee_inbox_item_read(uuid, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.mark_my_hobee_notification_read(uuid, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.my_hobee_earnings_summary() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.apply_for_hobee_role(text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_my_hobee_role_application(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_my_hobee_organization(text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_my_hobee_organization_member(uuid, uuid, text, text[], text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.perform_my_hobee_order_operation(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_my_hobee_booking(uuid, text, uuid, uuid, timestamptz, timestamptz, integer, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_my_hobee_inbox_item_read(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_my_hobee_notification_read(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_hobee_earnings_summary() TO authenticated;
