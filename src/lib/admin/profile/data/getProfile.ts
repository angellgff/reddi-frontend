import { requireAdminUser } from "@/src/lib/admin/auth/requireAdmin";

export interface AdminProfileFull {
  id: string;
  email: string | undefined;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  notification_preferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export async function getAdminProfileFull(): Promise<AdminProfileFull> {
  const { supabase, user } = await requireAdminUser();

  // Fetch profile data from 'profiles' table
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, phone_number, email")
    .eq("id", user.id)
    .single();

  // Get metadata for preferences (assuming they are stored there as they are not in profiles table)
  // Defaulting to true/false as appropriate if not set
  type UserMetadata = {
    notifications_email?: boolean;
    notifications_push?: boolean;
    notifications_sms?: boolean;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
  };

  const meta = (user.user_metadata || {}) as UserMetadata;
  const notification_preferences = {
    email: meta.notifications_email ?? true,
    push: meta.notifications_push ?? true,
    sms: meta.notifications_sms ?? false,
  };

  return {
    id: user.id,
    // Prefer profile email, fallback to auth email
    email: profile?.email || user.email,
    first_name: profile?.first_name || meta.first_name || null,
    last_name: profile?.last_name || meta.last_name || null,
    phone_number: profile?.phone_number || meta.phone_number || null,
    notification_preferences,
  };
}
