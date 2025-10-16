import ClockOrdersIcon from "@/src/components/icons/ClockOrdersIcon";
import PhoneIcon from "@/src/components/icons/PhoneIcon";
import Link from "next/dist/client/link";

// Como se guardará el estado en el servidor
export type OrderStatus =
  | "new"
  | "preparation"
  | "delivered"
  | "pending"
  | "canceled";

export type PartnerOrderCardProps = {
  customerName: string;
  orderId: string;
  status: OrderStatus;
  timeRemaining: number;
  products: string;
  total: number;
  paymentMethod: string;
  deliveryTime: string;
};

export const badgeLabels: Record<PartnerOrderCardProps["status"], string> = {
  new: "Nuevo",
  preparation: "En preparación",
  delivered: "Entregado",
  pending: "Pendiente",
  canceled: "Cancelado",
};

export const badgeColors: Record<PartnerOrderCardProps["status"], string> = {
  new: "bg-blue-100 text-blue-600",
  preparation: "bg-[#DCD2FF] text-[#7F27FF]",
  delivered: "bg-green-100 text-green-600",
  pending: "bg-red-100 text-red-600",
  canceled: "bg-red-100 text-red-600",
};

// Función para formatear el precio con punto de mil
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    // Para dólares, normalmente se quieren 2 decimales.
    // minimumFractionDigits: 2, // Se puede omitir, ya que es el default para USD
  }).format(price);
};

export default function OrderCard({
  customerName,
  orderId,
  status,
  timeRemaining,
  products,
  total,
  paymentMethod,
  deliveryTime,
}: PartnerOrderCardProps) {
  return (
    // Contenedor principal de la tarjeta
    <div className="bg-white rounded-xl border border-gray-200 font-sans">
      {/* Sección Superior: Nombre, Pedido, Estado y Tiempo */}
      <div className="flex justify-between items-start mb-4 p-4">
        {/* Lado izquierdo: Nombre y número de pedido */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            {customerName}
          </h2>
          <p className="text-sm text-[#525252] font-inter">Pedido #{orderId}</p>
        </div>

        {/* Lado derecho: Etiqueta de estado y tiempo restante */}
        <div className="flex items-center gap-4">
          <span
            className={`${badgeColors[status]} text-xs font-medium px-2 py-1 rounded-lg`}
          >
            {badgeLabels[status]}
          </span>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ClockOrdersIcon className="text-primary h-4 w-4" />
            <span className="font-inter">{timeRemaining} min restantes</span>
          </div>
        </div>
      </div>

      {/* Sección Central: Detalles del Pedido */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6 px-4">
        <div className="flex flex-col">
          <span className="text-sm font-roboto">Productos</span>
          <span className="text-base font-medium">{products}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-roboto">Total</span>
          <span className="text-base font-medium">{formatPrice(total)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-roboto">Método de pago</span>
          <span className="text-base font-medium">{paymentMethod}</span>
        </div>
        <div className="flex flex-col text-right md:text-left">
          <span className="text-sm font-roboto">Hora entrega</span>
          <span className="text-base font-medium">{deliveryTime}</span>
        </div>
      </div>

      {/* Línea divisoria */}
      <hr className="border-gray-200 border-2" />

      {/* Sección Inferior: Botones de Acción */}
      <div className="flex gap-4 p-4">
        <Link
          href={`orders/${orderId}`}
          className="flex-1 md:flex-none py-2 px-6 border border-black rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
        >
          Ver detalle
        </Link>
        <button className="flex-1 md:flex-none py-2 px-6 bg-primary text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-teal-600 transition-colors">
          <PhoneIcon className="h-7 w-7" />
          <span>Contactar cliente</span>
        </button>
      </div>
    </div>
  );
}
