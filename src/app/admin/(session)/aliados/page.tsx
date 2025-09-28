"use server";

import ClientShell from "@/src/components/features/admin/partners/partnersList/ClientShell";
import RestaurantListServer from "@/src/components/features/admin/partners/partnersList/RestaurantListServer";
import getTotalCount from "@/src/lib/admin/data/partners/getTotalCount";

export type SearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;

export default async function AdminPartnersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const totalCount = await getTotalCount();
  return (
    <div className="bg-[#F0F2F5] px-8 py-6 min-h-screen">
      {/* Título */}
      <h1 className="font-semibold">Gestión de aliados</h1>
      <h2 className="font-roboto font-normal mb-5">
        Comprueba los datos de tus aliados
      </h2>
      {/* Fila 1: Sección de filtros */}
      <ClientShell
        totalCount={totalCount}
        tableBody={<RestaurantListServer searchParams={searchParams} />}
      />
    </div>
  );
}
