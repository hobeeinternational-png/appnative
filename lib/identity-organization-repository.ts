import type { User } from "@supabase/supabase-js";

import { loadMyOrganizations } from "./my-hobee-phase2";
import type { MyHobeeOrganizationMembership } from "./my-hobee-phase2";
import { loadMyHobeeSnapshot, loadMyRoles, loadRoleApplications } from "./my-hobee";
import type { MyHobeeRole, MyHobeeRoleApplication, MyHobeeSnapshot } from "./my-hobee";
import { toHobeeIdentityProfile } from "./identity-profile";
import type { HobeeIdentityProfile, HobeeProfileRow } from "./identity-profile";
import { supabase } from "./supabase";

export { toHobeeIdentityProfile } from "./identity-profile";
export type { HobeeIdentityProfile } from "./identity-profile";

export type HobeeIdentityOrganizationContext = {
  profile: HobeeIdentityProfile;
  roles: MyHobeeRole[];
  applications: MyHobeeRoleApplication[];
  memberships: MyHobeeOrganizationMembership[];
};

export type MyHobeeIdentityWorkspace = {
  profile: HobeeIdentityProfile;
  snapshot: MyHobeeSnapshot;
  memberships: MyHobeeOrganizationMembership[];
};

export async function loadHobeeIdentityProfile(user: User): Promise<HobeeIdentityProfile> {
  const { data, error } = await supabase.from("profiles").select("display_name,avatar_url,phone").eq("id", user.id).maybeSingle();
  if (error) throw error;
  return toHobeeIdentityProfile(user, data as HobeeProfileRow | null);
}

export async function loadHobeeIdentityOrganizationContext(user: User): Promise<HobeeIdentityOrganizationContext> {
  const [profile, roles, applications, memberships] = await Promise.all([
    loadHobeeIdentityProfile(user),
    loadMyRoles(user.id),
    loadRoleApplications(user.id),
    loadMyOrganizations(user.id),
  ]);
  return { profile, roles, applications, memberships };
}

export async function loadMyHobeeIdentityWorkspace(user: User): Promise<MyHobeeIdentityWorkspace> {
  const [profile, snapshot, memberships] = await Promise.all([
    loadHobeeIdentityProfile(user),
    loadMyHobeeSnapshot(user.id),
    loadMyOrganizations(user.id),
  ]);
  return { profile, snapshot, memberships };
}
