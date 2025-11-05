"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/src/lib/supabase/client";

function currency(n: number | null | undefined) {
  const v = typeof n === "number" && isFinite(n) ? n : 0;
  return v.toLocaleString("es-MX", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

const ORDER_STEPS = [
  { key: "confirmed", label: "Confirmado" },
  { key: "preparing", label: "Preparando" },
  { key: "on_the_way", label: "En camino" },
  { key: "delivered", label: "Entregado" },
] as const;

type OrderStepKey = (typeof ORDER_STEPS)[number]["key"];

type DeliveryInfo = {
  assigned: boolean;
  name?: string;
  avatar_url?: string | null;
  phone?: string | null;
};

type MinimalProfile = {
  id?: string;
  full_name?: string;
  name?: string;
  first_name?: string;
  email?: string;
  avatar_url?: string | null;
  phone?: string | null;
};

type OrderItem = {
  id: string;
  quantity: number;
  unit_price: number;
  products?: {
    name?: string;
    image_url?: string | null;
    unit?: string;
  } | null;
};

type OrderData = {
  id: string;
  status?: OrderStepKey;
  subtotal?: number | null;
  delivery_fee?: number | null;
  discount_amount?: number | null;
  total_amount?: number | null;
  tip_amount?: number | null;
  instructions?: string | null;
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

function displayName(user: MinimalProfile | null | undefined): string {
  const emailPrefix =
    typeof user?.email === "string" ? user.email.split("@")[0] : "";
  return (
    user?.full_name ||
    user?.name ||
    user?.first_name ||
    emailPrefix ||
    "Repartidor"
  );
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v !== null && typeof v === "object"
    ? (v as Record<string, unknown>)
    : null;
}

function firstObj(v: unknown): Record<string, unknown> | null {
  if (Array.isArray(v)) return asRecord(v[0]);
  return asRecord(v);
}

function normalizeOrder(data: unknown): OrderData {
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
      typeof rec["delivery_fee"] === "number"
        ? (rec["delivery_fee"] as number)
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
    user_addresses,
    partners,
    order_detail,
  };
}

export default function OrderStatusPage() {
  const params = useParams();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderData>(null);
  const [delivery, setDelivery] = useState<DeliveryInfo | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("orders")
          .select(
            "id,status,subtotal,shipping_fee,discount_amount,total_amount,tip_amount,instructions, user_addresses(id,location_type,location_number), partners(name,image_url,address), order_detail(id,quantity,unit_price, products(name,image_url,unit))"
          )
          .eq("id", id)
          .single();
        if (error) throw error;
        if (mounted) setOrder(normalizeOrder(data));
        // Try to load delivery assignment info in a best-effort manner.
        // 1) Attempt to read a potential delivery_user (FK to profiles) directly from orders.
        // 2) Fallback to common join tables if present.
        // 3) If any step fails or no data, mock as not assigned.
        try {
          // Reuse client
          let assigned: DeliveryInfo | null = null;

          // Try: orders with delivery_user_id -> profiles
          try {
            const { data: ordWithDriver, error: driverErr } = await supabase
              .from("orders")
              .select(
                "id, delivery_user:profiles!orders_delivery_user_id_fkey(id, full_name, name, first_name, email, avatar_url, phone)"
              )
              .eq("id", id)
              .single();
            const u = (
              ordWithDriver as { delivery_user?: MinimalProfile | null } | null
            )?.delivery_user;
            if (!driverErr && ordWithDriver && u) {
              assigned = {
                assigned: true,
                name: displayName(u),
                avatar_url: u?.avatar_url ?? null,
                phone: u?.phone ?? null,
              };
            }
          } catch {
            // ignore; relationship or column may not exist yet
          }

          // Try: delivery_assignments with profiles
          if (!assigned) {
            try {
              const { data: da, error: daErr } = await supabase
                .from("delivery_assignments")
                .select(
                  "id, order_id, delivery_user:profiles(id, full_name, name, first_name, email, avatar_url, phone)"
                )
                .eq("order_id", id)
                .maybeSingle();
              const u = (da as { delivery_user?: MinimalProfile | null } | null)
                ?.delivery_user;
              if (!daErr && da && u) {
                assigned = {
                  assigned: true,
                  name: displayName(u),
                  avatar_url: u?.avatar_url ?? null,
                  phone: u?.phone ?? null,
                };
              }
            } catch {
              // ignore; table or relationship may not exist yet
            }
          }

          // Try: deliveries with driver profile
          if (!assigned) {
            try {
              const { data: del, error: delErr } = await supabase
                .from("deliveries")
                .select(
                  "id, order_id, driver:profiles(id, full_name, name, first_name, email, avatar_url, phone)"
                )
                .eq("order_id", id)
                .maybeSingle();
              const u = (del as { driver?: MinimalProfile | null } | null)
                ?.driver;
              if (!delErr && del && u) {
                assigned = {
                  assigned: true,
                  name: displayName(u),
                  avatar_url: u?.avatar_url ?? null,
                  phone: u?.phone ?? null,
                };
              }
            } catch {
              // ignore; table or relationship may not exist yet
            }
          }

          if (mounted) {
            setDelivery(assigned ?? { assigned: false });
          }
        } catch {
          // As a safety net, mark as not assigned
          if (mounted) setDelivery({ assigned: false });
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "No se pudo cargar el pedido";
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const currentIndex = useMemo(() => {
    const s = (order?.status as OrderStepKey | undefined) ?? "confirmed";
    const idx = ORDER_STEPS.findIndex((x) => x.key === s);
    return idx >= 0 ? idx : 0;
  }, [order?.status]);

  if (!id) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-sm">Pedido no encontrado</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header card */}
      <section className="rounded-2xl border border-[#D9DCE3] bg-white p-6 md:p-8 flex flex-col items-center gap-6">
        <h1 className="text-[28px] leading-8 font-semibold text-[#04BD88] text-center">
          Estado del Pedido{" "}
          <span className="block text-sm text-gray-700">#{id}</span>
        </h1>

        {/* Steps row */}
        <div className="w-full max-w-[846px] flex items-center justify-between">
          {ORDER_STEPS.map((step, i) => (
            <div key={step.key} className="flex flex-col items-center w-[86px]">
              <div
                className={
                  i <= currentIndex
                    ? "h-12 w-12 rounded-full border border-[#04BD88] opacity-80 grid place-items-center"
                    : "h-12 w-12 rounded-full border border-[#9BA1AE] grid place-items-center"
                }
              >
                <div
                  className={
                    i <= currentIndex
                      ? "h-5 w-5 rounded-full bg-[#04BD88]"
                      : "h-5 w-5 rounded-full border border-[#9BA1AE]"
                  }
                />
              </div>
              <div
                className={
                  i <= currentIndex
                    ? "mt-2 text-[14px] leading-[18px] text-[#525252]"
                    : "mt-2 text-[14px] leading-[18px] text-[#9BA1AE]"
                }
              >
                {step.label}
              </div>
              <div className="text-[12px] leading-4 text-gray-500">
                {i === 0 ? "13:30" : "--:--"}
              </div>
            </div>
          ))}
        </div>

        {/* Info banner */}
        <div className="w-full max-w-[862px] rounded-xl border border-[#04BD88] bg-[#CDF7E7] p-4 flex items-center gap-4">
          <div className="h-9 w-9 pl-3 flex items-center justify-center">
            <Image src="/clock.png" width={28} height={28} alt="Info" />
          </div>
          <div>
            <div className="font-semibold text-[#04BD88] text-sm">
              Tu pedido se está preparando
            </div>
            <div className="text-sm text-black">
              El restaurante está preparando tu orden. Tiempo estimado: 5–10
              minutos.
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: map and driver */}
        <div className="rounded-2xl border border-[#D9DCE3] bg-white p-6 shadow-[0_1px_4px_rgba(12,12,13,0.1),0_1px_4px_rgba(12,12,13,0.05)]">
          <div className="h-[400px] w-full rounded-xl bg-[url('/placeholder-map.png')] bg-cover bg-center" />
          <div className="mt-4 flex items-center justify-between rounded-xl border border-[#9BA1AE] bg-[rgba(240,242,245,0.72)] p-3">
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 rounded-full bg-gray-300 overflow-hidden relative">
                {delivery?.assigned && delivery?.avatar_url ? (
                  <Image
                    src={delivery.avatar_url}
                    alt={delivery.name ?? "Repartidor"}
                    fill
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div>
                <div className="text-[16px] leading-5 font-medium text-[#171717]">
                  {delivery?.assigned
                    ? delivery?.name
                    : "Sin repartidor asignado"}
                </div>
                <div className="text-[14px] leading-[18px] text-[#292929]">
                  {delivery?.assigned
                    ? "Repartidor asignado"
                    : "Esperando asignación"}
                </div>
              </div>
            </div>
            <button
              className={
                delivery?.assigned
                  ? "inline-flex items-center justify-center rounded-full border border-[#04BD88] bg-[#CDF7E7] h-[51px] w-[51px]"
                  : "inline-flex items-center justify-center rounded-full border border-[#D9DCE3] bg-[#F0F2F5] h-[51px] w-[51px] opacity-60 cursor-not-allowed"
              }
              disabled={!delivery?.assigned}
              aria-disabled={!delivery?.assigned}
              title={delivery?.assigned ? "Contactar" : "Aún sin repartidor"}
            >
              <span className="sr-only">Contactar</span>
            </button>
          </div>
          <div className="mt-4 flex gap-4">
            <a
              className="inline-flex items-center justify-center rounded-xl bg-[#04BD88] px-5 py-2.5 text-white text-sm font-medium"
              href="#"
            >
              Contactar Restaurante
            </a>
            <button className="inline-flex items-center justify-center rounded-xl border border-black px-5 py-2.5 text-sm font-medium">
              Cancelar Pedido
            </button>
          </div>
        </div>

        {/* Right: order details */}
        <div className="rounded-2xl border border-[#D9DCE3] bg-white p-6 shadow-[0_1px_4px_rgba(12,12,13,0.1),0_1px_4px_rgba(12,12,13,0.05)]">
          <div className="text-[16px] font-bold">Detalles del pedido</div>
          {/* Partner */}
          <div className="mt-4 flex items-center gap-4">
            <div className="h-15 w-15">
              {order?.partners?.image_url ? (
                <Image
                  src={order.partners.image_url}
                  alt={order?.partners?.name ?? "Tienda"}
                  width={60}
                  height={60}
                  className="rounded-md object-cover"
                />
              ) : (
                <div className="h-[60px] w-[60px] rounded-md bg-gray-200" />
              )}
            </div>
            <div>
              <div className="text-[16px] leading-5 font-medium">
                {order?.partners?.name ?? "Tienda"}
              </div>
              <div className="text-[14px] leading-[18px] text-black">
                Tiempo estimado: 25–35 min
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="mt-4 divide-y divide-[#D9DCE3]">
            {order?.order_detail?.map((d: OrderItem) => (
              <div key={d.id} className="py-4 flex items-center gap-4">
                <div className="h-20 w-20 rounded-md bg-gray-200 relative overflow-hidden">
                  {d.products?.image_url ? (
                    <Image
                      src={d.products.image_url}
                      alt={d.products?.name ?? "producto"}
                      fill
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex-1">
                  <div className="font-medium">
                    {d.products?.name ?? "Producto"}
                  </div>
                  <div className="text-sm">
                    {d.quantity} {d.products?.unit ?? "ud"}
                  </div>
                </div>
                <div className="text-right font-semibold">
                  {currency(d.unit_price * d.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{currency(order?.subtotal)}</span>
            </div>
            {order?.delivery_fee != null && (
              <div className="flex justify-between">
                <span>Entrega</span>
                <span>{currency(order.delivery_fee)}</span>
              </div>
            )}
            {order?.discount_amount ? (
              <div className="flex justify-between">
                <span>Descuento</span>
                <span>-{currency(order.discount_amount)}</span>
              </div>
            ) : null}
            {order?.tip_amount ? (
              <div className="flex justify-between">
                <span>Propina</span>
                <span>{currency(order.tip_amount)}</span>
              </div>
            ) : null}
            <div className="h-px bg-[#D9DCE3] my-2" />
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span>{currency(order?.total_amount)}</span>
            </div>
          </div>

          {/* Address footer card */}
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-black text-white p-4">
            <div className="h-[61px] w-[64px] rounded-xl bg-[#292929] flex items-center justify-center" />
            <div>
              <div className="text-[#04BD88] font-medium">
                Entrega en{" "}
                {order?.user_addresses?.location_type === "villa"
                  ? "villa"
                  : order?.user_addresses?.location_type === "yate"
                  ? "yate"
                  : "destino"}{" "}
                {order?.user_addresses?.location_number ?? ""}
              </div>
              <div className="text-sm opacity-90">
                {order?.instructions ?? "Sin instrucciones"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Back link */}
      <div className="mt-6">
        <Link href="/user/home" className="text-sm underline">
          Volver al inicio
        </Link>
      </div>

      {loading && (
        <div className="fixed inset-x-0 bottom-4 mx-auto w-max rounded bg-black/80 text-white text-sm px-3 py-1">
          Cargando pedido…
        </div>
      )}
      {error && (
        <div className="fixed inset-x-0 bottom-4 mx-auto w-max rounded bg-red-600 text-white text-sm px-3 py-1">
          {error}
        </div>
      )}
    </div>
  );
}
