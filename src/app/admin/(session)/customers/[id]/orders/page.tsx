import { ChevronRight, User } from "lucide-react";
import React from "react";
import { getCustomerDetails } from "@/src/lib/admin/data/customers/getCustomerOrders";
import Image from "next/image";
import Link from "next/link";

// Helper for status styling and label
const getStatusConfig = (status: string | null) => {
  switch (status) {
    case "delivered":
      return { label: "Entregado", className: "bg-[#D7FFD8] text-[#04910C]" };
    case "cancelled":
    case "payment_failed":
      return { label: "Cancelado", className: "bg-[#FFDCDC] text-[#FF0000]" };
    case "failed":
      return { label: "Fallido", className: "bg-[#FFDCDC] text-[#FF0000]" };
    case "pending":
    case "preparing":
    case "out_for_delivery":
    case "awaiting_payment":
      return { label: "En curso", className: "bg-[#E5F2FF] text-[#0065FF]" };
    default:
      return { label: "Desconocido", className: "bg-gray-100 text-gray-600" };
  }
};

export default async function ClientOrdersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile, orders } = await getCustomerDetails(id);

  if (!profile) {
    return <div>Cliente no encontrado</div>;
  }

  // Format Date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col items-start p-[30px] md:px-[50px] gap-[29px] w-full min-h-screen bg-[#F0F2F5]">
      {/* Header Section */}
      <div className="flex flex-col gap-1 w-full">
        <h1 className="font-poppins font-semibold text-[24px] leading-[28px] text-[#171717]">
          Gestión de pedidos
        </h1>
        <h2 className="font-roboto font-normal text-[18px] leading-[24px] text-black">
          Aquí está el resumen de hoy
        </h2>
      </div>

      {/* Main Content Card */}
      <div className="flex flex-col items-center p-6 md:px-[50px] md:py-[24px] gap-[20px] w-full bg-white border border-[#D9DCE3] rounded-2xl box-border">
        
        {/* Datos Personales Section */}
        <div className="w-full flex flex-col gap-4">
          <div className="flex flex-row items-center gap-[12px] h-[24px]">
            <User className="text-[#04BD88] w-5 h-5" />
            <h3 className="font-poppins font-semibold text-[20px] leading-[24px] text-[#04BD88]">
              Datos Personales
            </h3>
          </div>

          <div className="flex flex-wrap w-full gap-[35px]">
            <div className="flex flex-col w-[228px] gap-2">
              <span className="font-roboto font-medium text-[14px] leading-[18px] text-[#292929]">
                Nombre completo
              </span>
              <span className="font-roboto font-normal text-[16px] leading-[20px] text-[#292929]">
                {profile.first_name} {profile.last_name}
              </span>
            </div>
            <div className="flex flex-col w-[228px] gap-2">
              <span className="font-roboto font-medium text-[14px] leading-[18px] text-[#292929]">
                Correo electrónico
              </span>
              <span className="font-roboto font-normal text-[16px] leading-[20px] text-[#292929]">
                {profile.email}
              </span>
            </div>
            <div className="flex flex-col w-[228px] gap-2">
              <span className="font-roboto font-medium text-[14px] leading-[18px] text-[#292929]">
                Teléfono
              </span>
              <span className="font-roboto font-normal text-[16px] leading-[20px] text-[#292929]">
                {profile.phone_number || "No registrado"}
              </span>
            </div>
            <div className="flex flex-col w-[228px] gap-2">
              <span className="font-roboto font-medium text-[14px] leading-[18px] text-[#292929]">
                Fecha de registro
              </span>
              <span className="font-roboto font-normal text-[16px] leading-[20px] text-[#292929]">
                 {profile.created_at ? new Date(profile.created_at).toLocaleDateString("es-ES") : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-[#D9DCE3] my-4" />

        {/* Historial de Pedidos Section */}
        <div className="w-full flex flex-col gap-[15px]">
          <div className="flex flex-row items-center gap-[12px] h-[24px]">
            <h3 className="font-poppins font-semibold text-[20px] leading-[24px] text-[#04BD88]">
              Historial de Pedidos
            </h3>
          </div>

          <div className="flex flex-col w-full gap-[10px]">
            {orders.length === 0 ? (
                <div className="text-gray-500 text-center py-4">Este cliente no tiene pedidos.</div>
            ) : (
                orders.map((order, index) => {
                const statusConfig = getStatusConfig(order.status);
                return (
                    <Link
                    key={order.id}
                    href={`/admin/customers/${id}/orders/${order.id}`}
                    className="flex flex-row items-center justify-between p-[15px] pl-[12px] pr-[12px] gap-[10px] w-full h-[94px] bg-white border border-[#D9DCE3] rounded-xl hover:shadow-sm transition-shadow cursor-pointer"
                    >
                    <div className="flex flex-row items-start gap-[10px] flex-grow">
                        {/* Logo Placeholder */}
                        <div className="w-[30px] h-[30px] rounded-full border-[3px] border-[#04BD88] bg-gray-200 flex-shrink-0 overflow-hidden relative flex items-center justify-center">
                            {order.partner?.image_url ? (
                                <img src={order.partner.image_url} alt={order.partner.name || "Restaurant"} className="w-full h-full object-cover" />
                             ) : (
                                <div className="absolute inset-0 bg-[#04BD88] opacity-20"></div>
                             )}
                        </div>
                        
                        <div className="flex flex-col items-start gap-0 w-full">
                            <div className="flex flex-row items-center gap-2 mb-1">
                            <span className="font-poppins font-bold text-[14px] leading-[18px] text-[#04BD88]">
                                #{order.id.slice(0, 8).toUpperCase()}
                            </span>
                            </div>
                            <span className="font-roboto font-normal text-[16px] leading-[20px] text-[#292929] mb-[2px]">
                            {order.partner?.name || "Restaurante Desconocido"}
                            </span>
                            <span className="font-roboto font-normal text-[14px] leading-[18px] text-[#292929] opacity-50">
                            {formatDate(order.created_at)}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-row items-center gap-4">
                        <div className={`px-[8px] py-[6px] rounded-[10px] ${statusConfig.className}`}>
                            <span className="font-plus-jakarta font-medium text-[12px] leading-[140%]">
                            {statusConfig.label}
                            </span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#9BA1AE]" />
                    </div>
                    </Link>
                );
                })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
