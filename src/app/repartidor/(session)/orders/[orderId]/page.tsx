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
    <div className="px-4 pt-4">
      <div className="mb-2">
        <Link
          href="/repartidor/home"
          className="inline-flex items-center gap-2 text-sm text-slate-700 hover:underline"
        >
          <span className="rounded-full p-2 bg-gray-200 hover:bg-gray-300 transition-colors">
            <ArrowLeftIcon />
          </span>
          Volver
        </Link>
      </div>
      <OrderDetailServer orderId={orderId} />
    </div>
  );
}
