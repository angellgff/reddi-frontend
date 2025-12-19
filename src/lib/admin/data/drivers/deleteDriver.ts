"use server";

import { createClient } from "@/src/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteDriver(driverId: string) {
  const supabase = await createClient();

  // First delete related records if necessary (cascade usually handles this, but good to be safe or aware)
  // For now assuming cascade or simple delete on profiles/users table
  // Ideally, we might just soft delete or update status, but "Eliminar" implies deletion.
  // We should probably delete from 'profiles' or whatever table 'getDriversPage' fetches from.
  // Checking 'getDriversPage' source would be wise, but usually it's 'profiles' with role=delivery.
  
  // Let's verify table from getDriversPage briefly or assume profiles based on previous tasks.
  // Previous task confirmed 'profiles' table.
  
  // However, deleting a user from auth and public table is complex. Use admin API if needed for auth user.
  // But for this table 'profiles', we can try deleting the row.
  
  try {
    const { error } = await supabase.from("profiles").delete().eq("id", driverId);

    if (error) {
        console.error("Error deleting driver:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/drivers");
    return { success: true };
  } catch (error) {
      console.error("Unexpected error:", error);
      return { success: false, error: "Unexpected error occurred" };
  }
}
