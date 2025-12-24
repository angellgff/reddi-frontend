import { getDriverFinance } from "@/src/lib/repartidor/finance/getDriverFinance";
import { formatCurrency } from "@/src/lib/utils"; // Assuming this exists or I'll implement a helper
import { Banknote, ArrowDownCircle, ArrowUpCircle, History } from "lucide-react";

// Helper for currency if not available
const formatMoney = (amount: number) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
};

export const revalidate = 60; // Revalidate every minute

export default async function FinancesPage() {
  const data = await getDriverFinance();

  return (
    <div className="flex flex-col items-center px-4 pt-6 pb-20 gap-6 bg-[#ECEFF0] min-h-screen">
      <h2 className="text-[18px] font-bold text-primary w-full max-w-[352px]">
        Mis Finanzas
      </h2>

      {/* Debt Summary Card */}
      <div className="w-full max-w-[352px] bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center">
        <span className="text-sm font-medium text-gray-500 mb-1">Deuda Actual</span>
        <h3 className={`text-4xl font-bold mb-4 ${data.currentDebt > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
          {formatMoney(data.currentDebt)}
        </h3>
        <p className="text-xs text-center text-gray-400">
          Monto total recaudado en efectivo que debes a la plataforma.
        </p>
        
        <div className="flex w-full mt-6 pt-6 border-t border-gray-100 divide-x divide-gray-100">
          <div className="flex-1 flex flex-col items-center">
            <span className="text-xs text-gray-400 mb-1">Cobrado</span>
            <span className="text-sm font-semibold text-gray-700">{formatMoney(data.totalCollections)}</span>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <span className="text-xs text-gray-400 mb-1">Pagado</span>
            <span className="text-sm font-semibold text-gray-700">{formatMoney(data.totalPayments)}</span>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="w-full max-w-[352px] flex flex-col gap-3">
        <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
          <History className="w-4 h-4" />
          Historial de Transacciones
        </h3>

        {data.transactions.length === 0 ? (
           <div className="text-center py-8 text-gray-400 text-sm">
             No hay transacciones registradas.
           </div>
        ) : (
          data.transactions.map((tx) => (
            <div key={tx.id} className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                tx.transaction_type === "delivery_payment" 
                  ? "bg-red-100 text-red-600" 
                  : "bg-emerald-100 text-emerald-600"
              }`}>
                 {tx.transaction_type === "delivery_payment" ? (
                   <ArrowDownCircle className="w-6 h-6" /> // Debt increases (Cash coming in)
                 ) : (
                   <ArrowUpCircle className="w-6 h-6" /> // Debt decreases (Payment out)
                 )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">
                  {tx.description}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(tx.created_at).toLocaleDateString("es-MX", {
                    day: "numeric", month: "short", hour: "2-digit", minute:"2-digit"
                  })}
                </p>
              </div>
              <span className={`text-sm font-bold ${
                 tx.transaction_type === "delivery_payment" 
                  ? "text-red-500" 
                  : "text-emerald-500"
              }`}>
                {tx.transaction_type === "delivery_payment" ? "+" : "-"} {formatMoney(tx.amount)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
