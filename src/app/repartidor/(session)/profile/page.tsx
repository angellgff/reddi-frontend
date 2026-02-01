import { createClient } from "@/src/lib/supabase/server";
import ProfilePageClient from "./ProfilePageClient";

export default async function RepartidorProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Cargando...</div>;
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <ProfilePageClient
      firstName={profile?.first_name || ""}
      lastName={profile?.last_name || ""}
      email={user.email || ""}
      avatarUrl={profile?.avatar_url}
    />
  );
}
