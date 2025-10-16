import PhoneIcon from "@/src/components/icons/PhoneIcon";
import Image from "next/image";

interface OrderTrackingProps {
  orderData: {
    id: number;
    customerName: string;
    paymentMethod: string;
    deliveryName: string;
  };
}

export default function OrderTracking({ orderData }: OrderTrackingProps) {
  return (
    <div className="flex flex-col space-y-6 h-full">
      {/* SECCIÓN 1: DATOS DEL CLIENTE */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-bold text-lg">Datos del cliente</h2>
          <div className="flex gap-8 mt-4 text-sm">
            <div>
              <p className="text-gray-500 font-roboto">Nombre completo</p>
              <p className="font-medium text-gray-900">
                {orderData.customerName}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-roboto">Método de pago</p>
              <p className="font-medium text-gray-900">
                {orderData.paymentMethod}
              </p>
            </div>
          </div>
        </div>
        <button className="flex items-center justify-center gap-2 bg-primary text-white font-medium py-2.5 px-4 rounded-xl text-sm hover:bg-teal-600 transition-colors">
          <PhoneIcon />
          <span>Contactar cliente</span>
        </button>
      </div>

      {/* SECCIÓN 2: MAPA DE SEGUIMIENTO */}
      <div className="relative w-full grow rounded-2xl overflow-hidden bg-gray-200">
        <span className="text-gray-400 pointer-events-none">
          Componente de mapa de seguimiento
        </span>
      </div>

      {/* SECCIÓN 3: DATOS DEL REPARTIDOR */}
      <div className="flex items-center justify-between p-3 border-2 border-[#9BA1AE] rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="relative h-16 w-16 bg-gray-200 rounded-full">
            <Image
              src="/carlosAvatar.svg"
              alt={`Foto de Carlos Ramírez`}
              fill={true}
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-medium">Carlos Ramírez</p>
            <p className="text-sm font-roboto">Repartidor asignado</p>
          </div>
        </div>
        <button className="border-[3px] border-primary rounded-full hover:bg-teal-200 transition-colors bg-[#CDF7E7]">
          <PhoneIcon className="w-16 h-16 text-primary" />
        </button>
      </div>
    </div>
  );
}
