"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { settleDriverDebt } from "@/src/lib/actions/admin-finance";
import { DriverBalance } from "@/src/lib/admin/finance/getDriverBalances";

interface SettleDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver: DriverBalance | null;
  adminId: string; // We need the admin ID for logging
}

export default function SettleDebtModal({
  isOpen,
  onClose,
  driver,
  adminId,
}: SettleDebtModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize amount when driver changes
  // We use a useEffect or key on the Dialog to reset, or just do it in render if controlled?
  // Better to reset state when modal opens.
  // I'll use a precise effect or key. Key on parent is easier.

  if (!driver) return null;

  const handleSettle = async () => {
    if (!amount || isNaN(Number(amount))) return;

    setIsLoading(true);
    try {
      const result = await settleDriverDebt(driver.driver_id, Number(amount), adminId);
      if (result.success) {
        alert(`Se ha registrado el pago de ${amount} para ${driver.driver_name}`);
        onClose();
        setAmount(""); // Reset
      } else {
        alert("Error al registrar el pago: " + result.error);
      }
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recibir Dinero</DialogTitle>
          <DialogDescription>
            Registrar pago de deuda para <strong>{driver.driver_name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Monto
            </Label>
            <div className="col-span-3">
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={driver.current_debt.toString()}
                className="col-span-3"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Deuda actual: RD$ {driver.current_debt.toLocaleString("es-DO")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSettle} disabled={isLoading}>
            {isLoading ? "Procesando..." : "Confirmar Recepción"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
