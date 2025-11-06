"use server";

import { createClient } from "@/src/lib/supabase/server";

export type OrderDetails = {
  orderId: string;
  status:
    | "pending"
    | "preparing"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";
  estimatedTime: string;
  partnerId?: string | null;
  userAddressId?: string | null;
  instructions?: string | null;
  store: {
    name: string;
    logoUrl: string;
  };
  items: {
    id: string;
    name: string;
    description: string;
    price: number;
    quantity: number;
    imageUrl: string;
    extras?: {
      id: string;
      product_extra_id?: string | null;
      name?: string;
      imageUrl?: string | null;
      quantity: number;
      unit_price: number;
    }[];
  }[];
  subtotal: number;
  total: number;
  costs: {
    delivery: number;
    taxes: number;
    tip: number;
    discount: number;
  };
  address: {
    title: string;
    details: string;
  };
};

export default async function getOrderDetailsData(
  id: string
): Promise<OrderDetails> {
  const supabase = await createClient();

  // Query order with partner and items
  const { data, error } = await supabase
    .from("orders")
    .select(
      `id, status, subtotal, shipping_fee, total_amount, tip_amount, discount_amount, scheduled_at, user_address_id, partner_id, instructions,
       partners:partner_id(name, image_url),
       order_detail(id, quantity, unit_price, products:product_id(name, description, image_url), order_detail_extras(id, product_extra_id, quantity, unit_price))`
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Order not found");

  type OrderRow = {
    id: string;
    status:
      | "pending"
      | "preparing"
      | "out_for_delivery"
      | "delivered"
      | "cancelled";
    subtotal: number | null;
    shipping_fee: number | null;
    total_amount: number | null;
    tip_amount: number | null;
    discount_amount: number | null;
    scheduled_at: string | null;
    user_address_id: string | null;
    partner_id: string | null;
    instructions: string | null;
    partners: { name?: string | null; image_url?: string | null } | null;
    order_detail: Array<{
      id: string;
      quantity: number;
      unit_price: number;
      products: {
        name?: string | null;
        description?: string | null;
        image_url?: string | null;
      } | null;
      order_detail_extras?: Array<{
        id: string;
        product_extra_id: string | null;
        quantity: number;
        unit_price: number | null;
      }>;
    }>;
  };

  const row = data as unknown as OrderRow;

  // Items mapping
  let items: OrderDetails["items"] = (row.order_detail ?? []).map((it) => ({
    id: it.id,
    name: it.products?.name ?? "Producto",
    description: it.products?.description ?? "",
    price: it.unit_price ?? 0,
    quantity: it.quantity ?? 0,
    imageUrl: it.products?.image_url ?? "/images/store-logo.png",
    extras: (it.order_detail_extras ?? []).map((ex) => ({
      id: ex.id,
      product_extra_id: ex.product_extra_id ?? null,
      quantity: ex.quantity ?? 0,
      unit_price: ex.unit_price ?? 0,
    })),
  }));

  // Enrich extras with product_extras (name, image_url, default_price)
  try {
    const extraIds = Array.from(
      new Set(
        items
          .flatMap((it) => it.extras ?? [])
          .map((e) => e.product_extra_id)
          .filter((x): x is string => typeof x === "string" && !!x)
      )
    );
    if (extraIds.length > 0) {
      const { data: extrasRows } = await supabase
        .from("product_extras")
        .select("id,name,image_url,default_price")
        .in("id", extraIds);
      const byId = new Map((extrasRows || []).map((r) => [r.id as string, r]));
      items = items.map((it) => ({
        ...it,
        extras: (it.extras ?? []).map((e) => {
          const info = e.product_extra_id ? byId.get(e.product_extra_id) : null;
          return {
            ...e,
            name:
              (info as { name?: string } | null | undefined)?.name ?? e.name,
            imageUrl:
              (info as { image_url?: string | null } | null | undefined)
                ?.image_url ??
              (e as { imageUrl?: string | null })?.imageUrl ??
              null,
            unit_price: Number(
              e.unit_price ||
                (info as { default_price?: number } | null | undefined)
                  ?.default_price ||
                0
            ),
          };
        }),
      }));
    }
  } catch {
    // best-effort enrichment
  }

  // Address
  let addressTitle = "Dirección";
  let addressDetails = "";
  if (data.user_address_id) {
    const { data: addr, error: addrErr } = await supabase
      .from("user_addresses")
      .select("location_type, location_number")
      .eq("id", data.user_address_id)
      .maybeSingle();
    if (addrErr) throw addrErr;
    if (addr) {
      addressTitle = addr.location_type
        ? addr.location_type.charAt(0).toUpperCase() +
          addr.location_type.slice(1)
        : "Dirección";
      addressDetails = addr.location_number
        ? `Ubicación ${addr.location_number}`
        : "Sin detalles";
    }
  }

  // Costs
  // DB column is shipping_fee; map to delivery for UI
  const delivery = row.shipping_fee ?? 0;
  // No hay impuestos explícitos en el esquema, dejar 0 por ahora
  const taxes = 0;
  const tip = data.tip_amount ?? 0;
  const discount = data.discount_amount ?? 0;

  // Store
  const storeName = row.partners?.name ?? "Comercio";
  const storeLogo = row.partners?.image_url ?? "/images/store-logo.png";

  // Estimated time (simple fallback)
  const estimatedTime = data.scheduled_at
    ? new Date(data.scheduled_at).toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "30-40 min";

  return {
    orderId: data.id,
    status: row.status,
    estimatedTime,
    partnerId: row.partner_id,
    userAddressId: row.user_address_id,
    instructions: row.instructions,
    store: {
      name: storeName,
      logoUrl: storeLogo,
    },
    items,
    subtotal:
      row.subtotal ??
      items.reduce((acc, it) => acc + it.price * it.quantity, 0),
    total: row.total_amount ?? 0,
    costs: {
      delivery,
      taxes,
      tip,
      discount,
    },
    address: {
      title: addressTitle,
      details: addressDetails,
    },
  };
}
