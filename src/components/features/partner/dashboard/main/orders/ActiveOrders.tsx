import CardShell from "@/src/components/features/partner/CardShell";
import type { Order } from "@/src/lib/partner/dashboard/type";

export default function ActiveOrders({ orders }: { orders: Order[] }) {
  const rows = orders.slice(0, 3);

  return (
    <CardShell>
      <div className="overflow-hidden rounded-lg border border-[#EDEDED] bg-white">
        <div className="flex items-center border-b-2 border-[#E5E7EB] px-6 py-3">
          <span className="mr-3 h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
          <h3 className="flex-1 font-inter text-sm font-bold uppercase tracking-[0.35px] text-[#101828]">
            Nuevos
          </h3>
          <span className="font-inter text-sm font-bold text-[#6A7282]">
            {rows.length}
          </span>
        </div>

        <div>
          {rows.map((order, index) => {
            const isUrgent = index === 0 || order.status === "Nuevo";
            const orderCode = `#${String(order.id).slice(0, 4)}`;

            return (
              <div
                key={order.id}
                className={`relative flex items-center gap-6 border-b border-[#E5E7EB] px-6 py-4 last:border-b-0 ${
                  isUrgent ? "bg-[#FEF2F2]" : "bg-white"
                }`}
              >
                <span
                  className={`absolute left-0 top-0 h-full w-1 ${
                    isUrgent ? "bg-[#E7000B]" : "bg-[#E5E7EB]"
                  }`}
                />

                <div className="w-[60px] shrink-0">
                  <p className="font-inter text-[20px] font-bold leading-[30px] tracking-[-0.75px] text-[#101828]">
                    {orderCode}
                  </p>
                  <p
                    className={`font-inter text-sm font-semibold ${
                      isUrgent ? "text-[#C10007]" : "text-[#4A5565]"
                    }`}
                  >
                    {index === 0 ? "11m" : index === 1 ? "3m" : "2m"}
                  </p>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-inter text-base font-semibold text-[#101828]">
                    {order.name.replace("Pedido", "") || "Cliente"}
                  </p>
                  {isUrgent && (
                    <span className="mt-1 inline-flex rounded bg-[#E7000B] px-2 py-0.5 font-inter text-xs font-bold text-white">
                      URGENTE
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex h-12 w-12 items-center justify-center rounded-[10px] text-[#364153]"
                    aria-label="Rechazar pedido"
                  >
                    ×
                  </button>
                  <button
                    type="button"
                    className="h-12 rounded-[10px] bg-primary px-6 font-inter text-sm font-semibold text-white"
                  >
                    Aceptar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </CardShell>
  );
}
