"use server";

import { createClient } from "@/src/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Database } from "@/src/lib/database.types";

type AppSectionKey = Database["public"]["Enums"]["app_section_key"];

export async function addPlacement(
  partnerId: string,
  sectionKey: AppSectionKey,
  displayOrder?: number,
) {
  const supabase = await createClient();

  // Check if already exists
  const { data: existing } = await supabase
    .from("partner_placements")
    .select("id")
    .eq("partner_id", partnerId)
    .eq("section_key", sectionKey)
    .single();

  if (existing) {
    throw new Error("Partner is already in this section");
  }

  let finalOrder = displayOrder;

  if (finalOrder === undefined) {
    const { data: maxData } = await supabase
      .from("partner_placements")
      .select("display_order")
      .eq("section_key", sectionKey)
      .order("display_order", { ascending: false })
      .limit(1)
      .single();

    finalOrder = (maxData?.display_order ?? 0) + 1;
  }

  const { error } = await supabase.from("partner_placements").insert({
    partner_id: partnerId,
    section_key: sectionKey,
    display_order: finalOrder,
  });

  if (error) {
    console.error("Error adding placement:", error);
    throw new Error("Failed to add placement");
  }

  revalidatePath("/admin/placements");
}

export async function removePlacement(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("partner_placements")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error removing placement:", error);
    throw new Error("Failed to remove placement");
  }

  revalidatePath("/admin/placements");
}

export async function updatePlacementOrder(
  items: { id: string; display_order: number }[],
) {
  const supabase = await createClient();

  // Process updates in parallel or sequence?
  // Parallel for now, Supabase doesn't support bulk update with different values easily in one query via JS SDK unless using upsert

  const updates = items.map((item) =>
    supabase
      .from("partner_placements")
      .update({ display_order: item.display_order })
      .eq("id", item.id),
  );

  const results = await Promise.all(updates);

  const hasError = results.some((r) => r.error);
  if (hasError) {
    console.error("Error reordering placements");
    throw new Error("Failed to reorder placements");
  }

  revalidatePath("/admin/placements");
}
