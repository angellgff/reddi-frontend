import { notFound } from "next/navigation";
import EditDishWizard from "./EditDishWizard";
// Importa la función correcta que creamos en el paso anterior
import { getRealDishById } from "@/src/lib/partner/dashboard/data/products/getRealDishByIdData";
// Importa la función de ayuda que obtiene los datos del partner
import { getPartnerDataForProductForms } from "@/src/lib/partner/dashboard/data/products/getPartnerDataForProductForms";

export default async function EditDishServer({ id }: { id: string }) {
  try {
    // Usamos Promise.all para cargar los datos del platillo y del partner en paralelo
    const [dishData, partnerData] = await Promise.all([
      getRealDishById({ id }),
      getPartnerDataForProductForms(),
    ]);

    // Si no se pueden obtener los datos del partner, es un error crítico
    if (!partnerData) {
      throw new Error("Could not retrieve partner data for forms.");
    }

    // Pasamos todas las props necesarias al componente cliente
    return (
      <EditDishWizard
        dishId={id}
        initialDishData={dishData}
        initialSubCategories={partnerData.subCategories}
        extrasCatalog={partnerData.extras}
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
