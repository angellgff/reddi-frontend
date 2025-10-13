import { createClient } from "@/src/lib/supabase/server";

export type ProductDetailsOption = {
  id: string; // product_section_options.id
  extraId: string; // product_extras.id
  name: string;
  price: number; // override or default
  imageUrl: string | null;
  displayOrder: number;
};

export type ProductDetailsSection = {
  id: string;
  name: string;
  isRequired: boolean;
  displayOrder: number;
  options: ProductDetailsOption[];
};

export type ProductDetails = {
  id: string;
  partnerId: string;
  name: string;
  description: string | null;
  image_url: string | null;
  base_price: number;
  previous_price: number | null;
  discount_percentage: number | null;
  unit: string;
  estimated_time: string;
  tax_included: boolean;
  sections: ProductDetailsSection[];
};

export default async function getProductDetails(
  partnerId: string,
  productId: string
): Promise<ProductDetails | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `id, partner_id, name, description, image_url, base_price, previous_price, discount_percentage, unit, estimated_time, tax_included,
      product_sections (id, name, is_required, display_order, product_section_options (id, extra_id, override_price, display_order, product_extras (id, name, default_price, image_url)))`
    )
    .eq("id", productId)
    .eq("partner_id", partnerId)
    .single();

  if (error || !data) {
    if (error) console.error("getProductDetails error", error);
    return null;
  }

  const details: ProductDetails = {
    id: data.id,
    partnerId: data.partner_id,
    name: data.name,
    description: data.description,
    image_url: data.image_url,
    base_price: data.base_price,
    previous_price: data.previous_price,
    discount_percentage: data.discount_percentage,
    unit: data.unit,
    estimated_time: data.estimated_time,
    tax_included: data.tax_included,
    sections: (data.product_sections || [])
      .map(
        (s: {
          id: string;
          name: string;
          is_required: boolean;
          display_order: number | null;
          product_section_options?: Array<{
            id: string;
            extra_id: string;
            override_price: number | null;
            display_order: number | null;
            // Some Supabase typings can return object or array for nested relation; accept both and normalize below
            product_extras?:
              | {
                  id: string;
                  name: string;
                  default_price: number;
                  image_url: string | null;
                }
              | Array<{
                  id: string;
                  name: string;
                  default_price: number;
                  image_url: string | null;
                }>
              | null;
          }> | null;
        }) => ({
          id: s.id,
          name: s.name,
          isRequired: !!s.is_required,
          displayOrder: s.display_order ?? 0,
          options: (s.product_section_options || [])
            .map(
              (o: {
                id: string;
                extra_id: string;
                override_price: number | null;
                display_order: number | null;
                product_extras?:
                  | {
                      id: string;
                      name: string;
                      default_price: number;
                      image_url: string | null;
                    }
                  | Array<{
                      id: string;
                      name: string;
                      default_price: number;
                      image_url: string | null;
                    }>
                  | null;
              }) => {
                const ex = Array.isArray(o.product_extras)
                  ? o.product_extras[0]
                  : o.product_extras;
                const price = Number(
                  (o.override_price ?? ex?.default_price ?? 0).toFixed(2)
                );
                return {
                  id: o.id,
                  extraId: o.extra_id,
                  name: ex?.name || "Opción",
                  price,
                  imageUrl: ex?.image_url ?? null,
                  displayOrder: o.display_order ?? 0,
                } as ProductDetailsOption;
              }
            )
            .sort(
              (a: ProductDetailsOption, b: ProductDetailsOption) =>
                a.displayOrder - b.displayOrder
            ),
        })
      )
      .sort(
        (a: ProductDetailsSection, b: ProductDetailsSection) =>
          a.displayOrder - b.displayOrder
      ),
  };

  return details;
}
