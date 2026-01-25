"use server";

import { createClient } from "@/src/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const CategorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  image: z.instanceof(File, { message: "La imagen es requerida" }).optional(),
});

export async function createCategory(prevState: any, formData: FormData) {
  const supabase = await createClient();

  // 1. Check Auth (Admin)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autorizado" };
  }

  // 2. Validate Input
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const imageFile = formData.get("image") as File;

  if (!name) {
      return { error: "El nombre es requerido" };
  }
  if (!imageFile || imageFile.size === 0) {
      return { error: "La imagen es requerida" };
  }

  // 3. Upload Image
  let imageUrl = "";
  try {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("categories") // Asumimos bucket 'categories'
      .upload(filePath, imageFile, {
        upsert: false,
      });

    if (uploadError) {
        // Fallback to 'public' bucket if 'categories' doesn't exist
        console.error("Upload error to categories bucket:", uploadError);
         return { error: "Error subiendo la imagen: " + uploadError.message };
    }

    const { data: { publicUrl } } = supabase.storage
      .from("categories")
      .getPublicUrl(filePath);
      
    imageUrl = publicUrl;

  } catch (error) {
    return { error: "Error procesando la imagen" };
  }

  // 4. Insert into DB
  const { error: insertError } = await supabase.from("categories").insert({
    name,
    description: description || null,
    image_url: imageUrl,
    is_active: true,
  });

  if (insertError) {
    return { error: "Error creando la categoría: " + insertError.message };
  }

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}


export async function deleteCategory(id: string) {
    const supabase = await createClient();
    
    // Check Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "No autorizado" };

    const { error } = await supabase.from("categories").delete().eq("id", id);
    
    if (error) {
        return { error: error.message };
    }

    revalidatePath("/admin/categories");
}
