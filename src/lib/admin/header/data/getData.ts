import type { PartnerProfile } from "@/src/lib/partner/header/data/getData";
import { requireAdminUser } from "@/src/lib/admin/auth/requireAdmin";

// Returns a profile object compatible with DashboardHeader
export async function getAuthenticatedAdminProfile(): Promise<PartnerProfile> {
  const { supabase, user } = await requireAdminUser();

  // 2) Load profile basics
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, first_name, name, avatar_url")
    .eq("id", user.id)
    .single();

  const meta = user.user_metadata as Record<string, unknown>;
  const appMeta = user.app_metadata as Record<string, unknown>;

  const displayName =
    profile?.full_name ||
    profile?.name ||
    profile?.first_name ||
    meta?.full_name ||
    meta?.name ||
    meta?.first_name ||
    (user.email ? user.email.split("@")[0] : "Administrador");

  const avatarUrl = profile?.avatar_url || meta?.avatar_url || null;
  const role = "admin";

  return {
    id: user.id,
    role,
    business_name: displayName,
    business_image_url: avatarUrl,
  };
}
