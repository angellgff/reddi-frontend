"use server";

import { createClient } from "@/src/lib/supabase/server";

export type OrderStepKey =
  | "confirmed"
  | "preparing"
  | "on_the_way"
  | "delivered";

type OrderItem = {
  id: string;
  quantity: number;
  unit_price: number;
  products?: {
    name?: string;
    image_url?: string | null;
    unit?: string;
  } | null;
  extras?: {
    id: string;
    product_extra_id?: string | null;
    name?: string;
    image_url?: string | null;
    quantity: number;
    unit_price: number;
  }[];
};

export type NormalizedOrder = {
  id: string;
  status?: OrderStepKey;
  subtotal?: number | null;
  delivery_fee?: number | null;
  discount_amount?: number | null;
  total_amount?: number | null;
  tip_amount?: number | null;
  instructions?: string | null;
  partner_id?: string | null;
  user_address_id?: string | null;
  user_addresses?: {
    id: string;
    location_type?: string | null;
    location_number?: string | null;
  } | null;
  partners?: {
    name?: string;
    image_url?: string | null;
    address?: string | null;
  } | null;
  order_detail?: OrderItem[];
} | null;

function asRecord(v: unknown): Record<string, unknown> | null {
  return v !== null && typeof v === "object"
    ? (v as Record<string, unknown>)
    : null;
}

function firstObj(v: unknown): Record<string, unknown> | null {
  if (Array.isArray(v)) return asRecord(v[0]);
  return asRecord(v);
}

function normalizeOrder(data: unknown): NormalizedOrder {
  const rec = asRecord(data);
  if (!rec) return null;

  const partnersRec = firstObj(rec["partners"]);
  const partners = partnersRec
    ? {
        name:
          typeof partnersRec["name"] === "string"
            ? (partnersRec["name"] as string)
            : undefined,
        image_url:
          typeof partnersRec["image_url"] === "string"
            ? (partnersRec["image_url"] as string)
            : null,
        address:
          typeof partnersRec["address"] === "string"
            ? (partnersRec["address"] as string)
            : null,
      }
    : null;

  const addrRec = firstObj(rec["user_addresses"]);
  const user_addresses = addrRec
    ? {
        id: String(addrRec["id"] ?? ""),
        location_type:
          typeof addrRec["location_type"] === "string"
            ? (addrRec["location_type"] as string)
            : null,
        location_number:
          typeof addrRec["location_number"] === "string"
            ? (addrRec["location_number"] as string)
            : null,
      }
    : null;

  const od = Array.isArray(rec["order_detail"])
    ? (rec["order_detail"] as unknown[])
    : [];
  const order_detail: OrderItem[] = od
    .map(asRecord)
    .filter((x): x is Record<string, unknown> => !!x)
    .map((it) => {
      const p = asRecord(it["products"]);
      const exArr = Array.isArray(it["order_detail_extras"])
        ? (it["order_detail_extras"] as unknown[])
        : [];
      const extras = exArr
        .map(asRecord)
        .filter((x): x is Record<string, unknown> => !!x)
        .map((ex) => ({
          id: String(ex["id"] ?? ""),
          product_extra_id:
            typeof ex["product_extra_id"] === "string"
              ? (ex["product_extra_id"] as string)
              : null,
          quantity: Number(ex["quantity"] ?? 0),
          unit_price: Number(ex["unit_price"] ?? 0),
        }));
      return {
        id: String(it["id"] ?? ""),
        quantity: Number(it["quantity"] ?? 0),
        unit_price: Number(it["unit_price"] ?? 0),
        products: p
          ? {
              name:
                typeof p["name"] === "string"
                  ? (p["name"] as string)
                  : undefined,
              image_url:
                typeof p["image_url"] === "string"
                  ? (p["image_url"] as string)
                  : null,
              unit:
                typeof p["unit"] === "string"
                  ? (p["unit"] as string)
                  : undefined,
            }
          : undefined,
        extras,
      } as OrderItem;
    });

  return {
    id: String(rec["id"] ?? ""),
    status:
      typeof rec["status"] === "string"
        ? (rec["status"] as OrderStepKey)
        : undefined,
    subtotal:
      typeof rec["subtotal"] === "number" ? (rec["subtotal"] as number) : null,
    delivery_fee:
      typeof rec["shipping_fee"] === "number"
        ? (rec["shipping_fee"] as number)
        : null,
    discount_amount:
      typeof rec["discount_amount"] === "number"
        ? (rec["discount_amount"] as number)
        : null,
    total_amount:
      typeof rec["total_amount"] === "number"
        ? (rec["total_amount"] as number)
        : null,
    tip_amount:
      typeof rec["tip_amount"] === "number"
        ? (rec["tip_amount"] as number)
        : null,
    instructions:
      typeof rec["instructions"] === "string"
        ? (rec["instructions"] as string)
        : null,
    partner_id:
      typeof rec["partner_id"] === "string"
        ? (rec["partner_id"] as string)
        : null,
    user_address_id:
      typeof rec["user_address_id"] === "string"
        ? (rec["user_address_id"] as string)
        : null,
    user_addresses,
    partners,
    order_detail,
  };
}

export async function getOrderDetails(id: string): Promise<NormalizedOrder> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id,status,subtotal,shipping_fee,discount_amount,total_amount,tip_amount,instructions, partner_id, user_address_id, user_addresses(id,location_type,location_number), partners(name,image_url,address), order_detail(id,quantity,unit_price, products(name,image_url,unit), order_detail_extras(id,product_extra_id,quantity,unit_price))"
    )
    .eq("id", id)
    .single();
  if (error) return null;

  let normalized = normalizeOrder(data);
  // Enrich extras with product_extras
  try {
    const extraIds = Array.from(
      new Set(
        (normalized?.order_detail || [])
          .flatMap((it) => it.extras || [])
          .map((e) => e.product_extra_id)
          .filter((x): x is string => typeof x === "string" && !!x)
      )
    );
    if (extraIds.length > 0) {
      const { data: extrasRows } = await supabase
        .from("product_extras")
        .select("id,name,image_url,default_price")
        .in("id", extraIds);
      const byId = new Map((extrasRows || []).map((r) => [r.id, r]));
      normalized = normalized
        ? {
            ...normalized,
            order_detail: (normalized.order_detail || []).map((it) => ({
              ...it,
              extras: (it.extras || []).map((e) => {
                const info = e.product_extra_id
                  ? byId.get(e.product_extra_id)
                  : undefined;
                return {
                  ...e,
                  name: info?.name ?? e.name,
                  image_url: info?.image_url ?? e.image_url ?? null,
                  unit_price: Number(
                    (e.unit_price ?? 0) || info?.default_price || 0
                  ),
                };
              }),
            })),
          }
        : null;
    }
  } catch {
    // ignore enrichment errors
  }
  return normalized;
}
