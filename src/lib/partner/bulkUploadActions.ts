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

type ParsedImportRow = {
  rowNumber: number;
  name: string;
  description: string;
  rawPrice: string;
  unit: string;
  categoryName: string;
  timeRange: string;
  rawPreviousPrice: string | null;
  imageUrl: string;
  rawTags: string;
};

const VALID_MEASUREMENT_UNITS = new Set(["unit", "lb", "kg", "oz", "g"]);

function parseCsvLine(line: string): string[] {
  return line
    .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
    .map((cell) => cell.trim().replace(/^"|"$/g, ""));
}

async function extractRowsFromFile(file: File): Promise<ParsedImportRow[]> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "csv") {
    const text = await file.text();
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length <= 1) return [];

    return lines.slice(1).map((line, index) => {
      const cells = parseCsvLine(line);
      return {
        rowNumber: index + 2,
        name: (cells[0] || "").trim(),
        description: (cells[1] || "").trim(),
        rawPrice: (cells[2] || "").trim(),
        unit: (cells[3] || "").trim(),
        categoryName: (cells[4] || "").trim(),
        timeRange: (cells[5] || "").trim(),
        rawPreviousPrice: cells[6] ? cells[6].trim() : null,
        imageUrl: (cells[7] || "").trim(),
        rawTags: (cells[8] || "").trim(),
      };
    });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as any);

  const worksheet = workbook.getWorksheet(1);
  if (!worksheet) return [];

  const rows: ParsedImportRow[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const rawPriceVal = row.getCell(3).value;
    const rawPrevPrice = row.getCell(7).value;

    rows.push({
      rowNumber,
      name: row.getCell(1).text?.trim() || "",
      description: row.getCell(2).text?.trim() || "",
      rawPrice: rawPriceVal ? String(rawPriceVal).trim() : "",
      unit: row.getCell(4).text?.trim() || "",
      categoryName: row.getCell(5).text?.trim() || "",
      timeRange: row.getCell(6).text?.trim() || "",
      rawPreviousPrice: rawPrevPrice ? String(rawPrevPrice).trim() : null,
      imageUrl: row.getCell(8).text?.trim() || "",
      rawTags: row.getCell(9).text?.trim() || "",
    });
  });

  return rows;
}

function normalizeMeasurementUnit(
  input: string,
): "unit" | "lb" | "kg" | "oz" | "g" {
  const normalized = input.toLowerCase().trim();
  if (normalized === "unidad") return "unit";
  if (VALID_MEASUREMENT_UNITS.has(normalized)) {
    return normalized as "unit" | "lb" | "kg" | "oz" | "g";
  }
  return "unit";
}

function parseTagNames(rawTags: string): string[] {
  if (!rawTags || !rawTags.trim()) return [];
  return rawTags
    .split(/[|,]/)
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

async function attachTagsToInsertedProducts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  insertedProducts: Array<{ id: string }> | null,
  sourceRowsWithTags: Array<{ _rawTags: string }>,
  errors: string[],
) {
  if (!insertedProducts || insertedProducts.length === 0) return;

  const { data: availableTags } = await supabase
    .from("product_tag_definitions")
    .select("id, name");

  const tagMap = new Map<string, string>();
  (availableTags ?? []).forEach((tag: { id: string; name: string }) => {
    tagMap.set(tag.name.toLowerCase().trim(), tag.id);
  });

  const productTagsToInsert: Array<{ product_id: string; tag_id: string }> = [];

  insertedProducts.forEach((inserted, index) => {
    const rawTags = sourceRowsWithTags[index]?._rawTags || "";
    const tagNames = parseTagNames(rawTags);

    tagNames.forEach((tagName) => {
      const tagId = tagMap.get(tagName.toLowerCase());
      if (!tagId) {
        errors.push(
          `Row ${index + 2}: Tag "${tagName}" no existe y fue omitido.`,
        );
        return;
      }
      productTagsToInsert.push({ product_id: inserted.id, tag_id: tagId });
    });
  });

  if (productTagsToInsert.length > 0) {
    const { error: tagsInsertError } = await supabase
      .from("product_tags")
      .insert(productTagsToInsert);

    if (tagsInsertError) {
      errors.push(`Tags Error: ${tagsInsertError.message}`);
    }
  }
}

async function attachSubCategoriesToInsertedProducts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  insertedProducts: Array<{ id: string }> | null,
  sourceRows: Array<{ _subCategoryId?: string | null }>,
  errors: string[],
) {
  if (!insertedProducts || insertedProducts.length === 0) return;

  const links = insertedProducts
    .map((inserted, index) => ({
      product_id: inserted.id,
      sub_category_id: sourceRows[index]?._subCategoryId || null,
    }))
    .filter((item): item is { product_id: string; sub_category_id: string } =>
      Boolean(item.sub_category_id),
    );

  if (links.length === 0) return;

  const { error } = await supabase.from("product_sub_categories").insert(links);

  if (error) {
    errors.push(`Category Link Error: ${error.message}`);
  }
}

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

  const { data: partner, error: partnerError } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (partnerError || !partner) {
    return { success: false, count: 0, errors: ["Partner not found"] };
  }

  const { data: subCategories } = await supabase
    .from("sub_categories")
    .select("id, name")
    .eq("partner_id", partner.id);

  const subCategoryMap = new Map<string, string>();
  subCategories?.forEach((subCategory: { id: string; name: string }) => {
    subCategoryMap.set(subCategory.name.toLowerCase().trim(), subCategory.id);
  });

  try {
    const parsedRows = await extractRowsFromFile(file);
    const productsToInsert: any[] = [];
    const errors: string[] = [];

    parsedRows.forEach((parsedRow) => {
      const {
        rowNumber,
        name,
        description,
        rawPrice,
        unit,
        categoryName,
        timeRange,
        rawPreviousPrice,
        imageUrl,
        rawTags,
      } = parsedRow;

      const priceString = rawPrice ? rawPrice.replace(",", ".") : "";
      const previousPriceString = rawPreviousPrice
        ? rawPreviousPrice.replace(",", ".")
        : null;

      if (!name || !priceString || !categoryName) {
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
        errors.push(`Row ${rowNumber}: Invalid price format (${rawPrice})`);
        return;
      }

      const subCategoryId = subCategoryMap.get(categoryName.toLowerCase());
      if (!subCategoryId) {
        errors.push(
          `Row ${rowNumber}: Category "${categoryName}" not found. Please create it first in your dashboard.`,
        );
        return;
      }

      const measurementUnit = normalizeMeasurementUnit(unit || "unit");

      productsToInsert.push({
        name,
        description: description || "",
        base_price: price,
        previous_price: previousPriceString
          ? parseFloat(previousPriceString)
          : null,
        unit: measurementUnit,
        estimated_time: timeRange || null,
        partner_id: partner.id,
        is_available: true,
        image_url: imageUrl || null,
        _subCategoryId: subCategoryId,
        _rawTags: rawTags,
      });
    });

    if (productsToInsert.length > 0) {
      const rowsToInsert = productsToInsert.map(
        ({ _rawTags, _subCategoryId, ...rest }) => rest,
      );

      const { data: insertedProducts, error: insertError } = await supabase
        .from("products")
        .insert(rowsToInsert)
        .select("id");

      if (insertError) {
        console.error("Bulk insert error", insertError);
        return {
          success: false,
          count: 0,
          errors: [...errors, `Database Error: ${insertError.message}`],
        };
      }

      await attachSubCategoriesToInsertedProducts(
        supabase,
        insertedProducts,
        productsToInsert,
        errors,
      );

      await attachTagsToInsertedProducts(
        supabase,
        insertedProducts,
        productsToInsert,
        errors,
      );
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
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let categoryNames: string[] = [];
    if (user) {
      const { data: partner } = await supabase
        .from("partners")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (partner?.id) {
        const { data: subCategories } = await supabase
          .from("sub_categories")
          .select("name")
          .eq("partner_id", partner.id)
          .order("name", { ascending: true });

        categoryNames = (subCategories ?? [])
          .map((item: { name: string }) => item.name?.trim())
          .filter((name): name is string => Boolean(name));
      }
    }

    if (categoryNames.length === 0) {
      categoryNames = ["Sin categorías (crea categorías en tu dashboard)"];
    }

    const { data: availableTags } = await supabase
      .from("product_tag_definitions")
      .select("name")
      .order("name", { ascending: true });

    const tagNames = (availableTags ?? [])
      .map((tag: { name: string }) => tag.name?.trim())
      .filter((name): name is string => Boolean(name));

    const templateTagNames =
      tagNames.length > 0
        ? tagNames
        : ["Sin etiquetas (crea etiquetas en admin)"];

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Plantilla Productos");
    const unitsWorksheet = workbook.addWorksheet("Unidades");
    const categoriesWorksheet = workbook.addWorksheet("Categorías");
    const tagsWorksheet = workbook.addWorksheet("Etiquetas");

    worksheet.columns = [
      { header: "Name", key: "name", width: 30 },
      { header: "Description", key: "description", width: 40 },
      { header: "Price", key: "price", width: 15 },
      { header: "Unit", key: "unit", width: 10 },
      { header: "Category", key: "category", width: 25 },
      { header: "TimeRange", key: "timeRange", width: 15 },
      { header: "PreviousPrice", key: "previousPrice", width: 15 },
      { header: "ImageURL", key: "imageUrl", width: 40 },
      { header: "Tags", key: "tags", width: 35 },
    ];

    worksheet.addRow({
      name: "Hamburguesa Clásica",
      description: "Carne de res 200g, lechuga, tomate",
      price: 1500,
      unit: "unit",
      category: categoryNames[0],
      timeRange: "20-30min",
      previousPrice: 1800,
      imageUrl: "https://example.com/burger.jpg",
      tags: templateTagNames[0],
    });

    worksheet.getRow(1).font = { bold: true };

    unitsWorksheet.columns = [
      { header: "Unidad", key: "unit", width: 20 },
      { header: "Descripción", key: "description", width: 35 },
    ];
    unitsWorksheet.addRows([
      { unit: "unit", description: "Unidad individual" },
      { unit: "lb", description: "Libra" },
      { unit: "kg", description: "Kilogramo" },
      { unit: "oz", description: "Onza" },
      { unit: "g", description: "Gramo" },
    ]);
    unitsWorksheet.getRow(1).font = { bold: true };

    categoriesWorksheet.columns = [
      { header: "Categoría", key: "category", width: 35 },
    ];
    categoriesWorksheet.addRows(
      categoryNames.map((name) => ({ category: name })),
    );
    categoriesWorksheet.getRow(1).font = { bold: true };

    tagsWorksheet.columns = [{ header: "Etiqueta", key: "tag", width: 35 }];
    tagsWorksheet.addRows(templateTagNames.map((name) => ({ tag: name })));
    tagsWorksheet.getRow(1).font = { bold: true };

    const maxRows = 1000;
    const unitsFormula = "'Unidades'!$A$2:$A$6";
    const categoriesFormula = `'Categorías'!$A$2:$A$${categoryNames.length + 1}`;
    const tagsFormula = `'Etiquetas'!$A$2:$A$${templateTagNames.length + 1}`;

    for (let row = 2; row <= maxRows; row++) {
      worksheet.getCell(`D${row}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [unitsFormula],
        showErrorMessage: true,
        errorTitle: "Unidad inválida",
        error: "Selecciona una unidad de la lista.",
      };

      worksheet.getCell(`E${row}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [categoriesFormula],
        showErrorMessage: true,
        errorTitle: "Categoría inválida",
        error: "Selecciona una categoría de la lista.",
      };

      worksheet.getCell(`I${row}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [tagsFormula],
        showErrorMessage: true,
        errorTitle: "Etiqueta inválida",
        error:
          "Selecciona una etiqueta de la lista. Para varias, sepáralas por | o ,.",
      };
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    return { success: true, base64 };
  } catch (error: any) {
    Sentry.captureException(error);
    console.error("Error generating template", error);
    return { success: false, error: error.message };
  }
}

export async function importDishesFromFileAction(
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

  const { data: partner, error: partnerError } = await supabase
    .from("partners")
    .select("id, partner_type")
    .eq("user_id", user.id)
    .single();

  if (partnerError || !partner) {
    return { success: false, count: 0, errors: ["Partner not found"] };
  }

  if (partner.partner_type !== "restaurant") {
    return {
      success: false,
      count: 0,
      errors: ["Solo restaurantes pueden usar esta importación."],
    };
  }

  const { data: subCategories } = await supabase
    .from("sub_categories")
    .select("id, name")
    .eq("partner_id", partner.id);

  const subCategoryMap = new Map<string, string>();
  subCategories?.forEach((subCategory: { id: string; name: string }) => {
    subCategoryMap.set(subCategory.name.toLowerCase().trim(), subCategory.id);
  });

  try {
    const parsedRows = await extractRowsFromFile(file);
    const productsToInsert: any[] = [];
    const errors: string[] = [];

    parsedRows.forEach((parsedRow) => {
      const {
        rowNumber,
        name,
        description,
        rawPrice,
        unit,
        categoryName,
        timeRange,
        rawPreviousPrice,
        imageUrl,
        rawTags,
      } = parsedRow;

      const priceString = rawPrice ? rawPrice.replace(",", ".") : "";
      const previousPriceString = rawPreviousPrice
        ? rawPreviousPrice.replace(",", ".")
        : null;

      if (!name || !priceString || !categoryName) {
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
        errors.push(`Row ${rowNumber}: Invalid price format (${rawPrice})`);
        return;
      }

      const subCategoryId = subCategoryMap.get(categoryName.toLowerCase());
      if (!subCategoryId) {
        errors.push(
          `Row ${rowNumber}: Category "${categoryName}" not found. Please create it first in your dashboard.`,
        );
        return;
      }

      const measurementUnit = normalizeMeasurementUnit(unit || "unit");

      productsToInsert.push({
        name,
        description: description || "",
        base_price: price,
        previous_price: previousPriceString
          ? parseFloat(previousPriceString)
          : null,
        unit: measurementUnit,
        measurement_unit: measurementUnit,
        min_quantity: 1,
        quantity_step: 1,
        estimated_time: timeRange || "10-20min",
        partner_id: partner.id,
        is_available: true,
        tax_included: false,
        image_url: imageUrl || null,
        _subCategoryId: subCategoryId,
        _rawTags: rawTags,
      });
    });

    if (productsToInsert.length > 0) {
      const rowsToInsert = productsToInsert.map(
        ({ _rawTags, _subCategoryId, ...rest }) => rest,
      );

      const { data: insertedProducts, error: insertError } = await supabase
        .from("products")
        .insert(rowsToInsert)
        .select("id");

      if (insertError) {
        console.error("Dish bulk insert error", insertError);
        return {
          success: false,
          count: 0,
          errors: [...errors, `Database Error: ${insertError.message}`],
        };
      }

      await attachSubCategoriesToInsertedProducts(
        supabase,
        insertedProducts,
        productsToInsert,
        errors,
      );

      await attachTagsToInsertedProducts(
        supabase,
        insertedProducts,
        productsToInsert,
        errors,
      );
    }

    revalidatePath("/partner/restaurant/menu");
    return {
      success: true,
      count: productsToInsert.length,
      errors,
    };
  } catch (err: any) {
    Sentry.captureException(err);
    console.error("Dish import processing error", err);
    return { success: false, count: 0, errors: [err.message] };
  }
}

export async function getDishesImportTemplateAction(): Promise<{
  success: boolean;
  base64?: string;
  error?: string;
}> {
  return getImportTemplateAction();
}
