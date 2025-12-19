"use server";

import { getDriverProfile } from "@/src/lib/admin/data/drivers/getDriverProfile";
import DriverProfileForm from "@/src/components/features/admin/drivers/DriverProfileForm";

// Se actualiza el tipo de 'params' para que sea una promesa
export default async function AdminDriverProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Se utiliza 'await' para resolver la promesa y obtener el valor de 'params'
  const { id } = await params;
  const driver = await getDriverProfile(id);

  if (!driver) {
      return <div className="p-8">Repartidor no encontrado.</div>;
  }

  return (
    <div className="bg-[#F0F2F5B8] min-h-screen">
      {/* Navbar */}
      <div className="bg-white border-b-2 border-[#E7E7E7] px-8 py-6">
        <div className="flex items-center justify-between">
          <div></div>
          <div className="flex items-center gap-4">
            <div className="hidden w-9 h-9 rounded-lg bg-[#F6F6F6]" />
            <div className="w-9 h-9 rounded-lg bg-[#F6F6F6]" />
            <div className="w-9 h-9 rounded-lg" />
          </div>
        </div>
      </div>

      <DriverProfileForm driver={driver} />
    </div>
  );
}
