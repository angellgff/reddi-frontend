"use server";

import { revalidatePath } from "next/cache";
import { updateDishAction } from "@/src/components/features/partner/dashboard/menu/newDish/actions";

export async function updateMarketProductAction(
  productId: string,
  formData: FormData
) {
  // Reutilizamos la lógica robusta de actualización existente para platos.
  const result = await updateDishAction(productId, formData);

  // Revalidamos rutas específicas de Market
  revalidatePath("/partner/market/productos");
  revalidatePath(`/partner/market/productos/editar/${productId}`);

  return result;
}
