import ClockOrdersIcon from "@/src/components/icons/ClockOrdersIcon";
import PhoneIcon from "@/src/components/icons/PhoneIcon";
import Link from "next/dist/client/link";

export type MarketOrderStatus =
  | "new"
  | "preparation"
  | "delivered"
  | "pending"
  | "canceled";

export type MarketPartnerOrderCardProps = {
  customerName: string;
  orderId: string;
  status: MarketOrderStatus;
  timeRemaining: number;
  products: string;
  total: number;
  paymentMethod: string;
  deliveryTime: string;
};

export const marketBadgeLabels: Record<
  MarketPartnerOrderCardProps["status"],
  string
> = {
  new: "Nuevo",
  preparation: "En preparación",
  delivered: "Entregado",
  pending: "Pendiente",
  canceled: "Cancelado",
};

export const marketBadgeColors: Record<
  MarketPartnerOrderCardProps["status"],
  string
> = {
  new: "bg-blue-100 text-blue-600",
  preparation: "bg-[#DCD2FF] text-[#7F27FF]",
  delivered: "bg-green-100 text-green-600",
  pending: "bg-red-100 text-red-600",
  canceled: "bg-red-100 text-red-600",
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
};

export default function MarketPartnerOrderCard({
  customerName,
  orderId,
  status,
  timeRemaining,
  products,
  total,
  paymentMethod,
  deliveryTime,
}: MarketPartnerOrderCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 font-sans">
      <div className="flex justify-between items-start mb-4 p-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            {customerName}
          </h2>
          <p className="text-sm text-[#525252] font-inter">Pedido #{orderId}</p>
        </div>
        <div className="flex items-center gap-4">
          <span
            className={`${marketBadgeColors[status]} text-xs font-medium px-2 py-1 rounded-lg`}
          >
            {marketBadgeLabels[status]}
          </span>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ClockOrdersIcon className="text-primary h-4 w-4" />
            <span className="font-inter">{timeRemaining} min restantes</span>
          </div>
        </div>
      </div>
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
      <hr className="border-gray-200 border-2" />
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
