-- HOBEE controlled identity QA seed. Run only against branch islisdlzuadwvxsocozj.
-- Prerequisite: create the listed QA identities through Supabase Auth in the QA branch.
-- This script intentionally never creates auth.users or stores a password.

BEGIN;
SET LOCAL app.hobee_qa_seed = 'allow';

DO $$
DECLARE missing_personas text;
BEGIN
  IF current_setting('app.hobee_qa_seed', true) IS DISTINCT FROM 'allow' THEN
    RAISE EXCEPTION 'QA seed guard denied: app.hobee_qa_seed must equal allow';
  END IF;

  SELECT string_agg(code, ', ' ORDER BY code) INTO missing_personas
  FROM (VALUES
    ('CUSTOMER_BASIC', 'qa+customer-basic@qa.hobee.invalid'),
    ('CUSTOMER_MULTIROLE', 'qa+customer-multirole@qa.hobee.invalid'),
    ('SELLER_OWNER', 'qa+seller-owner@qa.hobee.invalid'),
    ('SELLER_MANAGER', 'qa+seller-manager@qa.hobee.invalid'),
    ('SELLER_FULFILMENT', 'qa+seller-fulfilment@qa.hobee.invalid'),
    ('SELLER_CUSTOMER_SERVICE', 'qa+seller-cs@qa.hobee.invalid'),
    ('SELLER_FINANCE', 'qa+seller-finance@qa.hobee.invalid'),
    ('HOTEL_OWNER', 'qa+hotel-owner@qa.hobee.invalid'),
    ('HOTEL_STAFF', 'qa+hotel-staff@qa.hobee.invalid'),
    ('TOUR_OPERATOR_OWNER', 'qa+tour-owner@qa.hobee.invalid'),
    ('TOUR_OPERATOR_STAFF', 'qa+tour-staff@qa.hobee.invalid'),
    ('CREATOR', 'qa+creator@qa.hobee.invalid'),
    ('AFFILIATE', 'qa+affiliate@qa.hobee.invalid'),
    ('TEACHER', 'qa+teacher@qa.hobee.invalid'),
    ('GUIDE', 'qa+guide@qa.hobee.invalid'),
    ('SERVICE_PROVIDER', 'qa+service-provider@qa.hobee.invalid'),
    ('HOBEE_EMPLOYEE', 'qa+employee@qa.hobee.invalid'),
    ('HOBEE_MANAGER', 'qa+manager@qa.hobee.invalid'),
    ('HOBEE_ADMIN', 'qa+admin@qa.hobee.invalid'),
    ('MULTI_ROLE_USER', 'qa+multi-role@qa.hobee.invalid')
  ) AS expected(code, email)
  WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE lower(u.email) = expected.email);

  IF missing_personas IS NOT NULL THEN
    RAISE EXCEPTION 'QA Auth identities missing: %. Provision only in the QA branch, then rerun.', missing_personas;
  END IF;
END $$;

CREATE TEMP TABLE qa_personas (code text PRIMARY KEY, email text UNIQUE NOT NULL, display_name text NOT NULL) ON COMMIT DROP;
INSERT INTO qa_personas VALUES
  ('CUSTOMER_BASIC', 'qa+customer-basic@qa.hobee.invalid', '[QA] Customer Basic'),
  ('CUSTOMER_MULTIROLE', 'qa+customer-multirole@qa.hobee.invalid', '[QA] Customer Multi-role'),
  ('SELLER_OWNER', 'qa+seller-owner@qa.hobee.invalid', '[QA] Seller Owner'),
  ('SELLER_MANAGER', 'qa+seller-manager@qa.hobee.invalid', '[QA] Seller Manager'),
  ('SELLER_FULFILMENT', 'qa+seller-fulfilment@qa.hobee.invalid', '[QA] Seller Fulfilment'),
  ('SELLER_CUSTOMER_SERVICE', 'qa+seller-cs@qa.hobee.invalid', '[QA] Seller Customer Service'),
  ('SELLER_FINANCE', 'qa+seller-finance@qa.hobee.invalid', '[QA] Seller Finance'),
  ('HOTEL_OWNER', 'qa+hotel-owner@qa.hobee.invalid', '[QA] Hotel Owner'),
  ('HOTEL_STAFF', 'qa+hotel-staff@qa.hobee.invalid', '[QA] Hotel Staff'),
  ('TOUR_OPERATOR_OWNER', 'qa+tour-owner@qa.hobee.invalid', '[QA] Tour Operator Owner'),
  ('TOUR_OPERATOR_STAFF', 'qa+tour-staff@qa.hobee.invalid', '[QA] Tour Operator Staff'),
  ('CREATOR', 'qa+creator@qa.hobee.invalid', '[QA] Creator'),
  ('AFFILIATE', 'qa+affiliate@qa.hobee.invalid', '[QA] Affiliate'),
  ('TEACHER', 'qa+teacher@qa.hobee.invalid', '[QA] Teacher'),
  ('GUIDE', 'qa+guide@qa.hobee.invalid', '[QA] Guide'),
  ('SERVICE_PROVIDER', 'qa+service-provider@qa.hobee.invalid', '[QA] Service Provider'),
  ('HOBEE_EMPLOYEE', 'qa+employee@qa.hobee.invalid', '[QA] HOBEE Employee'),
  ('HOBEE_MANAGER', 'qa+manager@qa.hobee.invalid', '[QA] HOBEE Manager'),
  ('HOBEE_ADMIN', 'qa+admin@qa.hobee.invalid', '[QA] HOBEE Admin'),
  ('MULTI_ROLE_USER', 'qa+multi-role@qa.hobee.invalid', '[QA] Multi-role User');

INSERT INTO public.profiles (id, display_name)
SELECT u.id, p.display_name FROM qa_personas p JOIN auth.users u ON lower(u.email) = p.email
ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name, updated_at = timezone('utc', now());

CREATE TEMP TABLE qa_user_roles (email text NOT NULL, role text NOT NULL, PRIMARY KEY (email, role)) ON COMMIT DROP;
INSERT INTO qa_user_roles VALUES
  ('qa+customer-basic@qa.hobee.invalid', 'customer'),
  ('qa+customer-multirole@qa.hobee.invalid', 'customer'), ('qa+customer-multirole@qa.hobee.invalid', 'creator'), ('qa+customer-multirole@qa.hobee.invalid', 'affiliate'), ('qa+customer-multirole@qa.hobee.invalid', 'employee'),
  ('qa+creator@qa.hobee.invalid', 'creator'), ('qa+affiliate@qa.hobee.invalid', 'affiliate'), ('qa+teacher@qa.hobee.invalid', 'teacher'), ('qa+guide@qa.hobee.invalid', 'guide'), ('qa+service-provider@qa.hobee.invalid', 'service_provider'),
  ('qa+hotel-owner@qa.hobee.invalid', 'hotel'), ('qa+tour-owner@qa.hobee.invalid', 'tour_operator'), ('qa+seller-owner@qa.hobee.invalid', 'seller'),
  ('qa+employee@qa.hobee.invalid', 'employee'), ('qa+manager@qa.hobee.invalid', 'employee'), ('qa+admin@qa.hobee.invalid', 'admin'),
  ('qa+multi-role@qa.hobee.invalid', 'customer'), ('qa+multi-role@qa.hobee.invalid', 'creator'), ('qa+multi-role@qa.hobee.invalid', 'affiliate'), ('qa+multi-role@qa.hobee.invalid', 'employee');

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, r.role FROM qa_user_roles r JOIN auth.users u ON lower(u.email) = r.email
ON CONFLICT (user_id, role) DO NOTHING;

CREATE TEMP TABLE qa_personal_roles (email text NOT NULL, role_type text NOT NULL, PRIMARY KEY (email, role_type)) ON COMMIT DROP;
INSERT INTO qa_personal_roles VALUES
  ('qa+customer-multirole@qa.hobee.invalid', 'creator'), ('qa+customer-multirole@qa.hobee.invalid', 'affiliate'), ('qa+customer-multirole@qa.hobee.invalid', 'employee'),
  ('qa+creator@qa.hobee.invalid', 'creator'), ('qa+affiliate@qa.hobee.invalid', 'affiliate'), ('qa+teacher@qa.hobee.invalid', 'teacher'), ('qa+guide@qa.hobee.invalid', 'guide'), ('qa+service-provider@qa.hobee.invalid', 'service_provider'),
  ('qa+hotel-owner@qa.hobee.invalid', 'hotel'), ('qa+tour-owner@qa.hobee.invalid', 'tour_operator'), ('qa+seller-owner@qa.hobee.invalid', 'seller'),
  ('qa+employee@qa.hobee.invalid', 'employee'), ('qa+manager@qa.hobee.invalid', 'employee'),
  ('qa+multi-role@qa.hobee.invalid', 'creator'), ('qa+multi-role@qa.hobee.invalid', 'affiliate'), ('qa+multi-role@qa.hobee.invalid', 'employee');

INSERT INTO public.user_role_profiles (user_id, role_type, status, application_data, approved_at)
SELECT u.id, r.role_type, 'approved', jsonb_build_object('qa_seed', true, 'persona_email', r.email), timezone('utc', now())
FROM qa_personal_roles r JOIN auth.users u ON lower(u.email) = r.email
ON CONFLICT (user_id, role_type) DO UPDATE SET status = 'approved', application_data = EXCLUDED.application_data, approved_at = COALESCE(public.user_role_profiles.approved_at, EXCLUDED.approved_at), updated_at = timezone('utc', now());

-- One pending application remains intentionally available for the approval acceptance journey.
INSERT INTO public.role_applications (user_id, role_type, status, application_data)
SELECT u.id, 'teacher', 'pending', jsonb_build_object('qa_seed', true, 'persona', 'CUSTOMER_BASIC')
FROM auth.users u WHERE lower(u.email) = 'qa+customer-basic@qa.hobee.invalid'
ON CONFLICT (user_id, role_type) WHERE status IN ('pending', 'reviewing', 'needs_changes')
DO UPDATE SET application_data = EXCLUDED.application_data, status = 'pending', reviewer_id = NULL, decision_note = NULL, reviewed_at = NULL, updated_at = timezone('utc', now());

CREATE TEMP TABLE qa_organizations (slug text PRIMARY KEY, owner_email text NOT NULL, organization_type text NOT NULL, name text NOT NULL) ON COMMIT DROP;
INSERT INTO qa_organizations VALUES
  ('qa-local-store', 'qa+seller-owner@qa.hobee.invalid', 'store', '[QA] Local Store'),
  ('qa-restaurant', 'qa+seller-owner@qa.hobee.invalid', 'store', '[QA] Restaurant'),
  ('qa-hotel', 'qa+hotel-owner@qa.hobee.invalid', 'hotel', '[QA] Hotel'),
  ('qa-tour-company', 'qa+tour-owner@qa.hobee.invalid', 'tour_company', '[QA] Tour Company'),
  ('qa-service-business', 'qa+service-provider@qa.hobee.invalid', 'service_business', '[QA] Service Business'),
  ('qa-hobee-internal', 'qa+manager@qa.hobee.invalid', 'hobee', '[QA] HOBEE Internal');

INSERT INTO public.organizations (owner_id, organization_type, name, slug, description, status, metadata)
SELECT u.id, o.organization_type, o.name, o.slug, 'Controlled QA-only organization. Never merge to production.', 'active', jsonb_build_object('qa_seed', true, 'qa_label', 'QA', 'business_label', CASE WHEN o.slug = 'qa-restaurant' THEN 'restaurant' ELSE o.organization_type END)
FROM qa_organizations o JOIN auth.users u ON lower(u.email) = o.owner_email
ON CONFLICT (slug) DO UPDATE SET owner_id = EXCLUDED.owner_id, name = EXCLUDED.name, description = EXCLUDED.description, status = 'active', metadata = EXCLUDED.metadata, updated_at = timezone('utc', now());

CREATE TEMP TABLE qa_memberships (organization_slug text NOT NULL, email text NOT NULL, member_role text NOT NULL, status text NOT NULL, title text, permissions text[] NOT NULL, PRIMARY KEY (organization_slug, email)) ON COMMIT DROP;
INSERT INTO qa_memberships VALUES
  ('qa-local-store','qa+seller-owner@qa.hobee.invalid','owner','active','Owner',ARRAY['MANAGE_STAFF','MANAGE_PRODUCTS','MANAGE_ORDERS','VIEW_ORDERS','VIEW_EARNINGS']),
  ('qa-local-store','qa+seller-manager@qa.hobee.invalid','manager','active','Store Manager',ARRAY['MANAGE_PRODUCTS','MANAGE_ORDERS','VIEW_ORDERS']),
  ('qa-local-store','qa+seller-fulfilment@qa.hobee.invalid','fulfilment','active','Fulfilment',ARRAY['VIEW_ORDERS','MANAGE_ORDERS']),
  ('qa-local-store','qa+seller-cs@qa.hobee.invalid','staff','active','Customer Service',ARRAY['VIEW_ORDERS']),
  ('qa-local-store','qa+seller-finance@qa.hobee.invalid','finance','active','Finance',ARRAY['VIEW_EARNINGS']),
  ('qa-local-store','qa+multi-role@qa.hobee.invalid','staff','active','Multi-org QA Staff',ARRAY['VIEW_ORDERS']),
  ('qa-restaurant','qa+customer-basic@qa.hobee.invalid','staff','suspended','Suspended QA Access',ARRAY['VIEW_ORDERS']),
  ('qa-hotel','qa+hotel-owner@qa.hobee.invalid','owner','active','Owner',ARRAY['MANAGE_STAFF','MANAGE_BOOKINGS','VIEW_BOOKINGS','VIEW_EARNINGS','MANAGE_ROOMS']),
  ('qa-hotel','qa+hotel-staff@qa.hobee.invalid','reception','active','Reception',ARRAY['VIEW_BOOKINGS','MANAGE_BOOKINGS']),
  ('qa-hotel','qa+seller-finance@qa.hobee.invalid','finance','active','Finance',ARRAY['VIEW_EARNINGS']),
  ('qa-hotel','qa+multi-role@qa.hobee.invalid','staff','active','Multi-org QA Staff',ARRAY['VIEW_BOOKINGS']),
  ('qa-tour-company','qa+tour-owner@qa.hobee.invalid','owner','active','Owner',ARRAY['MANAGE_STAFF','MANAGE_BOOKINGS','VIEW_BOOKINGS','VIEW_EARNINGS']),
  ('qa-tour-company','qa+tour-staff@qa.hobee.invalid','staff','active','Operations',ARRAY['VIEW_BOOKINGS','MANAGE_BOOKINGS']),
  ('qa-tour-company','qa+guide@qa.hobee.invalid','staff','active','Guide',ARRAY['VIEW_BOOKINGS']),
  ('qa-tour-company','qa+seller-finance@qa.hobee.invalid','finance','active','Finance',ARRAY['VIEW_EARNINGS']),
  ('qa-service-business','qa+service-provider@qa.hobee.invalid','owner','active','Owner',ARRAY['MANAGE_STAFF','VIEW_BOOKINGS','MANAGE_BOOKINGS']),
  ('qa-hobee-internal','qa+admin@qa.hobee.invalid','admin','active','Platform Admin',ARRAY['MANAGE_STAFF','APPROVE_ACTIONS','VIEW_EARNINGS']),
  ('qa-hobee-internal','qa+manager@qa.hobee.invalid','manager','active','HOBEE Manager',ARRAY['MANAGE_STAFF','APPROVE_ACTIONS']),
  ('qa-hobee-internal','qa+employee@qa.hobee.invalid','staff','active','HOBEE Employee',ARRAY[]::text[]);

INSERT INTO public.organization_memberships (organization_id, user_id, member_role, status, title)
SELECT o.id, u.id, m.member_role, m.status, m.title
FROM qa_memberships m JOIN public.organizations o ON o.slug = m.organization_slug JOIN auth.users u ON lower(u.email) = m.email
ON CONFLICT (organization_id, user_id) DO UPDATE SET member_role = EXCLUDED.member_role, status = EXCLUDED.status, title = EXCLUDED.title, updated_at = timezone('utc', now());

DELETE FROM public.organization_member_permissions p
USING public.organization_memberships m JOIN public.organizations o ON o.id = m.organization_id
WHERE p.membership_id = m.id AND o.slug LIKE 'qa-%';

INSERT INTO public.organization_member_permissions (membership_id, permission)
SELECT m.id, granted.permission
FROM qa_memberships q JOIN public.organizations o ON o.slug = q.organization_slug JOIN auth.users u ON lower(u.email) = q.email JOIN public.organization_memberships m ON m.organization_id = o.id AND m.user_id = u.id
CROSS JOIN LATERAL unnest(q.permissions) AS granted(permission)
ON CONFLICT DO NOTHING;

COMMIT;
