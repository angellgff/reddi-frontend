"use server";

import { createClient } from "@/src/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deletePartner(id: string) {
  const supabase = await createClient();

  // Assuming cascade delete is set up in DB for related tables (drivers, products etc).
  // If not, we might need to delete those first or handle soft delete.
  // For now, implementing hard delete on 'partners' table.
  const { error } = await supabase.from("partners").delete().eq("id", id);

  if (error) {
    console.error("Error deleting partner:", error);
    // You might want to throw or return a status to the client to handle errors gracefully
  } else {
    revalidatePath("/admin/aliados");
  }
}
