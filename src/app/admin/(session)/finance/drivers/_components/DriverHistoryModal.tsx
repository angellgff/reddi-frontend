"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { getDriverCashLogs } from "@/src/lib/actions/admin-finance";
import { DriverBalance } from "@/src/lib/admin/finance/getDriverBalances";

interface DriverHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver: DriverBalance | null;
}

// Define explicit type based on the table schema we saw earlier
interface CashLog {
  id: string;
  amount: number;
  transaction_type: string;
  created_at: string | null;
  order_id: string | null;
}

export default function DriverHistoryModal({
  isOpen,
  onClose,
  driver,
}: DriverHistoryModalProps) {
  const [logs, setLogs] = useState<CashLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && driver) {
      setLoading(true);
      getDriverCashLogs(driver.driver_id)
        .then((data) => setLogs(data as CashLog[]))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, driver]);

  if (!driver) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Historial Reciente: {driver.driver_name}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <p className="text-center text-sm text-gray-500"></p>
          ) : logs.length === 0 ? (
            <p className="text-center text-sm text-gray-500">
              No hay movimientos recientes.
            </p>
          ) : (
            <div className="overflow-hidden rounded-md border">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2">Fecha</th>
                    <th className="px-3 py-2">Tipo</th>
                    <th className="px-3 py-2">Monto</th>
                    <th className="px-3 py-2">Orden ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-3 py-2">
                        {log.created_at
                          ? new Date(log.created_at).toLocaleString("es-DO")
                          : "-"}
                      </td>
                      <td className="px-3 py-2 capitalize">
                        {log.transaction_type.replace(/_/g, " ")}
                      </td>
                      <td
                        className={`px-3 py-2 font-medium ${
                          log.transaction_type === "settlement" ||
                          log.transaction_type === "payment"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(log.amount)}
                      </td>
                      <td className="px-3 py-2 text-xs font-mono text-gray-500">
                        {log.order_id || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
