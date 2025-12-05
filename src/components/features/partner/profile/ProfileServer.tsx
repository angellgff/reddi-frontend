import { createClient } from "@/src/lib/supabase/server";
import getPartnerDataById from "@/src/lib/admin/data/partners/getPartnerDataById";
import ProfileClient from "./ProfileClient";
import { redirect } from "next/navigation";

export default async function ProfileServer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/partner/login");
  }

  const partnerData = await getPartnerDataById(user.id);

  if (!partnerData) {
    // Handle case where partner data is not found, maybe redirect to onboarding or show error
    return <div>No se encontraron datos del perfil.</div>;
  }

  return <ProfileClient partnerId={user.id} partnerData={partnerData} />;
}
