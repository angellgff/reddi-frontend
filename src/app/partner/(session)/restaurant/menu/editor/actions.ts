"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";

type SubCategoryVM = {
  id: string;
  name: string;
  imageUrl: string | null;
  displayOrder: number;
};

type ProductVM = {
  id: string;
  name: string;
  imageUrl: string | null;
  subCategoryId: string | null;
  isAvailable: boolean;
  displayOrder: number;
  displayPrice: number;
};

export type MenuEditorInitialData = {
  partner: {
    id: string;
    name: string;
  };
  subCategories: SubCategoryVM[];
  products: ProductVM[];
};

export type SaveMenuOrderInput = {
  subCategoryOrder: string[];
  productOrdersBySubCategory: Record<string, string[]>;
};

async function fallbackReorderProductsSafely(
  supabase: Awaited<ReturnType<typeof createClient>>,
  partnerId: string,
  subCategoryId: string,
  productIds: string[],
) {
  if (productIds.length === 0) return;

  // Evita conflictos de índice único moviendo primero a un rango alto seguro para int4.
  const { data: currentRows, error: currentRowsError } = await supabase
    .from("products")
    .select("display_order")
    .eq("partner_id", partnerId)
    .eq("sub_category_id", subCategoryId);

  if (currentRowsError) {
    throw new Error(
      currentRowsError.message || "No se pudo leer el orden actual",
    );
  }

  const maxCurrentOrder = (currentRows ?? []).reduce(
    (max, row) => Math.max(max, row.display_order ?? 0),
    0,
  );

  const maxInt32 = 2147483647;
  const roomNeeded = productIds.length + 10;
  const offsetBase = Math.min(maxCurrentOrder + 1000, maxInt32 - roomNeeded);

  if (offsetBase <= maxCurrentOrder) {
    throw new Error("No hay rango disponible para aplicar orden temporal");
  }

  for (let index = 0; index < productIds.length; index += 1) {
    const id = productIds[index];
    const { error } = await supabase
      .from("products")
      .update({ display_order: offsetBase + index + 1 })
      .eq("id", id)
      .eq("partner_id", partnerId)
      .eq("sub_category_id", subCategoryId);

    if (error) {
      throw new Error(error.message || "No se pudo aplicar orden temporal");
    }
  }

  for (let index = 0; index < productIds.length; index += 1) {
    const id = productIds[index];
    const { error } = await supabase
      .from("products")
      .update({ display_order: index + 1 })
      .eq("id", id)
      .eq("partner_id", partnerId)
      .eq("sub_category_id", subCategoryId);

    if (error) {
      throw new Error(error.message || "No se pudo aplicar orden final");
    }
  }
}

async function getAuthenticatedPartner() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("No autenticado");
  }

  const { data: partner, error: partnerError } = await supabase
    .from("partners")
    .select("id, name")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (partnerError || !partner) {
    throw new Error("Partner no encontrado");
  }

  return { supabase, partner };
}

export async function getMenuEditorInitialData(): Promise<MenuEditorInitialData> {
  const { supabase, partner } = await getAuthenticatedPartner();

  const { data: subCategories, error: subCategoriesError } = await supabase
    .from("sub_categories")
    .select("id, name, image_url, display_order")
    .eq("partner_id", partner.id)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (subCategoriesError) {
    throw new Error(
      subCategoriesError.message || "No se pudieron cargar categorías",
    );
  }

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(
      "id, name, image_url, display_price, base_price, sub_category_id, is_available, display_order",
    )
    .eq("partner_id", partner.id)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (productsError) {
    throw new Error(productsError.message || "No se pudieron cargar productos");
  }

  return {
    partner: {
      id: partner.id,
      name: partner.name ?? "Mi tienda",
    },
    subCategories: (subCategories ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      imageUrl: item.image_url,
      displayOrder: item.display_order ?? 0,
    })),
    products: (products ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      imageUrl: item.image_url,
      subCategoryId: item.sub_category_id,
      isAvailable: item.is_available ?? false,
      displayOrder: item.display_order ?? 0,
      displayPrice: Number(item.display_price ?? item.base_price ?? 0),
    })),
  };
}

function hasDuplicates(values: string[]) {
  return new Set(values).size !== values.length;
}

export async function saveMenuOrderAction(
  input: SaveMenuOrderInput,
): Promise<{ ok: boolean; message?: string }> {
  try {
    if (!input || !Array.isArray(input.subCategoryOrder)) {
      return { ok: false, message: "Payload inválido" };
    }

    if (input.subCategoryOrder.length === 0) {
      return { ok: false, message: "Debes enviar al menos una subcategoría" };
    }

    if (hasDuplicates(input.subCategoryOrder)) {
      return { ok: false, message: "Subcategorías duplicadas en payload" };
    }

    const { supabase, partner } = await getAuthenticatedPartner();

    const { data: partnerSubCategories, error: subCategoryError } =
      await supabase
        .from("sub_categories")
        .select("id")
        .eq("partner_id", partner.id);

    if (subCategoryError) {
      return { ok: false, message: subCategoryError.message };
    }

    const existingSubCategoryIds = (partnerSubCategories ?? []).map(
      (item) => item.id,
    );
    const payloadSubCategoryIds = input.subCategoryOrder;

    if (existingSubCategoryIds.length !== payloadSubCategoryIds.length) {
      return {
        ok: false,
        message:
          "Debes incluir todas las subcategorías del partner para reordenar.",
      };
    }

    const existingSet = new Set(existingSubCategoryIds);
    if (payloadSubCategoryIds.some((id) => !existingSet.has(id))) {
      return {
        ok: false,
        message: "El payload contiene subcategorías fuera de alcance.",
      };
    }

    const { data: partnerProducts, error: partnerProductsError } =
      await supabase
        .from("products")
        .select("id, sub_category_id")
        .eq("partner_id", partner.id);

    if (partnerProductsError) {
      return { ok: false, message: partnerProductsError.message };
    }

    const productsBySubCategory = new Map<string, string[]>();
    for (const subCategoryId of payloadSubCategoryIds) {
      productsBySubCategory.set(subCategoryId, []);
    }

    for (const product of partnerProducts ?? []) {
      if (!product.sub_category_id) continue;
      if (!productsBySubCategory.has(product.sub_category_id)) continue;
      productsBySubCategory.get(product.sub_category_id)?.push(product.id);
    }

    for (const subCategoryId of payloadSubCategoryIds) {
      const payloadItems =
        input.productOrdersBySubCategory[subCategoryId] ?? [];
      const existingItems = productsBySubCategory.get(subCategoryId) ?? [];

      if (hasDuplicates(payloadItems)) {
        return {
          ok: false,
          message: `Productos duplicados para la subcategoría ${subCategoryId}`,
        };
      }

      if (payloadItems.length !== existingItems.length) {
        return {
          ok: false,
          message: `Debes enviar todos los productos de la subcategoría ${subCategoryId}`,
        };
      }

      const existingProductSet = new Set(existingItems);
      if (payloadItems.some((id) => !existingProductSet.has(id))) {
        return {
          ok: false,
          message: `Hay productos fuera de alcance en la subcategoría ${subCategoryId}`,
        };
      }
    }

    const orderedSubCategoryItems = payloadSubCategoryIds.map((id, index) => ({
      id,
      display_order: index + 1,
    }));

    const { error: reorderSubCategoriesError } = await supabase.rpc(
      "reorder_partner_sub_categories",
      {
        p_partner_id: partner.id,
        p_items: orderedSubCategoryItems,
      },
    );

    if (reorderSubCategoriesError) {
      return {
        ok: false,
        message:
          reorderSubCategoriesError.message ||
          "No se pudo guardar el orden de categorías",
      };
    }

    for (const subCategoryId of payloadSubCategoryIds) {
      const productIds = input.productOrdersBySubCategory[subCategoryId] ?? [];
      if (productIds.length === 0) continue;

      const { error: reorderProductsError } = await supabase.rpc(
        "reorder_partner_products",
        {
          p_partner_id: partner.id,
          p_sub_category_id: subCategoryId,
          p_items: productIds,
        },
      );

      if (reorderProductsError) {
        const isUniqueCollision =
          reorderProductsError.message?.includes(
            "products_partner_subcategory_display_order_uidx",
          ) ?? false;

        if (isUniqueCollision) {
          try {
            await fallbackReorderProductsSafely(
              supabase,
              partner.id,
              subCategoryId,
              productIds,
            );
            continue;
          } catch (fallbackError) {
            return {
              ok: false,
              message:
                fallbackError instanceof Error
                  ? fallbackError.message
                  : "No se pudo guardar el orden de productos",
            };
          }
        }

        return {
          ok: false,
          message:
            reorderProductsError.message ||
            `No se pudo guardar el orden de productos para ${subCategoryId}`,
        };
      }
    }

    revalidatePath("/partner/restaurant/menu");
    revalidatePath("/partner/restaurant/categorias");
    revalidatePath("/partner/restaurant/menu/editor");

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Error inesperado",
    };
  }
}
