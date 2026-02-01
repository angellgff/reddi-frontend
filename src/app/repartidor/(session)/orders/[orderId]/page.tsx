import OrderDetailServer from "@/src/components/features/repartidor/orderDetail/OrderDetailServer";
import Link from "next/link";
import ArrowLeftIcon from "@/src/components/icons/ArrowLeftIcon";

// 1. Corrige la interfaz para que espere una Promise
interface Props {
  params: Promise<{ orderId: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  // 2. Usa 'await' directamente sobre la prop 'params' para obtener su valor
  const { orderId } = await params;

  // 3. El resto del componente funciona igual con el 'orderId' ya resuelto
  return (
    <div className="w-full">

      <OrderDetailServer orderId={orderId} />
    </div>
  );
}
