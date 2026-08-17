-- Reset controlled identity QA data only. Run only against branch islisdlzuadwvxsocozj.
-- Auth users remain intentionally untouched; delete the disposable branch to remove them.

BEGIN;
SET LOCAL app.hobee_qa_seed = 'allow';
DO $$ BEGIN
  IF current_setting('app.hobee_qa_seed', true) IS DISTINCT FROM 'allow' THEN
    RAISE EXCEPTION 'QA reset guard denied: app.hobee_qa_seed must equal allow';
  END IF;
END $$;

DELETE FROM public.role_application_audit_logs a USING public.role_applications r, auth.users u WHERE a.application_id = r.id AND r.user_id = u.id AND lower(u.email) LIKE 'qa+%@qa.hobee.invalid';
DELETE FROM public.role_applications r USING auth.users u WHERE r.user_id = u.id AND lower(u.email) LIKE 'qa+%@qa.hobee.invalid';
DELETE FROM public.organization_member_permissions p USING public.organization_memberships m, public.organizations o WHERE p.membership_id = m.id AND m.organization_id = o.id AND o.slug LIKE 'qa-%';
DELETE FROM public.organization_memberships m USING public.organizations o WHERE m.organization_id = o.id AND o.slug LIKE 'qa-%';
DELETE FROM public.organizations WHERE slug LIKE 'qa-%';
DELETE FROM public.user_role_profiles r USING auth.users u WHERE r.user_id = u.id AND lower(u.email) LIKE 'qa+%@qa.hobee.invalid';
DELETE FROM public.user_roles r USING auth.users u WHERE r.user_id = u.id AND lower(u.email) LIKE 'qa+%@qa.hobee.invalid';
COMMIT;
