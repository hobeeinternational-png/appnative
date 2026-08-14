-- My HOBEE multi-role foundation.
-- This migration preserves the existing customer/seller/admin roles and commerce contracts.

ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_role_check
  CHECK (role = ANY (ARRAY[
    'customer', 'seller', 'admin',
    'creator', 'affiliate', 'teacher', 'tour_operator', 'hotel',
    'guide', 'service_provider', 'partner', 'employee'
  ]));

CREATE TABLE IF NOT EXISTS public.user_role_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_type text NOT NULL CHECK (role_type = ANY (ARRAY[
    'creator', 'affiliate', 'seller', 'teacher', 'tour_operator', 'hotel',
    'guide', 'service_provider', 'partner', 'employee'
  ])),
  status text NOT NULL DEFAULT 'pending' CHECK (status = ANY (ARRAY[
    'pending', 'reviewing', 'approved', 'rejected', 'suspended'
  ])),
  application_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (user_id, role_type)
);

CREATE TABLE IF NOT EXISTS public.role_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_type text NOT NULL CHECK (role_type = ANY (ARRAY[
    'creator', 'affiliate', 'seller', 'teacher', 'tour_operator', 'hotel',
    'guide', 'service_provider', 'partner', 'employee'
  ])),
  status text NOT NULL DEFAULT 'pending' CHECK (status = ANY (ARRAY[
    'pending', 'reviewing', 'approved', 'rejected', 'withdrawn'
  ])),
  application_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  reviewer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  decision_note text,
  submitted_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  reviewed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE UNIQUE INDEX IF NOT EXISTS role_applications_one_open_per_role
  ON public.role_applications (user_id, role_type)
  WHERE status IN ('pending', 'reviewing');

CREATE INDEX IF NOT EXISTS user_role_profiles_user_status_idx
  ON public.user_role_profiles (user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS role_applications_user_submitted_idx
  ON public.role_applications (user_id, submitted_at DESC);

CREATE TABLE IF NOT EXISTS public.work_inbox_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_type text NOT NULL CHECK (item_type = ANY (ARRAY[
    'ORDER', 'BOOKING', 'CREATOR_JOB', 'TEACHING', 'SERVICE_JOB',
    'EMPLOYEE_TASK', 'MESSAGE', 'APPROVAL'
  ])),
  reference_id uuid,
  title text NOT NULL,
  body text,
  urgency_level text NOT NULL DEFAULT 'normal' CHECK (urgency_level = ANY (ARRAY['normal', 'urgent'])),
  due_at timestamptz,
  is_read boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS work_inbox_items_user_unread_idx
  ON public.work_inbox_items (user_id, is_read, due_at, created_at DESC);

CREATE INDEX IF NOT EXISTS work_inbox_items_user_type_idx
  ON public.work_inbox_items (user_id, item_type, created_at DESC);

DROP TRIGGER IF EXISTS set_user_role_profiles_updated_at ON public.user_role_profiles;
CREATE TRIGGER set_user_role_profiles_updated_at
  BEFORE UPDATE ON public.user_role_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_role_applications_updated_at ON public.role_applications;
CREATE TRIGGER set_role_applications_updated_at
  BEFORE UPDATE ON public.role_applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_work_inbox_items_updated_at ON public.work_inbox_items;
CREATE TRIGGER set_work_inbox_items_updated_at
  BEFORE UPDATE ON public.work_inbox_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.user_role_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_inbox_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_role_profiles_own_or_admin_read ON public.user_role_profiles;
CREATE POLICY user_role_profiles_own_or_admin_read ON public.user_role_profiles
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR private.is_platform_admin());

DROP POLICY IF EXISTS user_role_profiles_admin_manage ON public.user_role_profiles;
CREATE POLICY user_role_profiles_admin_manage ON public.user_role_profiles
  FOR ALL TO authenticated
  USING (private.is_platform_admin())
  WITH CHECK (private.is_platform_admin());

DROP POLICY IF EXISTS role_applications_own_or_admin_read ON public.role_applications;
CREATE POLICY role_applications_own_or_admin_read ON public.role_applications
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR private.is_platform_admin());

DROP POLICY IF EXISTS role_applications_admin_manage ON public.role_applications;
CREATE POLICY role_applications_admin_manage ON public.role_applications
  FOR ALL TO authenticated
  USING (private.is_platform_admin())
  WITH CHECK (private.is_platform_admin());

DROP POLICY IF EXISTS work_inbox_items_own_or_admin_read ON public.work_inbox_items;
CREATE POLICY work_inbox_items_own_or_admin_read ON public.work_inbox_items
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR private.is_platform_admin());

DROP POLICY IF EXISTS work_inbox_items_admin_manage ON public.work_inbox_items;
CREATE POLICY work_inbox_items_admin_manage ON public.work_inbox_items
  FOR ALL TO authenticated
  USING (private.is_platform_admin())
  WITH CHECK (private.is_platform_admin());

CREATE OR REPLACE FUNCTION public.apply_for_hobee_role(
  p_role_type text,
  p_application_data jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, private, pg_catalog
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_application_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'authentication required';
  END IF;

  IF p_role_type NOT IN (
    'creator', 'affiliate', 'seller', 'teacher', 'tour_operator', 'hotel',
    'guide', 'service_provider', 'partner', 'employee'
  ) THEN
    RAISE EXCEPTION 'unsupported role type';
  END IF;

  INSERT INTO public.role_applications (user_id, role_type, status, application_data)
  VALUES (v_user_id, p_role_type, 'pending', COALESCE(p_application_data, '{}'::jsonb))
  ON CONFLICT (user_id, role_type) WHERE status IN ('pending', 'reviewing')
  DO UPDATE SET application_data = EXCLUDED.application_data, updated_at = timezone('utc', now())
  RETURNING id INTO v_application_id;

  INSERT INTO public.user_role_profiles (user_id, role_type, status, application_data)
  VALUES (v_user_id, p_role_type, 'pending', COALESCE(p_application_data, '{}'::jsonb))
  ON CONFLICT (user_id, role_type)
  DO UPDATE SET
    application_data = EXCLUDED.application_data,
    status = CASE
      WHEN public.user_role_profiles.status = 'rejected' THEN 'pending'
      ELSE public.user_role_profiles.status
    END,
    approved_at = CASE
      WHEN public.user_role_profiles.status = 'rejected' THEN NULL
      ELSE public.user_role_profiles.approved_at
    END,
    updated_at = timezone('utc', now());

  RETURN v_application_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.mark_my_hobee_inbox_item_read(
  p_item_id uuid,
  p_is_read boolean DEFAULT true
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, private, pg_catalog
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication required';
  END IF;

  UPDATE public.work_inbox_items
  SET is_read = p_is_read, updated_at = timezone('utc', now())
  WHERE id = p_item_id AND user_id = auth.uid();
END;
$function$;

CREATE OR REPLACE FUNCTION public.my_hobee_earnings_summary()
RETURNS TABLE (
  paid_amount numeric,
  paid_order_count bigint,
  pending_amount numeric,
  pending_order_count bigint,
  period_started_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public, private, pg_catalog
AS $function$
  WITH owned_shops AS (
    SELECT id FROM public.shops WHERE owner_id = auth.uid()
  ), owned_lines AS (
    SELECT oi.order_id, oi.line_total
    FROM public.order_items oi
    INNER JOIN owned_shops s ON s.id = oi.shop_id
  ), current_period AS (
    SELECT date_trunc('month', timezone('utc', now())) AT TIME ZONE 'utc' AS started_at
  )
  SELECT
    COALESCE(SUM(CASE WHEN o.payment_status = 'paid' THEN l.line_total ELSE 0 END), 0)::numeric AS paid_amount,
    COUNT(DISTINCT l.order_id) FILTER (WHERE o.payment_status = 'paid')::bigint AS paid_order_count,
    COALESCE(SUM(CASE WHEN o.payment_status IN ('pending', 'authorized') THEN l.line_total ELSE 0 END), 0)::numeric AS pending_amount,
    COUNT(DISTINCT l.order_id) FILTER (WHERE o.payment_status IN ('pending', 'authorized'))::bigint AS pending_order_count,
    (SELECT started_at FROM current_period) AS period_started_at
  FROM owned_lines l
  INNER JOIN public.orders o ON o.id = l.order_id
  CROSS JOIN current_period cp
  WHERE o.created_at >= cp.started_at;
$function$;

REVOKE ALL ON FUNCTION public.apply_for_hobee_role(text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.mark_my_hobee_inbox_item_read(uuid, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.my_hobee_earnings_summary() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_for_hobee_role(text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_my_hobee_inbox_item_read(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_hobee_earnings_summary() TO authenticated;
