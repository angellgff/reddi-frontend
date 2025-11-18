import Image from "next/image";
import Link from "next/link";
import OrderDeliveredRatingDialog from "@/src/components/features/finalUser/orders/OrderDeliveredRatingDialog";
import OrderLiveStatusClient from "@/src/components/features/finalUser/orders/OrderLiveStatusClient";
import { getOrderDetails } from "@/src/lib/finalUser/orders/getOrderDetails";
import { getRouteDetails } from "@/src/lib/finalUser/orders/getRouteDetails";
import { createClient } from "@/src/lib/supabase/server";
import type { NormalizedOrder } from "@/src/lib/finalUser/orders/getOrderDetails";

type PageProps = {
  params: Promise<{ [key: string]: string }>;
};

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

function currentIndex(status?: OrderStepKey) {
  const s = status ?? "confirmed";
  const idx = ORDER_STEPS.findIndex((x) => x.key === s);
  return idx >= 0 ? idx : 0;
}

export default async function OrderStatusPage({ params }: PageProps) {
  // Usamos `await` para resolver la promesa y obtener los `params`.
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const order: NormalizedOrder = await getOrderDetails(id);
  const route = await getRouteDetails(
    order?.partner_id,
    order?.user_address_id || order?.user_addresses?.id
  );
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id ?? null;
  const idx = currentIndex(order?.status as OrderStepKey | undefined);

  if (!order) {
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
                  i <= idx
                    ? "h-12 w-12 rounded-full border border-[#04BD88] opacity-80 grid place-items-center"
                    : "h-12 w-12 rounded-full border border-[#9BA1AE] grid place-items-center"
                }
              >
                <div
                  className={
                    i <= idx
                      ? "h-5 w-5 rounded-full bg-[#04BD88]"
                      : "h-5 w-5 rounded-full border border-[#9BA1AE]"
                  }
                />
              </div>
              <div
                className={
                  i <= idx
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
      <section className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Live status (client) */}
        <div className="lg:col-span-2">
          <OrderLiveStatusClient
            orderId={id}
            delivered={order.status === "delivered"}
            initialRoute={route}
          />
        </div>
        {/* Order details */}
        <div className="rounded-2xl border border-[#D9DCE3] bg-white p-6 shadow-[0_1px_4px_rgba(12,12,13,0.1),0_1px_4px_rgba(12,12,13,0.05)] lg:col-span-2">
          <div className="text-[16px] font-bold">Detalles del pedido</div>
          {/* Partner */}
          <div className="mt-4 flex items-center gap-4">
            <div className="h-[60px] w-[60px] rounded-md bg-gray-200 overflow-hidden">
              {order?.partners?.image_url ? (
                <Image
                  src={order.partners.image_url}
                  alt={order?.partners?.name ?? "Tienda"}
                  width={60}
                  height={60}
                  className="object-cover"
                />
              ) : null}
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
            {order?.order_detail?.map((d) => (
              <div key={d.id} className="py-4">
                <div className="flex items-center gap-4">
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
                {/* Extras list */}
                {d.extras && d.extras.length > 0 ? (
                  <div className="mt-2 ml-24 space-y-1">
                    {d.extras.map((ex) => (
                      <div
                        key={ex.id}
                        className="flex items-center justify-between text-sm text-gray-700"
                      >
                        <div className="flex items-center gap-2">
                          {ex.image_url ? (
                            <div className="h-6 w-6 rounded bg-gray-200 overflow-hidden relative">
                              <Image
                                src={ex.image_url}
                                alt={ex.name ?? "extra"}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-6 w-6 rounded bg-gray-100" />
                          )}
                          <span>
                            + {ex.name ?? "Extra"}
                            {ex.quantity > 1 ? ` x${ex.quantity}` : ""}
                          </span>
                        </div>
                        <span className="text-gray-900">
                          {currency(ex.unit_price * ex.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}
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

      {/* Rating dialog appears when delivered */}
      <OrderDeliveredRatingDialog
        orderId={id}
        partnerId={order?.partner_id}
        userId={userId}
        delivered={order?.status === "delivered"}
      />
    </div>
  );
}
