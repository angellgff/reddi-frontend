"use server";

import { createClient } from "@/src/lib/supabase/server";
import { getDriverBalances } from "@/src/lib/admin/finance/getDriverBalances";
import FinanceDriversView from "./_components/FinanceDriversView";
import { redirect } from "next/navigation";

export default async function AdminFinanceDriversPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const driverBalances = await getDriverBalances();

  return (
    <div className="bg-[#F0F2F5] px-8 py-6 min-h-screen">
      <h1 className="font-semibold text-2xl text-gray-800">Finanzas de Drivers</h1>
      <h2 className="font-roboto font-normal text-gray-500 mb-6">
        Gestión de deudas y liquidaciones
      </h2>
      <FinanceDriversView initialData={driverBalances} adminId={user.id} />
    </div>
  );
}
