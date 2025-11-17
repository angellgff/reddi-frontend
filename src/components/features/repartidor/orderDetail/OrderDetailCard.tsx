"use client";

import Image from "next/image";
import OrderDetailRouteMap from "./OrderDetailRouteMap";

interface Props {
  data: {
    id: string;
    statusLabel: string;
    customerName: string;
    partnerId: string | null;
    userAddressId: string | null;
    restaurantName: string;
    restaurantAddress: string;
    deliveryAddress: string;
    eta: string;
    restaurantLogo: string;
    customerPhone: string | null;
    canAccept: boolean;
    canContact: boolean;
    canMarkDelivered: boolean;
  } | null;
}

export default function OrderDetailCard({ data }: Props) {
  if (!data) {
    return (
      <div className="text-center text-sm text-gray-500">
        Pedido no encontrado.
      </div>
    );
  }

  return (
    <div className="flex flex-col p-[18px] gap-3 w-[352px] bg-white shadow-[0_2px_4px_rgba(0,0,0,0.1),0_4px_6px_rgba(0,0,0,0.1)] rounded-xl">
      {/* Header */}
      <div className="flex flex-col w-full">
        <h3 className="text-[18px] leading-[27px] font-semibold text-slate-900 mb-2">
          Cliente: {data.customerName}
        </h3>
        <div className="inline-flex items-center bg-blue-100 text-blue-900 rounded-full px-3 py-1 text-sm font-medium w-fit">
          Recoger pedido
        </div>
      </div>

      {/* Restaurante */}
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-3">
          <div className="w-[30px] h-[30px] rounded-full border-2 border-emerald-500 overflow-hidden flex items-center justify-center">
            <Image
              src={data.restaurantLogo}
              alt={data.restaurantName}
              width={30}
              height={30}
              className="object-cover"
            />
          </div>
          <p className="text-[12px] leading-4 font-medium text-slate-600 flex-1">
            {data.restaurantName} - {data.restaurantAddress}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="inline-block w-2 h-2 bg-red-500 rounded-full" />
          <p className="text-[14px] font-bold text-slate-600">
            Entrega: {data.deliveryAddress}
          </p>
        </div>
      </div>

      {/* Mapa con RouteMap (Mapbox) */}
      <OrderDetailRouteMap
        partnerId={data.partnerId ?? undefined}
        userAddressId={data.userAddressId ?? undefined}
        eta={data.eta}
      />

      {/* Accept button when unassigned */}
      {data.canAccept ? <AcceptButton orderId={data.id} /> : null}

      {/* Contact button */}
      {data.canContact && data.customerPhone ? (
        <a
          href={`tel:${data.customerPhone}`}
          className="flex items-center justify-center gap-2 w-full h-9 bg-white border border-black rounded-xl text-[14px] font-medium text-slate-800"
        >
          Contactar a cliente
        </a>
      ) : (
        <button
          type="button"
          disabled
          className="flex items-center justify-center gap-2 w-full h-9 bg-white border border-gray-300 text-gray-400 rounded-xl text-[14px] font-medium cursor-not-allowed"
          title="Solo disponible para el repartidor asignado"
        >
          Contactar a cliente
        </button>
      )}

      {/* Delivered button */}
      <button
        type="button"
        disabled={!data.canMarkDelivered}
        className={
          data.canMarkDelivered
            ? "flex items-center justify-center gap-2 w-full h-9 bg-[#04BD88] rounded-xl text-[14px] font-medium text-white"
            : "flex items-center justify-center gap-2 w-full h-9 rounded-xl text-[14px] font-medium bg-gray-200 text-gray-500 cursor-not-allowed"
        }
        onClick={() => {}}
        title={
          data.canMarkDelivered
            ? "Marcar como entregado"
            : "Solo disponible para el repartidor asignado"
        }
      >
        Marcar como Entregado
      </button>
    </div>
  );
}

function AcceptButton({ orderId }: { orderId: string }) {
  const onClick = async () => {
    try {
      const resp = await fetch("/api/delivery/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      if (resp.ok) {
        // Best-effort refresh
        if (typeof window !== "undefined") window.location.reload();
      }
    } catch {}
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-2 w-full h-9 bg-white border border-black rounded-xl text-[14px] font-medium text-slate-800"
    >
      Aceptar pedido
    </button>
  );
}
