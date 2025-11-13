"use server";

import DriversClientShell from "@/src/components/features/admin/drivers/driversList/ClientShell";
import DriversListServer from "@/src/components/features/admin/drivers/driversList/DriversListServer";
import getDriversPage from "@/src/lib/admin/data/drivers/getDriversPage";

export type SearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;

export default async function AdminDriversPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = (params.q as string) || "";
  const page = params.page ? parseInt(params.page as string) : 1;

  const { total } = await getDriversPage({ q }, page, 10);

  return (
    <div className="bg-[#F0F2F5] px-8 py-6 min-h-screen">
      <h1 className="font-semibold">Gestión de repartidores</h1>
      <h2 className="font-roboto font-normal mb-5">
        Aquí está el resumen de hoy
      </h2>
      <DriversClientShell
        totalCount={total}
        tableBody={<DriversListServer searchParams={searchParams} />}
      />
    </div>
  );
}
