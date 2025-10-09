import { createClient } from "@/src/lib/supabase/server";
import type { Database } from "@/src/lib/database.types";
import type { BusinessFormData } from "@/src/components/features/admin/partners/editPartner/PartnerProfile";

type PartnerRow = Database["public"]["Tables"]["partners"]["Row"];
type SelectedPartnerColumns = Pick<
  PartnerRow,
  | "id"
  | "name"
  | "is_physical"
  | "address"
  | "partner_type"
  | "phone"
  | "billing_email"
  | "business_hours"
  | "image_url"
  | "is_approved"
>;

const defaultHours: BusinessFormData["hours"] = {
  monday: { active: false, opens: "08:00:00", closes: "18:00:00" },
  tuesday: { active: false, opens: "08:00:00", closes: "18:00:00" },
  wednesday: { active: false, opens: "08:00:00", closes: "18:00:00" },
  thursday: { active: false, opens: "08:00:00", closes: "18:00:00" },
  friday: { active: false, opens: "08:00:00", closes: "18:00:00" },
  saturday: { active: false, opens: "08:00:00", closes: "18:00:00" },
};

function mapDbToForm(row: SelectedPartnerColumns): BusinessFormData {
  const hours = (row.business_hours as any) || defaultHours;
  const category =
    row.partner_type === "liquor_store"
      ? ("alcohol" as const)
      : (row.partner_type as any);
  return {
    name: row.name,
    isPhysical: !!row.is_physical,
    address: row.address || "",
    category,
    phone: row.phone || "",
    email: row.billing_email || "",
    hours,
    profileState: !!row.is_approved,
    logo: row.image_url || null,
    document: null,
  };
}

export default async function getPartnerDataById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partners")
    .select(
      "id, name, is_physical, address, partner_type, phone, billing_email, business_hours, image_url, is_approved"
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("getPartnerDataById error", error);
    throw new Error("Aliado no encontrado");
  }

  return mapDbToForm(data as SelectedPartnerColumns);
}
