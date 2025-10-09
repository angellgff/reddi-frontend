import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import type { PartnerProfile } from "@/src/lib/partner/header/data/getData";

// Returns a profile object compatible with DashboardHeader
export async function getAuthenticatedAdminProfile(): Promise<PartnerProfile> {
  const supabase = await createClient();

  // 1) Session
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect("/admin/login");

  const user = session.user;

  // 2) Load profile basics
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, first_name, name, avatar_url")
    .eq("id", user.id)
    .single();

  const meta = user.user_metadata as any;
  const appMeta = user.app_metadata as any;

  const displayName =
    profile?.full_name ||
    profile?.name ||
    profile?.first_name ||
    meta?.full_name ||
    meta?.name ||
    meta?.first_name ||
    (user.email ? user.email.split("@")[0] : "Administrador");

  const avatarUrl = profile?.avatar_url || meta?.avatar_url || null;
  const role = profile?.role || appMeta?.role || "admin";

  return {
    id: user.id,
    role,
    business_name: displayName,
    business_image_url: avatarUrl,
  };
}
