"use client";

import { useState } from "react";
import { DriverBalance } from "@/src/lib/admin/finance/getDriverBalances";
import SummaryCards from "./SummaryCards";
import { Button } from "@/src/components/ui/button";
import SettleDebtModal from "./SettleDebtModal";
import DriverHistoryModal from "./DriverHistoryModal";
import { Search, History } from "lucide-react";
import { Input } from "@/src/components/ui/input";

interface FinanceDriversViewProps {
  initialData: DriverBalance[];
  adminId: string;
}

export default function FinanceDriversView({
  initialData,
  adminId,
}: FinanceDriversViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<DriverBalance | null>(null);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const filteredDrivers = initialData.filter((driver) =>
    driver.driver_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
    }).format(amount);
  };

  const handleOpenSettle = (driver: DriverBalance) => {
    setSelectedDriver(driver);
    setIsSettleModalOpen(true);
  };

  const handleOpenHistory = (driver: DriverBalance) => {
    setSelectedDriver(driver);
    setIsHistoryModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <SummaryCards drivers={initialData} />

      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Listado de Drivers</h2>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar driver..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Última Actividad</th>
                <th className="px-4 py-3 text-right">Deuda Actual</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDrivers.map((driver) => (
                <tr key={driver.driver_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <button 
                      className="hover:underline text-left"
                      onClick={() => handleOpenHistory(driver)}
                    >
                      {driver.driver_name}
                    </button>
                    {/* Add small icon to indicate history clickable? */}
                  </td>
                  <td className="px-4 py-3">
                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        driver.status === 'online' ? 'bg-green-100 text-green-800' : 
                        driver.status === 'offline' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                     }`}>
                        {driver.status}
                     </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {driver.last_activity ? new Date(driver.last_activity).toLocaleDateString() : "-"}
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${
                      driver.current_debt > 0 ? "text-red-600" : "text-gray-900"
                  }`}>
                    {formatCurrency(driver.current_debt)}
                  </td>
                  <td className="px-4 py-3 text-center flex items-center justify-center gap-2">
                    <Button 
                        size="sm" 
                        variant={driver.current_debt > 0 ? "default" : "outline"}
                        onClick={() => handleOpenSettle(driver)}
                    >
                        Liquidar
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenHistory(driver)}
                        title="Ver Historial"
                    >
                        <History className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredDrivers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No se encontraron drivers.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SettleDebtModal
        isOpen={isSettleModalOpen}
        onClose={() => setIsSettleModalOpen(false)}
        driver={selectedDriver}
        adminId={adminId}
        key={`settle-${selectedDriver?.driver_id}`} 
      />

      <DriverHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        driver={selectedDriver}
        key={`history-${selectedDriver?.driver_id}`}
      />
    </div>
  );
}
