import EditPartnerProfile from "@/src/components/features/admin/partners/editPartner/EditPartnerProfile";
import getPartnerDataById from "@/src/lib/admin/data/partners/getPartnerDataById";

export default async function EditProfileServer({ id }: { id: string }) {
  const partnerData = await getPartnerDataById(id);
  return <EditPartnerProfile partnerData={partnerData} />;
}
