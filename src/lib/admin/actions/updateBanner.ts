"use server";

import { createClient } from "@/src/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { uuid } from "@/src/lib/utils";

export type UpdateBannerState = {
  success?: boolean;
  message?: string;
  errors?: {
    [key: string]: string[];
  };
};

export async function updateBanner(
  prevState: UpdateBannerState,
  formData: FormData,
) {
  console.log("--- Starting updateBanner Action ---");
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const categoryId = formData.get("categoryId") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  // imageUrl might be null if not updated, but we handle that logic in the form or here
  const imageUrl = formData.get("imageUrl") as string;
  const imageFile = formData.get("imageFile") as File;
  const isActive = formData.get("isActive") === "true";
  const placement = formData.get("placement") as string;
  const enforceGifOnly = formData.get("enforceGifOnly") === "true";
  const maxFileSizeMbRaw = formData.get("maxFileSizeMb") as string;
  const maxFileSizeMb = Number(maxFileSizeMbRaw || "0");

  console.log("FormData received for update:", {
    id,
    title,
    description,
    categoryId,
    startDate,
    endDate,
    imageUrl,
    isActive,
    placement,
  });

  /* Extract Action fields */
  const actionLink = formData.get("actionLink") as string;
  const couponId = formData.get("couponId") as string;

  /* Basic validation */
  if (!id || !title || !startDate || !endDate) {
    console.error("Validation failed: Missing required fields");
    return {
      success: false,
      message: "Faltan campos obligatorios",
    };
  }

  // Validate placement if provided
  if (
    placement &&
    !["home_top", "search_page", "test_page", "yacht_section"].includes(
      placement,
    )
  ) {
    console.error("Validation failed: Invalid placement");
    return {
      success: false,
      message: "Ubicación del banner inválida",
    };
  }

  // Get current admin user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Auth Error or No User:", authError);
    return { success: false, message: "No autorizado" };
  }

  // Build update object
  const updateData: any = {
    title,
    description,
    category_id: categoryId || null,
    start_date: startDate,
    end_date: endDate,
    is_active: isActive,
    action_link: actionLink || null,
    coupon_id: couponId || null,
    placement: (placement as any) || null,
  };

  // Only update image_url if provided
  if (imageUrl) {
    updateData.image_url = imageUrl;
  }

  if (imageFile && imageFile.size > 0) {
    if (enforceGifOnly && imageFile.type !== "image/gif") {
      return {
        success: false,
        message: "Solo se permiten archivos GIF para este módulo.",
      };
    }

    if (maxFileSizeMb > 0 && imageFile.size > maxFileSizeMb * 1024 * 1024) {
      return {
        success: false,
        message: `El archivo excede el tamaño máximo permitido de ${maxFileSizeMb}MB.`,
      };
    }

    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${uuid()}.${fileExt}`;
    const filePath = `images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("banners")
      .upload(filePath, imageFile);

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      return {
        success: false,
        message: "Error al subir la imagen al servidor.",
      };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("banners").getPublicUrl(filePath);

    updateData.image_url = publicUrl;
  }

  const { error } = await supabase
    .from("banners")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Error updating banner in DB:", error);
    return {
      success: false,
      message: "Error al actualizar el banner en la base de datos.",
    };
  }

  console.log("Banner updated successfully.");

  revalidatePath("/admin/banners");
  revalidatePath("/admin/banners/yacht-section");

  return {
    success: true,
    message: "Banner actualizado correctamente",
  };
}
