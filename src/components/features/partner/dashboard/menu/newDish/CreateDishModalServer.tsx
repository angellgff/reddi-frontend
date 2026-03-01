import { createClient } from "@/src/lib/supabase/server";
import { ProductTagDefinition } from "@/src/lib/partner/productTypes";
import { getPartnerDataForProductForms } from "@/src/lib/partner/dashboard/data/products/getPartnerDataForProductForms";
import NewDishWizard from "./NewDishWizard";
import DishFormModal from "../dishesList/DishFormModal";

interface CreateDishModalServerProps {
  closeHref: string;
  successHref: string;
}

export default async function CreateDishModalServer({
  closeHref,
  successHref,
}: CreateDishModalServerProps) {
  const supabase = await createClient();
  const partnerData = await getPartnerDataForProductForms();

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

  return (
    <DishFormModal title="Crear producto" closeHref={closeHref}>
      <section className="rounded-xl bg-white p-6 shadow-sm">
        {partnerData ? (
          <NewDishWizard
            initialSubCategories={partnerData.subCategories}
            extrasCatalog={partnerData.extras}
            availableTags={availableTags}
            mode="modal"
            closeHref={closeHref}
            successHref={successHref}
          />
        ) : (
          <p className="text-sm text-gray-500">
            No se pudo cargar la información del formulario.
          </p>
        )}
      </section>
    </DishFormModal>
  );
}
