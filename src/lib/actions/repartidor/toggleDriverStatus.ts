"use server";

import { createClient } from "@/src/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleDriverStatus(newStatus: "online" | "offline") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No authenticated user" };
  }

  const { error } = await supabase
    .from("drivers")
    .update({ status: newStatus })
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating driver status:", error);
    return { error: "Failed to update status" };
  }

  revalidatePath("/repartidor/historial");
  return { success: true };
}
