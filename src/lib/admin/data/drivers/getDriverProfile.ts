import { createClient } from "@/src/lib/supabase/server";

export type DriverProfileRow = {
  id: string; // user_id
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone_number: string | null;
  role: string | null;
  driver_id: string | null; // id from drivers table
  status: string | null;
  vehicle_type: string | null;
  vehicle_details: any | null;
  is_approved: boolean | null;
  identity_card_url: string | null;
  driver_license_url: string | null;
  background_check_url: string | null;
};

export async function getDriverProfile(
  id: string
): Promise<DriverProfileRow | null> {
  const supabase = await createClient();

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email, phone_number, role")
    .eq("id", id)
    .single();

  if (profileError) {
    console.error("[getDriverProfile] Profile error:", profileError);
    return null;
  }

  // Fetch driver details
  const { data: driver, error: driverError } = await supabase
    .from("drivers")
    .select("id, status, vehicle_type, vehicle_details, is_approved, identity_card_url, driver_license_url, background_check_url")
    .eq("user_id", id)
    .single();

  // It's possible a profile exists but no driver record yet if not fully registered?
  // But likely there should be one if they are in the list.
  // If error is 'PGRST116' (no rows), we just return profile with null driver fields.
  if (driverError && driverError.code !== "PGRST116") {
    console.error("[getDriverProfile] Driver error:", driverError);
  }

  return {
    id: profile.id,
    first_name: profile.first_name,
    last_name: profile.last_name,
    email: profile.email,
    phone_number: profile.phone_number,
    role: profile.role,
    driver_id: driver?.id || null,
    status: driver?.status || null,
    vehicle_type: driver?.vehicle_type || null,
    vehicle_details: driver?.vehicle_details || null,
    is_approved: driver?.is_approved || null,
    identity_card_url: driver?.identity_card_url || null,
    driver_license_url: driver?.driver_license_url || null,
    background_check_url: driver?.background_check_url || null,
  };
}
