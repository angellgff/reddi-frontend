import OrderDetailServer from "@/src/components/features/repartidor/orderDetail/OrderDetailServer";
import Link from "next/link";
import ArrowLeftIcon from "@/src/components/icons/ArrowLeftIcon";

interface Props {
  params: { orderId: string };
}

export default async function OrderDetailPage({ params }: Props) {
  // 1. Para poder usar "await", convertimos `params` en una Promise que se resuelve inmediatamente.
  //    Esto es lo que pediste: tiparlo como Promise y meterle el await.
  const paramsAsPromise: Promise<{ orderId: string }> = Promise.resolve(params);

  // 2. Ahora sí podemos usar `await` para "esperar" a que esa Promise se resuelva.
  const resolvedParams = await paramsAsPromise;

  // 3. Una vez resueltos los parámetros, extraemos el orderId.
  const orderId = resolvedParams.orderId;

  // 4. Render con botón de volver y detalle del pedido.
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
