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
  display_price: number;
  previous_price: number | null;
  discount_percentage: number | null;
  unit: string;
  estimated_time: string;
  tax_included: boolean;
  sections: ProductDetailsSection[];
  variant_groups: {
    id: string;
    name: string;
    is_required: boolean;
    display_order: number;
    description: string | null;
    variants: Array<{
      id: string;
      name: string;
      base_price: number;
      is_available: boolean;
      display_variant_price: number;
    }>;
  }[];
  ungrouped_variants: Array<{
    id: string;
    name: string;
    base_price: number;
    is_available: boolean;
    display_variant_price: number;
  }>;
};

export default async function getProductDetails(
  partnerId: string,
  productId: string,
): Promise<ProductDetails | null> {
  const supabase = await createClient();

  // Updated query with variants
  const { data, error } = await supabase
    .from("products")
    .select(
      `id, partner_id, name, description, image_url, base_price, display_price, previous_price, discount_percentage, unit, estimated_time, tax_included,
      product_sections (id, name, is_required, display_order, product_section_options (id, extra_id, override_price, display_order, product_extras (id, name, default_price, image_url))),
      product_variant_groups (
        id, name, display_order, is_required,
        product_variants (
          id, name, base_price, is_available, display_variant_price
        )
      ),
      product_variants (
         id, name, base_price, is_available, group_id, display_variant_price
       )
      `,
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
    display_price: data.display_price,
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

                // --- Cálculo del precio ajustado (display_price) para el extra ---
                // Se basa en la proporción (display_price / base_price) del producto principal.
                let rawPrice = o.override_price ?? ex?.default_price ?? 0;
                if (data.base_price > 0 && data.display_price > 0) {
                  const multiplier = data.display_price / data.base_price;
                  rawPrice = rawPrice * multiplier;
                }
                const price = Number(rawPrice.toFixed(2));
                // -------------------------------------------------------------

                return {
                  id: o.id,
                  extraId: o.extra_id,
                  name: ex?.name || "Opción",
                  price,
                  imageUrl: ex?.image_url ?? null,
                  displayOrder: o.display_order ?? 0,
                } as ProductDetailsOption;
              },
            )
            .sort(
              (a: ProductDetailsOption, b: ProductDetailsOption) =>
                a.displayOrder - b.displayOrder,
            ),
        }),
      )
      .sort(
        (a: ProductDetailsSection, b: ProductDetailsSection) =>
          a.displayOrder - b.displayOrder,
      ),
    variant_groups: (data.product_variant_groups || [])
      .map((g: any) => ({
        id: g.id,
        name: g.name,
        is_required: g.is_required,
        display_order: g.display_order,
        description: null,
        variants: (g.product_variants || []).map((v: any) => ({
          id: v.id,
          name: v.name,
          base_price: v.base_price,
          is_available: v.is_available,
          display_variant_price: v.display_variant_price,
        })),
      }))
      .sort((a: any, b: any) => a.display_order - b.display_order),
    ungrouped_variants: (data.product_variants || [])
      .filter((v: any) => v.group_id === null)
      .map((v: any) => ({
        id: v.id,
        name: v.name,
        base_price: v.base_price,
        is_available: v.is_available,
        display_variant_price: v.display_variant_price,
      })),
  };

  return details;
}
