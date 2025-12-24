"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { DriverBalance } from "@/src/lib/admin/finance/getDriverBalances";
import { DollarSign, Users } from "lucide-react";

interface SummaryCardsProps {
  drivers: DriverBalance[];
}

export default function SummaryCards({ drivers }: SummaryCardsProps) {
  const driversWithDebt = drivers.filter((d) => d.current_debt > 0);
  const totalDebt = driversWithDebt.reduce((sum, d) => sum + d.current_debt, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Deuda Total en la Calle
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(totalDebt)}
          </div>
          <p className="text-xs text-muted-foreground">
            Suma de deudas activas
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Drivers con Deuda
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {driversWithDebt.length}
          </div>
          <p className="text-xs text-muted-foreground">
            De un total de {drivers.length} drivers
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
