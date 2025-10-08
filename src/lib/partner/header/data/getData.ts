// src/lib/data/partner.ts

import { createClient } from "@/src/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Definimos una interfaz para la forma de nuestros datos
export interface PartnerProfile {
  id: string;
  role: string;
  business_name: string;
  business_image_url: string | null;
}

export async function getAuthenticatedPartnerProfile(): Promise<PartnerProfile> {
  const cookieStore = cookies();
  const supabase = await createClient();

  // 1. Obtener la sesión del usuario
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // Si no hay sesión, redirigir al login
    redirect("/aliado/login"); // Ajusta la ruta a tu página de login de socios
  }

  const userId = session.user.id;

  // 2. Consultar las tablas 'profiles' y 'partners' para obtener la información completa
  // Usamos la sintaxis de Supabase para hacer un "join" implícito
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      role,
      partners (
        name,
        image_url
      )
    `
    )
    .eq("id", userId)
    .single();

  console.log(
    "///////////////////////////////////////////////////////////Fetched partner profile data:",
    { data, error }
  );
  if (error || !data) {
    console.error("Error fetching partner profile:", error);
    // Si no se encuentra el perfil, podría ser un estado inconsistente.
    // Redirigir o manejar el error como prefieras.
    redirect("/aliado/login");
  }

  // 3. Formatear y devolver los datos en una estructura clara
  // El resultado de la consulta anidada está en 'data.partners'
  const partnerData = Array.isArray(data.partners)
    ? data.partners[0]
    : data.partners;

  return {
    id: userId,
    role: data.role,
    business_name: partnerData?.name || "Nombre no disponible",
    business_image_url: partnerData?.image_url || null,
  };
}
