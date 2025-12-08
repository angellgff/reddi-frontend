import { getAdminProfileFull } from "@/src/lib/admin/profile/data/getProfile";
import ProfileClient from "@/src/components/features/admin/profile/ProfileClient";

export default async function AdminProfilePage() {
  const profileData = await getAdminProfileFull();

  return <ProfileClient initialData={profileData} />;
}
