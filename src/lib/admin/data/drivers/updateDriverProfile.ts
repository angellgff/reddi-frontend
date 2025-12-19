"use server";

import { createClient } from "@/src/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type UpdateDriverData = {
  phone_number?: string;
  identity_card_url?: string;
  driver_license_url?: string;
  background_check_url?: string;
};

export async function updateDriverProfile(
  userId: string,
  data: UpdateDriverData
) {
  const supabase = await createClient();

  // Update Profile (Phone)
  if (data.phone_number) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ phone_number: data.phone_number })
      .eq("id", userId);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      return { success: false, error: profileError.message };
    }
  }

  // Update Driver (Documents)
  // Check if there are any driver specific fields to update
  const driverFields = {
    identity_card_url: data.identity_card_url,
    driver_license_url: data.driver_license_url,
    background_check_url: data.background_check_url,
  };

  // Filter out undefined values
  const fieldsToUpdate = Object.fromEntries(
    Object.entries(driverFields).filter(([_, v]) => v !== undefined)
  );

  if (Object.keys(fieldsToUpdate).length > 0) {
    const { error: driverError } = await supabase
      .from("drivers")
      .update(fieldsToUpdate)
      .eq("user_id", userId);

    if (driverError) {
      console.error("Error updating driver:", driverError);
      return { success: false, error: driverError.message };
    }
  }

  revalidatePath(`/admin/drivers/profile/${userId}`);
  return { success: true };
}
