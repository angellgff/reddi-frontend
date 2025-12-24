import { createClient } from "@/src/lib/supabase/server";

export interface FinanceTransaction {
  id: string;
  amount: number;
  transaction_type: string;
  created_at: string;
  order_id: string | null;
  description?: string;
}

export interface DriveFinanceData {
  currentDebt: number;
  totalCollections: number;
  totalPayments: number;
  transactions: FinanceTransaction[];
}

export async function getDriverFinance(): Promise<DriveFinanceData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuario no autenticado");
  }

  // Get Driver ID
  const { data: driver } = await supabase
    .from("drivers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!driver) {
    throw new Error("No se encontró perfil de repartidor");
  }

  // Fetch logs
  const { data: logs, error } = await supabase
    .from("driver_cash_logs")
    .select("*")
    .eq("driver_id", driver.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching finance logs:", error);
    throw new Error("Error obteniendo finanzas");
  }

  // Calculate totals
  let totalCollections = 0;
  let totalPayments = 0;

  const transactions: FinanceTransaction[] = (logs || []).map((log) => {
    let description = "Transacción";
    if (log.transaction_type === "delivery_payment") description = "Cobro de pedido";
    if (log.transaction_type === "platform_payment") description = "Pago a plataforma";
    
    // Sum logic
    // Assuming 'delivery_payment' adds to debt (money collected from customer)
    // Assuming 'platform_payment' reduces debt (money paid to Reddi)
    if (log.transaction_type === "delivery_payment") {
      totalCollections += log.amount;
    } else if (log.transaction_type === "platform_payment") {
      totalPayments += log.amount;
    }

    return {
      id: log.id,
      amount: log.amount,
      transaction_type: log.transaction_type,
      created_at: log.created_at || new Date().toISOString(),
      order_id: log.order_id,
      description,
    };
  });

  const currentDebt = totalCollections - totalPayments;

  return {
    currentDebt,
    totalCollections,
    totalPayments,
    transactions,
  };
}
