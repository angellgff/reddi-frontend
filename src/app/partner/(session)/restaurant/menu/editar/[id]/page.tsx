import EditDishWizard from "@/src/components/features/partner/dashboard/menu/editDish/EditDishWizard";
import { getRealDishById } from "@/src/lib/partner/dashboard/data/products/getRealDishByIdData";
import { getPartnerDataForProductForms } from "@/src/lib/partner/dashboard/data/products/getPartnerDataForProductForms";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import EditDishSkeleton from "@/src/components/features/partner/dashboard/menu/editDish/EditDishSkeleton";

export default async function EditDishPage({
  params,
}: {
  // 1. Aquí está el cambio: se define 'params' como una Promise
  params: Promise<{ id: string }>;
}) {
  // Tu uso de 'await' ya era correcto
  const { id } = await params;

  try {
    // 1. Obtener los datos del producto a editar y los datos generales del partner
    const [dishData, partnerData] = await Promise.all([
      getRealDishById({ id }),
      getPartnerDataForProductForms(), // Esta función obtiene subcategorías y extras
    ]);

    if (!partnerData) {
      // Manejar el caso en que no se puedan obtener los datos del partner
      throw new Error("Could not retrieve partner data.");
    }

    return (
      <div className="bg-[#F0F2F5] px-8 py-6 min-h-screen">
        <h1 className="font-semibold">Editar producto</h1>
        <h2 className="font-roboto font-normal mb-5">
          Estás editando: {dishData.name}
        </h2>
        <section className="bg-white p-6 rounded-xl shadow-sm mt-6">
          <Suspense fallback={<EditDishSkeleton />}>
            <EditDishWizard
              dishId={id}
              initialDishData={dishData}
              initialSubCategories={partnerData.subCategories}
              extrasCatalog={partnerData.extras}
            />
          </Suspense>
        </section>
      </div>
    );
  } catch (error) {
    // Si getDishById lanza un error (ej. no encontrado), muestra una página 404
    console.error(`Failed to load data for dish ${id}:`, error);
    notFound();
  }
}
