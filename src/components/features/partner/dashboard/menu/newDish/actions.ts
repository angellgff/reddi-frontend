"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";
import {
  CreateProductPayload,
  CreateDishResult,
  ProductExtra,
  ProductSectionForm,
} from "@/src/lib/partner/productTypes";

// Helper para generar un nombre de archivo único y seguro
const generateUniqueFileName = (originalName: string) => {
  const extension = originalName.split(".").pop() || "jpg";
  return `${crypto.randomUUID()}.${extension}`;
};

// Crear nueva sub-categoría (modal)
export async function createSubCategoryAction(name: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("No autenticado");

  // Obtener partner id
  const { data: partner, error: pErr } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (pErr || !partner) throw new Error("Partner no encontrado");

  const trimmed = name.trim();
  if (!trimmed) throw new Error("Nombre requerido");
  if (trimmed.length > 80) throw new Error("Nombre demasiado largo");

  // Insert con asociación al partner (partner_id es NOT NULL en el esquema)
  const payload: any = {
    name: trimmed,
    partner_id: partner.id,
    // category_id: null, // opcional si luego se soporta categoría padre
  };
  const { data, error } = await supabase
    .from("sub_categories")
    .insert(payload)
    .select("id, name")
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/aliado/menu/nuevo");
  return data; // { id, name }
}

// Crear producto + secciones + opciones
export async function createDishAction(
  formData: FormData
): Promise<CreateDishResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  // 1. Obtener partner_id (sin cambios)
  const { data: partner, error: pErr } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (pErr || !partner) throw new Error("Partner no encontrado");

  // 2. Manejar la subida de la imagen a Supabase Storage
  let imageUrl: string | null = null;
  const imageFile = formData.get("image") as File | null;

  if (imageFile && imageFile.size > 0) {
    const fileName = generateUniqueFileName(imageFile.name);
    // Sube al bucket 'product-images'. ¡Asegúrate de que este bucket exista y sea público!
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(`public/${fileName}`, imageFile);

    if (uploadError) {
      console.error("Supabase Storage Error:", uploadError);
      throw new Error("Error al subir la imagen del producto.");
    }

    // Obtenemos la URL pública para guardarla en la base de datos
    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(uploadData.path);

    imageUrl = publicUrlData.publicUrl;
  }

  // 3. Extraer los datos del producto del FormData
  const productPayload = {
    name: formData.get("name") as string,
    base_price: parseFloat(formData.get("basePrice") as string),
    previous_price: formData.get("previousPrice")
      ? parseFloat(formData.get("previousPrice") as string)
      : null,
    // Asumo que discountPercent se calcula en el cliente o aquí. Lo añadiré por si acaso.
    // discount_percentage: formData.get("discountPercent") ? parseInt(formData.get("discountPercent") as string, 10) : null,
    unit: formData.get("unit") as string,
    // Cambia estimatedTime a estimated_time si así se llama en tu DB
    estimated_time: formData.get("estimatedTimeRange") as string,
    description: formData.get("description") as string,
    sub_category_id: formData.get("subCategoryId") as string,
    is_available: formData.get("isAvailable") === "true",
    tax_included: formData.get("taxIncluded") === "true",
    partner_id: partner.id,
    image_url: imageUrl, // <-- ¡Aquí está la URL de la imagen!
  };

  // 4. Insertar el producto en la tabla 'products'
  const { data: productRow, error: prodErr } = await supabase
    .from("products")
    .insert(productPayload)
    .select("id")
    .single();

  if (prodErr || !productRow)
    throw new Error(prodErr?.message || "Error creando producto");

  const productId = productRow.id;

  // 5. Extraer y procesar las secciones y opciones (sin cambios en la lógica, solo en la fuente de datos)
  const sections: ProductSectionForm[] = JSON.parse(
    formData.get("sections") as string
  );

  if (sections.length) {
    // Insert sections
    const sectionsInsert = sections.map((s, index) => ({
      name: s.name,
      is_required: s.isRequired,
      display_order: index,
      product_id: productId,
    }));
    const { data: sectionsRows, error: secErr } = await supabase
      .from("product_sections")
      .insert(sectionsInsert)
      .select("id, name, display_order");
    if (secErr) throw new Error(secErr.message);

    // ... (El resto de la lógica para las opciones es idéntica)
    const orderToId = new Map<number, string>();
    sectionsRows?.forEach((r) => orderToId.set(r.display_order, r.id));

    const optionsFlatten = sections.flatMap((s, sectionIndex) =>
      s.options
        .filter((o) => o.extraId)
        .map((o, optionIndex) => ({
          section_id: orderToId.get(sectionIndex)!,
          extra_id: o.extraId!,
          // VERSIÓN CORREGIDA Y MÁS SEGURA
          override_price:
            o.overridePrice && o.overridePrice.trim() !== ""
              ? parseFloat(o.overridePrice)
              : null,
          display_order: optionIndex,
        }))
    );
    if (optionsFlatten.length) {
      const { error: optErr } = await supabase
        .from("product_section_options")
        .insert(optionsFlatten);
      if (optErr) throw new Error(optErr.message);
    }
  }

  revalidatePath("/aliado/menu");
  return { productId };
}

// Stub de subida de imagen (por implementar si se requiere en este ciclo)
export async function uploadProductImageAction(
  _productId: string,
  _file: File
) {
  // TODO: Implementar subida a storage y update products.image_url
  return { imageUrl: null };
}

// Crear nuevo extra del partner
export async function createExtraAction({
  name,
  defaultPrice,
  imageFile,
}: {
  name: string;
  defaultPrice: number;
  imageFile?: File | null;
}): Promise<ProductExtra> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  const { data: partner, error: pErr } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (pErr || !partner) throw new Error("Partner no encontrado");
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Nombre requerido");

  // Subida opcional de imagen del extra
  let imageUrl: string | null = null;
  if (imageFile && imageFile.size > 0) {
    const fileName = generateUniqueFileName(imageFile.name);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(`public/extras/${fileName}`, imageFile);
    if (uploadError) {
      console.error("Supabase Storage Error (extra):", uploadError);
      throw new Error("Error al subir la imagen del extra.");
    }
    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(uploadData.path);
    imageUrl = publicUrlData.publicUrl;
  }
  const { data, error } = await supabase
    .from("product_extras")
    .insert({
      name: trimmed,
      default_price: defaultPrice,
      partner_id: partner.id,
      image_url: imageUrl,
    })
    .select("id, name, default_price, image_url, partner_id")
    .single();
  if (error) throw new Error(error.message);
  return {
    id: data.id,
    name: data.name,
    defaultPrice: data.default_price,
    imageUrl: data.image_url,
    partnerId: data.partner_id,
  };
}

export async function updateDishAction(dishId: string, formData: FormData) {
  console.group(
    `\n\n--- 🚀 INICIO DE ACCIÓN: updateDishAction para plato ID: ${dishId} ---`
  );
  console.log(`Timestamp: ${new Date().toISOString()}`);

  const supabase = await createClient();

  // 1. AUTENTICACIÓN Y OBTENCIÓN DE DATOS
  console.group("1. Autenticación y obtención de Partner ID");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.error("❌ ERROR CRÍTICO: No hay usuario autenticado.");
    console.groupEnd();
    console.groupEnd();
    throw new Error("Autenticación requerida.");
  }
  console.log(`Usuario autenticado: ${user.id}`);

  const { data: partner, error: pErr } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (pErr || !partner) {
    console.error(
      "❌ ERROR CRÍTICO: No se pudo encontrar un partner para este usuario.",
      { userId: user.id, dbError: pErr }
    );
    console.groupEnd();
    console.groupEnd();
    throw new Error("Partner no encontrado para este usuario.");
  }
  console.log(`Partner ID obtenido: ${partner.id}`);
  console.groupEnd();

  // 2. PAYLOAD DEL PRODUCTO PRINCIPAL
  console.group("2. Preparando payload para actualizar el producto principal");
  const updatePayload: { [key: string]: any } = {
    name: formData.get("name") as string,
    base_price: parseFloat(formData.get("basePrice") as string),
    description: formData.get("description") as string,
    sub_category_id: formData.get("subCategoryId") as string,
    unit: formData.get("unit") as string,
    estimated_time: formData.get("estimatedTimeRange") as string,
    is_available: formData.get("isAvailable") === "true",
    tax_included: formData.get("taxIncluded") === "true",
    previous_price: formData.get("previousPrice")
      ? parseFloat(formData.get("previousPrice") as string)
      : null,
  };
  console.log("Payload construido (sin imagen):", updatePayload);
  console.groupEnd();

  // 3. MANEJO DE IMAGEN
  console.group("3. Manejando subida de nueva imagen (si existe)");
  const imageFile = formData.get("image") as File | null;
  if (imageFile && imageFile.size > 0) {
    console.log(
      `Nueva imagen detectada: ${imageFile.name}, tamaño: ${imageFile.size} bytes.`
    );
    const fileName = generateUniqueFileName(imageFile.name);
    const filePath = `${partner.id}/${fileName}`;
    console.log(`Intentando subir a la ruta: ${filePath}`);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, imageFile, { upsert: true });

    console.log("Respuesta de Supabase Storage:", { uploadData, uploadError });
    if (uploadError) {
      console.error(
        "❌ ERROR CRÍTICO: Falló la subida de la imagen.",
        uploadError
      );
      console.groupEnd();
      console.groupEnd();
      throw new Error("No se pudo actualizar la imagen del producto.");
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(filePath);
    updatePayload.image_url = publicUrl;
    console.log(`Imagen subida con éxito. URL pública: ${publicUrl}`);
  } else {
    console.log("No se proporcionó una nueva imagen. Se omite este paso.");
  }
  console.groupEnd();

  // 4. ACTUALIZACIÓN DE PRODUCTO PRINCIPAL
  console.group("4. Ejecutando actualización en la tabla 'products'");
  console.log(
    "Enviando el siguiente payload a la tabla 'products':",
    updatePayload
  );
  const { error: updateError } = await supabase
    .from("products")
    .update(updatePayload)
    .eq("id", dishId)
    .eq("partner_id", partner.id);

  console.log(
    "Respuesta de la actualización de 'products'. Error:",
    updateError
  );
  if (updateError) {
    console.error(
      "❌ ERROR CRÍTICO: Falló la actualización del producto principal.",
      updateError
    );
    console.groupEnd();
    console.groupEnd();
    throw new Error("No se pudo guardar los cambios del producto.");
  }
  console.log("✅ Producto principal actualizado con éxito.");
  console.groupEnd();

  // 5. ACTUALIZACIÓN DE SECCIONES Y OPCIONES
  console.group("5. Actualizando Secciones y Opciones (Borrar y Recrear)");
  try {
    const sectionsRaw = formData.get("sections") as string;
    console.log("Datos de secciones recibidos (raw string):", sectionsRaw);
    const sections: ProductSectionForm[] = JSON.parse(sectionsRaw);
    console.log(
      `JSON parseado con éxito. ${sections.length} secciones para procesar.`
    );

    // 5.1. PROCESO DE BORRADO
    console.group("5.1. Borrando datos antiguos");
    const { data: oldSections, error: fetchOldSectionsError } = await supabase
      .from("product_sections")
      .select("id")
      .eq("product_id", dishId);

    console.log(
      "Respuesta de la búsqueda de secciones antiguas. Error:",
      fetchOldSectionsError
    );
    if (fetchOldSectionsError)
      throw new Error(
        `Error buscando secciones antiguas: ${fetchOldSectionsError.message}`
      );

    if (oldSections && oldSections.length > 0) {
      const oldSectionIds = oldSections.map((s) => s.id);
      console.log(
        `Se encontraron ${oldSections.length} secciones antiguas para borrar. IDs:`,
        oldSectionIds
      );

      console.log("Intentando borrar opciones antiguas...");
      const { error: deleteOptErr } = await supabase
        .from("product_section_options")
        .delete()
        .in("section_id", oldSectionIds);
      console.log("Respuesta del borrado de opciones. Error:", deleteOptErr);
      if (deleteOptErr)
        throw new Error(
          `Error borrando opciones antiguas: ${deleteOptErr.message}`
        );
      console.log("✅ Opciones antiguas borradas.");

      console.log("Intentando borrar secciones antiguas...");
      const { error: deleteSecErr } = await supabase
        .from("product_sections")
        .delete()
        .eq("product_id", dishId);
      console.log("Respuesta del borrado de secciones. Error:", deleteSecErr);
      if (deleteSecErr)
        throw new Error(
          `Error borrando secciones antiguas: ${deleteSecErr.message}`
        );
      console.log("✅ Secciones antiguas borradas.");
    } else {
      console.log("No se encontraron secciones antiguas para borrar.");
    }
    console.groupEnd();

    // 5.2. PROCESO DE RE-INSERCIÓN
    console.group("5.2. Re-insertando nuevos datos");
    if (sections && sections.length > 0) {
      const sectionsInsert = sections.map((s, index) => ({
        name: s.name,
        is_required: s.isRequired,
        display_order: index,
        product_id: dishId,
      }));
      console.log("Payload para insertar nuevas secciones:", sectionsInsert);

      const { data: newSectionsRows, error: secErr } = await supabase
        .from("product_sections")
        .insert(sectionsInsert)
        .select("id, display_order");

      console.log("Respuesta de la inserción de secciones. Error:", secErr);
      console.log("Filas de secciones insertadas:", newSectionsRows);
      if (secErr)
        throw new Error(`Error al re-insertar secciones: ${secErr.message}`);
      if (!newSectionsRows)
        throw new Error("La inserción de secciones no devolvió filas.");

      const orderToId = new Map<number, string>();
      newSectionsRows.forEach((r) => orderToId.set(r.display_order, r.id));
      console.log("Mapa de order -> new_id creado:", orderToId);

      const optionsFlatten = sections.flatMap((s, sectionIndex) =>
        s.options
          .filter((o) => o.extraId)
          .map((o, optionIndex) => ({
            section_id: orderToId.get(sectionIndex)!,
            extra_id: o.extraId!,
            override_price:
              o.overridePrice && o.overridePrice.trim() !== ""
                ? parseFloat(o.overridePrice)
                : null,
            display_order: optionIndex,
          }))
      );

      if (optionsFlatten.length > 0) {
        console.log("Payload para insertar nuevas opciones:", optionsFlatten);
        const { error: optErr } = await supabase
          .from("product_section_options")
          .insert(optionsFlatten);
        console.log("Respuesta de la inserción de opciones. Error:", optErr);
        if (optErr)
          throw new Error(`Error al re-insertar opciones: ${optErr.message}`);
        console.log("✅ Opciones nuevas insertadas.");
      } else {
        console.log("No había nuevas opciones para insertar.");
      }
    } else {
      console.log("No hay nuevas secciones para insertar.");
    }
    console.groupEnd();
  } catch (error: any) {
    console.error(
      "❌ ERROR CRÍTICO: Falló el bloque de actualización de secciones/opciones.",
      error
    );
    console.groupEnd();
    console.groupEnd();
    throw new Error(
      `No se pudieron actualizar las secciones y opciones: ${error.message}`
    );
  }
  console.groupEnd();

  // 6. FINALIZACIÓN Y REVALIDACIÓN
  console.group("6. Finalización");
  console.log(
    "Todas las operaciones de base de datos se han ejecutado. Intentando revalidar paths..."
  );
  // Descomenta estas líneas una vez que el problema principal esté resuelto.
  // revalidatePath("/aliado/menu");
  // revalidatePath(`/aliado/menu/editar/${dishId}`);
  console.log("Revalidación (actualmente comentada) omitida.");

  console.log("✅✅✅ ACCIÓN COMPLETADA: Devolviendo objeto de éxito.");
  console.groupEnd();
  console.groupEnd(); // Cierra el grupo principal de la acción

  return { success: true, updatedProductId: dishId };
}

// Eliminar producto (plato) y sus dependencias
export async function deleteDishAction(dishId: string) {
  const supabase = await createClient();

  // 1) Autenticación
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("No autenticado");

  // 2) Obtener partner vinculado al usuario
  const { data: partner, error: pErr } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (pErr || !partner) throw new Error("Partner no encontrado");

  // 3) Traer producto para validar ownership y obtener image_url
  const { data: productRow, error: fetchErr } = await supabase
    .from("products")
    .select("id, partner_id, image_url")
    .eq("id", dishId)
    .single();
  if (fetchErr || !productRow)
    throw new Error(fetchErr?.message || "Producto no encontrado");
  if (productRow.partner_id !== partner.id)
    throw new Error("No autorizado para eliminar este producto");

  // 4) Borrar dependencias: opciones y secciones
  const { data: oldSections, error: fetchSectionsErr } = await supabase
    .from("product_sections")
    .select("id")
    .eq("product_id", dishId);
  if (fetchSectionsErr)
    throw new Error(
      `Error buscando secciones del producto: ${fetchSectionsErr.message}`
    );

  const sectionIds = (oldSections || []).map((s: any) => s.id);
  if (sectionIds.length > 0) {
    const { error: delOptsErr } = await supabase
      .from("product_section_options")
      .delete()
      .in("section_id", sectionIds);
    if (delOptsErr)
      throw new Error(`Error borrando opciones: ${delOptsErr.message}`);

    const { error: delSecsErr } = await supabase
      .from("product_sections")
      .delete()
      .eq("product_id", dishId);
    if (delSecsErr)
      throw new Error(`Error borrando secciones: ${delSecsErr.message}`);
  }

  // 5) Borrar el producto
  const { error: delProdErr } = await supabase
    .from("products")
    .delete()
    .eq("id", dishId)
    .eq("partner_id", partner.id);
  if (delProdErr)
    throw new Error(`Error borrando producto: ${delProdErr.message}`);

  // 6) Intentar borrar la imagen del storage (best-effort)
  const imageUrl: string | null = productRow.image_url;
  if (imageUrl) {
    try {
      // Los publicUrl suelen contener "/object/public/<bucket>/<path>"
      const marker = "/object/public/product-images/";
      const idx = imageUrl.indexOf(marker);
      if (idx !== -1) {
        const storagePath = imageUrl.substring(idx + marker.length);
        if (storagePath) {
          await supabase.storage.from("product-images").remove([storagePath]);
        }
      }
    } catch (e) {
      // No romper por un fallo al borrar imagen
      console.warn("No se pudo eliminar la imagen del storage:", e);
    }
  }

  // 7) Revalidar listado
  revalidatePath("/aliado/menu");

  return { success: true };
}
