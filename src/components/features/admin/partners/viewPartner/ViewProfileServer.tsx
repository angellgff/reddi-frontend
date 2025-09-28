import ViewPartnerProfile from "@/src/components/features/admin/partners/viewPartner/ViewPartnerProfile";
import getPartnerDataById from "@/src/lib/admin/data/partners/getPartnerDataById";

export default async function ViewProfileServer({ id }: { id: string }) {
  const partnerData = await getPartnerDataById(id);
  return <ViewPartnerProfile formData={partnerData} />;
}
