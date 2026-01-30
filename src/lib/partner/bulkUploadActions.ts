"use server";

import { createClient } from "@/src/lib/supabase/server";
import { revalidatePath } from "next/cache";
import ExcelJS from "exceljs";
import * as Sentry from "@sentry/nextjs";

type ImportResult = {
  success: boolean;
  count: number;
  errors: string[];
};

export async function importProductsFromExcelAction(
  prevState: any,
  formData: FormData,
): Promise<ImportResult> {
  const file = formData.get("file") as File;
  if (!file) {
    return { success: false, count: 0, errors: ["No file uploaded"] };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, count: 0, errors: ["Unauthorized"] };
  }

  // 1. Get Partner ID
  const { data: partner, error: partnerError } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (partnerError || !partner) {
    return { success: false, count: 0, errors: ["Partner not found"] };
  }

  // 2. Load Subcategories for mapping
  const { data: subCategories } = await supabase
    .from("sub_categories")
    .select("id, name")
    .eq("partner_id", partner.id);

  const subCategoryMap = new Map<string, string>();
  subCategories?.forEach((sc: { id: string; name: string }) => {
    // Guardamos el nombre en minúsculas para comparar fácilmente
    subCategoryMap.set(sc.name.toLowerCase().trim(), sc.id);
  });

  try {
    // 3. Parse Excel
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      return { success: false, count: 0, errors: ["Invalid Excel file"] };
    }

    const productsToInsert: any[] = [];
    const errors: string[] = [];

    // Assuming Row 1 is header
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      // Cells: 1=Name, 2=Description, 3=Price, 4=Unit, 5=Category, 6=TimeRange(opt), 7=PreviousPrice(opt), 8=Image
      const name = row.getCell(1).text?.trim();
      const description = row.getCell(2).text?.trim();

      // --- MANEJO DE PRECIO ---
      // Obtenemos el valor, lo convertimos a string y cambiamos coma por punto
      const rawPriceVal = row.getCell(3).value;
      // Si Excel lo ve como número, value es number. Si es texto "152,50", es string.
      // String(rawPriceVal) lo convierte a texto seguro.
      const priceString = rawPriceVal
        ? String(rawPriceVal).replace(",", ".")
        : "";

      // --- MANEJO DE UNIDAD ---
      // Si está vacía, usamos "Unidad" por defecto
      let unit = row.getCell(4).text?.trim();
      if (!unit || unit === "") {
        unit = "Unidad";
      }

      const categoryName = row.getCell(5).text?.trim();
      const timeRange = row.getCell(6).text?.trim();

      // --- MANEJO PRECIO ANTERIOR ---
      const rawPrevPrice = row.getCell(7).value;
      const prevPriceString = rawPrevPrice
        ? String(rawPrevPrice).replace(",", ".")
        : null;

      const imageUrl = row.getCell(8).text?.trim();

      // VALIDACIÓN: Ya no exigimos 'unit' en el if porque le pusimos un valor por defecto arriba
      if (!name || !priceString || !categoryName) {
        // Skip empty rows completely
        if (!name && !priceString && !categoryName) return;

        const missing = [];
        if (!name) missing.push("Name");
        if (!priceString) missing.push("Price");
        if (!categoryName) missing.push("Category");

        errors.push(
          `Row ${rowNumber}: Missing required fields (${missing.join(", ")})`,
        );
        return;
      }

      const price = parseFloat(priceString);
      if (isNaN(price)) {
        errors.push(`Row ${rowNumber}: Invalid price format (${rawPriceVal})`);
        return;
      }

      let subCategoryId = subCategoryMap.get(categoryName.toLowerCase());
      if (!subCategoryId) {
        errors.push(
          `Row ${rowNumber}: Category "${categoryName}" not found. Please create it first in your dashboard.`,
        );
        return;
      }

      productsToInsert.push({
        name,
        description: description || "",
        base_price: price,
        previous_price: prevPriceString ? parseFloat(prevPriceString) : null,
        unit,
        estimated_time: timeRange || null,
        sub_category_id: subCategoryId,
        partner_id: partner.id,
        is_available: true, // Default
        image_url: imageUrl || null,
      });
    });

    if (productsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("products")
        .insert(productsToInsert);

      if (insertError) {
        console.error("Bulk insert error", insertError);
        return {
          success: false,
          count: 0,
          errors: [...errors, `Database Error: ${insertError.message}`],
        };
      }
    }

    revalidatePath("/partner/market/productos");
    return {
      success: true,
      count: productsToInsert.length,
      errors,
    };
  } catch (err: any) {
    Sentry.captureException(err);
    console.error("Excel processing error", err);
    return { success: false, count: 0, errors: [err.message] };
  }
}

export async function getImportTemplateAction(): Promise<{
  success: boolean;
  base64?: string;
  error?: string;
}> {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Plantilla Productos");

    // Define columns
    worksheet.columns = [
      { header: "Name", key: "name", width: 30 },
      { header: "Description", key: "description", width: 40 },
      { header: "Price", key: "price", width: 15 },
      { header: "Unit", key: "unit", width: 10 },
      { header: "Category", key: "category", width: 25 },
      { header: "TimeRange", key: "timeRange", width: 15 },
      { header: "PreviousPrice", key: "previousPrice", width: 15 },
      { header: "ImageURL", key: "imageUrl", width: 40 },
    ];

    // Add example row
    worksheet.addRow({
      name: "Hamburguesa Clásica",
      description: "Carne de res 200g, lechuga, tomate",
      price: 1500,
      unit: "unidad",
      category: "Comidas Rápidas",
      timeRange: "20-30 min",
      previousPrice: 1800,
      imageUrl: "https://example.com/burger.jpg",
    });

    // Formatting
    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    return { success: true, base64 };
  } catch (error: any) {
    Sentry.captureException(error);
    console.error("Error generating template", error);
    return { success: false, error: error.message };
  }
}
