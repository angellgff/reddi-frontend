"use server";

import { createClient } from "@/src/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateAdminProfile(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autorizado" };
  }

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string; // Ideally split the single name input if needed, or if UI provides separate inputs. Image shows "Nombre" with "Carlos Rodriguez Martinez". I'll assume one input "fullName" or separate. The image shows ONE input for "Datos Personales" -> Name.
  // Wait, the Image shows "Datos Personales" with Label "Carlos Rodriguez Martinez" and Input "Ingresar la información".
  // Actually, the label says "Datos Personales", then a text "Carlos Rodriguez Martinez" (maybe a label?) then an Input?
  // No, the image shows:
  // "Carlos Rodriguez Martinez" (Label? Or the value?)
  // Input: "Ingresar la información"
  // It looks like "Carlos Rodriguez Martinez" is the LABEL for the input? That's weird.
  // Usually it's Label: "Nombre", Value: "Carlos...".
  // Looking at the Figma text dump:
  // "Nombre" -> text "Carlos Rodriguez Martinez" -> no.
  // "Nombre" width 176px.
  // Input group.
  // Let's assume the label is "Nombre" (it appears in the text dump: `/* Nombre */ ... content: 'Nombre'`).
  // The "Carlos Rodriguez Martinez" text in the image might be the *placeholder* or the *current value*?
  // Ah, looking at the image provided in Step 0:
  // Label: "Carlos Rodriguez Martinez" (This looks like the Name of the field?? No, that's a name).
  // Below it: Input "Ingresar la información".
  // Label: "Correo electrónico"
  // Below it: Input "Ingresar la información".
  // Label: "Teléfono"
  // Below it: Input "Ingresar la información".
  // It seems the LABELS are effectively "Name", "Email", "Phone", but in the mockup they put a specific name "Carlos..." as the label? Or maybe the user IS Carlos and that's the title?
  // Actually, look at the second group: "Correo electrónico". That is clearly a generic label.
  // "Teléfono". clearly a generic label.
  // "Carlos Rodriguez Martinez" -> This must be the label for the Name field? That makes no sense.
  // It's more likely the field label IS "Nombre Completo" and the mockup just has "Carlos..." as a placeholder or text?
  // OR, maybe the design has the User's Name as a Section Header?
  // Re-reading CSS Dump:
  // `/* Nombre */ ... color: #292929;`
  // `/* Input */ ... placeholder: Ingresar la información`
  // I will treat it as:
  // Field 1: Name (Label: Nombre)
  // Field 2: Email (Label: Correo electrónico)
  // Field 3: Phone (Label: Teléfono)
  
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;

  // Split Name if possible, or just store in first_name (or use logic).
  // Profiles table has first_name, last_name.
  // safely split
  const nameParts = fullName.trim().split(" ");
  const first_name = nameParts[0];
  const last_name = nameParts.slice(1).join(" ");

  try {
    // Update profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        first_name,
        last_name,
        phone_number: phone,
        email: email, // update generic profile email column
      })
      .eq("id", user.id);

    if (profileError) throw profileError;

    // We do NOT update auth.email here to avoid logout/confirmation complexity unless requested.
    // If user changes email in UI, it updates DB 'profiles' but not login credentials for now?
    // Or should I update auth? I'll stick to profiles for safety unless "functional" implies auth change.
    // Given the prompt "Connect it to the database so it is completely functional", changing email usually means changing login.
    // I'll try to update auth email too.
    
    if (email && email !== user.email) {
       const { error: authError } = await supabase.auth.updateUser({ email });
       if (authError) {
         // handle error (maybe return warning)
         console.error("Auth update error:", authError);
         return { error: "Error updating login email: " + authError.message };
       }
    }

    revalidatePath("/admin/profile");
    return { success: "Perfil actualizado correctamente." };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateNotifications(userId: string, preferences: { email: boolean; push: boolean; sms: boolean }) {
  const supabase = await createClient();
  
  const { error } = await supabase.auth.updateUser({
    data: {
      notifications_email: preferences.email,
      notifications_push: preferences.push,
      notifications_sms: preferences.sms,
    },
  });

  if (error) throw error;
  revalidatePath("/admin/profile");
}

export async function changePassword(prevState: any, formData: FormData) {
    // This would typically be a separate form or modal.
    // Implementation:
    const supabase = await createClient();
    const newPassword = formData.get("newPassword") as string;
    
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) return { error: error.message };
    return { success: "Contraseña actualizada." };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
