"use server";

import { createClient } from "@/src/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type CreateBannerState = {
  success?: boolean;
  message?: string;
  errors?: {
    [key: string]: string[];
  };
};

export async function createBanner(prevState: CreateBannerState, formData: FormData) {
  console.log("--- Starting createBanner Action ---");
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const categoryId = formData.get("categoryId") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const isActive = formData.get("isActive") === "true";
  const placement = formData.get("placement") as string;

  console.log("FormData received:", {
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
  if (!title || !startDate || !endDate || !imageUrl) {
    console.error("Validation failed: Missing required fields");
    return {
      success: false,
      message: "Faltan campos obligatorios",
    };
  }

  // Validate placement if provided
  if (placement && !['home_top', 'home_middle', 'category_page'].includes(placement)) {
     console.error("Validation failed: Invalid placement");
     return {
        success: false,
        message: "Ubicación del banner inválida",
     };
  }

  // Get current admin user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
      console.error("Auth Error or No User:", authError);
      return { success: false, message: "No autorizado" };
  }

  console.log("Authenticated User ID:", user.id);

  // Fetch admin profile
  const { data: adminData, error: adminError } = await supabase
      .from("admins")
      .select("id")
      .eq("user_id", user.id)
      .single();
  
  if (adminError || !adminData) {
       console.error("Admin Record Fetch Error:", adminError);
       return { success: false, message: "No tienes permisos de administrador" };
  }

  console.log("Admin ID found:", adminData.id);

  const { error } = await supabase.from("banners").insert({
    title,
    description,
    category_id: categoryId || null,
    start_date: startDate,
    end_date: endDate,
    image_url: imageUrl,
    is_active: isActive,
    created_by: adminData.id,
    action_link: actionLink || null, // Optional
    coupon_id: couponId || null,     // Optional
    placement: (placement as any) || null
  });

  if (error) {
    console.error("Error creating banner in DB:", error);
    return {
      success: false,
      message: "Error al crear el banner en la base de datos.",
    };
  }

  console.log("Banner inserted successfully.");

  revalidatePath("/admin/banners");
  
  return {
    success: true,
    message: "Banner creado correctamente",
  };
}
