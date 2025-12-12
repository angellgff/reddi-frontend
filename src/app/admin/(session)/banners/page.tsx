import React, { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import BannersClientShell from "@/src/components/features/admin/banners/BannersClient";
import BannersTableServer from "@/src/components/features/admin/banners/BannersTableServer";
import getBannersStats from "@/src/lib/admin/data/banners/getBannersStats";
import getBannersTotalCount from "@/src/lib/admin/data/banners/getBannersTotalCount";

export type SearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;

export default async function BannersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const fromDate = (params.fromDate as string) || "";
  const toDate = (params.toDate as string) || "";
  const status = (params.status as string) || "";

  // Parallel fetch for shell data
  const statsPromise = getBannersStats();
  const countPromise = getBannersTotalCount({ fromDate, toDate, status });
  
  const [stats, totalCount] = await Promise.all([statsPromise, countPromise]);

  return (
    <div className="bg-[#F0F2F5] px-8 py-6 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-semibold text-2xl mb-2">Banner</h1>
          <h2 className="font-roboto font-normal text-[#454545]">
            Gestiona tus ingresos, retiros y análisis financieros
          </h2>
        </div>
        
        <Link
          href="/admin/banners/create"
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#04BD88] hover:bg-green-600 text-white rounded-[12px] font-poppins font-medium text-sm transition-colors"
           style={{
            boxShadow: "0px 1px 2px rgba(16, 24, 40, 0.05)"
           }}
        >
           Crear Banner
        </Link>
      </div>
      
      <BannersClientShell
        stats={stats}
        totalCount={totalCount}
        tableBody={
          <Suspense fallback={<div className="p-4 text-center">Cargando Banners...</div>}>
            <BannersTableServer searchParams={searchParams} />
          </Suspense>
        }
      />
    </div>
  );
}
