"use server";

import { createClient } from "@/src/lib/supabase/server";

export type ExtraOption = {
  optionId: string;
  extraId: string;
  name: string;
  imageUrl: string | null;
  price: number;
  displayOrder: number;
  sectionName?: string;
  sectionRequired?: boolean;
};

export type Section = {
  id: string;
  name: string;
  isRequired: boolean;
  displayOrder: number;
  options: ExtraOption[];
};

export async function getCartItemExtras(productId: string): Promise<Section[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("product_sections")
    .select(
      `id,name,is_required,display_order,
       product_section_options (
         id,override_price,display_order,
         product_extras ( id,name,image_url,default_price )
       )`,
    )
    .eq("product_id", productId)
    .order("display_order", { ascending: true });

  if (error) {
    console.error(`Error fetching extras for product ${productId}:`, error);
    return [];
  }

  if (!data) return [];

  // Transform data to simpler structure
  const mapped: Section[] = data.map((s) => ({
    id: s.id,
    name: s.name,
    isRequired: !!s.is_required,
    displayOrder: s.display_order ?? 0,
    options: (s.product_section_options || [])
      .filter((o) => Boolean(o.product_extras)) // Ensure extra exists
      .map((o) => {
        // Safe casting since we filtered
        const extra = o.product_extras as any;
        const price =
          typeof o.override_price === "number"
            ? Number(o.override_price)
            : Number(extra.default_price ?? 0);

        return {
          optionId: o.id,
          extraId: extra.id,
          name: extra.name,
          imageUrl: extra.image_url ?? null,
          price,
          displayOrder: o.display_order ?? 0,
          sectionName: s.name,
          sectionRequired: !!s.is_required,
        };
      })
      .sort((a, b) => a.displayOrder - b.displayOrder),
  }));

  return mapped;
}
