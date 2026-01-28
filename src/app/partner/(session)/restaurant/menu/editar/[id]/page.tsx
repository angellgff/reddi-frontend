import EditDishWizard from "@/src/components/features/partner/dashboard/menu/editDish/EditDishWizard";
import { getRealDishById } from "@/src/lib/partner/dashboard/data/products/getRealDishByIdData";
import { getPartnerDataForProductForms } from "@/src/lib/partner/dashboard/data/products/getPartnerDataForProductForms";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import EditDishSkeleton from "@/src/components/features/partner/dashboard/menu/editDish/EditDishSkeleton";
import ProductVariantsManager from "@/src/components/features/partner/dashboard/shared/ProductVariantsManager";
import { createClient } from "@/src/lib/supabase/server";
import { ProductTagDefinition } from "@/src/lib/partner/productTypes";

export default async function EditDishPage({
  params,
}: {
  // 1. Aquí está el cambio: se define 'params' como una Promise
  params: Promise<{ id: string }>;
}) {
  // Tu uso de 'await' ya era correcto
  const { id } = await params;
  const supabase = await createClient();

  try {
    // 1. Obtener los datos del producto a editar y los datos generales del partner
    const [dishData, partnerData] = await Promise.all([
      getRealDishById({ id }),
      getPartnerDataForProductForms(), // Esta función obtiene subcategorías y extras
    ]);

    // Fetch Variants and Groups
    const { data: groupsData } = await supabase
      .from("product_variant_groups")
      .select(
        `
        id,
        name,
        is_required,
        product_variants (
          id,
          name,
          base_price,
          is_available,
          group_id
        )
      `,
      )
      .eq("product_id", id)
      .order("display_order", { ascending: true });

    const formattedGroups = (groupsData || []).map((g) => ({
      id: g.id,
      name: g.name,
      is_required: g.is_required,
      product_variants: (g.product_variants as any[]).map((v) => ({
        id: v.id,
        name: v.name,
        base_price: v.base_price,
        is_available: v.is_available,
        group_id: v.group_id,
      })),
    }));

    // Fetch Tags Definitions
    const { data: tagDefinitions } = await supabase
      .from("product_tag_definitions")
      .select("id, name, icon_key, color")
      .eq("is_active", true)
      .order("name");

    const availableTags: ProductTagDefinition[] = (tagDefinitions || []).map(
      (t) => ({
        id: t.id,
        name: t.name,
        iconKey: t.icon_key,
        color: t.color,
      }),
    );

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
              availableTags={availableTags}
            />
          </Suspense>
        </section>
        <section className="bg-white p-6 rounded-xl shadow-sm mt-6">
          <ProductVariantsManager
            productId={id}
            groups={formattedGroups}
            revalidateUrl={`/partner/restaurant/menu/editar/${id}`}
          />
        </section>
      </div>
    );
  } catch (error) {
    // Si getDishById lanza un error (ej. no encontrado), muestra una página 404
    console.error(`Failed to load data for dish ${id}:`, error);
    notFound();
  }
}
