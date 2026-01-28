import { notFound } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import EditDishWizard from "./EditDishWizard";
// Importa la función correcta que creamos en el paso anterior
import { getRealDishById } from "@/src/lib/partner/dashboard/data/products/getRealDishByIdData";
// Importa la función de ayuda que obtiene los datos del partner
import { getPartnerDataForProductForms } from "@/src/lib/partner/dashboard/data/products/getPartnerDataForProductForms";

export default async function EditDishServer({ id }: { id: string }) {
  try {
    const supabase = await createClient(); // Need supabase client for tags

    // Usamos Promise.all para cargar los datos del platillo, del partner y los tags en paralelo
    const [dishData, partnerData, tagsResult] = await Promise.all([
      getRealDishById({ id }),
      getPartnerDataForProductForms(),
      supabase
        .from("product_tag_definitions")
        .select("id, name, icon_key, color")
        .eq("is_active", true)
        .order("name"),
    ]);

    // Si no se pueden obtener los datos del partner, es un error crítico
    if (!partnerData) {
      throw new Error("Could not retrieve partner data for forms.");
    }

    const availableTags = (tagsResult.data || []).map((t) => ({
      id: t.id,
      name: t.name,
      iconKey: t.icon_key,
      color: t.color,
    }));

    // Pasamos todas las props necesarias al componente cliente
    return (
      <EditDishWizard
        dishId={id}
        initialDishData={dishData}
        initialSubCategories={partnerData.subCategories}
        extrasCatalog={partnerData.extras}
        availableTags={availableTags}
      />
    );
  } catch (error) {
    // Si getDishById lanza un error (ej. no encontrado), muestra una página 404
    console.error(
      `Failed to load data for dish ${id} in EditDishServer:`,
      error
    );
    notFound();
  }
}
