"use server";

import { createClient } from "@/src/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateAdminProfile(prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autorizado" };
  }

  // Variables firstName and lastName were unused and removed.
  
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
  } catch (err: unknown) { // Fix: use unknown instead of any
    return { error: (err as Error).message };
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

export async function changePassword(prevState: unknown, formData: FormData) {
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
