import { createClient } from "@/src/lib/supabase/server";
import { ProductTagDefinition } from "@/src/lib/partner/productTypes";
import { getRealDishById } from "@/src/lib/partner/dashboard/data/products/getRealDishByIdData";
import { getPartnerDataForProductForms } from "@/src/lib/partner/dashboard/data/products/getPartnerDataForProductForms";
import ProductVariantsManager from "../../shared/ProductVariantsManager";
import EditDishWizard from "./EditDishWizard";
import DishFormModal from "../dishesList/DishFormModal";

interface EditDishModalServerProps {
  id: string;
  closeHref: string;
  successHref: string;
}

export default async function EditDishModalServer({
  id,
  closeHref,
  successHref,
}: EditDishModalServerProps) {
  const supabase = await createClient();

  const [dishData, partnerData, groupsResult, tagsResult] = await Promise.all([
    getRealDishById({ id }),
    getPartnerDataForProductForms(),
    supabase
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
      .order("display_order", { ascending: true }),
    supabase
      .from("product_tag_definitions")
      .select("id, name, icon_key, color")
      .eq("is_active", true)
      .order("name"),
  ]);

  const availableTags: ProductTagDefinition[] = (tagsResult.data || []).map(
    (t) => ({
      id: t.id,
      name: t.name,
      iconKey: t.icon_key,
      color: t.color,
    }),
  );

  const formattedGroups = (groupsResult.data || []).map((g) => ({
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

  return (
    <DishFormModal
      title={`Editar producto: ${dishData.name}`}
      closeHref={closeHref}
    >
      {partnerData ? (
        <>
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <EditDishWizard
              dishId={id}
              initialDishData={dishData}
              initialSubCategories={partnerData.subCategories}
              extrasCatalog={partnerData.extras}
              availableTags={availableTags}
              mode="modal"
              closeHref={closeHref}
              successHref={successHref}
            />
          </section>

          <section className="mt-6 rounded-xl bg-white p-6 shadow-sm">
            <ProductVariantsManager
              productId={id}
              groups={formattedGroups}
              revalidateUrl="/partner/restaurant/menu"
            />
          </section>
        </>
      ) : (
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            No se pudo cargar la información del formulario.
          </p>
        </section>
      )}
    </DishFormModal>
  );
}
