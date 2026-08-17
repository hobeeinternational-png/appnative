export type HobeeAuthIdentity = {
  id: string;
  email?: string | null;
  phone?: string | null;
  email_confirmed_at?: string | null;
  phone_confirmed_at?: string | null;
  user_metadata?: Record<string, unknown>;
};

export type HobeeIdentityProfile = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  email: string | null;
  phone: string | null;
  accountStatus: "active" | "unconfirmed";
};

export type HobeeProfileRow = { display_name: string | null; avatar_url: string | null; phone: string | null };

function metadataName(user: HobeeAuthIdentity) {
  const metadata = user.user_metadata ?? {};
  const values = [metadata.display_name, metadata.full_name, metadata.name];
  return values.find((value) => typeof value === "string" && value.trim().length > 0) as string | undefined;
}

export function toHobeeIdentityProfile(user: HobeeAuthIdentity, row: HobeeProfileRow | null): HobeeIdentityProfile {
  const displayName = row?.display_name?.trim() || metadataName(user)?.trim() || "บัญชี HOBEE ของคุณ";
  return {
    id: user.id,
    displayName,
    avatarUrl: row?.avatar_url ?? null,
    email: user.email ?? null,
    phone: row?.phone ?? user.phone ?? null,
    accountStatus: user.email_confirmed_at || user.phone_confirmed_at ? "active" : "unconfirmed",
  };
}
