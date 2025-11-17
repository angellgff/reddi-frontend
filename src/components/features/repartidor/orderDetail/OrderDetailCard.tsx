"use client";

import Image from "next/image";
import OrderDetailRouteMap from "./OrderDetailRouteMap";
import { useState } from "react";
import ConfirmModal from "@/src/components/basics/ConfirmModal";
import Toast from "@/src/components/basics/Toast";

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

  const [delivered, setDelivered] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

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
      {data.canAccept && !delivered ? <AcceptButton orderId={data.id} /> : null}

      {/* Contact button */}
      {data.canContact && data.customerPhone && !delivered ? (
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
      <CompleteButton
        enabled={data.canMarkDelivered && !delivered}
        onRequest={() => setConfirmOpen(true)}
      />

      {/* Confirm complete modal */}
      <ConfirmModal
        open={confirmOpen}
        title="¿Marcar como entregado?"
        description="Esta acción no se puede deshacer. ¿Deseas continuar?"
        confirmText="Sí, marcar"
        cancelText="Cancelar"
        loading={confirmLoading}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          try {
            setConfirmLoading(true);
            const resp = await fetch("/api/delivery/complete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: data.id }),
            });
            if (resp.ok) {
              setDelivered(true);
              setSuccessOpen(true);
            }
          } finally {
            setConfirmLoading(false);
            setConfirmOpen(false);
          }
        }}
      />

      {/* Success info modal */}
      <ConfirmModal
        open={successOpen}
        title="Pedido entregado"
        description="El pedido se ha marcado como entregado."
        confirmText="Cerrar"
        cancelText="Cerrar"
        onConfirm={() => setSuccessOpen(false)}
        onCancel={() => setSuccessOpen(false)}
      />
      {/* Placeholder Toast wiring to keep API consistent; hidden by default */}
      <Toast open={false} message="" onClose={() => {}} />
    </div>
  );
}

function AcceptButton({ orderId }: { orderId: string }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const requestAccept = async () => {
    try {
      setConfirmLoading(true);
      const resp = await fetch("/api/delivery/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      if (resp.ok) {
        if (typeof window !== "undefined") window.location.reload();
      }
    } finally {
      setConfirmLoading(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="flex items-center justify-center gap-2 w-full h-9 bg-white border border-black rounded-xl text-[14px] font-medium text-slate-800"
      >
        Aceptar pedido
      </button>
      <ConfirmModal
        open={confirmOpen}
        title="¿Aceptar este pedido?"
        description="Te asignarás como repartidor de este envío."
        confirmText="Sí, aceptar"
        cancelText="Cancelar"
        loading={confirmLoading}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={requestAccept}
      />
    </>
  );
}

function CompleteButton({
  enabled,
  onRequest,
}: {
  enabled: boolean;
  onRequest: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!enabled}
      className={
        enabled
          ? "flex items-center justify-center gap-2 w-full h-9 bg-[#04BD88] rounded-xl text-[14px] font-medium text-white"
          : "flex items-center justify-center gap-2 w-full h-9 rounded-xl text-[14px] font-medium bg-gray-200 text-gray-500 cursor-not-allowed"
      }
      onClick={enabled ? onRequest : undefined}
      title={
        enabled
          ? "Marcar como entregado"
          : "Solo disponible para el repartidor asignado"
      }
    >
      Marcar como Entregado
    </button>
  );
}
