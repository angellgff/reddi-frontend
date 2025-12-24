"use server";

import { createClient } from "@/src/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deletePartner(id: string) {
  console.log("Attempting to inactivate partner with ID:", id);
  const supabase = await createClient();

  // Soft delete: set is_active to false instead of deleting row.
  const response = await supabase
    .from("partners")
    .update({ is_active: false })
    .eq("id", id);
  console.log("Inactivate partner response:", response);

  const { error } = response;

  if (error) {
    console.error("Error inactivating partner:", error);
    // You might want to throw or return a status to the client to handle errors gracefully
  } else {
    console.log("Partner inactivated successfully, revalidating path");
    revalidatePath("/admin/aliados");
  }
}
