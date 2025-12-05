import ProfileServer from "@/src/components/features/partner/profile/ProfileServer";
import { Suspense } from "react";
import EditProfileSkeleton from "@/src/components/features/admin/partners/editPartner/EditProfileSkeleton";

export default function ProfilePage() {
  return (
    <Suspense fallback={<EditProfileSkeleton />}>
      <ProfileServer />
    </Suspense>
  );
}
