"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";

export type PartnerMenu = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  isActive: boolean;
  displayOrder: number;
  subCategoryIds: string[];
};

export type PartnerSubCategory = {
  id: string;
  name: string;
  displayOrder: number;
};

export type PartnerMenusData = {
  menus: PartnerMenu[];
  subCategories: PartnerSubCategory[];
};

type UpsertMenuInput = {
  name: string;
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  isActive: boolean;
  subCategoryIds: string[];
};

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
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (partnerError || !partner) {
    throw new Error("Partner no encontrado");
  }

  return { supabase, partnerId: partner.id };
}

function normalizeDays(days: number[]) {
  const valid = Array.from(
    new Set(
      (days || []).filter(
        (day) => Number.isInteger(day) && day >= 0 && day <= 6,
      ),
    ),
  ).sort((a, b) => a - b);

  if (valid.length === 0) {
    throw new Error("Debes seleccionar al menos un dia de la semana");
  }

  return valid;
}

function validateTime(value: string, label: string) {
  if (!/^\d{2}:\d{2}(:\d{2})?$/.test(value)) {
    throw new Error(`Formato invalido para ${label}`);
  }
}

async function validateMenuOwnership(menuId: string, partnerId: string) {
  const { supabase } = await getAuthenticatedPartner();
  const { data: menu } = await supabase
    .from("menus")
    .select("id")
    .eq("id", menuId)
    .eq("partner_id", partnerId)
    .maybeSingle();

  if (!menu) {
    throw new Error("Menu no encontrado");
  }
}

async function replaceMenuSubCategories(
  menuId: string,
  partnerId: string,
  subCategoryIds: string[],
) {
  const { supabase } = await getAuthenticatedPartner();

  const cleanIds = Array.from(new Set(subCategoryIds.filter(Boolean)));

  if (cleanIds.length > 0) {
    const { data: ownedSubCategories, error: subCategoryError } = await supabase
      .from("sub_categories")
      .select("id")
      .eq("partner_id", partnerId)
      .in("id", cleanIds);

    if (subCategoryError) {
      throw new Error(
        subCategoryError.message || "No se pudieron validar subcategorias",
      );
    }

    const ownedIds = new Set((ownedSubCategories || []).map((item) => item.id));
    if (cleanIds.some((id) => !ownedIds.has(id))) {
      throw new Error("Hay subcategorias fuera de tu alcance");
    }
  }

  const { error: deleteError } = await supabase
    .from("menu_sub_categories")
    .delete()
    .eq("menu_id", menuId);

  if (deleteError) {
    throw new Error(
      deleteError.message ||
        "No se pudieron limpiar las subcategorias del menu",
    );
  }

  if (cleanIds.length === 0) return;

  const { error: insertError } = await supabase
    .from("menu_sub_categories")
    .insert(
      cleanIds.map((subCategoryId, index) => ({
        menu_id: menuId,
        sub_category_id: subCategoryId,
        display_order: index + 1,
      })),
    );

  if (insertError) {
    throw new Error(
      insertError.message ||
        "No se pudieron guardar las subcategorias del menu",
    );
  }
}

export async function getPartnerMenusData(): Promise<PartnerMenusData> {
  const { supabase, partnerId } = await getAuthenticatedPartner();

  const { data: menus, error: menusError } = await supabase
    .from("menus")
    .select(
      "id, name, start_time, end_time, days_of_week, is_active, display_order",
    )
    .eq("partner_id", partnerId)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (menusError) {
    throw new Error(menusError.message || "No se pudieron cargar menus");
  }

  const { data: subCategories, error: subCategoriesError } = await supabase
    .from("sub_categories")
    .select("id, name, display_order")
    .eq("partner_id", partnerId)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (subCategoriesError) {
    throw new Error(
      subCategoriesError.message || "No se pudieron cargar subcategorias",
    );
  }

  const menuIds = (menus || []).map((menu) => menu.id);
  const menuSubCategories = menuIds.length
    ? await supabase
        .from("menu_sub_categories")
        .select("menu_id, sub_category_id, display_order")
        .in("menu_id", menuIds)
        .order("display_order", { ascending: true })
    : { data: [], error: null as null | { message: string } };

  if (menuSubCategories.error) {
    throw new Error(
      menuSubCategories.error.message ||
        "No se pudieron cargar relaciones menu-subcategoria",
    );
  }

  const byMenu = new Map<string, string[]>();
  (menuSubCategories.data || []).forEach((item) => {
    const current = byMenu.get(item.menu_id) || [];
    current.push(item.sub_category_id);
    byMenu.set(item.menu_id, current);
  });

  return {
    menus: (menus || []).map((menu) => ({
      id: menu.id,
      name: menu.name,
      startTime: menu.start_time,
      endTime: menu.end_time,
      daysOfWeek: menu.days_of_week || [0, 1, 2, 3, 4, 5, 6],
      isActive: menu.is_active ?? true,
      displayOrder: menu.display_order ?? 0,
      subCategoryIds: byMenu.get(menu.id) || [],
    })),
    subCategories: (subCategories || []).map((subCategory) => ({
      id: subCategory.id,
      name: subCategory.name,
      displayOrder: subCategory.display_order ?? 0,
    })),
  };
}

export async function createMenuAction(input: UpsertMenuInput) {
  const { supabase, partnerId } = await getAuthenticatedPartner();

  const name = input.name?.trim();
  if (!name) throw new Error("Nombre requerido");
  if (name.length > 100) throw new Error("Nombre demasiado largo");

  validateTime(input.startTime, "hora de inicio");
  validateTime(input.endTime, "hora de fin");

  const days = normalizeDays(input.daysOfWeek || []);

  const { data: lastMenu } = await supabase
    .from("menus")
    .select("display_order")
    .eq("partner_id", partnerId)
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = (lastMenu?.display_order ?? 0) + 1;

  const { data: menu, error: createError } = await supabase
    .from("menus")
    .insert({
      partner_id: partnerId,
      name,
      start_time: input.startTime,
      end_time: input.endTime,
      days_of_week: days,
      is_active: input.isActive,
      display_order: nextOrder,
    })
    .select("id")
    .single();

  if (createError || !menu) {
    throw new Error(createError?.message || "No se pudo crear el menu");
  }

  await replaceMenuSubCategories(
    menu.id,
    partnerId,
    input.subCategoryIds || [],
  );

  revalidatePath("/partner/restaurant/menus");
  revalidatePath("/partner/restaurant/menu");

  return { id: menu.id };
}

export async function updateMenuAction(menuId: string, input: UpsertMenuInput) {
  const { supabase, partnerId } = await getAuthenticatedPartner();

  await validateMenuOwnership(menuId, partnerId);

  const name = input.name?.trim();
  if (!name) throw new Error("Nombre requerido");
  if (name.length > 100) throw new Error("Nombre demasiado largo");

  validateTime(input.startTime, "hora de inicio");
  validateTime(input.endTime, "hora de fin");

  const days = normalizeDays(input.daysOfWeek || []);

  const { error: updateError } = await supabase
    .from("menus")
    .update({
      name,
      start_time: input.startTime,
      end_time: input.endTime,
      days_of_week: days,
      is_active: input.isActive,
    })
    .eq("id", menuId)
    .eq("partner_id", partnerId);

  if (updateError) {
    throw new Error(updateError.message || "No se pudo actualizar el menu");
  }

  await replaceMenuSubCategories(menuId, partnerId, input.subCategoryIds || []);

  revalidatePath("/partner/restaurant/menus");
  revalidatePath("/partner/restaurant/menu");
}

export async function deleteMenuAction(menuId: string) {
  const { supabase, partnerId } = await getAuthenticatedPartner();
  await validateMenuOwnership(menuId, partnerId);

  const { error } = await supabase
    .from("menus")
    .delete()
    .eq("id", menuId)
    .eq("partner_id", partnerId);

  if (error) {
    throw new Error(error.message || "No se pudo eliminar el menu");
  }

  revalidatePath("/partner/restaurant/menus");
  revalidatePath("/partner/restaurant/menu");
}

export async function reorderMenusAction(menuIds: string[]) {
  const { supabase, partnerId } = await getAuthenticatedPartner();

  const ids = Array.from(new Set(menuIds.filter(Boolean)));
  if (ids.length === 0) throw new Error("Orden invalido");

  const { data: ownedMenus, error: ownedError } = await supabase
    .from("menus")
    .select("id")
    .eq("partner_id", partnerId)
    .in("id", ids);

  if (ownedError) {
    throw new Error(ownedError.message || "No se pudo validar menus");
  }

  if ((ownedMenus || []).length !== ids.length) {
    throw new Error("Hay menus fuera de tu alcance");
  }

  for (let index = 0; index < ids.length; index += 1) {
    const id = ids[index];
    const { error } = await supabase
      .from("menus")
      .update({ display_order: index + 1 })
      .eq("id", id)
      .eq("partner_id", partnerId);

    if (error) {
      throw new Error(error.message || "No se pudo guardar el orden de menus");
    }
  }

  revalidatePath("/partner/restaurant/menus");
  revalidatePath("/partner/restaurant/menu");
}

export async function reorderMenuSubCategoriesAction(
  menuId: string,
  orderedSubCategoryIds: string[],
) {
  const { partnerId } = await getAuthenticatedPartner();
  await validateMenuOwnership(menuId, partnerId);

  await replaceMenuSubCategories(menuId, partnerId, orderedSubCategoryIds);

  revalidatePath("/partner/restaurant/menus");
  revalidatePath("/partner/restaurant/menu");
}
