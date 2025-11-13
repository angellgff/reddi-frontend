"use server";

import ClientsClientShell from "@/src/components/features/admin/customers/customersList/ClientShell";
import CustomerListServer from "@/src/components/features/admin/customers/customersList/CustomerListServer";
import getCustomersPage from "@/src/lib/admin/data/customers/getCustomersPage";

export type SearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = (params.q as string) || "";
  const page = params.page ? parseInt(params.page as string) : 1;

  // Fetch only the count for header; the list is rendered by CustomerListServer
  const { total } = await getCustomersPage({ q }, page, 10);

  return (
    <div className="bg-[#F0F2F5] px-8 py-6 min-h-screen">
      <h1 className="font-semibold">Gestión de usuarios</h1>
      <h2 className="font-roboto font-normal mb-5">
        Aquí está el resumen de hoy
      </h2>
      <ClientsClientShell
        totalCount={total}
        tableBody={<CustomerListServer searchParams={searchParams} />}
      />
    </div>
  );
}
