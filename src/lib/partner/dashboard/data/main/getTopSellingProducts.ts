import { createClient } from "@/src/lib/supabase/server";
import { formatCurrency } from "@/src/lib/utils";
import { z } from "zod";

type TopSellingProduct = {
  id: string;
  name: string;
  category: string;
  amount: string;
  sales: string;
  growth: string;
  unitsSold: number;
  grossAmount: number;
};

const orderRowSchema = z.object({
  id: z.string().uuid(),
});

const detailRowSchema = z.object({
  product_id: z.string().uuid().nullable(),
  quantity: z.number().finite().min(0).max(100000),
  unit_price: z.number().finite().min(0).max(1000000000),
});

const productRowSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  category_id: z.string().uuid().nullable(),
  sub_category_id: z.string().uuid().nullable(),
});

type Aggregate = {
  units: number;
  amount: number;
};

const DAYS_CURRENT_WINDOW = 30;
const MAX_ORDERS = 500;
const MAX_DETAILS = 5000;
const MAX_PRODUCTS = 25;

function startOfUTCDateDaysAgo(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString();
}

function computeGrowth(current: number, previous: number): string {
  if (previous <= 0 && current <= 0) return "+0%";
  if (previous <= 0) return "+100%";
  const growth = ((current - previous) / previous) * 100;
  const rounded = Math.round(growth);
  return `${rounded >= 0 ? "+" : ""}${rounded}%`;
}

async function getPartnerId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, partnerId: null };

  const { data: partner } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  return { supabase, partnerId: partner?.id ?? null };
}

async function getDeliveredOrderIds(
  sinceIso: string,
  supabase: Awaited<ReturnType<typeof createClient>>,
  partnerId: string,
) {
  const { data, error } = await supabase
    .from("orders")
    .select("id")
    .eq("partner_id", partnerId)
    .eq("status", "delivered")
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: false })
    .limit(MAX_ORDERS);

  if (error || !data?.length) return [];

  return data
    .map((row) => orderRowSchema.safeParse(row))
    .filter((parsed) => parsed.success)
    .map((parsed) => parsed.data.id);
}

async function aggregateSalesByProduct(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orderIds: string[],
): Promise<Map<string, Aggregate>> {
  if (!orderIds.length) return new Map();

  const { data, error } = await supabase
    .from("order_detail")
    .select("product_id, quantity, unit_price")
    .in("order_id", orderIds)
    .limit(MAX_DETAILS);

  if (error || !data?.length) return new Map();

  const aggregateMap = new Map<string, Aggregate>();

  for (const row of data) {
    const parsed = detailRowSchema.safeParse(row);
    if (!parsed.success) continue;
    if (!parsed.data.product_id) continue;

    const current = aggregateMap.get(parsed.data.product_id) || {
      units: 0,
      amount: 0,
    };

    current.units += parsed.data.quantity;
    current.amount += parsed.data.quantity * parsed.data.unit_price;
    aggregateMap.set(parsed.data.product_id, current);
  }

  return aggregateMap;
}

async function fetchProductsMeta(
  supabase: Awaited<ReturnType<typeof createClient>>,
  partnerId: string,
  productIds: string[],
) {
  if (!productIds.length) {
    return {
      productsById: new Map<string, z.infer<typeof productRowSchema>>(),
      categoriesById: new Map<string, string>(),
      subCategoriesById: new Map<string, string>(),
    };
  }

  const { data: productsData } = await supabase
    .from("products")
    .select("id, name, category_id, sub_category_id")
    .eq("partner_id", partnerId)
    .in("id", productIds)
    .limit(productIds.length);

  const validProducts = (productsData || [])
    .map((row) => productRowSchema.safeParse(row))
    .filter((parsed) => parsed.success)
    .map((parsed) => parsed.data);

  const productsById = new Map(
    validProducts.map((product) => [product.id, product]),
  );

  const categoryIds = Array.from(
    new Set(
      validProducts.map((product) => product.category_id).filter(Boolean),
    ),
  ) as string[];

  const subCategoryIds = Array.from(
    new Set(
      validProducts.map((product) => product.sub_category_id).filter(Boolean),
    ),
  ) as string[];

  const [categoriesResult, subCategoriesResult] = await Promise.all([
    categoryIds.length
      ? supabase.from("categories").select("id, name").in("id", categoryIds)
      : Promise.resolve({ data: [], error: null }),
    subCategoryIds.length
      ? supabase
          .from("sub_categories")
          .select("id, name")
          .in("id", subCategoryIds)
          .eq("partner_id", partnerId)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const categoriesById = new Map(
    (categoriesResult.data || [])
      .filter(
        (row): row is { id: string; name: string } =>
          typeof row?.id === "string" && typeof row?.name === "string",
      )
      .map((row) => [row.id, row.name]),
  );

  const subCategoriesById = new Map(
    (subCategoriesResult.data || [])
      .filter(
        (row): row is { id: string; name: string } =>
          typeof row?.id === "string" && typeof row?.name === "string",
      )
      .map((row) => [row.id, row.name]),
  );

  return { productsById, categoriesById, subCategoriesById };
}

export default async function getTopSellingProducts(): Promise<
  TopSellingProduct[]
> {
  const { supabase, partnerId } = await getPartnerId();
  if (!partnerId) return [];

  const currentSince = startOfUTCDateDaysAgo(DAYS_CURRENT_WINDOW);
  const previousWindowEnd = currentSince;
  const previousWindowStart = startOfUTCDateDaysAgo(DAYS_CURRENT_WINDOW * 2);

  const [currentOrderIds, previousOrderIds] = await Promise.all([
    getDeliveredOrderIds(currentSince, supabase, partnerId),
    (async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id")
        .eq("partner_id", partnerId)
        .eq("status", "delivered")
        .gte("created_at", previousWindowStart)
        .lt("created_at", previousWindowEnd)
        .order("created_at", { ascending: false })
        .limit(MAX_ORDERS);

      if (error || !data?.length) return [] as string[];

      return data
        .map((row) => orderRowSchema.safeParse(row))
        .filter((parsed) => parsed.success)
        .map((parsed) => parsed.data.id);
    })(),
  ]);

  if (!currentOrderIds.length) return [];

  const [currentAggregates, previousAggregates] = await Promise.all([
    aggregateSalesByProduct(supabase, currentOrderIds),
    aggregateSalesByProduct(supabase, previousOrderIds),
  ]);

  const sortedCurrent = Array.from(currentAggregates.entries())
    .sort((a, b) => {
      if (b[1].units !== a[1].units) return b[1].units - a[1].units;
      return b[1].amount - a[1].amount;
    })
    .slice(0, MAX_PRODUCTS);

  const productIds = sortedCurrent.map(([productId]) => productId);
  const { productsById, categoriesById, subCategoriesById } =
    await fetchProductsMeta(supabase, partnerId, productIds);

  return sortedCurrent
    .map(([productId, aggregate]) => {
      const product = productsById.get(productId);
      if (!product) return null;

      const previous = previousAggregates.get(productId);
      const categoryName =
        (product.sub_category_id &&
          subCategoriesById.get(product.sub_category_id)) ||
        (product.category_id && categoriesById.get(product.category_id)) ||
        "Sin categoría";

      return {
        id: product.id,
        name: product.name,
        category: categoryName,
        amount: formatCurrency(aggregate.amount),
        sales: `${Math.round(aggregate.units)} ventas`,
        growth: computeGrowth(aggregate.amount, previous?.amount || 0),
        unitsSold: aggregate.units,
        grossAmount: aggregate.amount,
      } satisfies TopSellingProduct;
    })
    .filter((row): row is TopSellingProduct => Boolean(row))
    .slice(0, 5);
}
