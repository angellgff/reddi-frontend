"use server";

import { createClient } from "@/src/lib/supabase/server";

export type OrderDetails = {
  orderId: string;
  estimatedTime: string;
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
      `id, subtotal, delivery_fee, total_amount, tip_amount, discount_amount, scheduled_at, user_address_id,
       partners:partner_id(name, image_url),
       order_detail(id, quantity, unit_price, products:product_id(name, description, image_url))`
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Order not found");

  // Items mapping
  const items = (data.order_detail ?? []).map((it: any) => ({
    id: it.id as string,
    name: it.products?.name ?? "Producto",
    description: it.products?.description ?? "",
    price: it.unit_price ?? 0,
    quantity: it.quantity ?? 0,
    imageUrl: it.products?.image_url ?? "/images/store-logo.png",
  }));

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
  const delivery = data.delivery_fee ?? 0;
  // No hay impuestos explícitos en el esquema, dejar 0 por ahora
  const taxes = 0;
  const tip = data.tip_amount ?? 0;
  const discount = data.discount_amount ?? 0;

  // Store
  const storeName = (data.partners as any)?.name ?? "Comercio";
  const storeLogo =
    (data.partners as any)?.image_url ?? "/images/store-logo.png";

  // Estimated time (simple fallback)
  const estimatedTime = data.scheduled_at
    ? new Date(data.scheduled_at).toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "30-40 min";

  return {
    orderId: data.id,
    estimatedTime,
    store: {
      name: storeName,
      logoUrl: storeLogo,
    },
    items,
    subtotal:
      data.subtotal ??
      items.reduce(
        (acc: number, it: any) => acc + (it.price ?? 0) * (it.quantity ?? 0),
        0
      ),
    total: data.total_amount ?? 0,
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
