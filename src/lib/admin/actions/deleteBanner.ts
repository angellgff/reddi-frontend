"use server";

import { createClient } from "@/src/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteBanner(id: string) {
  const supabase = await createClient();

  const { data: banner, error: fetchError } = await supabase
    .from("banners")
    .select("id, image_url")
    .eq("id", id)
    .single();

  if (fetchError || !banner) {
    console.error("Error fetching banner before delete:", fetchError);
    throw new Error("No se pudo encontrar el banner.");
  }

  const { error } = await supabase.from("banners").delete().eq("id", id);

  if (error) {
    console.error("Error deleting banner:", error);
    throw new Error("No se pudo eliminar el banner.");
  }

  if (banner.image_url) {
    const marker = "/storage/v1/object/public/banners/";
    const markerIndex = banner.image_url.indexOf(marker);
    if (markerIndex !== -1) {
      const objectPath = decodeURIComponent(
        banner.image_url.substring(markerIndex + marker.length),
      );

      if (objectPath) {
        await supabase.storage.from("banners").remove([objectPath]);
      }
    }
  }

  revalidatePath("/admin/banners");
  revalidatePath("/admin/banners/yacht-section");
}
